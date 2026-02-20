import { useQuery } from "@tanstack/react-query";

// Query keys for eBay item group
export const EBAY_ITEM_GROUP_KEYS = {
	itemGroup: ["ebay", "itemGroup"],
} as const;

// Hook for fetching items by item group
export function useEbayItemGroup(itemGroupId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: [...EBAY_ITEM_GROUP_KEYS.itemGroup, itemGroupId],
		queryFn: async () => {
			try {
				console.log("Fetching item group:", itemGroupId);

				// Call the API route instead of server function directly
				const response = await fetch(`/api/ebay/item-group/${itemGroupId}`);

				if (!response.ok) {
					const errorText = await response.text();
					console.error("API response error:", response.status, errorText);
					throw new Error(
						`API request failed: ${response.status} - ${errorText}`,
					);
				}

				const result = await response.json();
				console.log("Item group fetch success:", result);
				return result;
			} catch (error) {
				console.error("Error in useEbayItemGroup:", error);

				// Log more detailed error information
				if (error instanceof Error) {
					console.error("Error message:", error.message);
					console.error("Error stack:", error.stack);
				}

				throw error;
			}
		},
		enabled: Boolean(enabled && !!itemGroupId),
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
