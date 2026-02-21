"use client";

import PreorderTable from "@/components/admin/PreorderTable";
import { SidebarTrigger } from "@/components/ui/sidebar";

const PreordersPage = () => {
	return (
		<div className="container space-y-5 mx-auto">
			<div className="flex flex-col mb-6">
				<div className="flex gap-5 items-center">
					<SidebarTrigger />
					<h1 className="text-3xl font-bold">Preorders</h1>
				</div>
				<p className="text-muted-foreground mt-2 pl-12">
					View and manage customer requests for items not currently in stock.
				</p>
			</div>
			<PreorderTable />
		</div>
	);
};

export default PreordersPage;
