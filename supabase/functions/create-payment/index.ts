import type { NextApiRequest, NextApiResponse } from "next";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Apply CORS headers
	Object.entries(corsHeaders).forEach(([key, value]) => {
		res.setHeader(key, value);
	});

	if (req.method === "OPTIONS") {
		res.status(200).end();
		return;
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { amount, email, metadata } = req.body;

		if (!amount || !email) {
			return res.status(400).json({ error: "Missing amount or email" });
		}

		// Construct the callback URL from request origin
		const origin = req.headers.origin || `http://${req.headers.host}`;
		const callback_url = `${origin}/payment/callback`;

		// Initialize payment with Paystack
		const paystackRes = await fetch(
			"https://api.paystack.co/transaction/initialize",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					amount: Math.round(amount * 100), // Convert to pesewas
					email,
					metadata,
					callback_url,
				}),
			}
		);

		const data = await paystackRes.json();

		if (!paystackRes.ok) {
			return res
				.status(paystackRes.status)
				.json({ error: data.message || "Paystack error" });
		}

		return res.status(200).json(data);
	} catch (error: any) {
		console.error("Error initializing payment:", error);
		return res
			.status(500)
			.json({ error: error.message || "Internal Server Error" });
	}
}
