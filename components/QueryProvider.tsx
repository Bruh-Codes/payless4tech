"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnMount: true,
			refetchOnReconnect: true,
			// Remove global refetchInterval to let individual queries control their own caching
			retry: (failureCount, error) => {
				// Don't retry on 401/403 errors (auth issues)
				if (
					error?.message?.includes("401") ||
					error?.message?.includes("403") ||
					error?.message?.includes("Unauthorized")
				) {
					return false;
				}
				return failureCount < 3;
			},
		},
		mutations: {
			retry: 1,
		},
	},
});

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<QueryClientProvider client={queryClient}>
				{children}
				<ReactQueryDevtools />
			</QueryClientProvider>
		</>
	);
};

export default QueryProvider;
