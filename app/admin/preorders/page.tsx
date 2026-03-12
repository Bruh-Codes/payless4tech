"use client";

import SalesTableWrapper from "@/components/admin/SalesTableWrapper";
import { SidebarTrigger } from "@/components/ui/sidebar";

const PreordersPage = () => {
	return (
		<div className="container space-y-5 mx-auto">
			<div className="flex flex-col mb-6">
				<div className="flex gap-5 items-center">
					<SidebarTrigger />
					<h1 className="text-3xl font-bold">Orders</h1>
				</div>
				<p className="text-muted-foreground mt-2 pl-12">
					View and manage both regular orders and pre-orders in one place.
				</p>
			</div>
			<SalesTableWrapper />
		</div>
	);
};

export default PreordersPage;
