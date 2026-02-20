// Server-side eBay API functions
import { EBAY_CATEGORY_IDS } from "./ebay-categories";

// Exchange rate cache (in memory, expires after 1 hour)
let exchangeRateCache: { rate: number; timestamp: number } | null = null;

// Fetch real-time exchange rate from exchangerate.host
async function getExchangeRateUSDToGHS(): Promise<number> {
	const now = Date.now();
	const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

	// Return cached rate if still valid
	if (exchangeRateCache && now - exchangeRateCache.timestamp < CACHE_DURATION) {
		return exchangeRateCache.rate;
	}

	try {
		const response = await fetch("https://open.er-api.com/v6/latest/USD");

		if (!response.ok) {
			throw new Error(`Exchange rate API failed: ${response.status}`);
		}

		const data = await response.json();
		const rate = data.rates?.GHS;

		if (!rate || typeof rate !== "number") {
			throw new Error("Invalid exchange rate response");
		}

		// Cache the new rate
		exchangeRateCache = {
			rate,
			timestamp: now,
		};

		return rate;
	} catch (error) {
		// Fallback to previous cached rate if available
		if (exchangeRateCache) {
			return exchangeRateCache.rate;
		}

		// Ultimate fallback to fixed rate
		return 13.8;
	}
}

// Convert price from USD to GHS using real-time rate
async function convertPrice(
	price: { value: number; currency: string },
	targetCurrency: "USD" | "GHS" = "USD",
): Promise<{ value: number; currency: string }> {
	if (price.currency === targetCurrency) {
		return price;
	}

	// Convert to USD first if needed
	const usdValue =
		price.currency === "USD"
			? price.value
			: price.value / (await getExchangeRateUSDToGHS());

	// Convert to target currency
	if (targetCurrency === "GHS") {
		const ghsValue = usdValue * (await getExchangeRateUSDToGHS());
		return {
			value: Math.round(ghsValue * 100) / 100, // Round to 2 decimal places
			currency: "GHS",
		};
	}

	return {
		value: usdValue,
		currency: "USD",
	};
}

