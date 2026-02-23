import { NextRequest, NextResponse } from "next/server";
import https from "https";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = await req.json();
	const { email, amount, items } = body;
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

	const saleId = items && items.length > 0 ? items[0].sale_id : null;

	const params = JSON.stringify({
		email,
		amount,
		callback_url: `${baseUrl}/api/paystack/redirect`,
		metadata: {
			custom_fields: [
				{
					display_name: "Sale ID",
					variable_name: "sale_id",
					value: saleId,
				},
			],
			items: items?.map((item: any) => ({ ...item })),
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
				const result = JSON.parse(data);
				if (result.status) {
					resolve(NextResponse.json({ url: result.data }));
				} else {
					resolve(
						NextResponse.json({ error: result.message }, { status: 400 }),
					);
				}
			});
		});

		paystackReq.on("error", (error) => {
			console.error(error);
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
