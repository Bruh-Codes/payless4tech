"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { LoadingState } from "./LoadingState";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { type ClassValue } from "clsx";

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
	// Additional fields
	make?: string;
	model?: string;
	currency?: string;
	quantity?: number;
	in_stock?: boolean;
}

// Product interface imported from useProducts hook

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
	const [error, setError] = useState<string | null>(null);
	const { state } = useCart();

	const fetchPublishedProducts = async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Fetch published products via API route (server-side database access)
			const params = new URLSearchParams({ status: 'published', limit: String(limit || 50) });
			const response = await fetch(`/api/products?${params}`);
			
			if (!response.ok) {
				throw new Error(`Failed to load products: ${response.statusText}`);
			}

			const result = await response.json();
			
			if (!result.success) {
				throw new Error(result.error || 'Failed to load products');
			}

			// Transform to match Product interface
			const transformedProducts = (result.data || []).map((product: any) => ({
				id: product.id,
				name: product.name,
				price: product.price,
				condition: "Renewed",
				image_url: product.featured_image,
				original_price: product.compare_at_price,
				category: product.category_id === 1 ? "laptops" : "business-laptops",
				description: product.description,
				detailed_specs: product.short_description,
				created_at: product.created_at,
				updated_at: product.updated_at,
				make: product.name.split(' ')[0],
				model: product.name.split(' ').slice(1).join(' '),
				quantity: product.stock_quantity,
				in_stock: product.stock_quantity > 0,
				currency: product.currency || 'GHS'
			}));

			// Apply filters
			let filteredProducts = transformedProducts;

			if (category) {
				filteredProducts = filteredProducts.filter(product => 
					product.category.toLowerCase() === category.toLowerCase()
				);
			}

			if (excludeCategory) {
				filteredProducts = filteredProducts.filter(product => 
					product.category.toLowerCase() !== excludeCategory.toLowerCase()
				);
			}

			if (brandFilter) {
				filteredProducts = filteredProducts.filter(product => {
					const productName = product.name.toLowerCase();
					const make = product.make?.toLowerCase() || '';
					const filterLower = brandFilter.toLowerCase();
					
					return productName.includes(filterLower) || make.includes(filterLower);
				});
			}

			setProducts(filteredProducts);

		} catch (err: any) {
			console.error("Error fetching published products:", err);
			setError(err.message || "Failed to load products");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchPublishedProducts();
	}, [category, excludeCategory, brandFilter, limit]);

	if (isLoading) {
		return <LoadingState />;
	}

	if (error) {
		return (
			<section className="py-4">
				<div className="container mx-auto px-4">
					<div className="text-center py-8">
						<p className="text-lg text-red-600 mb-2">Failed to load products</p>
						<p className="text-muted-foreground">{error}</p>
					</div>
				</div>
			</section>
		);
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