export async function searchEbayProducts(
	query: string,
	pageNumber = 1,
	limit = 5,
	targetCurrency: "USD" | "GHS" = "GHS", // Default to GHS
	sortOrder: "newlyListed" | "bestMatch" | "price" | "-price" = "newlyListed", // Default to newly listed
	categorySlug?: string, // Optional category slug for filtering
	minPrice?: number,
	maxPrice?: number,
	conditions?: string[],
	brands?: string[], // Add brands parameter
) {
	const q = query.trim();

	// Allow empty query if category is provided (for category-only browsing)
	if (!q && !categorySlug) {
		return { items: [], totalCount: 0, pageNumber };
	}

	const baseUrl =
		process.env.EBAY_ENV === "sandbox"
			? "https://api.sandbox.ebay.com"
			: "https://api.ebay.com";

	const clientId = process.env.EBAY_CLIENT_ID!;
	const clientSecret = process.env.EBAY_CLIENT_SECRET!;
	const marketplaceId = process.env.EBAY_MARKETPLACE_ID || "EBAY_US";

	// ---- Get token (cache later; keeping simple here) ----
	const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

	const tokenRes = await fetch(`${baseUrl}/identity/v1/oauth2/token`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${basic}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "client_credentials",
			scope: "https://api.ebay.com/oauth/api_scope",
		}),
	});

	if (!tokenRes.ok) throw new Error(await tokenRes.text());
	const { access_token } = await tokenRes.json();

	// ---- Browse search ----
	const offset = (pageNumber - 1) * limit;

	const url = new URL(`${baseUrl}/buy/browse/v1/item_summary/search`);
	// Add category filter if provided
	if (categorySlug) {
		// Handle multiple categories (comma-separated)
		const categorySlugs = categorySlug.split(",");
		const categoryIds = categorySlugs
			.map((slug) => EBAY_CATEGORY_IDS[slug.trim()])
			.filter((id) => id && id !== "0");

		if (categoryIds.length > 0) {
			url.searchParams.set("category_ids", categoryIds.join(","));
		}
	}
	// Add query parameter - eBay API requires q OR category_ids, but can have both
	if (q) {
		url.searchParams.set("q", `"${q}"`);
	}
	url.searchParams.set("limit", String(Math.min(limit, 50)));
	url.searchParams.set("offset", String(offset));
	url.searchParams.set("sort", sortOrder);
	url.searchParams.set("fieldgroups", "FULL"); // Get all available data for better results

	// Build dynamic filters
	const filters: string[] = [];

	// Add condition filter
	if (conditions && conditions.length > 0) {
		const conditionFilters = conditions
			.map((c) => `conditions:{${c.toUpperCase()}}`)
			.join(",");
		filters.push(conditionFilters);
	} else {
		// Default to new items if no conditions specified
		filters.push("conditions:NEW");
	}

	// Add brand filter
	if (brands && brands.length > 0) {
		const brandFilters = brands.map((brand) => `brand:${brand}`).join(",");
		filters.push(brandFilters);
	}

	// Add price range filter if specified
	if (minPrice !== undefined && maxPrice !== undefined) {
		filters.push(`price:[${minPrice}..${maxPrice}]`);
	}

	// Set the filter parameter
	const finalFilter = filters.join(",");
	url.searchParams.set("filter", finalFilter);

	const res = await fetch(url.toString(), {
		headers: {
			Authorization: `Bearer ${access_token}`,
			"X-EBAY-C-MARKETPLACE-ID": marketplaceId,
			Accept: "application/json",
		},
	});

	if (!res.ok) throw new Error(await res.text());
	const data = await res.json();

	const processedItems = await Promise.all(
		(data.itemSummaries ?? [])
			.filter((it: any) => it.image?.imageUrl) // Only include products with actual images
			.filter((it: any) => {
				// Filter out unavailable items
				const availabilityStatus = it.estimatedAvailabilityStatus;

				// Exclude OUT_OF_STOCK items
				if (availabilityStatus === "OUT_OF_STOCK") {
					return false;
				}

				// Also exclude items with past end dates (ended listings)
				if (it.itemEndDate) {
					const endDate = new Date(it.itemEndDate);
					const now = new Date();
					if (endDate < now) {
						return false;
					}
				}

				// Include items if they're IN_STOCK, LIMITED_STOCK, or status is unknown
				return true;
			})
			.map(async (it: any) => {
				let imageUrl = it.image?.imageUrl ?? "";
				if (imageUrl) {
					// Convert to HTTPS and get higher quality image
					imageUrl = imageUrl.replace("http://", "https://");
					// Get larger image size if available
					imageUrl = imageUrl.replace("/s-l64.jpg", "/s-l500.jpg");
					imageUrl = imageUrl.replace("/s-l160.jpg", "/s-l500.jpg");
					imageUrl = imageUrl.replace("/s-l225.jpg", "/s-l500.jpg");
				}

				// Note: Additional images come from getItem API, not search
				// We'll fetch them on product details page

				return {
					id: it.itemId ?? "",
					title: it.title ?? "",
					price: await convertPrice(
						it.price ?? { value: 0, currency: "USD" },
						targetCurrency,
					),
					image: imageUrl,
					category: it.categories?.[0]?.categoryName ?? "Unknown",
					condition: it.condition ?? "Unknown",
					shipping: "Request Delivery",
					seller: "Payless4tech",
					itemUrl: it.itemWebUrl ?? "",
					isPreorder: true,
					// Add availability fields
					estimatedAvailabilityStatus: it.estimatedAvailabilityStatus,
					itemEndDate: it.itemEndDate,
				};
			}),
	);

	return {
		items: processedItems,
		totalCount: Number(data.total ?? 0),
		pageNumber,
	};
}

