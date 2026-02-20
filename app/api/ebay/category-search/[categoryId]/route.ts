import { NextRequest, NextResponse } from "next/server";
import { searchEbayProducts } from "@/lib/ebay-server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ categoryId: string }> },
) {
	const { categoryId } = await params;
	const searchParams = req.nextUrl.searchParams;
	const limit = parseInt(searchParams.get("limit") || "10");

	if (!categoryId) {
		return NextResponse.json(
			{ error: "Category ID is required" },
			{ status: 400 },
		);
	}

	try {
		// Search for products in the same category
		// Use empty query to get all items in the category
		const data = await searchEbayProducts(
			"", // Empty query for category-only search
			1, // Page 1
			limit, // Use provided limit
			"GHS", // Target currency
			"newlyListed", // Sort order
			categoryId, // Category ID as string
			undefined, // No min price
			undefined, // No max price
			["NEW"], // Only new items
			undefined, // No specific brands
		);

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching items by category:", error);
		return NextResponse.json(
			{ error: "Failed to fetch items by category" },
			{ status: 500 },
		);
	}
}
