"use client";

import StockProductList from "../components/StockProductList";
import { Product } from "../components/ProductCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
			const response = await supabase.from("products").select("*");
			return response;
		},
	});

	if (error) {
		console.error("Supabase error:", error);
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
