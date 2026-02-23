import { NextRequest, NextResponse } from "next/server";
import { searchEbayProducts } from "@/lib/ebay-server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const q = searchParams.get("q") || "";
	const page = Number(searchParams.get("page") || "1");
	const limit = Number(searchParams.get("limit") || "5");
	const currency = (searchParams.get("currency") as "USD" | "GHS") || "GHS";
	const sortParam = searchParams.get("sort") || "best-match";

	// Map UI sort values to API sort values
	const sortMapping: Record<
		string,
		"newlyListed" | "bestMatch" | "price" | "-price"
	> = {
		"best-match": "bestMatch",
		"price-low-high": "price",
		"price-high-low": "-price",
		newest: "newlyListed",
		rating: "bestMatch", // Map to bestMatch for now
		reviews: "bestMatch", // Map to bestMatch for now
	};

	const sortOrder = sortMapping[sortParam] || "bestMatch";
	const categorySlug =
		searchParams.get("categories") || searchParams.get("category") || undefined;
	const minPrice = searchParams.get("minPrice")
		? Number(searchParams.get("minPrice"))
		: undefined;
	const maxPrice = searchParams.get("maxPrice")
		? Number(searchParams.get("maxPrice"))
		: undefined;
	const conditions = searchParams.get("conditions")
		? searchParams.get("conditions")!.split(",")
		: undefined;
	const brands = searchParams.get("brands")
		? searchParams.get("brands")!.split(",")
		: undefined;

	const data = await searchEbayProducts(
		q,
		page,
		limit,
		currency,
		sortOrder,
		categorySlug,
		minPrice,
		maxPrice,
		conditions,
		brands,
	);

	// Fetch local products if we are on the first page
	if (page === 1) {
		try {
			let query = supabase
				.from("products")
				.select("*")
				.in("status", ["available", "new"]); // Or any status that signifies availability

			if (q) {
				query = query.ilike("name", `%${q}%`);
			}

			// Apply basic local filtering
			if (minPrice !== undefined) {
				query = query.gte("price", minPrice);
			}
			if (maxPrice !== undefined) {
				query = query.lte("price", maxPrice);
			}

			const { data: localProducts, error } = await query.limit(10);

			if (!error && localProducts && localProducts.length > 0) {
				const localItems = localProducts.map((p) => ({
					id: p.id,
					title: p.name,
					price: { value: p.price, currency: "GHS" },
					originalPrice: p.original_price
						? { value: parseFloat(p.original_price), currency: "GHS" }
						: undefined,
					image: p.image_url,
					category: p.category,
					condition: p.condition || "New",
					shipping: "Request Delivery",
					seller: "Payless4tech",
					itemUrl: `/product/${p.id}`,
					isPreorder: false,
					isLocal: true,
				}));

				// Prepend local items to eBay items
				data.items = [...localItems, ...data.items];
				data.totalCount += localItems.length;
			}
		} catch (err) {
			console.error("Error fetching local products for search:", err);
		}
	}

	return NextResponse.json(data);
}
