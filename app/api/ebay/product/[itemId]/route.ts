import { NextRequest, NextResponse } from "next/server";
import { getEbayProductById } from "@/lib/ebay-server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ itemId: string }> },
) {
	const { itemId } = await params;

	if (!itemId) {
		return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
	}

	try {
		// If it's a UUID, it's a local Supabase product
		if (
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
				itemId,
			)
		) {
			const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
			const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
			const supabase = createClient(supabaseUrl, supabaseKey);

			const { data: productData, error: productError } = await supabase
				.from("products")
				.select("*")
				.eq("id", itemId)
				.single();

			if (productError || !productData) {
				return NextResponse.json(
					{ error: "Product not found" },
					{ status: 404 },
				);
			}

			const { data: imagesData } = await supabase
				.from("product_images")
				.select("*")
				.eq("product_id", itemId)
				.order("display_order", { ascending: true });

			const additionalImagesUrl =
				imagesData?.map((img: any) => img.image_url) || [];

			// Parse detailed_specs (JSON string like '[{"key":"Brand","value":"Apple"}]')
			let specifications = [];
			if (productData.detailed_specs) {
				try {
					specifications = JSON.parse(productData.detailed_specs);
					if (!Array.isArray(specifications)) {
						specifications = [
							{ key: "Details", value: productData.detailed_specs },
						];
					}
				} catch (e) {
					// Fallback if it's raw text
					specifications = [
						{ key: "Details", value: productData.detailed_specs },
					];
				}
			}

			const localProduct = {
				id: productData.id,
				title: productData.name,
				price: { value: productData.price || 0, currency: "GHS" },
				originalPrice: productData.original_price
					? { value: parseFloat(productData.original_price), currency: "GHS" }
					: undefined,
				image: productData.image_url,
				categoryId: productData.category,
				additionalImages: [
					productData.image_url,
					...additionalImagesUrl,
				].filter(Boolean),
				category: productData.category,
				condition: productData.condition,
				shipping: "Request Delivery",
				seller: "Payless4tech",
				itemUrl: "",
				isPreorder: productData.status === "pre-order",
				estimatedAvailabilityStatus:
					productData.stock > 0 || productData.status === "pre-order"
						? "IN_STOCK"
						: "OUT_OF_STOCK",
				specifications,
			};

			return NextResponse.json(localProduct);
		}

		// Otherwise, fetch from eBay API
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
