"use client";

import React, { useState, useEffect } from "react";
import StockProductList from "../components/StockProductList";
import { Product } from "../components/ProductCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// This file will handle all Supabase related functionality
// It's currently a placeholder for when you connect your Supabase integration

const Products = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchProducts = async () => {
		try {
			setIsLoading(true);
			// In a real implementation, you would fetch products from Supabase
			let { data, error } = await supabase.from("products").select("*");

			if (error) {
				console.error("Supabase error:", error);
				toast.error("Error loading products", {
					description: error.message,
				});
			}
			setProducts(data as unknown as Product[]);
		} catch (error) {
			console.error("Error fetching products:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	return (
		<div className="w-full">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Products</h1>
			</div>

			{isLoading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
				</div>
			) : (
				<StockProductList products={products} onRefresh={fetchProducts} />
			)}
		</div>
	);
};

export default Products;
