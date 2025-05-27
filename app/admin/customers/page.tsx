"use client";

import { DataTable } from "@/components/admin/data-table";
import { CustomerColumns } from "@/components/admin/Columns";
import { customersData } from "@/data";

const Page = () => {
	return (
		<div className="space-y-6 w-full">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold tracking-tight">Customers</h1>
			</div>

			<div className="container mx-auto">
				<DataTable columns={CustomerColumns} data={customersData} />
			</div>
		</div>
	);
};

export default Page;
