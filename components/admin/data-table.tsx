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
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const schema = z.object({
	id: z.union([z.number(), z.string()]),
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
		}),
	),
});

const columns = (
	handleDelete: (id: string | number) => void,
	handleMarkAsDelivered: (id: string | number) => void,
	handleMarkAsUndelivered: (id: string | number) => void,
	handleViewDetails: (id: string | number) => void,
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
				{row.original.status === "paid" ? (
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
					{safeProduct?.map(({ name, quantity, price, id }, index) => (
						<li key={id || index} className="flex items-start gap-2">
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
					"bg-sidebar-accent text-sidebar-accent-foreground":
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
					<DropdownMenuItem onClick={() => handleViewDetails(row.original.id)}>
						View Details
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						disabled={row?.original.fulfillment_status !== "pending"}
						onClick={() => handleMarkAsDelivered(row.original.id)}
					>
						Mark Delivered
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={row?.original.fulfillment_status !== "delivered"}
						onClick={() => handleMarkAsUndelivered(row.original.id)}
					>
						Mark Undelivered
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={row?.original.fulfillment_status === "pending"}
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

export function DataTable() {
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [activeTab, setActiveTab] = React.useState("outline");
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const [searchQuery, setSearchQuery] = React.useState("");
	const [debouncedQuery] = useDebounce(searchQuery, 300);

	const queryClient = useQueryClient();
	const router = useRouter();

	const {
		data: queryResult,
		error,
		isLoading,
	} = useQuery({
		queryKey: [
			"admin",
			"sales",
			pagination.pageIndex,
			pagination.pageSize,
			debouncedQuery,
		],
		queryFn: async () => {
			const from = pagination.pageIndex * pagination.pageSize;
			const to = from + pagination.pageSize - 1;

			let req = supabase
				.from("sales")
				.select("*", { count: "exact" })
				.order("created_at", { ascending: false })
				.range(from, to);

			if (debouncedQuery) {
				req = req.or(
					`email.ilike.%${debouncedQuery}%,phone_number.ilike.%${debouncedQuery}%,delivery_address.ilike.%${debouncedQuery}%`,
				);
			}

			const { data, error, count } = await req;
			if (error) throw error;
			return { data: data || [], count: count || 0 };
		},
		staleTime: 1000 * 60 * 2, // 2 minutes
	});

	if (error) {
		console.error("Error fetching sales data", error);
	}

	const rawData = queryResult?.data ?? [];
	const totalCount = queryResult?.count ?? 0;

	// Sort active items logic
	const salesData = [...rawData].sort((a, b) => {
		const aIsActive =
			a.status === "paid" && a.fulfillment_status !== "delivered";
		const bIsActive =
			b.status === "paid" && b.fulfillment_status !== "delivered";

		if (aIsActive && !bIsActive) return -1;
		if (!aIsActive && bIsActive) return 1;
		return 0;
	});

	const handleViewDetails = (id: string | number) => {
		router.push(`/admin/orders/${id}`);
	};

	const deleteMutation = useMutation({
		mutationFn: async (id: string | number) => {
			const { data: saleData, error: fetchError } = await supabase
				.from("sales")
				.select("*")
				.eq("id", id)
				.single();

			if (fetchError || !saleData)
				throw new Error("Failed to fetch sale for archiving");

			const { error: archiveError } = await supabase
				.from("archived_sales")
				.insert([saleData]);

			if (archiveError) throw new Error("Failed to archive sale");

			const { error: deleteError } = await supabase
				.from("sales")
				.delete()
				.eq("id", id);

			if (deleteError) throw new Error("Failed to delete sale");
			return id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "sales"] });
			toast.success("Order archived successfully.");
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	const markAsDeliveredMutation = useMutation({
		mutationFn: async (id: string | number) => {
			const { error } = await supabase
				.from("sales")
				.update({ fulfillment_status: "delivered" })
				.eq("id", id);
			if (error) throw error;
			return id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "sales"] });
			toast.success("Marked as delivered.");
		},
		onError: () => toast.error("Failed to mark as delivered."),
	});

	const markAsUndeliveredMutation = useMutation({
		mutationFn: async (id: string | number) => {
			const { error } = await supabase
				.from("sales")
				.update({ fulfillment_status: "pending" })
				.eq("id", id);
			if (error) throw error;
			return id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "sales"] });
			toast.success("Marked as undelivered.");
		},
		onError: () => toast.error("Failed to mark as undelivered."),
	});

	const handleDelete = (id: string | number) => deleteMutation.mutate(id);
	const handleMarkAsDelivered = (id: string | number) =>
		markAsDeliveredMutation.mutate(id);
	const handleMarkAsUndelivered = (id: string | number) =>
		markAsUndeliveredMutation.mutate(id);

	const table = useReactTable({
		data: salesData as z.infer<typeof schema>[],
		columns: columns(
			handleDelete,
			handleMarkAsDelivered,
			handleMarkAsUndelivered,
			handleViewDetails,
		),
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
		manualPagination: true,
		pageCount: Math.ceil(totalCount / pagination.pageSize),
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
											column.getCanHide(),
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
				className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
			>
				<div className="flex items-center">
					<Input
						placeholder="Search by email, phone, or address..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="max-w-sm"
					/>
				</div>
				<div className="overflow-hidden rounded-lg border">
					{!table || !table?.getRowModel() ? (
						isLoading ? (
							<Table>
								<TableHeader className="bg-muted sticky top-0 z-10">
									<TableRow>
										<TableHead>
											<Skeleton className="h-4 w-24" />
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{Array.from({ length: 5 }).map((_, i) => (
										<TableRow key={i}>
											<TableCell>
												<Skeleton className="h-6 w-full" />
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<div className="h-24 flex items-center justify-center text-center text-muted-foreground">
								{Array.isArray(salesData) && salesData.length === 0
									? "No data available."
									: "Unable to load data. Please check your internet connection."}
							</div>
						)
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
																header.getContext(),
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
										const isActiveRow =
											row.original.status === "paid" &&
											row.original.fulfillment_status !== "delivered";
										return (
											<ContextMenu key={row.id}>
												<ContextMenuTrigger asChild>
													<TableRow
														data-state={row.getIsSelected() && "selected"}
														onDoubleClick={() =>
															handleViewDetails(row.original.id)
														}
														className={
															isActiveRow
																? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 cursor-pointer"
																: "cursor-pointer"
														}
													>
														{row.getVisibleCells().map((cell) => {
															return (
																<TableCell key={cell.id}>
																	{flexRender(
																		cell.column.columnDef.cell,
																		cell.getContext(),
																	)}
																</TableCell>
															);
														})}
													</TableRow>
												</ContextMenuTrigger>
												<ContextMenuContent className="w-48">
													<ContextMenuItem
														onClick={() => handleViewDetails(row.original.id)}
													>
														View Details
													</ContextMenuItem>
													<ContextMenuSeparator />
													<ContextMenuItem
														disabled={
															row?.original.fulfillment_status !== "pending"
														}
														onClick={() =>
															handleMarkAsDelivered(row.original.id)
														}
													>
														Mark Delivered
													</ContextMenuItem>
													<ContextMenuSeparator />
													<ContextMenuItem
														disabled={
															row?.original.fulfillment_status !== "delivered"
														}
														onClick={() =>
															handleMarkAsUndelivered(row.original.id)
														}
													>
														Mark Undelivered
													</ContextMenuItem>
													<ContextMenuSeparator />
													<ContextMenuItem
														disabled={
															row?.original.fulfillment_status === "pending"
														}
														onClick={() => handleDelete(row.original.id)}
														className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950 dark:focus:text-red-400"
													>
														Delete
													</ContextMenuItem>
												</ContextMenuContent>
											</ContextMenu>
										);
									})
								) : isLoading ? (
									Array.from({ length: 5 }).map((_, i) => (
										<TableRow key={i}>
											{table.getVisibleLeafColumns().map((column) => (
												<TableCell key={column.id}>
													<Skeleton className="h-6 w-full" />
												</TableCell>
											))}
										</TableRow>
									))
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
							<Label htmlFor="rows-per-page" className="text-sm font-medium">
								Rows per page
							</Label>
							<Select
								value={`${table?.getState().pagination.pageSize}`}
								onValueChange={(value) => {
									table?.setPageSize(Number(value));
								}}
							>
								<SelectTrigger size="sm" className="w-20" id="rows-per-page">
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
								onClick={() => table?.setPageIndex(table?.getPageCount() - 1)}
								disabled={!table?.getCanNextPage()}
							>
								<span className="sr-only">Go to last page</span>
								<IconChevronsRight />
							</Button>
						</div>
					</div>
				</div>
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
