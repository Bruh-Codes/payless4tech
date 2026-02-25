"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/db-client";
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
	// Additional fields from Bizhub
	make?: string;
	model?: string;
	asset_type?: string;
	currency?: string;
	images?: string[];
	quantity?: number;
	in_stock?: boolean;
	asset_tag?: string;
	featured?: boolean;
	specs?: any;
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
			// Fetch published products from Supabase (not directly from Bizhub)
			let query = supabase
				.from("products")
				.select("*")
				.eq("status", "active") // Only show published products
				.order("updated_at", { ascending: false });

			// Handle category filtering
			if (category) {
				query = query.eq("category", category.toLowerCase());
			} else if (!excludeCategory) {
				// Default to laptops if no category specified and not excluding
				query = query.eq("category", "laptops");
			}

			// Handle excluded category
			if (excludeCategory) {
				query = query.neq("category", excludeCategory.toLowerCase());
			}

			// Handle brand filtering
			if (brandFilter) {
				if (brandFilter === "MacBook") {
					query = query.ilike("name", `%${brandFilter}%`);
				} else {
					const sanitizedBrandFilter = brandFilter.trim();
					query = query.ilike("name", `${sanitizedBrandFilter}%`);
				}
			}

			// Apply limit
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

			setProducts(data || []);

		} catch (err: any) {
			console.error("Unexpected error in ProductGrid:", err);
			toast.error("Error loading products", {
				description: err.message || "Please try again later",
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
							"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5",
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
