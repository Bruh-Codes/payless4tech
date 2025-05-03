import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers":
		"authorization, x-client-info, apikey, content-type",
};

interface PreorderDetails {
	fullName: string;
	email: string;
	phoneNumber: string;
	itemType: string;
	specifications: string;
	deliveryAddress?: string;
	alternativePhone?: string;
	gpsLocation?: string;
}

export async function OPTIONS() {
	return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
	try {
		if (!RESEND_API_KEY) {
			console.error("RESEND_API_KEY is not set");
			throw new Error("Email service configuration is missing");
		}

		const isTest = req.headers.get("x-test-mode") === "true";
		let preorderDetails: PreorderDetails;

		if (isTest) {
			preorderDetails = {
				fullName: "Test User",
				email: "joy@payless4tech.com",
				phoneNumber: "1234567890",
				itemType: "Test Item",
				specifications: "Test Specifications",
			};
		} else {
			const body = await req.json();
			preorderDetails = body.preorderDetails;
		}

		const emailHtml = `
      <h2>New Preorder Request</h2>
      <p><strong>Customer Name:</strong> ${preorderDetails.fullName}</p>
      <p><strong>Email:</strong> ${preorderDetails.email}</p>
      <p><strong>Phone:</strong> ${preorderDetails.phoneNumber}</p>
      ${
				preorderDetails.alternativePhone
					? `<p><strong>Alternative Phone:</strong> ${preorderDetails.alternativePhone}</p>`
					: ""
			}
      ${
				preorderDetails.deliveryAddress
					? `<p><strong>Delivery Address:</strong> ${preorderDetails.deliveryAddress}</p>`
					: ""
			}
      ${
				preorderDetails.gpsLocation
					? `<p><strong>GPS Location:</strong> ${preorderDetails.gpsLocation}</p>`
					: ""
			}
      <p><strong>Item Type:</strong> ${preorderDetails.itemType}</p>
      <p><strong>Specifications:</strong></p>
      <p>${preorderDetails.specifications}</p>
    `;

		const emailResponse = await resend.emails.send({
			from: "Payless4Tech <orders@payless4tech.com>",
			to: ["joy@payless4tech.com"],
			subject: isTest
				? "TEST - New Preorder Request - Payless4Tech"
				: "New Preorder Request - Payless4Tech",
			html: emailHtml,
			replyTo: preorderDetails.email,
		});

		return NextResponse.json(
			{
				success: true,
				message: isTest
					? "Test email sent successfully"
					: "Email sent successfully",
				response: emailResponse,
			},
			{ headers: corsHeaders, status: 200 }
		);
	} catch (error: any) {
		console.error("Error in send-preorder-email API:", error);
		return NextResponse.json(
			{
				error: "Failed to process preorder notification",
				details: error.message,
			},
			{ headers: corsHeaders, status: 500 }
		);
	}
}
