// Server-side eBay API functions
import { EBAY_CATEGORY_IDS } from "./ebay-categories";

// Exchange rate cache (in memory, expires after 1 hour)
let exchangeRateCache: { rate: number; timestamp: number } | null = null;

// eBay OAuth token cache (tokens typically last 2 hours)
let tokenCache: { token: string; expiresAt: number } | null = null;

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

// Get cached eBay OAuth token
async function getEbayAuthToken(): Promise<string> {
	const now = Date.now();

	// Return cached token if still valid (with 5 min buffer)
	if (tokenCache && now < tokenCache.expiresAt - 5 * 60 * 1000) {
		return tokenCache.token;
	}

	const baseUrl =
		process.env.EBAY_ENV === "sandbox"
			? "https://api.sandbox.ebay.com"
			: "https://api.ebay.com";

	const clientId = process.env.EBAY_CLIENT_ID!;
	const clientSecret = process.env.EBAY_CLIENT_SECRET!;
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
		throw new Error(`Token fetch failed: ${tokenRes.status} - ${errorText}`);
	}

	const data = await tokenRes.json();

	// Cache the token (eBay tokens last 7200 seconds / 2 hours)
	tokenCache = {
		token: data.access_token,
		expiresAt: now + (data.expires_in || 7200) * 1000,
	};

	return data.access_token;
}

// ============================================================
// Quality Scoring System
// ============================================================
// Items with higher scores appear first in results.
// This ensures professional, catalog-quality listings are prioritized.

interface QualitySignals {
	hasEpid: boolean; // eBay Product ID = catalog-matched product
	hasItemGroup: boolean; // Multi-variant listing = professional seller
	sellerFeedbackScore: number; // Higher = more established seller
	sellerFeedbackPercentage: number; // Higher = more reputable
	imageQuality: "high" | "medium" | "low"; // Based on image URL pattern
	hasBrand: boolean; // Title contains known brand
	conditionId: string; // New items score higher
	isPriorityListing: boolean; // Promoted listings tend to be pro
	hasMarketingPrice: boolean; // Has original/discount price = retail seller
}

const KNOWN_TECH_BRANDS = [
	"apple",
	"samsung",
	"google",
	"sony",
	"lg",
	"microsoft",
	"dell",
	"hp",
	"lenovo",
	"asus",
	"acer",
	"msi",
	"razer",
	"corsair",
	"logitech",
	"bose",
	"jbl",
	"beats",
	"sennheiser",
	"anker",
	"belkin",
	"motorola",
	"oneplus",
	"xiaomi",
	"huawei",
	"oppo",
	"realme",
	"nothing",
	"nokia",
	"pixel",
	"iphone",
	"ipad",
	"macbook",
	"airpods",
	"galaxy",
	"surface",
	"thinkpad",
	"ideapad",
	"zenbook",
	"rog",
	"alienware",
	"predator",
	"playstation",
	"xbox",
	"nintendo",
	"switch",
	"kindle",
	"echo",
	"dyson",
	"gopro",
	"dji",
	"canon",
	"nikon",
	"fujifilm",
	"panasonic",
	"epson",
	"brother",
	"tp-link",
	"netgear",
	"ubiquiti",
	"seagate",
	"western digital",
	"sandisk",
	"crucial",
	"nvidia",
	"amd",
	"intel",
];

function calculateQualityScore(signals: QualitySignals): number {
	let score = 0;

	// Catalog match is the strongest signal for professional quality (0-30)
	if (signals.hasEpid) score += 30;

	// Multi-variant listings = professional sellers (0-20)
	if (signals.hasItemGroup) score += 20;

	// Seller reputation (0-15)
	if (signals.sellerFeedbackPercentage >= 99) score += 15;
	else if (signals.sellerFeedbackPercentage >= 98) score += 12;
	else if (signals.sellerFeedbackPercentage >= 97) score += 9;
	else if (signals.sellerFeedbackPercentage >= 95) score += 5;

	// Seller established-ness (0-10)
	if (signals.sellerFeedbackScore >= 10000) score += 10;
	else if (signals.sellerFeedbackScore >= 5000) score += 8;
	else if (signals.sellerFeedbackScore >= 1000) score += 6;
	else if (signals.sellerFeedbackScore >= 500) score += 4;
	else if (signals.sellerFeedbackScore >= 100) score += 2;

	// Image quality (0-10)
	if (signals.imageQuality === "high") score += 10;
	else if (signals.imageQuality === "medium") score += 5;

	// Brand recognition (0-8)
	if (signals.hasBrand) score += 8;

	// Condition (0-5)
	if (signals.conditionId === "1000")
		score += 5; // New
	else if (signals.conditionId === "1500")
		score += 4; // Open Box
	else if (signals.conditionId === "2000")
		score += 4; // Certified Refurbished
	else if (signals.conditionId === "2010") score += 3; // Excellent Refurbished

	// Priority/promoted listing (0-3)
	if (signals.isPriorityListing) score += 3;

	// Has marketing price = retail seller (0-4)
	if (signals.hasMarketingPrice) score += 4;

	return score;
}

