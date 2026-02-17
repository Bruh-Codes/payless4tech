import { cache } from "react";
import { memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionCards } from "../section-cards";

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

// Cache the database calls to prevent duplicate requests
const getProducts = cache(async (): Promise<Product[]> => {
	const { data } = await supabase.from("products").select("*");
	return data || [];
});

const getSales = cache(async (): Promise<Sale[]> => {
	const { data } = await supabase.from("sales").select("*");
	return data || [];
});

const AdminOverview: React.FC = memo(async () => {
	// Fetch data in parallel for better performance
	const [products, sales] = await Promise.all([getProducts(), getSales()]);

	const totalProducts =
		products.length >= 1_000_000
			? (products.length / 1_000_000).toFixed(2) + "M"
			: Intl.NumberFormat().format(products.length);

	const outOfStockProducts = products.filter(
		(product: Product) => product.status === "unavailable",
	);

	const outOfStock =
		outOfStockProducts.length >= 1_000_000
			? (outOfStockProducts.length / 1_000_000).toFixed(2) + "M"
			: Intl.NumberFormat().format(outOfStockProducts.length);

	const newProducts = products.filter(
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
			<SectionCards
				outOfStock={outOfStock}
				totalCustomers={totalCustomers}
				totalNewProducts={totalNewProducts}
				totalProducts={totalProducts}
			/>
		</div>
	);
});

AdminOverview.displayName = "AdminOverview";

export default AdminOverview;
