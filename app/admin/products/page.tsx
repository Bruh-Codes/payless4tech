"use client";

import StockProductList from "../components/StockProductList";
import { Product } from "../components/ProductCard";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Products = () => {
	const {
		data: products,
		error,
		isPending,
	} = useQuery({
		queryKey: ["products"],
		queryFn: async () => {
			const response = await fetch('/api/products?status=all&limit=100');
			const result = await response.json();
			if (!result.success) throw new Error(result.error);
			return { data: result.data };
		},
	});

	if (error) {
		console.error("Products error:", error);
		toast.error("Error loading products", {
			description: error.message,
		});
	}

	return (
		<div className="w-full">
			<div className="flex gap-5 items-center mb-6">
				<SidebarTrigger />
				<h1 className="text-3xl font-bold">Products</h1>
			</div>

			{isPending ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
				</div>
			) : (
				<StockProductList products={(products?.data ?? []) as Product[]} />
			)}
		</div>
	);
};

export default Products;
