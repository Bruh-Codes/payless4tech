import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Create Supabase client using service role key (only if available)
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
	? createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL,
			process.env.SUPABASE_SERVICE_ROLE_KEY
		)
	: null;

// Utility to skip ngrok warning page
const withNgrokHeader = (body: any, status: number) => {
	return new NextResponse(JSON.stringify(body), {
		status,
		headers: { "ngrok-skip-browser-warning": "true" },
	});
};
export async function POST(req: NextRequest) {
	// Check if required services are available
	if (!supabase) {
		return withNgrokHeader({ error: "Payment processing not configured" }, 503);
	}

	if (!process.env.PAYSTACK_SECRET_KEY) {
		return withNgrokHeader({ error: "Paystack not configured" }, 503);
	}

	const rawBody = await req.text();
	const signature = req.headers.get("x-paystack-signature");

	// console.log("🔔 Raw Body:", rawBody);
	// console.log("🔔 Signature Header:", signature);

	const expectedSignature = crypto
		.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
		.update(rawBody)
		.digest("hex");

	if (expectedSignature !== signature) {
		// console.warn("❌ Invalid signature");
		return withNgrokHeader({ error: "Invalid signature" }, 401);
	}

	let event;
	try {
		event = JSON.parse(rawBody);
	} catch (err) {
		// console.error("❌ Failed to parse JSON:", err);
		return withNgrokHeader({ error: "Invalid JSON" }, 400);
	}

	// console.log("📦 Parsed Event:", JSON.stringify(event, null, 2));

	if (event.event === "charge.success") {
		const metadata = event?.data?.metadata;

		if (!metadata) {
			// console.warn("⚠️ Metadata is missing:", event?.data);
			return withNgrokHeader({ error: "metadata missing in data" }, 400);
		}

		// Extract sale_id from custom_fields array
		const customFields = metadata.custom_fields || [];
		const saleField = customFields.find(
			(field: { variable_name: string }) => field.variable_name === "sale_id"
		);

		if (!saleField || !saleField.value) {
			// console.warn("⚠️ sale_id missing in custom_fields:", customFields);
			return withNgrokHeader(
				{ error: "sale_id missing in metadata.custom_fields" },
				400
			);
		}

		const saleId = saleField.value;

		// Update sale status in Supabase
		const { error } = await supabase
			.from("sales")
			.update({ status: "completed" })
			.eq("id", saleId);

		if (error) {
			// console.error("❌ Supabase update error:", error.message);
			return withNgrokHeader({ error: "Database update failed" }, 500);
		}

		// console.log("✅ Sale updated:", saleId);
		return withNgrokHeader({ message: "Sale updated successfully" }, 200);
	}

	// console.log("ℹ️ Event ignored:", event.event);
	return withNgrokHeader({ message: "Event ignored" }, 200);
}
