import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { searchEbayProducts, EbaySearchResponse } from "@/lib/ebay";

// Query keys for eBay searches
export const EBAY_QUERY_KEYS = {
	search: ["ebay", "search"],
	details: ["ebay", "details"],
} as const;

// Hook for searching eBay products
export function useEbaySearch(
	query: string,
	pageNumber: number = 1,
	enabled: boolean = true,
) {
	return useQuery({
		queryKey: [...EBAY_QUERY_KEYS.search, query, pageNumber],
		queryFn: () => searchEbayProducts(query, pageNumber),
		enabled: enabled && query.trim().length > 0,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
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

// Hook for infinite scroll pagination
export function useEbayInfiniteSearch(query: string, enabled: boolean = true) {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: [...EBAY_QUERY_KEYS.search, query, "infinite"],
		queryFn: () => searchEbayProducts(query, 1, 40), // Get more items for infinite scroll
		enabled: enabled && query.trim().length > 0,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
	});
}

// Prefetch function for better UX
export function usePrefetchEbaySearch() {
	const queryClient = useQueryClient();

	const prefetch = (query: string) => {
		if (query.trim().length > 2) {
			queryClient.prefetchQuery({
				queryKey: [...EBAY_QUERY_KEYS.search, query, 1],
				queryFn: () => searchEbayProducts(query, 1),
				staleTime: 5 * 60 * 1000,
			});
		}
	};

	return prefetch;
}

// Hook for debounced search
export function useDebouncedEbaySearch(query: string, delay: number = 300) {
	const [debouncedQuery, setDebouncedQuery] = useState(query);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query);
		}, delay);

		return () => clearTimeout(timer);
	}, [query, delay]);

	return useEbaySearch(debouncedQuery);
}

// Hook for search suggestions/autocomplete
export function useEbaySuggestions(query: string, enabled: boolean = true) {
	return useQuery({
		queryKey: [...EBAY_QUERY_KEYS.search, "suggestions", query],
		queryFn: async () => {
			if (query.trim().length < 2) return [];

			// For now, return empty array. In a real implementation,
			// you'd call eBay's suggestion API
			return [];
		},
		enabled: enabled && query.trim().length >= 2,
		staleTime: 10 * 60 * 1000, // 10 minutes for suggestions
		gcTime: 15 * 60 * 1000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
}

// Hook for clearing eBay cache
export function useEbayCacheActions() {
	const queryClient = useQueryClient();

	const clearEbayCache = () => {
		queryClient.invalidateQueries({ queryKey: EBAY_QUERY_KEYS.search });
	};

	const clearSpecificSearch = (query: string) => {
		queryClient.invalidateQueries({
			queryKey: [...EBAY_QUERY_KEYS.search, query],
		});
	};

	return {
		clearEbayCache,
		clearSpecificSearch,
	};
}
