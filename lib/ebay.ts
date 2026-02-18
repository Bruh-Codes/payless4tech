export interface EbayProduct {
	id: string;
	title: string;
	price: {
		value: number;
		currency: string;
	};
	image: string;
	category: string;
	condition: string;
	rating?: number;
	reviews?: number;
	shipping?: string;
	seller: string;
	itemUrl: string;
	isPreorder?: boolean;
}

export interface EbaySearchResponse {
	items: EbayProduct[];
	totalCount: number;
	pageNumber: number;
}

// eBay API configuration
const EBAY_CONFIG = {
	baseUrl: "https://svcs.ebay.com/services/search/FindingService/v1",
	appId: process.env.NEXT_PUBLIC_EBAY_APP_ID,
	defaultLimit: 20,
	maxRetries: 3,
	retryDelay: 1000,
};

// Helper function for retry logic
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// eBay API search function with retry logic
export async function searchEbayProducts(
	query: string,
	pageNumber: number = 1,
	limit: number = EBAY_CONFIG.defaultLimit,
): Promise<EbaySearchResponse> {
	if (!query.trim()) {
		return { items: [], totalCount: 0, pageNumber };
	}

	if (!EBAY_CONFIG.appId) {
		console.warn(
			"eBay App ID not found. Please set NEXT_PUBLIC_EBAY_APP_ID environment variable.",
		);
		// Return mock data for development
		return getMockEbayData(query, pageNumber, limit);
	}

	let lastError: Error | null = null;

	// Retry logic for production resilience
	for (let attempt = 1; attempt <= EBAY_CONFIG.maxRetries; attempt++) {
		try {
			const searchParams = new URLSearchParams({
				"OPERATION-NAME": "findItemsByKeywords",
				"SERVICE-VERSION": "1.0.0",
				"SECURITY-APPNAME": EBAY_CONFIG.appId,
				"RESPONSE-DATA-FORMAT": "JSON",
				"REST-PAYLOAD": "true",
				keywords: query.trim(),
				"paginationInput.pageNumber": pageNumber.toString(),
				"paginationInput.entriesPerPage": limit.toString(),
				"outputSelector[0]": "SellerInfo",
				"outputSelector[1]": "StoreInfo",
				"outputSelector[2]": "GalleryInfo",
				"itemFilter(0).name": "Condition",
				"itemFilter(0).value": "New",
				"itemFilter(0).paramName": "Currency",
				"itemFilter(0).paramValue": "USD",
				sortOrder: "BestMatch",
			});

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

			const response = await fetch(`${EBAY_CONFIG.baseUrl}?${searchParams}`, {
				signal: controller.signal,
				headers: {
					"User-Agent": "Payless4Tech/1.0",
					Accept: "application/json",
				},
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(
					`eBay API error: ${response.status} ${response.statusText}`,
				);
			}

			const data = await response.json();

			// Validate response structure
			if (!data.findItemsByKeywordsResponse?.[0]) {
				throw new Error("Invalid eBay API response structure");
			}

			const searchResult =
				data.findItemsByKeywordsResponse[0].searchResult?.[0];
			if (!searchResult?.item) {
				return { items: [], totalCount: 0, pageNumber };
			}

			const items: EbayProduct[] = searchResult.item.map((item: any) => ({
				id: item.itemId?.[0] || "",
				title: item.title?.[0] || "",
				price: {
					value: parseFloat(
						item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || "0",
					),
					currency:
						item.sellingStatus?.[0]?.currentPrice?.[0]?.["@currencyId"] ||
						"USD",
				},
				image: item.galleryURL?.[0] || "",
				category: item.primaryCategory?.[0]?.categoryName?.[0] || "Unknown",
				condition: item.condition?.[0]?.conditionDisplayName?.[0] || "Unknown",
				rating: undefined,
				reviews: undefined,
				shipping:
					item.shippingInfo?.[0]?.shippingServiceCost?.[0]?.__value__ === "0.0"
						? "Free shipping"
						: item.shippingInfo?.[0]?.shippingServiceCost?.[0]?.__value__
							? `$${item.shippingInfo[0].shippingServiceCost[0].__value__} shipping`
							: "Shipping info unavailable",
				seller: item.sellerInfo?.[0]?.sellerUserName?.[0] || "Unknown Seller",
				itemUrl: item.viewItemURL?.[0] || "",
				isPreorder: false,
			}));

			const totalCount = parseInt(
				data.findItemsByKeywordsResponse[0]?.paginationOutput?.[0]
					?.totalEntries?.[0] || "0",
			);

			return {
				items,
				totalCount,
				pageNumber,
			};
		} catch (error) {
			lastError = error as Error;
			console.warn(`eBay API attempt ${attempt} failed:`, error);

			if (attempt < EBAY_CONFIG.maxRetries) {
				await sleep(EBAY_CONFIG.retryDelay * attempt); // Exponential backoff
			}
		}
	}

	// All retries failed, log error and return empty result
	console.error("eBay API failed after all retries:", lastError);
	return { items: [], totalCount: 0, pageNumber };
}

// Mock data for development when API key is not available
function getMockEbayData(
	query: string,
	pageNumber: number,
	limit: number,
): EbaySearchResponse {
	const mockItems: EbayProduct[] = [
		{
			id: "mock-1",
			title: `Apple iPhone 14 Pro Max 256GB - ${query}`,
			price: { value: 899.99, currency: "USD" },
			image: "https://i.ebayimg.com/images/g/1JIAAOSw~m9lE4dV/s-l500.jpg",
			category: "Cell Phones & Smartphones",
			condition: "New",
			shipping: "Free shipping",
			seller: "mock_seller_1",
			itemUrl: "https://www.ebay.com/itm/123456789",
			isPreorder: false,
		},
		{
			id: "mock-2",
			title: `Samsung Galaxy S24 Ultra 512GB - ${query}`,
			price: { value: 1099.99, currency: "USD" },
			image: "https://i.ebayimg.com/images/g/2JEAAOSw~m9lE4dW/s-l500.jpg",
			category: "Cell Phones & Smartphones",
			condition: "New",
			shipping: "Free shipping",
			seller: "mock_seller_2",
			itemUrl: "https://www.ebay.com/itm/123456790",
			isPreorder: false,
		},
	];

	const startIndex = (pageNumber - 1) * limit;
	const endIndex = startIndex + limit;
	const paginatedItems = mockItems.slice(startIndex, endIndex);

	return {
		items: paginatedItems,
		totalCount: mockItems.length,
		pageNumber,
	};
}

// Convert eBay product to local Product interface
export function convertEbayToLocalProduct(ebayProduct: EbayProduct) {
	const result: any = {
		id: `ebay-${ebayProduct.id}`,
		title: ebayProduct.title,
		price: ebayProduct.price.value,
		image: ebayProduct.image,
		category: ebayProduct.category,
		condition: ebayProduct.condition,
		rating: ebayProduct.rating || 0,
		reviews: ebayProduct.reviews || 0,
		shipping: ebayProduct.shipping || "Standard Shipping",
		seller: `${ebayProduct.seller} (eBay)`,
		isPreorder: ebayProduct.isPreorder,
	};

	// Only include originalPrice if it has a value
	if (ebayProduct.price.value !== undefined) {
		// You could add logic here to calculate originalPrice if available
		// For now, we omit it entirely
	}

	return result;
}