function getImageQuality(imageUrl: string): "high" | "medium" | "low" {
	if (!imageUrl) return "low";
	if (
		imageUrl.includes("s-l1600") ||
		imageUrl.includes("s-l1200") ||
		imageUrl.includes("s-l960")
	)
		return "high";
	if (imageUrl.includes("s-l500") || imageUrl.includes("s-l400"))
		return "medium";
	return "low";
}

function detectBrand(title: string): boolean {
	const lowerTitle = title.toLowerCase();
	return KNOWN_TECH_BRANDS.some((brand) => lowerTitle.includes(brand));
}

function upgradeImageUrl(imageUrl: string): string {
	if (!imageUrl) return "";

	let url = imageUrl.replace("http://", "https://");

	// Upgrade to the highest quality image available (s-l1600)
	url = url.replace(/\/s-l\d+\.jpg/i, "/s-l1600.jpg");
	url = url.replace(/\/s-l\d+\.png/i, "/s-l1600.png");
	url = url.replace(/\/s-l\d+\.webp/i, "/s-l1600.webp");

	return url;
}

// Map condition IDs to display names
const CONDITION_ID_MAP: Record<string, string> = {
	"1000": "New",
	"1500": "Open Box",
	"1750": "New with defects",
	"2000": "Certified Refurbished",
	"2010": "Excellent - Refurbished",
	"2020": "Very Good - Refurbished",
	"2030": "Good - Refurbished",
	"2500": "Seller Refurbished",
	"2750": "Like New",
	"3000": "Used",
	"4000": "Very Good",
	"5000": "Good",
	"6000": "Acceptable",
	"7000": "For parts or not working",
};

// ============================================================
// API Functions
// ============================================================

