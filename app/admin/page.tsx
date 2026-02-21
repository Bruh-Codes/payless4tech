import AdminOverview from "@/components/admin/AdminOverview";
import { SidebarTrigger } from "@/components/ui/sidebar";
import dynamicImport from "next/dynamic";
import { Suspense } from "react";
import {
	ChartSkeleton,
	TableSkeleton,
	AdminCardsSkeleton,
} from "@/components/LoadingSkeletons";
import SalesTableWrapper from "@/components/admin/SalesTableWrapper";

// Dynamically import heavy components for better performance
const ChartAreaInteractive = dynamicImport(
	() =>
		import("@/components/chart-area-interactive").then((mod) => ({
			default: mod.ChartAreaInteractive,
		})),
	{
		loading: () => <ChartSkeleton />,
	},
);

export const dynamic = "force-dynamic";

export default function Page() {
	return (
		<div className="container space-y-5 mx-auto">
			<div className="flex flex-col mb-6">
				<div className="flex gap-5 items-center">
					<SidebarTrigger />
					<h1 className="text-3xl font-bold">Dashboard</h1>
				</div>
				<p className="text-muted-foreground mt-2 pl-12">
					Overview of your store's performance, sales, and inventory metrics.
				</p>
			</div>

			<Suspense fallback={<AdminCardsSkeleton />}>
				<AdminOverview />
			</Suspense>

			<Suspense fallback={<ChartSkeleton />}>
				<ChartAreaInteractive />
			</Suspense>

			<Suspense fallback={<TableSkeleton />}>
				<SalesTableWrapper />
			</Suspense>
		</div>
	);
}
