"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "./ProductCard";
import { LoadingState } from "./LoadingState";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { type ClassValue } from "clsx";
import { toast } from "sonner";

interface Product {
	id: string;
	name: string;
	price: number;
	condition: string;
	image_url: string | null;
	original_price: number | null;
	category: string;
	description: string | null;
	detailed_specs: string | null;
	created_at: string;
	updated_at: string;
}

interface ProductGridProps {
	category?: string | null;
	excludeCategory?: string | null;
	brandFilter?: string | null;
	limit?: number;
	className?: ClassValue;
}

export const ProductGrid = ({
	category,
	excludeCategory,
	brandFilter,
	limit,
	className,
}: ProductGridProps) => {
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { state } = useCart();

	const fetchProducts = async () => {
		setIsLoading(true);

		try {
			let query = supabase.from("products").select("*");

			if (category) {
				query = query.eq("category", category);
			}

			if (excludeCategory) {
				query = query.neq("category", excludeCategory);
			}

			if (brandFilter) {
				if (brandFilter === "MacBook") {
					query = query.ilike("name", `%${brandFilter}%`);
				} else {
					const sanitizedBrandFilter = brandFilter.trim();
					query = query.ilike("name", `${sanitizedBrandFilter}%`);
				}
			}

			query = query.order("created_at", { ascending: false });

			if (limit) {
				query = query.limit(limit);
			}

			const { data, error } = await query;

			if (error) {
				console.error("Supabase error:", error);
				toast.error("Error loading products", {
					description: error.message,
				});
				return;
			}

			if (!data || data.length === 0) {
				console.log("No products found for filters:", {
					category,
					excludeCategory,
					brandFilter,
					limit,
				});
			}

			setProducts(data || []);
		} catch (err) {
			console.error("Unexpected error in ProductGrid:", err);
			toast.error("Error loading products", {
				description: "Please try again later",
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, [category, excludeCategory, brandFilter, limit]);

	if (isLoading) {
		return <LoadingState />;
	}

	return (
		<section className="py-4 fade-in">
			<div className="container mx-auto px-4">
				{products.length === 0 ? (
					<p className="text-center text-lg text-muted-foreground">
						No products found for the selected filters
					</p>
				) : (
					<div
						className={cn(
							"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5",
							className
						)}
					>
						{products.map((product) => {
							const productInCart = state.items.some(
								(cartItems) => cartItems.id === product.id
							);

							return (
								<ProductCard
									key={product.id}
									product={product}
									inCart={productInCart}
								/>
							);
						})}
					</div>
				)}
			</div>
		</section>
	);
};
