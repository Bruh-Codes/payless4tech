// eBay Category Mapping
// This maps our slugs to actual eBay category IDs

export interface EbayCategoryMapping {
	slug: string;
	categoryTreeId: string;
	displayName: string;
}

export const EBAY_CATEGORY_IDS: Record<string, string> = {
	smartphones: "9355", // Cell Phones & Smartphones
	laptops: "175673", // Laptops & Netbooks
	tablets: "171485", // iPad/Tablet/eReaders
	audio: "32981", // Sound & Vision
	gaming: "1249", // Video Games & Consoles
	accessories: "6030", // Mobile Phone Accessories
	consumer_electronics: "293", // Consumer Electronics
	all: "0", // Will be populated dynamically
};

// Default category tree ID for US marketplace
export const DEFAULT_CATEGORY_TREE_ID = "0";

// Fetch category tree ID from eBay
export async function getEbayCategoryTreeId(token: string): Promise<string> {
	try {
		const res = await fetch(
			`https://api.ebay.com/commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=EBAY_US`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		if (!res.ok) {
			throw new Error(`Failed to get category tree ID: ${res.statusText}`);
		}

		const data = await res.json();
		return data.categoryTreeId as string;
	} catch (error) {
		console.error("Error getting eBay category tree ID:", error);
		return DEFAULT_CATEGORY_TREE_ID;
	}
}

// Get category suggestions for a specific category tree
export async function getCategorySuggestions(
	token: string,
	categoryTreeId: string,
	query: string,
): Promise<string | undefined> {
	try {
		const res = await fetch(
			`https://api.ebay.com/commerce/taxonomy/v1/category_tree/${categoryTreeId}/get_category_suggestions?q=${encodeURIComponent(query)}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		if (!res.ok) {
			throw new Error(`Failed to get category suggestions: ${res.statusText}`);
		}

		const data = await res.json();
		return data.categorySuggestions?.[0]?.category?.categoryId;
	} catch (error) {
		console.error("Error getting category suggestions:", error);
		return undefined;
	}
}

// Initialize category mapping on startup
export async function initializeEbayCategories(): Promise<void> {
	try {
		const token = await getEbayToken();

		// Get category tree ID
		const categoryTreeId = await getEbayCategoryTreeId(token);

		// Map our slugs to eBay categories
		const techSlugs = [
			"smartphones",
			"laptops",
			"tablets",
			"audio",
			"gaming",
			"accessories",
			"consumer-electronics",
		];

		for (const slug of techSlugs) {
			const categoryId = await getCategorySuggestions(
				token,
				categoryTreeId,
				slug,
			);
			if (categoryId) {
				EBAY_CATEGORY_IDS[slug] = categoryId;
				console.log(`Mapped ${slug} to category ID: ${categoryId}`);
			}
		}

		console.log("eBay category mapping initialized:", EBAY_CATEGORY_IDS);
	} catch (error) {
		console.error("Failed to initialize eBay categories:", error);
	}
}

// Helper to get eBay token
async function getEbayToken(): Promise<string> {
	const clientId = process.env.EBAY_CLIENT_ID!;
	const clientSecret = process.env.EBAY_CLIENT_SECRET!;

	const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

	const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
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

	if (!res.ok) {
		throw new Error(`Failed to get eBay token: ${res.statusText}`);
	}

	const data = await res.json();
	return data.access_token;
}
