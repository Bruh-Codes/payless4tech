"use client";

import * as React from "react";
import {
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconCircleCheckFilled,
	IconDotsVertical,
	IconLayoutColumns,
	IconLoader,
} from "@tabler/icons-react";
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import PreorderTable from "./PreorderTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const schema = z.object({
	id: z.number(),
	email: z.string(),
	user_id: z.string(),
	total_amount: z.string(),
	status: z.string(),
	phone_number: z.string(),
	alternative_phone: z.string(),
	delivery_address: z.string(),
	gps_location: z.string(),
	extended_warranty: z.boolean(),
	fulfillment_status: z.enum(["pending", "delivered", "cancelled"]),
	product: z.array(
		z.object({
			name: z.string(),
			quantity: z.number(),
			price: z.number(),
			id: z.string(),
		})
	),
});

const handleMarkAsDelivered = async (
	id: number,
	data: any[],
	setData: Function
) => {
	const { error } = await supabase
		.from("sales")
		.update({ fulfillment_status: "delivered" })
		.eq("id", id.toString());

	if (error) {
		console.error("Error updating order status:", error);
		toast.error("Error", { description: "Failed to update order status" });
	} else {
		// Update local state
		const updated = data.map((row) =>
			row.id === id ? { ...row, fulfillment_status: "delivered" } : row
		);
		setData(updated);

		toast.success("Success", {
			description: "Order status updated successfully",
		});
	}
};

