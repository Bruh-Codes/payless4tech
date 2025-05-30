import { supabase } from "@/integrations/supabase/client";
import { SectionCards } from "../section-cards";

const AdminOverview: React.FC = async () => {
	const products = await supabase.from("products").select("*");

	if (products.error) {
		console.log("Error fetching products data", products.error);
	}

	const totalProducts =
		(products.data?.length || 0) >= 1_000_000
			? ((products.data?.length || 0) / 1_000_000).toFixed(2) + "M"
			: Intl.NumberFormat().format(products.data?.length! || 0);

	const outOfStockProducts = products.data?.filter(
		(product) => product.status === "unavailable"
	);

	const outOfStock =
		(outOfStockProducts?.length || 0) >= 1_000_000
			? ((outOfStockProducts?.length || 0) / 1_000_000).toFixed(2) + "M"
			: Intl.NumberFormat().format(outOfStockProducts?.length! || 0);

	const newProducts = products.data?.filter(
		(product) => product.status === "new"
	);
	const totalNewProducts =
		(newProducts?.length || 0) >= 1_000_000
			? ((newProducts?.length || 0) / 1_000_000).toFixed(2) + "M"
			: Intl.NumberFormat().format(newProducts?.length! || 0);

	let { data: sales, error } = await supabase.from("sales").select("*");

	// Remove duplicate customers based on phone or email
	const uniqueCustomers = sales
		? sales.filter(
				(customer, index, self) =>
					self.findIndex(
						(c) => c.phone === customer.phone || c.email === customer.email
					) === index
		  )
		: [];

	const totalCustomers =
		(uniqueCustomers.length || 0) >= 1_000_000
			? (uniqueCustomers.length / 1_000_000).toFixed(2) + "M"
			: Intl.NumberFormat().format(uniqueCustomers.length || 0);

	if (error) {
		console.log("Error fetching sales data", error);
	}

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
};

export default AdminOverview;
