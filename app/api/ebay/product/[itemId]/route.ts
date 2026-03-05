import { NextRequest, NextResponse } from "next/server";
import { getProductDetailsById } from "@/lib/product-details";

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ itemId: string }> },
) {
	const { itemId } = await params;

	if (!itemId) {
		return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
	}

	try {
		const product = await getProductDetailsById(itemId);

		if (!product) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		return NextResponse.json(product);
	} catch (error) {
		console.error("Error fetching eBay product:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch product",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
