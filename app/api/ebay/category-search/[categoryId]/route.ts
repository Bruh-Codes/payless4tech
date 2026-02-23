import { NextRequest, NextResponse } from "next/server";
import { searchEbayProducts } from "@/lib/ebay-server";
import { createClient } from "@supabase/supabase-js";

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
		// Fetch local products
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
		const supabaseKey =
			process.env.SUPABASE_SERVICE_ROLE_KEY ||
			process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
		const supabase = createClient(supabaseUrl, supabaseKey);

		// Also try to get local products from the category, fallback to just eBay
		const { data: localProducts } = await supabase
			.from("products")
			.select("*")
			.eq("category", categoryId)
			.limit(limit);

		const mappedLocalProducts = (localProducts || []).map((p) => {
			let specifications = [];
			if (p.detailed_specs) {
				try {
					specifications = JSON.parse(p.detailed_specs);
					if (!Array.isArray(specifications)) {
						specifications = [{ key: "Details", value: p.detailed_specs }];
					}
				} catch (e) {
					specifications = [{ key: "Details", value: p.detailed_specs }];
				}
			}

			return {
				id: p.id,
				title: p.name,
				price: { value: p.price || 0, currency: "GHS" },
				originalPrice: p.original_price
					? { value: parseFloat(p.original_price), currency: "GHS" }
					: undefined,
				image: p.image_url,
				category: p.category,
				categoryId: p.category,
				condition: p.condition || "New",
				shipping: "Request Delivery",
				seller: "Payless4tech",
				itemUrl: "",
				isPreorder: p.status === "pre-order",
				estimatedAvailabilityStatus:
					p.stock > 0 || p.status === "pre-order" ? "IN_STOCK" : "OUT_OF_STOCK",
				specifications,
			};
		});

		// Search for products in the same category (eBay)
		let ebayData: { items: any[]; totalCount: number; pageNumber: number } = {
			items: [],
			totalCount: 0,
			pageNumber: 1,
		};
		try {
			ebayData = await searchEbayProducts(
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
		} catch (e) {
			console.error("eBay search failed but providing local fallbacks:", e);
		}

		// Merge results, giving priority to local products
		const items = [...mappedLocalProducts, ...(ebayData.items || [])].slice(
			0,
			limit,
		);

		return NextResponse.json({
			items,
			totalCount: (ebayData.totalCount || 0) + mappedLocalProducts.length,
			pageNumber: 1,
		});
	} catch (error) {
		console.error("Error fetching items by category:", error);
		return NextResponse.json(
			{ error: "Failed to fetch items by category" },
			{ status: 500 },
		);
	}
}
