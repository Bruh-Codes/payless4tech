import { useQuery } from "@tanstack/react-query";
import { searchEbayProducts } from "@/lib/ebay";
import { supabase } from "@/integrations/supabase/client";

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
	smartphones: "smartphone",
	laptops: "laptop",
	tablets: "tablet",
	audio: "headphones",
	gaming: "gaming console",
	accessories: "phone accessories",
	"consumer-electronics": "electronics",
	all: "electronics",
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

				// Fetch local featured products first
				let localFeaturedItems: any[] = [];
				try {
					const { data: localProducts, error } = await supabase
						.from("products")
						.select("*")
						.eq("is_featured", true)
						.in("status", ["available", "new"])
						.limit(10);

					if (!error && localProducts) {
						localFeaturedItems = localProducts.map((p) => ({
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
					}
				} catch (err) {
					console.error("Error fetching local featured products:", err);
				}

				const promises = categories.map((category) => {
					const searchTerm =
						CATEGORY_SEARCH_TERMS[
							category as keyof typeof CATEGORY_SEARCH_TERMS
						];
					console.log(`Searching for ${category} with term: "${searchTerm}"`);

					return searchEbayProducts(
						searchTerm,
						1,
						12, // Increased limit to get more results
						"GHS", // Use GHS currency
						"newlyListed", // Get latest products
						category, // Pass category for filtering
					);
				});

				const results = await Promise.allSettled(promises);
				console.log("Category search results:", results);

				// Log each result for debugging
				results.forEach((result, index) => {
					if (result.status === "fulfilled") {
						console.log(`Category ${categories[index]} success:`, {
							itemsCount: result.value.items?.length || 0,
							totalCount: result.value.totalCount || 0,
						});
					} else {
						console.error(
							`Category ${categories[index]} failed:`,
							result.reason,
						);
					}
				});

				// Combine successful results and take first few from each
				const ebayProducts = results
					.filter(
						(result): result is PromiseFulfilledResult<any> =>
							result.status === "fulfilled",
					)
					.flatMap((result) => result.value.items || [])
					.slice(0, 20); // Increased to 20 products for better variety

				const allProducts = [...localFeaturedItems, ...ebayProducts];

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

// Hook for fetching New Arrivals including local items
export function useNewArrivalsProducts(enabled: boolean = true) {
	return useQuery({
		queryKey: ["new-arrivals-products"],
		queryFn: async () => {
			try {
				let localNewArrivals: any[] = [];
				const { data: localProducts, error } = await supabase
					.from("products")
					.select("*")
					.eq("is_new_arrival", true)
					.in("status", ["available", "new"])
					.limit(10);

				if (!error && localProducts) {
					localNewArrivals = localProducts.map((p) => ({
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
				}

				// Fetch some eBay products generically
				const ebayRes = await searchEbayProducts(
					"Samsung",
					1,
					12,
					"GHS",
					"newlyListed",
				);
				const ebayProducts = ebayRes.items || [];

				const combined = [...localNewArrivals, ...ebayProducts];

				return {
					items: combined,
					totalCount: combined.length,
					pageNumber: 1,
				};
			} catch (error) {
				console.error("Error fetching new arrivals:", error);
				return {
					items: [],
					totalCount: 0,
					pageNumber: 1,
				};
			}
		},
		enabled,
		staleTime: 15 * 60 * 1000, // 15 minutes
		gcTime: 20 * 60 * 1000, // 20 minutes
		retry: 1,
		refetchOnWindowFocus: false,
	});
}
