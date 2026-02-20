import { useQuery } from "@tanstack/react-query";

// Query keys for eBay category search
export const EBAY_CATEGORY_SEARCH_KEYS = {
	categorySearch: ["ebay", "categorySearch"],
} as const;

// Hook for fetching items by category ID
export function useEbayCategorySearch(
	categoryId: string,
	enabled: boolean = true,
	limit: number = 10
) {
	return useQuery({
		queryKey: [...EBAY_CATEGORY_SEARCH_KEYS.categorySearch, categoryId, limit],
		queryFn: async () => {
			try {
				console.log("Fetching category search:", categoryId);
				
				// Call API route for category search
				const response = await fetch(`/api/ebay/category-search/${categoryId}?limit=${limit}`);
				
				if (!response.ok) {
					const errorText = await response.text();
					console.error("Category search API response error:", response.status, errorText);
					throw new Error(`Category search API request failed: ${response.status} - ${errorText}`);
				}
				
				const result = await response.json();
				console.log("Category search fetch success:", result);
				return result;
			} catch (error) {
				console.error("Error in useEbayCategorySearch:", error);
				
				// Log more detailed error information
				if (error instanceof Error) {
					console.error("Error message:", error.message);
					console.error("Error stack:", error.stack);
				}
				
				throw error;
			}
		},
		enabled: Boolean(enabled && !!categoryId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: (failureCount, error) => {
			// Don't retry on 4xx errors
			if (error instanceof Error && error.message.includes("4")) {
				return false;
			}
			return failureCount < 3;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});
}
