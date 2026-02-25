import AdminOverview from "@/components/admin/AdminOverview";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/admin/data-table";
import { supabase } from "@/integrations/supabase/client";

export interface salesType {
	id: number;
	email: string;
	user_id: string;
	total_amount: string;
	phone_number: string;
	alternative_phone: string;
	delivery_address: string;
	extended_warranty: boolean;
	fulfillment_status: "pending" | "delivered" | "cancelled";
	gps_location: string;
	product_id: string;
	total_price: number;
	status: string;
	product: {
		name: string;
		quantity: number;
		price: number;
		id: string;
	}[];
}

export const dynamic = "force-dynamic";

export default async function Page() {
	// Only fetch data if we're not in build time and Supabase is properly configured
	let sales: any[] = [];
	let error = null;

	try {
		// Check if we have the required environment variables
		if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
			const result = await supabase.from("sales").select("*");
			sales = result.data || [];
			error = result.error;
		}
	} catch (e) {
		// Handle any errors during build time gracefully
		console.log("Admin page: Supabase not available during build");
		sales = [];
		error = null;
	}

	const sortedSales = sales?.sort((a, b) => {
		if (
			a.fulfillment_status === "pending" &&
			b.fulfillment_status !== "pending"
		)
			return -1;
		if (
			a.fulfillment_status !== "pending" &&
			b.fulfillment_status === "pending"
		)
			return 1;
		return 0;
	});
	
	if (error) {
		console.log("Error fetching sales data", error);
	}

	return (
		<div className="container space-y-5 mx-auto">
			<div className="flex gap-5 items-center mb-6">
				<SidebarTrigger />
				<h1 className="text-3xl font-bold">Dashboard</h1>
			</div>
			<AdminOverview />
			<ChartAreaInteractive />
			<DataTable data={sortedSales as salesType[]} />
			{/* <SlideshowImageList /> */}

			{/* <div className="grid gap-8">
				<div className="space-y-6">
					<SlideshowImageForm onImageAdded={handleSlideshowImageAdded} />
					{/*  */}
			{/*
				</div>
					 <ProductList /> */}
		</div>
	);
}
