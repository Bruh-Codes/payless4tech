import { useQuery } from "@tanstack/react-query";
import { searchEbayProducts } from "@/lib/ebay";

// Tech categories for the shop
export const TECH_CATEGORIES = [
	{ name: "All Products", slug: "all" },
	{ name: "Smartphones", slug: "smartphones" },
	{ name: "Laptops", slug: "laptops" },
	{ name: "Tablets", slug: "tablets" },
	{ name: "Audio", slug: "audio" },
	{ name: "Gaming", slug: "gaming" },
	{ name: "Accessories", slug: "accessories" },
	{ name: "Consumer Electronics", slug: "consumer-electronics" },
] as const;

// Search terms mapped to categories for better eBay results
const CATEGORY_SEARCH_TERMS = {
	smartphones: "smartphone -used -refurbished -broken -for parts",
	laptops: "laptop -used -refurbished -broken -for parts",
	tablets: "tablet -used -refurbished -broken -for parts",
	audio: "headphones -used -refurbished -broken -for parts",
	gaming: "gaming console -used -refurbished -broken -for parts",
	accessories: "phone accessories -used -refurbished -broken -for parts",
	"consumer-electronics": "electronics -used -refurbished -broken -for parts",
	all: "electronics -used -refurbished -broken -for parts",
} as const;

type CategorySlug = (typeof TECH_CATEGORIES)[number]["slug"];

// Query keys for featured products
export const FEATURED_PRODUCTS_QUERY_KEYS = {
	featured: ["featured", "products"],
	category: ["featured", "category"],
} as const;

// Hook for getting featured products based on category
export function useFeaturedProducts(
	categorySlug: CategorySlug = "all",
	enabled: boolean = true,
) {
	const searchTerm =
		CATEGORY_SEARCH_TERMS[categorySlug] || CATEGORY_SEARCH_TERMS.all;

	return useQuery({
		queryKey: [...FEATURED_PRODUCTS_QUERY_KEYS.category, categorySlug],
		queryFn: () => searchEbayProducts(searchTerm, 1),
		enabled,
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 15 * 60 * 1000, // 15 minutes
		retry: (failureCount, error) => {
			// Don't retry on 4xx errors
			if (error instanceof Error && error.message.includes("4")) {
				return false;
			}
			return failureCount < 2;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});
}

// Hook for getting market prices (sold items) for homepage
export function useMarketPrices(enabled: boolean = true) {
	return useQuery({
		queryKey: [...FEATURED_PRODUCTS_QUERY_KEYS.featured, "market"],
		queryFn: async () => {
			try {
				// Get sold products from a few key categories
				const categories = ["smartphones", "laptops", "audio", "gaming"];
				const promises = categories.map((category) =>
					searchEbayProducts(
						CATEGORY_SEARCH_TERMS[
							category as keyof typeof CATEGORY_SEARCH_TERMS
						],
						1,
						8,
						"GHS", // Use GHS currency
						"bestMatch", // Sort by relevance for sold items
					),
				);

				const results = await Promise.allSettled(promises);

				// Combine successful results and take first few from each
				const allProducts = results
					.filter(
						(result): result is PromiseFulfilledResult<any> =>
							result.status === "fulfilled",
					)
					.flatMap((result) => result.value.items || [])
					.slice(0, 12); // 12 products for variety

				return {
					items: allProducts,
					totalPages: 1,
					pageNumber: 1,
					totalItems: allProducts.length,
				};
			} catch (error) {
				console.error("eBay API error, using fallback:", error);
				return {
					items: [],
					totalPages: 1,
					pageNumber: 1,
					totalItems: 0,
				};
			}
		},
		enabled,
		staleTime: 30 * 60 * 1000, // 30 minutes for sold data
		gcTime: 60 * 60 * 1000, // 1 hour for sold data
		retry: 1,
		retryDelay: 1000,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});
}

// Hook for getting a mix of products from all categories for homepage
export function useMixedFeaturedProducts(enabled: boolean = true) {
	return useQuery({
		queryKey: [...FEATURED_PRODUCTS_QUERY_KEYS.featured, "mixed"],
		queryFn: async () => {
			try {
				// Get products from a few key categories
				const categories = ["smartphones", "laptops", "audio", "gaming"];
				console.log("Fetching products for categories:", categories);

				const promises = categories.map((category) =>
					searchEbayProducts(
						CATEGORY_SEARCH_TERMS[
							category as keyof typeof CATEGORY_SEARCH_TERMS
						],
						1,
						12, // Increased limit to get more results
						"GHS", // Use GHS currency
						"newlyListed", // Get latest products
						undefined, // Temporarily disable category filtering to get more results
					),
				);

				const results = await Promise.allSettled(promises);
				console.log("Category search results:", results);

				// Combine successful results and take first few from each
				const allProducts = results
					.filter(
						(result): result is PromiseFulfilledResult<any> =>
							result.status === "fulfilled",
					)
					.flatMap((result) => result.value.items || [])
					.slice(0, 15); // Increased to 20 products for better variety

				console.log("Final combined products:", allProducts.length);

				return {
					items: allProducts,
					totalPages: 1,
					pageNumber: 1,
					totalItems: allProducts.length,
				};
			} catch (error) {
				console.error("Error fetching featured products:", error);
				return {
					items: [],
					totalPages: 1,
					pageNumber: 1,
					totalItems: 0,
				};
			}
		},
		enabled,
		staleTime: 15 * 60 * 1000, // 15 minutes
		gcTime: 20 * 60 * 1000, // 20 minutes
		retry: 1,
		retryDelay: 1000,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});
}
