"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import _ from "lodash";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Types
interface SalesData {
	date: string;
	total_sales: number;
	order_count: number;
	avg_order_value: number;
}

interface RawSalesRow {
	created_at: string;
	total_amount: number;
	fulfillment_status: string;
}

const chartConfig = {
	total_sales: {
		label: "Total Sales",
		color: "var(--chart-3)",
	},
	order_count: {
		label: "Order Count",
		color: "white",
	},
} satisfies ChartConfig;

function processData(rawData: RawSalesRow[]): SalesData[] {
	// Filter only completed sales
	const completedSales = rawData.filter(
		(sale) => sale.fulfillment_status === "delivered",
	);
	// Group by date
	const groupedByDate = _.groupBy(completedSales, (sale) => {
		return format(new Date(sale.created_at), "yyyy-MM-dd");
	});

	// Convert to chart data format
	const chartData = Object.entries(groupedByDate).map(([date, sales]) => {
		const total_sales = _.sumBy(sales, "total_amount");
		const order_count = sales.length;
		const avg_order_value = order_count > 0 ? total_sales / order_count : 0;

		return {
			date,
			total_sales,
			order_count,
			avg_order_value: Math.round(avg_order_value),
		};
	});

	// Sort by date
	return _.sortBy(chartData, "date");
}

export function ChartAreaInteractive() {
	const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
		from: subDays(new Date(), 7),
		to: new Date(),
	});
	const [salesData, setSalesData] = React.useState<SalesData[]>([]);
	const isMobile = useIsMobile();

	const { isPending, mutate } = useMutation({
		mutationKey: ["salesData"],
		mutationFn: async ({ from, to }: { from: string; to: string }) => {
			const response = await supabase
				.from("sales")
				.select("created_at,total_amount, fulfillment_status")
				.eq("fulfillment_status", "delivered")
				.gte("created_at", from)
				.lte("created_at", to)
				.order("created_at");
			return response.data;
		},

		onSuccess: (data) => {
			const processedData = processData(data as RawSalesRow[]);
			setSalesData(processedData);
		},
		onError: (error) => {
			console.error("Error fetching sales data:", error);
			toast.error("Error fetching sales data.");
		},
	});

	// Fetch data when date range changes
	React.useEffect(() => {
		if (dateRange?.from && dateRange?.to) {
			mutate({
				from: startOfDay(dateRange?.from as Date).toISOString(),
				to: endOfDay(dateRange?.to as Date).toISOString(),
			});
		}
	}, [dateRange]);

	// Quick date range presets
	const setPresetRange = (days: number) => {
		setDateRange({
			from: subDays(new Date(), days),
			to: new Date(),
		});
	};

	const totalRevenue = salesData.reduce(
		(acc, item) => acc + item.total_sales,
		0,
	);
	const totalOrders = salesData.reduce(
		(acc, item) => acc + item.order_count,
		0,
	);
	const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "GHS",
			minimumFractionDigits: 0,
		}).format(value);

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-lg">Revenue Over Time</CardTitle>
				<CardDescription className="text-orange-300">
					Total Revenue: ${formatCurrency(totalRevenue)}
					{" • "}
					Avg Order Value: {formatCurrency(avgOrderValue)}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Controls */}
				<div className="flex flex-wrap gap-4 mb-6">
					{/* Date Range Picker */}
					<Popover>
						<Select>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										"w-[280px] justify-start text-left font-normal",
										!dateRange && "text-muted-foreground",
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{dateRange?.from ? (
										dateRange.to ? (
											<>
												{format(dateRange.from, "LLL dd, y")} -{" "}
												{format(dateRange.to, "LLL dd, y")}
											</>
										) : (
											format(dateRange.from, "LLL dd, y")
										)
									) : (
										<span>Pick a date range</span>
									)}
								</Button>
							</PopoverTrigger>
						</Select>

						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								initialFocus
								mode="range"
								defaultMonth={dateRange?.from}
								selected={dateRange}
								onSelect={setDateRange}
								numberOfMonths={2}
							/>
						</PopoverContent>
					</Popover>

					{/* Quick Presets */}
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPresetRange(7)}
						>
							7d
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPresetRange(30)}
						>
							30d
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPresetRange(90)}
						>
							90d
						</Button>
					</div>
				</div>

				{/* Chart */}
				{isPending ? (
					<div className="h-[300px] flex items-center justify-center">
						<div className="text-muted-foreground">Loading sales data...</div>
					</div>
				) : salesData.length >= 1 ? (
					<ChartContainer
						config={chartConfig}
						className="aspect-auto h-[250px] w-full"
					>
						<AreaChart data={salesData}>
							<defs>
								<linearGradient
									id="fillTotal_sales"
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="5%"
										stopColor={chartConfig.total_sales.color}
										stopOpacity={1.0}
									/>
									<stop
										offset="95%"
										stopColor={chartConfig.total_sales.color}
										stopOpacity={0.1}
									/>
								</linearGradient>
								<linearGradient
									id="fillOrder_count"
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="5%"
										stopColor={chartConfig.order_count.color}
										stopOpacity={0.8}
									/>
									<stop
										offset="95%"
										stopColor={chartConfig.order_count.color}
										stopOpacity={0.1}
									/>
								</linearGradient>
							</defs>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="date"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								minTickGap={32}
								tickFormatter={(value) => {
									const date = new Date(value);
									return date.toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									});
								}}
							/>
							<ChartTooltip
								cursor={false}
								defaultIndex={isMobile ? -1 : 10}
								content={
									<ChartTooltipContent
										labelFormatter={(value) => {
											return new Date(value).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											});
										}}
										indicator="dot"
									/>
								}
							/>
							<Area
								dataKey="total_sales"
								type="natural"
								fill="url(#fillTotal_sales)"
								stroke={chartConfig.total_sales.color}
								stackId="a"
							/>
							<Area
								dataKey="order_count"
								type="natural"
								fill="url(#fillTotal_sales)"
								stroke={chartConfig.order_count.color}
								stackId="a"
							/>
						</AreaChart>
					</ChartContainer>
				) : (
					<div className="h-[300px] flex items-center justify-center">
						<div className="text-muted-foreground">
							No sales data available.
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
