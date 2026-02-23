"use client";

import { supabase } from "@/integrations/supabase/client";
import { SectionCards } from "../section-cards";
import { useQuery } from "@tanstack/react-query";
import { AdminCardsSkeleton } from "@/components/LoadingSkeletons";

// Define types for better TypeScript support
interface Product {
	id: string;
	status: string;
	[name: string]: any;
}

interface Sale {
	id: number;
	email: string;
	phone: string;
	[name: string]: any;
}

export default function AdminOverview() {
	const {
		data: productsData,
		isLoading: isLoadingProducts,
		error: productsError,
	} = useQuery({
		queryKey: ["admin", "products"],
		queryFn: async () => {
			const { data, error } = await supabase.from("products").select("*");
			if (error) {
				console.error("Products query error:", error);
				throw error;
			}
			return data as Product[];
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	const {
		data: salesData,
		isLoading: isLoadingSales,
		error: salesError,
	} = useQuery({
		queryKey: ["admin", "sales"],
		queryFn: async () => {
			const { data, error } = await supabase.from("sales").select("*");
			if (error) {
				console.error("Sales query error:", error);
				throw error;
			}
			return data as Sale[];
		},
		staleTime: 1000 * 60 * 2, // 2 minutes
	});

	if (isLoadingProducts || isLoadingSales) {
		return <AdminCardsSkeleton />;
	}

	if (productsError) {
		console.error("Products error in component:", productsError);
		return (
			<div className="text-red-500">
				Error loading products: {productsError.message}
			</div>
		);
	}

	if (salesError) {
		console.error("Sales error in component:", salesError);
		return (
			<div className="text-red-500">
				Error loading sales: {salesError.message}
			</div>
		);
	}

	const products = productsData || [];
	const sales = salesData || [];

	// Handle case where no products exist
	if (!productsData && !isLoadingProducts) {
		return (
			<div className="text-yellow-500 p-4">
				No products data available. Please refresh the page.
			</div>
		);
	}

	const totalProducts =
		products.length >= 1_000_000
			? (products.length / 1_000_000).toFixed(2) + "M"
			: Intl.NumberFormat().format(products.length);

	const outOfStockProducts = products?.filter(
		(product: Product) => product.status === "unavailable",
	);

	const outOfStock =
		outOfStockProducts.length >= 1_000_000
			? (outOfStockProducts.length / 1_000_000).toFixed(2) + "M"
			: Intl.NumberFormat().format(outOfStockProducts.length);

	const newProducts = products?.filter(
		(product: Product) => product.status === "new",
	);
	const totalNewProducts =
		newProducts.length >= 1_000_000
			? (newProducts.length / 1_000_000).toFixed(2) + "M"
			: Intl.NumberFormat().format(newProducts.length);

	// Remove duplicate customers based on phone or email
	const uniqueCustomers = sales.filter(
		(customer: Sale, index: number, self: Sale[]) =>
			self.findIndex(
				(c: Sale) => c.phone === customer.phone || c.email === customer.email,
			) === index,
	);

	const totalCustomers =
		uniqueCustomers.length >= 1_000_000
			? (uniqueCustomers.length / 1_000_000).toFixed(2) + "M"
			: Intl.NumberFormat().format(uniqueCustomers.length);

	return (
		<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
			{/* End debug display */}
			<SectionCards
				outOfStock={outOfStock}
				totalCustomers={totalCustomers}
				totalNewProducts={totalNewProducts}
				totalProducts={totalProducts}
			/>
		</div>
	);
}
