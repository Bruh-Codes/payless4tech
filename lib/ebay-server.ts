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

export async function getItemsByItemGroup(
	itemGroupId: string,
	targetCurrency: "USD" | "GHS" = "GHS",
) {
	// console.log("getItemsByItemGroup called with:", itemGroupId);

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

	if (!tokenRes.ok) {
		const errorText = await tokenRes.text();
		// console.error("Token fetch error:", tokenRes.status, errorText);
		throw new Error(`Token fetch failed: ${tokenRes.status} - ${errorText}`);
	}
	const { access_token } = await tokenRes.json();

	// ---- Get items by item group ----
	const res = await fetch(
		`${baseUrl}/buy/browse/v1/item/get_items_by_item_group?item_group_id=${encodeURIComponent(itemGroupId)}`,
		{
			headers: {
				Authorization: `Bearer ${access_token}`,
				"X-EBAY-C-MARKETPLACE-ID": marketplaceId,
				Accept: "application/json",
			},
		},
	);

	if (!res.ok) {
		const errorText = await res.text();
		// console.error("Item Group API Error:", res.status, errorText);
		// console.error(
		// 	"Request URL:",
		// 	`${baseUrl}/buy/browse/v1/item/get_items_by_item_group?item_group_id=${encodeURIComponent(itemGroupId)}`,
		// );
		throw new Error(`Item Group API failed: ${res.status} - ${errorText}`);
	}

	const data = await res.json();
	// console.log("Data structure:", Object.keys(data));
	// console.log("ItemSummaries:", data.itemSummaries);
	// console.log("Item Group API Response items[0]:", data.items?.[0]);
	// console.log("Category ID from first item:", data.items?.[0]?.categoryId);
	// console.log("Category from first item:", data.items?.[0]?.categories?.[0]);

	// Process items similar to searchEbayProducts function
	const processedItems = await Promise.all(
		(data.items ?? [])
			.filter((it: any) => it.image?.imageUrl) // Only include products with actual images
			.filter((it: any) => {
				// Filter out unavailable items
				const availabilityStatus = it.estimatedAvailabilityStatus;

				// Exclude OUT_OF_STOCK items
				if (availabilityStatus === "OUT_OF_STOCK") {
					return false;
				}
				return true;
			})
			.map(async (it: any) => {
				// Convert price to target currency
				const convertedPrice = await convertPrice(
					{
						value: Number(it.price?.value ?? 0),
						currency: it.price?.currency ?? "USD",
					},
					targetCurrency,
				);

				return {
					id: it.itemId ?? "",
					title: it.title ?? "",
					price: convertedPrice,
					image: it.image?.imageUrl ?? "",
					additionalImages:
						it.additionalImages?.map((img: any) => img.imageUrl) || [],
					category: it.categoryId ? getCategoryName(it.categoryId) : "Unknown",
					condition: it.condition ?? "Unknown",
					shipping: "Request Delivery",
					seller: "payless4tech",
					itemUrl: it.itemWebUrl ?? "",
					isPreorder: false,
					estimatedAvailabilityStatus: it.estimatedAvailabilityStatus,
					itemEndDate: it.itemEndDate,
					specifications: it.localizedAspects
						? it.localizedAspects.map((aspect: any) => ({
								key: aspect.name || "Unknown",
								value: aspect.value || "Unknown",
							}))
						: [],
				};
			}),
	);

	return {
		items: processedItems,
		totalCount: data.total || processedItems.length,
		pageNumber: 1,
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
		// Check if it's already a numeric category ID or a comma-separated list of IDs
		if (/^\d+(,\d+)*$/.test(categorySlug)) {
			// It's already numeric category IDs, use directly
			url.searchParams.set("category_ids", categorySlug);
		} else {
			// Handle multiple category slugs (comma-separated)
			const categorySlugs = categorySlug.split(",");
			const categoryIds = categorySlugs
				.map((slug) => EBAY_CATEGORY_IDS[slug.trim()])
				.filter((id) => id && id !== "0");

			if (categoryIds.length > 0) {
				url.searchParams.set("category_ids", categoryIds.join(","));
			}
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

// Map eBay category IDs to readable names
const getCategoryName = (categoryId: string): string => {
	const categoryMap: Record<string, string> = {
		// Cell Phones & Accessories
		"20349": "Cell Phone Cases & Covers",
		"175672": "Cell Phones & Accessories",
		"175673": "Cell Phone Accessories",
		"175674": "Cell Phone Cases & Covers",
		"9395": "Smartphones",
		"175676": "Cell Phones",
		"175677": "Cell Phone Parts",
		"175678": "Smart Watches",

		// Electronics
		"293": "Computers & Tablets",
		"175679": "Computer Components",
		"175680": "Laptop Accessories",
		"175681": "Computer Accessories",
		"175682": "Tablets",
		"175683": "Desktop Computers",
		"175684": "Laptops",

		// Audio & Video
		"329": "Audio & Home Theater",
		"175685": "Headphones",
		"175686": "Speakers",
		"175687": "Audio Accessories",
		"175688": "TV & Video",
		"175689": "Home Theater",

		// Gaming
		"1247": "Video Games & Consoles",
		"175690": "Video Games",
		"175691": "Gaming Consoles",
		"175692": "Gaming Accessories",
		"175693": "PC Gaming",

		// Cameras & Photo
		"625": "Cameras & Photo",
		"175694": "Digital Cameras",
		"175695": "Camera Accessories",
		"175696": "Lenses",
		"175697": "Photography",

		// Wearables
		"175698": "Smart Watches",
		"175699": "Fitness Trackers",
		"175700": "Wearable Technology",
		"175701": "Smart Bands",

		// General Tech
		"175702": "Electronics",
		"175703": "Tech Accessories",
		"175704": "Gadgets",
		"175705": "Digital Devices",
	};
	return categoryMap[categoryId] || "Accessories";
};

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
		`${baseUrl}/buy/browse/v1/item/${encodeURIComponent(itemId)}?fieldgroups=PRODUCT`,
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

	// // Debug: Log actual eBay API response structure for product details
	// console.log(
	// 	"eBay Product API response structure:",
	// 	JSON.stringify(data, null, 2),
	// );

	let imageUrl = data.image?.imageUrl ?? "";
	if (imageUrl) {
		imageUrl = imageUrl.replace("http://", "https://");
	} else {
		imageUrl =
			"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80";
	}

	// Extract additional images if available
	const additionalImages =
		data?.primaryItemGroup?.itemGroupAdditionalImages?.map(
			(img: any) => img.imageUrl,
		) || [];
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
		categoryId: data.categoryId,
		additionalImages: allImages, // Limit to 4 additional images
		category: data.categoryId ? getCategoryName(data.categoryId) : "Unknown",
		condition: data.condition ?? "Unknown",
		shipping: "Request Delivery",
		seller: "payless4tech",
		itemUrl: data.itemWebUrl ?? "",
		isPreorder: true,
		// Add availability fields
		estimatedAvailabilityStatus: data.estimatedAvailabilityStatus,
		itemEndDate: data.itemEndDate,
		// Add itemGroupId for related products
		itemGroupId: data.primaryItemGroup?.itemGroupId,
		// Add specifications from eBay API
		specifications: data.localizedAspects
			? data.localizedAspects.map((aspect: any) => ({
					key: aspect.name || "Unknown",
					value: aspect.value || "Unknown",
				}))
			: [],
	};
}
