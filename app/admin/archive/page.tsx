"use client";

import { ArchivedDataTable } from "@/components/admin/ArchivedDataTable";
import { salesType } from "@/components/admin/SalesTableWrapper";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
	const {
		data: archived_sales,
		error,
		isLoading,
	} = useQuery({
		queryKey: ["admin", "archived_sales"],
		queryFn: async () => {
			const response = await supabase.from("archived_sales").select("*");
			return response;
		},
		staleTime: 1000 * 60 * 10, // 10 minutes
	});

	if (error?.message) {
		toast.error(error.message);
	}

	const sortedArchivedSales = archived_sales?.data?.sort((a, b) => {
		const aIsActive =
			a.status === "paid" && a.fulfillment_status !== "delivered";
		const bIsActive =
			b.status === "paid" && b.fulfillment_status !== "delivered";

		if (aIsActive && !bIsActive) return -1;
		if (!aIsActive && bIsActive) return 1;
		return 0;
	});

	return (
		<div className="container space-y-5 mx-auto">
			<div className="flex flex-col mb-6">
				<div className="flex gap-5 items-center">
					<SidebarTrigger />
					<h1 className="text-3xl font-bold">Archives</h1>
				</div>
				<p className="text-muted-foreground mt-2 pl-12">
					View history of completed and cancelled sales orders.
				</p>
			</div>
			<ArchivedDataTable
				isLoading={isLoading}
				data={(sortedArchivedSales ?? []) as salesType[]}
			/>
		</div>
	);
};

export default Page;
