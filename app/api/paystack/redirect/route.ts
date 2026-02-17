import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const reference = searchParams.get("reference");

	if (reference) {
		// Redirect to home with success parameters
		return NextResponse.redirect(
			new URL(`/?payment_success=true&reference=${reference}`, req.url),
		);
	}

	// If no reference, redirect to home
	return NextResponse.redirect(new URL("/", req.url));
}
