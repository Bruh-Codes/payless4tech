import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/integrations/supabase/client";

// Utility to skip ngrok warning page
const withNgrokHeader = (body: any, status: number) => {
	return new NextResponse(JSON.stringify(body), {
		status,
		headers: { "ngrok-skip-browser-warning": "true" },
	});
};

export async function POST(req: NextRequest) {
	try {
		const rawBody = await req.text();
		const signature = req.headers.get("x-paystack-signature");

		const expectedSignature = crypto
			.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
			.update(rawBody)
			.digest("hex");

		if (expectedSignature !== signature) {
			return withNgrokHeader({ error: "Invalid signature" }, 401);
		}

		let event;
		try {
			event = JSON.parse(rawBody);
		} catch (err) {
			return withNgrokHeader({ error: "Invalid JSON" }, 400);
		}

		if (event.event === "charge.success") {
			const metadata = event?.data?.metadata;

			if (!metadata) {
				return withNgrokHeader({ error: "metadata missing in data" }, 400);
			}

			// Extract sale_id from custom_fields array
			const customFields = metadata.custom_fields || [];
			const saleField = customFields.find(
				(field: { variable_name: string }) => field.variable_name === "sale_id",
			);

			if (!saleField || !saleField.value) {
				return withNgrokHeader(
					{ error: "sale_id missing in metadata.custom_fields" },
					400,
				);
			}

			const saleId = saleField.value;

			// Update sale status in Supabase
			const { error } = await supabase
				.from("sales")
				.update({ status: "paid" })
				.eq("id", saleId);

			if (error) {
				return withNgrokHeader({ error: "Database update failed" }, 500);
			}

			return withNgrokHeader({ message: "Sale updated successfully" }, 200);
		}

		return withNgrokHeader({ message: "Event ignored" }, 200);
	} catch (error: any) {
		console.error("Webhook error:", error);
		return withNgrokHeader({ error: "Internal server error" }, 500);
	}
}
