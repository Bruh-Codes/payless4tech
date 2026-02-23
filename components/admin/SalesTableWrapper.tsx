"use client";

import dynamicImport from "next/dynamic";
import { TableSkeleton } from "@/components/LoadingSkeletons";

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
	id: string;
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
	return <DataTable />;
}
