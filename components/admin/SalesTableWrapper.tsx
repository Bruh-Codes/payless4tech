"use client";

import { supabase } from "@/integrations/supabase/client";
import dynamicImport from "next/dynamic";
import { TableSkeleton } from "@/components/LoadingSkeletons";
import { useQuery } from "@tanstack/react-query";

const DataTable = dynamicImport(
	() =>
		import("@/components/admin/data-table").then((mod) => ({
			default: mod.DataTable,
		})),
	{
		loading: () => <TableSkeleton />,
	},
);

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

export default function SalesTableWrapper() {
	const {
		data: sales,
		error,
		isLoading,
	} = useQuery({
		queryKey: ["admin", "sales"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("sales")
				.select("*")
				.order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		},
		staleTime: 1000 * 60 * 2, // 2 minutes
	});

	if (isLoading) {
		return <TableSkeleton />;
	}

	if (error) {
		console.log("Error fetching sales data", error);
		return <div className="text-red-500">Failed to load sales data</div>;
	}

	const sortedSales = sales?.sort((a, b) => {
		const aIsActive =
			a.status === "paid" && a.fulfillment_status !== "delivered";
		const bIsActive =
			b.status === "paid" && b.fulfillment_status !== "delivered";

		if (aIsActive && !bIsActive) return -1;
		if (!aIsActive && bIsActive) return 1;
		return 0;
	});

	return <DataTable data={sortedSales as salesType[]} />;
}
