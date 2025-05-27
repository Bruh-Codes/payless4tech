import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Users, TrendingUp } from "lucide-react";
import Analytics from "./Analytics";
import { supabase } from "@/integrations/supabase/client";

export const customersData = [
	{
		id: 1,
		name: "John Doe",
		email: "john.doe@example.com",
		phone: "+1 123-456-7890",
		status: "active",
		spent: 1245.89,
		orders: 12,
		lastOrder: "2023-05-01",
	},
	{
		id: 2,
		name: "Jane Smith",
		email: "jane.smith@example.com",
		phone: "+1 234-567-8901",
		status: "active",
		spent: 3456.78,
		orders: 24,
		lastOrder: "2023-05-12",
	},
	{
		id: 3,
		name: "Robert Johnson",
		email: "robert.j@example.com",
		phone: "+1 345-678-9012",
		status: "inactive",
		spent: 789.12,
		orders: 5,
		lastOrder: "2023-02-25",
	},
	{
		id: 4,
		name: "Emily Davis",
		email: "emily.d@example.com",
		phone: "+1 456-789-0123",
		status: "active",
		spent: 2567.34,
		orders: 18,
		lastOrder: "2023-05-15",
	},
	{
		id: 5,
		name: "Michael Wilson",
		email: "michael.w@example.com",
		phone: "+1 567-890-1234",
		status: "active",
		spent: 1789.45,
		orders: 15,
		lastOrder: "2023-04-28",
	},
];

const AdminOverview: React.FC = async () => {
	const products = await supabase.from("products").select("*");

	const totalProducts =
		(products.data?.length || 0) >= 1_000_000
			? ((products.data?.length || 0) / 1_000_000).toFixed(2) + "M"
			: Intl.NumberFormat().format(products.data?.length! || 0);

	const outOfStockProducts = products.data?.filter(
		(product) => product.status === "Unavailable"
	);

	const outOfStock =
		(outOfStockProducts?.length || 0) >= 1_000_000
			? ((outOfStockProducts?.length || 0) / 1_000_000).toFixed(2) + "M"
			: Intl.NumberFormat().format(outOfStockProducts?.length! || 0);

	const newProducts = products.data?.filter(
		(product) => product.status === "New"
	);
	const totalNewProducts =
		(newProducts?.length || 0) >= 1_000_000
			? ((newProducts?.length || 0) / 1_000_000).toFixed(2) + "M"
			: Intl.NumberFormat().format(newProducts?.length! || 0);

	const totalCustomers =
		(customersData?.length || 0) >= 1_000_000
			? ((customersData?.length || 0) / 1_000_000).toFixed(2) + "M"
			: Intl.NumberFormat().format(customersData?.length! || 0);

	return (
		<div className="space-y-6">
			<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">
							Total Products
						</CardTitle>
						<ShoppingBag className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-4xl font-bold">{totalProducts}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-4xl font-bold">{outOfStock}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">New Products</CardTitle>
						<ShoppingBag className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-4xl font-bold">{totalNewProducts}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">
							Total Customers
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-4xl font-bold">{totalCustomers}</div>
					</CardContent>
				</Card>
			</div>

			<Analytics />
		</div>
	);
};

export default AdminOverview;
