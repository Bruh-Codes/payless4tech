import { NextRequest, NextResponse } from "next/server";
import { searchEbayProducts } from "@/lib/ebay-server";

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
	return NextResponse.json(data);
}
