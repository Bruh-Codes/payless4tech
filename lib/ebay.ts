// Types for eBay API response
export interface EbayItem {
	id: string;
	title: string;
	price: {
		value: number;
		currency: string;
	};
	originalPrice?: {
		value: number;
		currency: string;
	};
	image: string;
	additionalImages?: string[];
	category: string;
	condition: string;
	shipping: string;
	seller: string;
	itemUrl: string;
	isPreorder: boolean;
	estimatedAvailabilityStatus?: string;
	itemEndDate?: string;
	// Quality metadata
	qualityScore?: number;
	epid?: string;
	itemGroupHref?: string;
	sellerFeedbackScore?: number;
	sellerFeedbackPercentage?: number;
}

export interface EbaySearchResponse {
	items: EbayItem[];
	totalCount: number;
	pageNumber: number;
}

// Local product type (should match the one in lib/products.ts)
export interface Product {
	id: string;
	title: string;
	price: number;
	originalPrice?: number;
	image: string;
	category: string;
	condition: string;
	rating: number;
	reviews: number;
	shipping: string;
	seller: string;
	isPreorder?: boolean;
}

// Convert eBay item to local product format
export function convertEbayToLocalProduct(ebayItem: EbayItem): Product {
	return {
		id: ebayItem.id,
		title: ebayItem.title,
		price: ebayItem.price.value,
		originalPrice: ebayItem.originalPrice?.value,
		currency: ebayItem.price.currency, // Add currency field
		image: ebayItem.image,
		category: ebayItem.category,
		condition: ebayItem.condition,
		rating: 0, // eBay doesn't provide rating in this API
		reviews: 0, // eBay doesn't provide reviews in this API
		shipping: "Request Delivery",
		seller: "Payless4Tech",
		isPreorder: ebayItem.isPreorder,
	} as Product; // Type assertion to bypass TypeScript cache issue
}

// Export the search function for the hook
export async function searchEbayProducts(
	query: string,
	pageNumber = 1,
	limit = 5,
	currency: "USD" | "GHS" = "GHS",
	sortOrder: "newlyListed" | "bestMatch" | "price" | "-price" = "bestMatch",
	categorySlug?: string,
	minPrice?: number,
	maxPrice?: number,
	conditions?: string[],
	brands?: string[],
): Promise<EbaySearchResponse> {
	const params = new URLSearchParams({
		q: query,
		page: pageNumber.toString(),
		limit: limit.toString(),
		currency,
		sort: sortOrder,
	});

	if (categorySlug) {
		params.set("categories", categorySlug);
	}
	if (minPrice !== undefined) {
		params.set("minPrice", minPrice.toString());
	}
	if (maxPrice !== undefined) {
		params.set("maxPrice", maxPrice.toString());
	}
	if (conditions && conditions.length > 0) {
		params.set("conditions", conditions.join(","));
	}
	if (brands && brands.length > 0) {
		params.set("brands", brands.join(","));
	}

	const res = await fetch(`/api/ebay/search?${params.toString()}`);
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}
