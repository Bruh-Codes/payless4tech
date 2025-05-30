"use client";

import { ArchivedDataTable } from "@/components/admin/ArchivedDataTable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { salesType } from "../page";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
	const { data: archived_sales, error } = useQuery({
		queryKey: ["archived_sales "],
		queryFn: async () => {
			const response = await supabase.from("archived_sales").select("*");
			return response;
		},
	});

	if (error?.message) {
		toast.error(error.message);
	}

	return (
		<div className="container space-y-5 mx-auto">
			<div className="flex gap-5 items-center mb-6">
				<SidebarTrigger />
				<h1 className="text-3xl font-bold">Archives</h1>
			</div>
			<ArchivedDataTable data={(archived_sales?.data ?? []) as salesType[]} />
		</div>
	);
};

export default Page;