const columns = (
	data: z.infer<typeof schema>[],
	setData: React.Dispatch<React.SetStateAction<z.infer<typeof schema>[]>>,
	handleDelete: (id: number) => void
): ColumnDef<z.infer<typeof schema>>[] => [
	{
		accessorKey: "status",
		header: "Payment Status",
		cell: ({ row }) => (
			<Badge
				variant="outline"
				className={cn("text-muted-foreground px-1.5", {
					"border-white/30 bg-green-300 text-black":
						row.original.fulfillment_status === "pending",
				})}
			>
				{row.original.status === "completed" ? (
					<IconCircleCheckFilled className="fill-green-800 dark:fill-green-900" />
				) : (
					<IconLoader />
				)}
				{row.original.status}
			</Badge>
		),
	},
	{
		accessorKey: "Amount Paid",
		header: "Amount Paid",
		cell: ({ row }) => {
			const amount = parseFloat(row.original.total_amount);
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "Ghc",
			}).format(amount);

			return (
				<div className="w-32">
					<Badge variant="outline" className="text-muted-foreground px-1.5">
						{formatted || "N/A"}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "product",
		header: "For Product",
		cell: ({ row }) => {
			let product = row?.original?.product;
			// Parse only if it's a string
			if (typeof product === "string") {
				try {
					product = JSON.parse(product);
				} catch (err) {
					product = []; // fallback to empty array on bad JSON
				}
			}

			const safeProduct = Array.isArray(product) ? product : [];

			return (
				<ul className="space-y-1 text-sm text-muted-foreground">
					{safeProduct?.map(({ name, quantity, price, id }) => (
						<li key={id} className="flex items-start gap-2">
							<span className="font-medium truncate text-foreground">
								Name:
							</span>{" "}
							<span
								className="truncate inline-block max-w-[250px] align-middle"
								title={name}
							>
								{name}
							</span>{" "}
							<span className="font-medium text-foreground">Qty:</span>{" "}
							{quantity}{" "}
							<span className="font-medium text-foreground">Price:</span> GHS{" "}
							{price}
						</li>
					))}
				</ul>
			);
		},
	},
	{
		accessorKey: "Delivery Status",
		header: "Delivery Status",
		cell: ({ row }) => (
			<Badge
				variant="outline"
				className={cn("text-muted-foreground px-1.5", {
					"bg-blue-400 text-white border-blue-500":
						row.original.fulfillment_status === "pending",
				})}
			>
				{row.original.fulfillment_status === "delivered" ? (
					<IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
				) : (
					<IconLoader />
				)}
				{row.original.fulfillment_status}
			</Badge>
		),
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => (
			<Badge variant="outline" className="text-muted-foreground px-1.5">
				{row.original.email}
			</Badge>
		),
	},
	{
		accessorKey: "Phone Number",
		header: "Phone",
		cell: ({ row }) => (
			<div className="w-32">
				<Badge variant="outline" className="text-muted-foreground px-1.5">
					{row.original.phone_number || "N/A"}
				</Badge>
			</div>
		),
	},
	{
		accessorKey: "Alternative Phone",
		header: "Alternative Phone",
		cell: ({ row }) => (
			<div className="w-32">
				<Badge variant="outline" className="text-muted-foreground px-1.5">
					{row.original.alternative_phone || "N/A"}
				</Badge>
			</div>
		),
	},
	{
		accessorKey: "Delivery Address",
		header: "Delivery Address",
		cell: ({ row }) => (
			<div className="w-32">
				<Badge variant="outline" className="text-muted-foreground px-1.5">
					{row.original.delivery_address || "N/A"}
				</Badge>
			</div>
		),
	},
	{
		accessorKey: "Extended Warranty",
		header: "Extended Warranty",
		cell: ({ row }) => (
			<div className="w-32">
				<Badge variant="outline" className="text-muted-foreground px-1.5">
					{row.original.extended_warranty ? "Yes" : "No"}
				</Badge>
			</div>
		),
	},
	{
		accessorKey: "Gps Location",
		header: "GPS Location",
		cell: ({ row }) => (
			<div className="w-32">
				<Badge variant="outline" className="text-muted-foreground px-1.5">
					{row.original.gps_location || "N/A"}
				</Badge>
			</div>
		),
	},
	{
		id: "action",
		cell: ({ row }) => (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
						size="icon"
					>
						<IconDotsVertical />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-32">
					<DropdownMenuItem
						disabled={row?.original.fulfillment_status !== "pending"}
						onClick={() =>
							handleMarkAsDelivered(row.original.id, data, setData)
						}
					>
						Mark Delivered
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={row?.original.status !== "pending"}
						onClick={() => handleDelete(row.original.id)}
						variant="destructive"
					>
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
];

export default columns;

export function DataTable({ data }: { data: z.infer<typeof schema>[] }) {
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [activeTab, setActiveTab] = React.useState("outline");
	const [salesData, setSalesData] = React.useState<z.infer<typeof schema>[]>(
		data || []
	);

	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const handleDelete = async (id: number) => {
		// Fetch the sale to archive
		const { data: saleData, error: fetchError } = await supabase
			.from("sales")
			.select("*")
			.eq("id", id.toString())
			.single();

		if (fetchError || !saleData) {
			console.error("Error fetching sale:", fetchError);
			toast.error("Error", {
				description: "Failed to fetch sale for archiving",
			});
			return;
		}

		// Insert into archived_sales
		const { error: archiveError } = await supabase
			.from("archived_sales")
			.insert([saleData]);

		if (archiveError) {
			console.error("Error archiving sale:", archiveError);
			toast.error("Error", { description: "Failed to archive sale" });
			return;
		}

		// Delete from sales
		const { error: deleteError } = await supabase
			.from("sales")
			.delete()
			.eq("id", id.toString());

		if (deleteError) {
			console.error("Error deleting sale:", deleteError);
			toast.error("Error", { description: "Failed to delete sale" });
			return;
		}

		// Update local state
		toast.success("Success", { description: "Order archived successfully" });
		setSalesData((prev) => prev.filter((row) => row.id !== id));
	};

	const table = useReactTable({
		data: salesData,
		columns: columns(salesData, setSalesData, handleDelete),
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		getRowId: (row) => row.id.toString(),
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	return (
		<Tabs
			value={activeTab}
			onValueChange={(value) => setActiveTab(value)}
			defaultValue="outline"
			className="w-full flex-col justify-start gap-6"
		>
			<div className="flex items-center justify-between px-4 lg:px-6">
				<Label htmlFor="view-selector" className="sr-only">
					View
				</Label>
				<Select defaultValue="outline">
					<SelectTrigger
						className="flex w-fit @4xl/main:hidden"
						size="sm"
						id="view-selector"
					>
						<SelectValue placeholder="Select a view" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="outline">Active Orders</SelectItem>
						<SelectItem value="preorders">Preorders</SelectItem>
					</SelectContent>
				</Select>
				<TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
					<TabsTrigger value="outline">Active Orders</TabsTrigger>
					<TabsTrigger value="preorders">Preorders</TabsTrigger>
				</TabsList>
				{activeTab === "outline" && (
					<div className="flex items-center gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									<IconLayoutColumns />
									<span className="hidden lg:inline">Customize Columns</span>
									<span className="lg:hidden">Columns</span>
									<IconChevronDown />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								{table
									?.getAllColumns()
									.filter(
										(column) =>
											typeof column.accessorFn !== "undefined" &&
											column.getCanHide()
									)
									.map((column) => {
										return (
											<DropdownMenuCheckboxItem
												key={column.id}
												className="capitalize"
												checked={column.getIsVisible()}
												onCheckedChange={(value) =>
													column.toggleVisibility(!!value)
												}
											>
												{column.id}
											</DropdownMenuCheckboxItem>
										);
									})}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
			</div>
			<TabsContent
				value="outline"
				className="relative flex flex-col gap-4 overflow-auto"
			>
				{!data ? (
					<p className="text-center">No data available.</p>
				) : (
					<>
						<div className="overflow-hidden rounded-lg border">
							{!table || !table?.getRowModel() ? (
								<div className="h-24 flex items-center justify-center text-center text-muted-foreground">
									{Array.isArray(data) && data.length === 0
										? "No data available."
										: "Unable to load data. Please check your internet connection."}
								</div>
							) : (
								<Table>
									<TableHeader className="bg-muted sticky top-0 z-10">
										{table?.getHeaderGroups()?.map((headerGroup) => (
											<TableRow key={headerGroup.id}>
												{headerGroup?.headers.map((header) => {
													return (
														<TableHead key={header.id} colSpan={header.colSpan}>
															{header.isPlaceholder
																? null
																: flexRender(
																		header.column.columnDef.header,
																		header.getContext()
																  )}
														</TableHead>
													);
												})}
											</TableRow>
										))}
									</TableHeader>
									<TableBody>
										{table?.getRowModel().rows?.length ? (
											table?.getRowModel().rows.map((row) => {
												const isPending =
													row.original.fulfillment_status === "pending";
												return (
													<TableRow
														key={row.id}
														data-state={row.getIsSelected() && "selected"}
														className={
															isPending
																? "bg-blue-100 hover:bg-blue-200 text-white dark:bg-yellow-900/30"
																: ""
														}
													>
														{row.getVisibleCells().map((cell) => {
															return (
																<TableCell key={cell.id}>
																	{flexRender(
																		cell.column.columnDef.cell,
																		cell.getContext()
																	)}
																</TableCell>
															);
														})}
													</TableRow>
												);
											})
										) : (
											<TableRow>
												<TableCell colSpan={20} className="h-24 text-center">
													No results.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							)}
						</div>
						<div className="flex items-center justify-between px-4">
							<div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
								{table?.getFilteredSelectedRowModel()?.rows.length} of{" "}
								{table?.getFilteredRowModel()?.rows.length} row(s) selected.
							</div>
							<div className="flex w-full items-center gap-8 lg:w-fit">
								<div className="hidden items-center gap-2 lg:flex">
									<Label
										htmlFor="rows-per-page"
										className="text-sm font-medium"
									>
										Rows per page
									</Label>
									<Select
										value={`${table?.getState().pagination.pageSize}`}
										onValueChange={(value) => {
											table?.setPageSize(Number(value));
										}}
									>
										<SelectTrigger
											size="sm"
											className="w-20"
											id="rows-per-page"
										>
											<SelectValue
												placeholder={table?.getState().pagination.pageSize}
											/>
										</SelectTrigger>
										<SelectContent side="top">
											{[10, 20, 30, 40, 50].map((pageSize) => (
												<SelectItem key={pageSize} value={`${pageSize}`}>
													{pageSize}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="flex w-fit items-center justify-center text-sm font-medium">
									Page {table?.getState().pagination.pageIndex + 1} of{" "}
									{table?.getPageCount()}
								</div>
								<div className="ml-auto flex items-center gap-2 lg:ml-0">
									<Button
										variant="outline"
										className="hidden h-8 w-8 p-0 lg:flex"
										onClick={() => table?.setPageIndex(0)}
										disabled={!table?.getCanPreviousPage()}
									>
										<span className="sr-only">Go to first page</span>
										<IconChevronsLeft />
									</Button>
									<Button
										variant="outline"
										className="size-8"
										size="icon"
										onClick={() => table?.previousPage()}
										disabled={!table?.getCanPreviousPage()}
									>
										<span className="sr-only">Go to previous page</span>
										<IconChevronLeft />
									</Button>
									<Button
										variant="outline"
										className="size-8"
										size="icon"
										onClick={() => table?.nextPage()}
										disabled={!table?.getCanNextPage()}
									>
										<span className="sr-only">Go to next page</span>
										<IconChevronRight />
									</Button>
									<Button
										variant="outline"
										className="hidden size-8 lg:flex"
										size="icon"
										onClick={() =>
											table?.setPageIndex(table?.getPageCount() - 1)
										}
										disabled={!table?.getCanNextPage()}
									>
										<span className="sr-only">Go to last page</span>
										<IconChevronsRight />
									</Button>
								</div>
							</div>
						</div>
					</>
				)}
			</TabsContent>
			<TabsContent
				value="preorders"
				className="relative flex flex-col gap-4 overflow-auto"
			>
				<PreorderTable />
			</TabsContent>
		</Tabs>
	);
}
