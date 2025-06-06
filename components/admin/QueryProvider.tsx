"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// Create a client
const queryClient = new QueryClient();

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
