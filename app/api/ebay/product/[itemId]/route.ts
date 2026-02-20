import { NextRequest, NextResponse } from "next/server";
import { getEbayProductById } from "@/lib/ebay-server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { itemId: string } },
) {
	const { itemId } = params;

	if (!itemId) {
		return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
	}

	try {
		const product = await getEbayProductById(itemId);

		if (!product) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		// Check if product is available
		if (product.estimatedAvailabilityStatus === "OUT_OF_STOCK") {
			return NextResponse.json(
				{ error: "Product is out of stock" },
				{ status: 410 }, // 410 Gone is appropriate for unavailable resources
			);
		}

		// Check if product listing has ended
		if (product.itemEndDate) {
			const endDate = new Date(product.itemEndDate);
			const now = new Date();
			if (endDate < now) {
				return NextResponse.json(
					{ error: "Product listing has ended" },
					{ status: 410 },
				);
			}
		}

		return NextResponse.json(product);
	} catch (error) {
		console.error("Error fetching eBay product:", error);
		return NextResponse.json(
			{ error: "Failed to fetch product" },
			{ status: 500 },
		);
	}
}
