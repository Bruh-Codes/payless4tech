import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers":
		"authorization, x-client-info, apikey, content-type",
};

interface OrderDetails {
	saleId: string;
	items: Array<{
		name: string;
		quantity: number;
		price: number;
	}>;
	total: number;
	customerDetails: {
		email: string;
		phoneNumber: string;
		alternativePhone?: string;
		deliveryAddress: string;
		gpsLocation?: string;
	};
	extendedWarranty: boolean;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "OPTIONS") {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader(
			"Access-Control-Allow-Headers",
			corsHeaders["Access-Control-Allow-Headers"]
		);
		return res.status(200).end();
	}

	try {
		console.log("Starting email send process...");
		console.log("RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);

		if (!process.env.RESEND_API_KEY) {
			throw new Error("RESEND_API_KEY is not configured");
		}

		const { orderDetails } = req.body as { orderDetails: OrderDetails };
		console.log(
			"Received order details:",
			JSON.stringify(orderDetails, null, 2)
		);

		const itemsList = orderDetails.items
			.map(
				(item) => `
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${
						item.quantity
					}</td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">₵${item.price.toLocaleString()}</td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">₵${(
						item.price * item.quantity
					).toLocaleString()}</td>
        </tr>
      `
			)
			.join("");

		const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Order Notification - Payless4Tech</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #2c5282; margin-bottom: 20px; text-align: center;">New Order Received</h1>
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #4a5568; margin-top: 0;">Order ID: ${
								orderDetails.saleId
							}</h2>
              <p style="margin: 5px 0;"><strong>Customer Email:</strong> ${
								orderDetails.customerDetails.email
							}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${
								orderDetails.customerDetails.phoneNumber
							}</p>
              ${
								orderDetails.customerDetails.alternativePhone
									? `<p style="margin: 5px 0;"><strong>Alternative Phone:</strong> ${orderDetails.customerDetails.alternativePhone}</p>`
									: ""
							}
              <p style="margin: 5px 0;"><strong>Delivery Address:</strong> ${
								orderDetails.customerDetails.deliveryAddress
							}</p>
              ${
								orderDetails.customerDetails.gpsLocation
									? `<p style="margin: 5px 0;"><strong>GPS Location:</strong> ${orderDetails.customerDetails.gpsLocation}</p>`
									: ""
							}
            </div>

            <h3 style="color: #4a5568; margin-top: 30px;">Order Items:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f7fafc;">
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Product</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Qty</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Unit Price</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>

            ${
							orderDetails.extendedWarranty
								? `<p style="color: #2c5282; font-weight: bold; margin: 10px 0;">Extended Warranty Added: ₵500.00</p>`
								: ""
						}
            
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <p style="font-size: 18px; font-weight: bold; margin: 0;">
                Total Amount: ₵${orderDetails.total.toLocaleString()}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

		console.log("Attempting to send email...");

		const emailResponse = await resend.emails.send({
			from: "Payless4Tech <orders@payless4tech.com>",
			to: ["joy@payless4tech.com"],
			subject: `New Order #${orderDetails.saleId} - Payless4Tech`,
			html: emailHtml,
			replyTo: orderDetails.customerDetails.email,
		});

		console.log("Email API Response:", emailResponse);

		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Content-Type", "application/json");
		return res.status(200).json({
			success: true,
			message: "Order notification sent successfully",
			response: emailResponse,
		});
	} catch (error: any) {
		console.error("Error in send-order-email function:", error);
		console.error("Error details:", {
			message: error.message,
			stack: error.stack,
		});

		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Content-Type", "application/json");
		return res.status(500).json({
			error: "Failed to send order notification",
			details: error.message,
			stack: error.stack,
		});
	}
}