export async function getEbayProductById(itemId: string) {
	const baseUrl =
		process.env.EBAY_ENV === "sandbox"
			? "https://api.sandbox.ebay.com"
			: "https://api.ebay.com";

	const clientId = process.env.EBAY_CLIENT_ID!;
	const clientSecret = process.env.EBAY_CLIENT_SECRET!;
	const marketplaceId = process.env.EBAY_MARKETPLACE_ID || "EBAY_US";

	// ---- Get token ----
	const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

	const tokenRes = await fetch(`${baseUrl}/identity/v1/oauth2/token`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${basic}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "client_credentials",
			scope: "https://api.ebay.com/oauth/api_scope",
		}),
	});

	if (!tokenRes.ok) throw new Error(await tokenRes.text());
	const { access_token } = await tokenRes.json();

	// ---- Get item details ----
	const res = await fetch(
		`${baseUrl}/buy/browse/v1/item/${encodeURIComponent(itemId)}`,
		{
			headers: {
				Authorization: `Bearer ${access_token}`,
				"X-EBAY-C-MARKETPLACE-ID": marketplaceId,
				Accept: "application/json",
			},
		},
	);

	if (!res.ok) throw new Error(await res.text());
	const data = await res.json();

	let imageUrl = data.image?.imageUrl ?? "";
	if (imageUrl) {
		imageUrl = imageUrl.replace("http://", "https://");
	} else {
		imageUrl =
			"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80";
	}

	// Extract additional images if available
	const additionalImages = data.image?.additionalImageUrls || [];
	const allImages = [
		imageUrl,
		...additionalImages.map((url: string) =>
			url.replace("http://", "https://"),
		),
	];

	return {
		id: data.itemId ?? "",
		title: data.title ?? "",
		price: data.price
			? await convertPrice(
					{
						value: Number(data.price.value ?? 0),
						currency: data.price.currency ?? "USD",
					},
					"GHS", // Always convert to GHS for product details
				)
			: { value: 0, currency: "GHS" },
		image: imageUrl,
		additionalImages: allImages.slice(0, 4), // Limit to 4 additional images
		category: data.categories?.[0]?.categoryName ?? "Unknown",
		condition: data.condition ?? "Unknown",
		shipping: "Request Delivery",
		seller: "payless4tech",
		itemUrl: data.itemWebUrl ?? "",
		isPreorder: false,
		// Add availability fields
		estimatedAvailabilityStatus: data.estimatedAvailabilityStatus,
		itemEndDate: data.itemEndDate,
	};
}

export async function testEbayAPI() {
	const baseUrl =
		process.env.EBAY_ENV === "sandbox"
			? "https://api.sandbox.ebay.com"
			: "https://api.ebay.com";

	const clientId = process.env.EBAY_CLIENT_ID!;
	const clientSecret = process.env.EBAY_CLIENT_SECRET!;
	const marketplaceId = process.env.EBAY_MARKETPLACE_ID || "EBAY_US";

	// ---- Get token (cache later; keeping simple here) ----
	const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

	const tokenRes = await fetch(`${baseUrl}/identity/v1/oauth2/token`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${basic}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "client_credentials",
			scope: "https://api.ebay.com/oauth/api_scope",
		}),
	});

	if (!tokenRes.ok) throw new Error(await tokenRes.text());
	const { access_token } = await tokenRes.json();

	// ---- Test category-only search ----
	const testUrl = `${baseUrl}/buy/browse/v1/item_summary/search?category_ids=175672`;
	console.log("Testing eBay API with URL:", testUrl);

	const res = await fetch(testUrl, {
		headers: {
			Authorization: `Bearer ${access_token}`,
			"X-EBAY-C-MARKETPLACE-ID": marketplaceId,
			Accept: "application/json",
		},
	});

	if (!res.ok) throw new Error(await res.text());
	const data = await res.json();

	return {
		success: res.ok,
		data: data,
		url: testUrl,
	};
}
