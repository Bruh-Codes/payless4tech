import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function SectionCards({
	totalProducts,
	outOfStock,
	totalNewProducts,
	totalCustomers,
}: {
	totalProducts: string;
	outOfStock: string;
	totalNewProducts: string;
	totalCustomers: string;
}) {
	return (
		<div className="*:data-[slot=card]:from-orange-50/30 *:data-[slot=card]:to-orange-100/20 dark:*:data-[slot=card]:from-primary/5 dark:*:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @md/main:grid-cols-2 @3xl/main:grid-cols-4">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Total Products</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{totalProducts}
					</CardTitle>
					{/* <CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+12.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				{/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Trending up this month <IconTrendingUp className="size-4" />
					</div>
					<div className="text-muted-foreground">
						Visitors for the last 6 months
					</div>
				</CardFooter> */}
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Out of Stock</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{outOfStock}
					</CardTitle>
				</CardHeader>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>New Products</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{totalNewProducts}
					</CardTitle>
				</CardHeader>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Total Customers</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{totalCustomers}
					</CardTitle>
				</CardHeader>
			</Card>
		</div>
	);
}