export async function getItemsByItemGroup(
	itemGroupId: string,
	targetCurrency: "USD" | "GHS" = "GHS",
) {
	const baseUrl =
		process.env.EBAY_ENV === "sandbox"
			? "https://api.sandbox.ebay.com"
			: "https://api.ebay.com";

	const marketplaceId = process.env.EBAY_MARKETPLACE_ID || "EBAY_US";
	const access_token = await getEbayAuthToken();

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
		throw new Error(`Item Group API failed: ${res.status} - ${errorText}`);
	}

	const data = await res.json();

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
					image: upgradeImageUrl(it.image?.imageUrl ?? ""),
					additionalImages:
						it.additionalImages?.map((img: any) =>
							upgradeImageUrl(img.imageUrl),
						) || [],
					category: it.categoryId ? getCategoryName(it.categoryId) : "Unknown",
					condition:
						CONDITION_ID_MAP[it.conditionId] ?? it.condition ?? "Unknown",
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
	sortOrder: "newlyListed" | "bestMatch" | "price" | "-price" = "bestMatch", // Changed default to bestMatch for quality
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

	const marketplaceId = process.env.EBAY_MARKETPLACE_ID || "EBAY_US";
	const access_token = await getEbayAuthToken();

	// Use standard pagination — quality filters + scoring handle the rest
	const fetchLimit = Math.min(limit, 50);
	const offset = (pageNumber - 1) * fetchLimit;

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
		url.searchParams.set("q", q);
	}
	url.searchParams.set("limit", String(fetchLimit));
	url.searchParams.set("offset", String(offset));
	url.searchParams.set("sort", sortOrder);
	// Use FULL fieldgroups to get all response data including epid, itemGroupHref, seller details
	url.searchParams.set("fieldgroups", "FULL");

	// Build dynamic filters
	const filters: string[] = [];

	// ============================================================
	// KEY FILTER: Only return FIXED_PRICE (Buy It Now) listings
	// This eliminates auction-style individual seller listings with
	// amateur photos. Professional retailers use FIXED_PRICE.
	// ============================================================
	filters.push("buyingOptions:{FIXED_PRICE}");

	// Add condition filter using conditionIds for more precise filtering
	if (conditions && conditions.length > 0) {
		// Map user-friendly conditions to eBay conditionIds
		const conditionIdMapping: Record<string, string> = {
			NEW: "1000",
			OPEN_BOX: "1500",
			CERTIFIED_REFURBISHED: "2000",
			EXCELLENT_REFURBISHED: "2010",
			VERY_GOOD_REFURBISHED: "2020",
			GOOD_REFURBISHED: "2030",
			SELLER_REFURBISHED: "2500",
			LIKE_NEW: "2750",
			USED: "3000",
			VERY_GOOD: "4000",
			GOOD: "5000",
			ACCEPTABLE: "6000",
		};

		const conditionIds = conditions
			.map((c) => conditionIdMapping[c.toUpperCase()] || c)
			.filter(Boolean);

		if (conditionIds.length > 0) {
			filters.push(`conditionIds:{${conditionIds.join("|")}}`);
		}
	} else {
		// Default: Only NEW, Open Box, and Certified/Excellent Refurbished
		// These conditions consistently have professional-quality images
		filters.push("conditionIds:{1000|1500|2000|2010}");
	}

	// ============================================================
	// BRAND FILTER: Use aspect_filter query parameter (not filter)
	// eBay requires: aspect_filter=categoryId:{id},Brand:{brand1|brand2}
	// This is set AFTER filters, as a separate URL param
	// ============================================================

	// ============================================================
	// PRICE RANGE FILTER
	// IMPORTANT: eBay's price filter works in USD only.
	// If the user sets a price range in GHS, we must convert
	// GHS → USD before sending to the eBay API.
	// ============================================================
	if (minPrice !== undefined || maxPrice !== undefined) {
		const rate = await getExchangeRateUSDToGHS();
		// Convert GHS prices to USD for the eBay API filter
		const minUsd =
			minPrice !== undefined ? Math.floor((minPrice / rate) * 100) / 100 : "";
		const maxUsd =
			maxPrice !== undefined ? Math.ceil((maxPrice / rate) * 100) / 100 : "";
		filters.push(`price:[${minUsd}..${maxUsd}]`);
		filters.push("priceCurrency:USD");
	}

	// Only return items that accept returns (professional sellers usually do)
	filters.push("returnsAccepted:true");

	// Set the filter parameter
	const finalFilter = filters.join(",");
	url.searchParams.set("filter", finalFilter);

	// Set brand filter using aspect_filter (separate from filter param)
	// Requires a category_ids to be set
	if (brands && brands.length > 0) {
		// Get the category ID(s) for the aspect_filter
		const categoryId = categorySlug
			? EBAY_CATEGORY_IDS[categorySlug.trim()]
			: undefined;
		if (categoryId && categoryId !== "0") {
			url.searchParams.set(
				"aspect_filter",
				`categoryId:${categoryId},Brand:{${brands.join("|")}}`,
			);
		}
	}

	const res = await fetch(url.toString(), {
		headers: {
			Authorization: `Bearer ${access_token}`,
			"X-EBAY-C-MARKETPLACE-ID": marketplaceId,
			"X-EBAY-C-ENDUSERCTX": "contextualLocation=country%3DUS%2Czip%3D10001",
			Accept: "application/json",
		},
	});

	if (!res.ok) throw new Error(await res.text());
	const data = await res.json();

	// ============================================================
	// Process, Score, and Sort items by quality
	// ============================================================
	const rawItems = (data.itemSummaries ?? [])
		.filter((it: any) => it.image?.imageUrl) // Must have an image
		.filter((it: any) => {
			// Filter out unavailable items
			const availabilityStatus = it.estimatedAvailabilityStatus;
			if (availabilityStatus === "OUT_OF_STOCK") return false;

			// Filter out ended listings
			if (it.itemEndDate) {
				const endDate = new Date(it.itemEndDate);
				if (endDate < new Date()) return false;
			}

			return true;
		})
		.filter((it: any) => {
			// ============================================================
			// SELLER QUALITY FILTER
			// Filter out low-quality individual sellers
			// Professional sellers typically have high feedback scores
			// ============================================================
			const feedbackScore = Number(it.seller?.feedbackScore ?? 0);
			const feedbackPercentage = Number(it.seller?.feedbackPercentage ?? "0");

			// Require minimum seller quality
			// feedbackScore >= 50 and feedbackPercentage >= 95%
			if (feedbackScore < 50) return false;
			if (feedbackPercentage > 0 && feedbackPercentage < 95) return false;

			return true;
		});

	// Score each item for quality
	const scoredItems = rawItems.map((it: any) => {
		const imageUrl = it.image?.imageUrl ?? "";
		const title = it.title ?? "";

		const signals: QualitySignals = {
			hasEpid: !!it.epid,
			hasItemGroup: !!it.itemGroupHref,
			sellerFeedbackScore: Number(it.seller?.feedbackScore ?? 0),
			sellerFeedbackPercentage: Number(it.seller?.feedbackPercentage ?? "0"),
			imageQuality: getImageQuality(imageUrl),
			hasBrand: detectBrand(title),
			conditionId: it.conditionId ?? "",
			isPriorityListing: !!it.priorityListing,
			hasMarketingPrice: !!it.marketingPrice,
		};

		return {
			item: it,
			qualityScore: calculateQualityScore(signals),
			signals,
		};
	});

	// Sort by quality score (highest first), then by eBay's native order
	scoredItems.sort((a: any, b: any) => b.qualityScore - a.qualityScore);

	// Convert to our response format
	const processedItems = await Promise.all(
		scoredItems.map(async ({ item: it, qualityScore, signals }: any) => {
			const imageUrl = upgradeImageUrl(it.image?.imageUrl ?? "");

			// Extract original/marketing price for discount display
			let originalPrice = undefined;
			if (it.marketingPrice?.originalPrice?.value) {
				const converted = await convertPrice(
					{
						value: Number(it.marketingPrice.originalPrice.value),
						currency: it.marketingPrice.originalPrice.currency ?? "USD",
					},
					targetCurrency,
				);
				originalPrice = converted;
			}

			const convertedPrice = await convertPrice(
				it.price ?? { value: 0, currency: "USD" },
				targetCurrency,
			);

			return {
				id: it.itemId ?? "",
				title: it.title ?? "",
				price: convertedPrice,
				originalPrice: originalPrice,
				image: imageUrl,
				category: it.categories?.[0]?.categoryName ?? "Unknown",
				condition:
					CONDITION_ID_MAP[it.conditionId] ?? it.condition ?? "Unknown",
				shipping: "Request Delivery",
				seller: "Payless4tech",
				itemUrl: it.itemWebUrl ?? "",
				isPreorder: true,
				// Availability fields
				estimatedAvailabilityStatus: it.estimatedAvailabilityStatus,
				itemEndDate: it.itemEndDate,
				// Quality metadata (useful for debugging/display)
				qualityScore,
				epid: it.epid,
				itemGroupHref: it.itemGroupHref,
				sellerFeedbackScore: signals.sellerFeedbackScore,
				sellerFeedbackPercentage: signals.sellerFeedbackPercentage,
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

	const marketplaceId = process.env.EBAY_MARKETPLACE_ID || "EBAY_US";
	const access_token = await getEbayAuthToken();

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

	let imageUrl = upgradeImageUrl(data.image?.imageUrl ?? "");
	if (!imageUrl) {
		imageUrl =
			"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80";
	}

	// Extract additional images if available - upgrade all to highest quality
	const additionalImages =
		data?.primaryItemGroup?.itemGroupAdditionalImages?.map((img: any) =>
			upgradeImageUrl(img.imageUrl),
		) || [];
	const allImages = [imageUrl, ...additionalImages];

	// Extract original/marketing price for discount display
	let originalPrice = undefined;
	if (data.marketingPrice?.originalPrice?.value) {
		originalPrice = await convertPrice(
			{
				value: Number(data.marketingPrice.originalPrice.value),
				currency: data.marketingPrice.originalPrice.currency ?? "USD",
			},
			"GHS",
		);
	}

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
		originalPrice: originalPrice,
		image: imageUrl,
		categoryId: data.categoryId,
		additionalImages: allImages,
		category: data.categoryId ? getCategoryName(data.categoryId) : "Unknown",
		condition:
			CONDITION_ID_MAP[data.conditionId] ?? data.condition ?? "Unknown",
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
		// Quality metadata
		epid: data.epid,
		brand: data.brand,
	};
}
