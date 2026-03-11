import { NextRequest, NextResponse } from "next/server";
import { searchEbayProducts } from "@/lib/ebay-server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

type LocalSortConfig = {
	column: "created_at" | "price";
	ascending: boolean;
};

const DEFAULT_LOCAL_SORT: LocalSortConfig = {
	column: "created_at",
	ascending: false,
};

const LOCAL_CONDITION_MAP: Record<string, string[]> = {
	new: ["new", "brand new"],
	used: ["used", "pre-owned", "pre owned", "fair", "good", "excellent"],
	refurbished: ["refurbished", "renewed"],
};

function mapLocalProduct(p: any) {
	return {
		id: p.id,
		title: p.name,
		price: { value: p.price, currency: "GHS" },
		originalPrice: p.original_price
			? { value: parseFloat(p.original_price), currency: "GHS" }
			: undefined,
		image: p.image_url,
		category: p.category,
		condition: p.condition || "New",
		shipping: "Within 24hrs",
		seller: "Payless4tech",
		itemUrl: `/product/${p.id}`,
		isPreorder: false,
		isLocal: true,
	};
}

function getLocalSortConfig(
	sortOrder: "newlyListed" | "bestMatch" | "price" | "-price",
): LocalSortConfig {
	switch (sortOrder) {
		case "newlyListed":
			return { column: "created_at", ascending: false };
		case "price":
			return { column: "price", ascending: true };
		case "-price":
			return { column: "price", ascending: false };
		case "bestMatch":
		default:
			return DEFAULT_LOCAL_SORT;
	}
}

async function fetchLocalProducts({
	q,
	offset,
	limit,
	sortOrder,
	categorySlug,
	minPrice,
	maxPrice,
	conditions,
	brands,
}: {
	q: string;
	offset: number;
	limit: number;
	sortOrder: "newlyListed" | "bestMatch" | "price" | "-price";
	categorySlug: string | undefined;
	minPrice: number | undefined;
	maxPrice: number | undefined;
	conditions: string[] | undefined;
	brands: string[] | undefined;
}) {
	let countQuery = supabase
		.from("products")
		.select("*", { count: "exact", head: true })
		.in("status", ["available", "new"]);

	let dataQuery = supabase
		.from("products")
		.select("*")
		.in("status", ["available", "new"]);

	if (q) {
		const searchPattern = `%${q}%`;
		countQuery = countQuery.or(
			`name.ilike.${searchPattern},description.ilike.${searchPattern}`,
		);
		dataQuery = dataQuery.or(
			`name.ilike.${searchPattern},description.ilike.${searchPattern}`,
		);
	}

	if (categorySlug) {
		countQuery = countQuery.eq("category", categorySlug);
		dataQuery = dataQuery.eq("category", categorySlug);
	}

	if (minPrice !== undefined) {
		countQuery = countQuery.gte("price", minPrice);
		dataQuery = dataQuery.gte("price", minPrice);
	}

	if (maxPrice !== undefined) {
		countQuery = countQuery.lte("price", maxPrice);
		dataQuery = dataQuery.lte("price", maxPrice);
	}

	if (conditions && conditions.length > 0) {
		const normalizedConditions = conditions
			.flatMap((condition) => {
				const normalizedCondition = condition.trim().toLowerCase();
				return LOCAL_CONDITION_MAP[normalizedCondition] || [normalizedCondition];
			})
			.filter(Boolean);

		if (normalizedConditions.length > 0) {
			const conditionFilter = normalizedConditions
				.map((condition) => `condition.ilike.%${condition}%`)
				.join(",");
			countQuery = countQuery.or(conditionFilter);
			dataQuery = dataQuery.or(conditionFilter);
		}
	}

	if (brands && brands.length > 0) {
		const brandFilter = brands
			.map((brand) => {
				const trimmedBrand = brand.trim();
				return `name.ilike.%${trimmedBrand}%,description.ilike.%${trimmedBrand}%`;
			})
			.join(",");
		countQuery = countQuery.or(brandFilter);
		dataQuery = dataQuery.or(brandFilter);
	}

	const sortConfig = getLocalSortConfig(sortOrder);
	dataQuery = dataQuery
		.order(sortConfig.column, { ascending: sortConfig.ascending })
		.range(offset, offset + Math.max(limit - 1, 0));

	const [{ count, error: countError }, { data, error: dataError }] =
		await Promise.all([countQuery, dataQuery]);

	if (countError) {
		throw countError;
	}

	if (dataError) {
		throw dataError;
	}

	return {
		totalCount: count || 0,
		items: (data || []).map(mapLocalProduct),
	};
}

async function fetchCombinedEbayItems({
	q,
	offset,
	limit,
	currency,
	sortOrder,
	categorySlug,
	minPrice,
	maxPrice,
	conditions,
	brands,
}: {
	q: string;
	offset: number;
	limit: number;
	currency: "USD" | "GHS";
	sortOrder: "newlyListed" | "bestMatch" | "price" | "-price";
	categorySlug: string | undefined;
	minPrice: number | undefined;
	maxPrice: number | undefined;
	conditions: string[] | undefined;
	brands: string[] | undefined;
}) {
	if (limit <= 0) {
		return { items: [], totalCount: 0 };
	}

	const ebayPageSize = Math.max(limit, 10);
	const firstEbayPage = Math.floor(offset / ebayPageSize) + 1;
	let currentPage = firstEbayPage;
	let skipped = offset % ebayPageSize;
	let items: any[] = [];
	let totalCount = 0;

	while (items.length < limit) {
		const ebayData = await searchEbayProducts(
			q,
			currentPage,
			ebayPageSize,
			currency,
			sortOrder,
			categorySlug,
			minPrice,
			maxPrice,
			conditions,
			brands,
		);

		totalCount = ebayData.totalCount || totalCount;

		const pageItems = ebayData.items || [];
		if (pageItems.length === 0) {
			break;
		}

		const slicedPageItems =
			skipped > 0 ? pageItems.slice(skipped) : pageItems.slice();
		items.push(...slicedPageItems);

		if (pageItems.length < ebayPageSize) {
			break;
		}

		currentPage += 1;
		skipped = 0;
	}

	return {
		items: items.slice(0, limit),
		totalCount,
	};
}

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
	const safePage = Number.isFinite(page) && page > 0 ? page : 1;
	const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 5;
	const offset = (safePage - 1) * safeLimit;
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

	try {
		const localData = await fetchLocalProducts({
			q,
			offset,
			limit: safeLimit,
			sortOrder,
			categorySlug,
			minPrice,
			maxPrice,
			conditions,
			brands,
		});

		const localCount = localData.totalCount;
		const localItems = localData.items;
		const remainingSlots = Math.max(safeLimit - localItems.length, 0);
		const ebayOffset = Math.max(offset - localCount, 0);

		const ebayData =
			remainingSlots > 0
				? await fetchCombinedEbayItems({
						q,
						offset: ebayOffset,
						limit: remainingSlots,
						currency,
						sortOrder,
						categorySlug,
						minPrice,
						maxPrice,
						conditions,
						brands,
					})
				: { items: [], totalCount: 0 };

		return NextResponse.json({
			items: [...localItems, ...ebayData.items],
			totalCount: localCount + ebayData.totalCount,
			pageNumber: safePage,
		});
	} catch (error) {
		console.error("Error fetching combined shop search results:", error);

		const fallbackEbayData = await searchEbayProducts(
			q,
			safePage,
			safeLimit,
			currency,
			sortOrder,
			categorySlug,
			minPrice,
			maxPrice,
			conditions,
			brands,
		);

		return NextResponse.json(fallbackEbayData);
	}
}
