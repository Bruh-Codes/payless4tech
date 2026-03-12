import { NextRequest, NextResponse } from "next/server";
import https from "https";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";

type CheckoutItem = {
	id?: string;
	name?: string;
	quantity?: number;
	price?: number;
	image_url?: string;
	specifications?: unknown;
};

type InitPayload = {
	email?: string;
	amount?: string | number;
	items?: CheckoutItem[];
	orderDetails?: {
		name?: string;
		phoneNumber?: string;
		alternativePhone?: string;
		deliveryAddress?: string;
		gpsLocation?: string;
		extendedWarranty?: boolean;
	};
};

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = (await req.json()) as InitPayload;
	const email = String(body.email || "").trim();
	const amount = Number(body.amount || 0);
	const items = Array.isArray(body.items) ? body.items : [];
	const orderDetails = body.orderDetails || {};
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

	if (!email) {
		return NextResponse.json({ error: "Email is required" }, { status: 400 });
	}

	if (!Number.isFinite(amount) || amount <= 0) {
		return NextResponse.json(
			{ error: "Amount must be a positive number" },
			{ status: 400 },
		);
	}

	if (items.length === 0) {
		return NextResponse.json(
			{ error: "At least one item is required" },
			{ status: 400 },
		);
	}

	const normalizedItems = items.map((item) => ({
		id: String(item.id || "").trim(),
		name: String(item.name || "").trim(),
		quantity: Number(item.quantity || 1),
		price: Number(item.price || 0),
		image_url: String(item.image_url || "").trim(),
	}));

	const uniqueProductIds = Array.from(
		new Set(
			normalizedItems
				.map((item) => item.id)
				.filter((id): id is string => Boolean(id)),
		),
	);

	const supabaseAdmin = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY ||
			process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
	);

	let snapshotItems = normalizedItems;
	if (uniqueProductIds.length > 0) {
		const { data: productRows, error: productRowsError } = await supabaseAdmin
			.from("products")
			.select("id, detailed_specs, image_url")
			.in("id", uniqueProductIds);

		if (productRowsError) {
			console.warn(
				"Could not enrich sale snapshot with product specs:",
				productRowsError.message,
			);
		} else {
			const detailedSpecsById = new Map<string, string>();
			const imageUrlById = new Map<string, string>();
			for (const row of productRows || []) {
				const rowId = String((row as any)?.id || "").trim();
				const detailedSpecs = String((row as any)?.detailed_specs || "").trim();
				const imageUrl = String((row as any)?.image_url || "").trim();
				if (rowId && detailedSpecs) {
					detailedSpecsById.set(rowId, detailedSpecs);
				}
				if (rowId && imageUrl) {
					imageUrlById.set(rowId, imageUrl);
				}
			}

			snapshotItems = normalizedItems.map((item) => ({
				...item,
				image_url: item.image_url || imageUrlById.get(item.id) || "",
				...(detailedSpecsById.has(item.id)
					? { specifications: detailedSpecsById.get(item.id) }
					: {}),
			}));
		}
	}

	const session = await auth.api.getSession({ headers: req.headers });
	const userId = session?.user?.id || null;

	const { data: insertedSale, error: saleInsertError } = await supabaseAdmin
		.from("sales")
		.insert({
			user_id: userId,
			name: String(orderDetails.name || session?.user?.name || "").trim() || null,
			email,
			total_amount: amount / 100, // paystack amount is in pesewas
			status: "pending",
			phone_number: String(orderDetails.phoneNumber || "").trim() || null,
			alternative_phone: String(orderDetails.alternativePhone || "").trim() || null,
			delivery_address: String(orderDetails.deliveryAddress || "").trim() || null,
			gps_location: String(orderDetails.gpsLocation || "").trim() || null,
			extended_warranty: Boolean(orderDetails.extendedWarranty),
			fulfillment_status: "pending",
			product: snapshotItems,
		})
		.select("id")
		.single();

	if (saleInsertError || !insertedSale?.id) {
		console.error("Failed to create pending sale:", saleInsertError);
		return NextResponse.json(
			{ error: "Unable to create order before payment" },
			{ status: 500 },
		);
	}

	const saleId = insertedSale.id as string;

	const saleItemsPayload = normalizedItems
		.filter((item) => item.id && item.price >= 0 && item.quantity > 0)
		.map((item) => ({
			sale_id: saleId,
			product_id: item.id,
			quantity: item.quantity,
			price_at_time: item.price,
		}));

	if (saleItemsPayload.length > 0) {
		const { error: saleItemsError } = await supabaseAdmin
			.from("sale_items")
			.insert(saleItemsPayload);

		// Do not block checkout on sale_items relation issues; sales row is the source of truth.
		if (saleItemsError) {
			console.warn("Failed to insert sale_items:", saleItemsError.message);
		}
	}

	const rollbackPendingSale = async () => {
		await supabaseAdmin.from("sale_items").delete().eq("sale_id", saleId);
		await supabaseAdmin.from("sales").delete().eq("id", saleId);
	};

	const params = JSON.stringify({
		email,
		amount,
		callback_url: `${baseUrl}/api/paystack/redirect`,
		metadata: {
			sale_id: saleId,
			custom_fields: [
				{
					display_name: "Sale ID",
					variable_name: "sale_id",
					value: saleId,
				},
			],
			items: snapshotItems,
		},
	});

	const options = {
		hostname: "api.paystack.co",
		port: 443,
		path: "/transaction/initialize",
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
			"Content-Type": "application/json",
		},
	};

	return new Promise<NextResponse>((resolve) => {
		const paystackReq = https.request(options, (paystackRes) => {
			let data = "";

			paystackRes.on("data", (chunk) => {
				data += chunk;
			});

			paystackRes.on("end", () => {
				let result: any;
				try {
					result = JSON.parse(data);
				} catch {
					console.error("Paystack response parse error:", data);
					void rollbackPendingSale();
					resolve(
						NextResponse.json(
							{ error: "Invalid payment gateway response" },
							{ status: 502 },
						),
					);
					return;
				}

				if (result.status) {
					resolve(NextResponse.json({ url: result.data }));
				} else {
					void rollbackPendingSale();
					resolve(
						NextResponse.json({ error: result.message }, { status: 400 }),
					);
				}
			});
		});

		paystackReq.on("error", (error) => {
			console.error(error);
			void rollbackPendingSale();
			resolve(
				NextResponse.json(
					{ error: "Payment initialization failed" },
					{ status: 500 },
				),
			);
		});

		paystackReq.write(params);
		paystackReq.end();
	});
}
