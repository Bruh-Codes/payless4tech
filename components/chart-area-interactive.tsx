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
import { useQuery } from "@tanstack/react-query";
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

function processData(
	rawData: RawSalesRow[],
	fromDate: Date,
	toDate: Date,
): SalesData[] {
	// Group by date (data already filtered by query)
	const groupedByDate = _.groupBy(rawData, (sale) => {
		return format(new Date(sale.created_at), "yyyy-MM-dd");
	});

	// Generate all dates in range
	const allDates: string[] = [];
	let currentDate = new Date(fromDate);
	while (currentDate <= toDate) {
		allDates.push(format(currentDate, "yyyy-MM-dd"));
		currentDate.setDate(currentDate.getDate() + 1);
	}

	// Convert to chart data format ensuring all dates are present
	const chartData = allDates.map((date) => {
		const sales = groupedByDate[date] || [];
		const total_sales = _.sumBy(sales, "total_amount") || 0;
		const order_count = sales.length;
		const avg_order_value = order_count > 0 ? total_sales / order_count : 0;

		return {
			date,
			total_sales,
			order_count,
			avg_order_value: Math.round(avg_order_value),
		};
	});

	return chartData;
}

export function ChartAreaInteractive() {
	const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
		from: subDays(new Date(), 7),
		to: new Date(),
	});
	const isMobile = useIsMobile();
	const fromStr = dateRange?.from
		? startOfDay(dateRange.from).toISOString()
		: null;
	const toStr = dateRange?.to ? endOfDay(dateRange.to).toISOString() : null;

	const { data: salesData = [], isLoading: isPending } = useQuery({
		queryKey: ["admin", "salesData", fromStr, toStr],
		queryFn: async () => {
			if (!fromStr || !toStr) return [];
			const response = await supabase
				.from("sales")
				.select("created_at,total_amount, fulfillment_status")
				.in("fulfillment_status", ["delivered", "completed", "shipped"])
				.gte("created_at", fromStr)
				.lte("created_at", toStr)
				.order("created_at");

			if (response.error) {
				console.error("Error fetching sales data:", response.error);
				toast.error("Error fetching sales data.");
				return [];
			}
			return processData(
				response.data as RawSalesRow[],
				new Date(fromStr),
				new Date(toStr),
			);
		},
		enabled: !!fromStr && !!toStr,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// Quick date range presets
	const setPresetRange = (days: number) => {
		setDateRange({
			from: subDays(new Date(), days),
			to: new Date(),
		});
	};

	// Calculate totals from processed data
	const totalRevenue = salesData.reduce(
		(acc, item) => acc + item.total_sales,
		0,
	);
	const totalOrders = salesData.reduce(
		(acc, item) => acc + item.order_count,
		0,
	);

	// Calculate accurate average order value from raw sales data
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
								mode="range"
								autoFocus
								defaultMonth={dateRange?.from || new Date()}
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
						className="h-[300px] w-full overflow-hidden"
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
