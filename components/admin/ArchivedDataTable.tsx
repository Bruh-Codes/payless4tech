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
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose,
} from "@/components/ui/dialog";
import ArchivedPreorders, { preorderSchema } from "./ArchivedPreorders";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

const columns = (
	// data: z.infer<typeof schema>[],
	// setData: React.Dispatch<React.SetStateAction<z.infer<typeof schema>[]>>,
	handleDeletePermanent: (id: number) => void,
	handleRestoreArchived: (id: number) => void
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
			const product = row?.original.product;
			return (
				<ul className="space-y-1 text-sm text-muted-foreground">
					{product?.map(({ name, quantity, price, id }) => (
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
						onClick={() => handleRestoreArchived(row.original.id)}
					>
						Restore
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => handleDeletePermanent(row.original.id)}
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

export function ArchivedDataTable({
	data,
}: {
	data: z.infer<typeof schema>[];
}) {
	const queryClient = useQueryClient();
	const [rowSelection, setRowSelection] = React.useState({});
	const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
	const [isDeleting, setIsDeleting] = React.useState(false);
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

	React.useEffect(() => {
		setSalesData(data || []);
	}, [data]);

	const { data: preorders, error } = useQuery({
		queryKey: ["archived_preorders"],
		queryFn: async () => {
			const response = await supabase.from("archived_preorders").select("*");
			return response;
		},
	});

	if (error) {
		toast.error(error.message);
	}

	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const handleDeletePermanent = async (id: number) => {
		const { error } = await supabase
			.from("archived_sales")
			.delete()
			.eq("id", id.toString());
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Record deleted successfully.");
		setSalesData((prevSales) => prevSales.filter((sale) => sale.id !== id));
	};

	const handleRestoreArchived = async (id: number) => {
		// Fetch the record from archived_sales
		const { data: archivedRecord, error: fetchError } = await supabase
			.from("archived_sales")
			.select("*")
			.eq("id", id)
			.single();

		if (fetchError || !archivedRecord) {
			toast.error(fetchError?.message || "Failed to fetch archived record.");
			return;
		}

		// Insert the record into sales
		const { error: insertError } = await supabase
			.from("sales")
			.insert([{ ...archivedRecord }]);

		if (insertError) {
			toast.error(insertError.message);
			return;
		}

		// Delete the record from archived_sales
		const { error: deleteError } = await supabase
			.from("archived_sales")
			.delete()
			.eq("id", id);

		if (deleteError) {
			toast.error(deleteError.message);
			return;
		}

		setSalesData((prevSales) => prevSales.filter((sale) => sale.id !== id));
		toast.success("Record successfully restored.");
	};

	const table = useReactTable({
		data: salesData,
		columns: columns(
			// salesData,
			// setSalesData,
			handleDeletePermanent,
			handleRestoreArchived
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
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	const handleDeleteAll = async () => {
		setIsDeleting(true);
		try {
			if (activeTab === "outline") {
				// Delete all archived orders
				await supabase.from("archived_sales").delete().neq("id", 0);
				setSalesData([]);
			} else if (activeTab === "preorders") {
				await supabase.from("archived_preorders").delete().neq("id", 0);
				queryClient.invalidateQueries({ queryKey: ["archived_preorders"] });
			}
			toast.success("All records deleted.");
		} catch (err) {
			toast.error("Failed to delete all records.");
		}
		setIsDeleting(false);
		setShowDeleteDialog(false);
	};

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
						<SelectItem value="outline">Archived Orders</SelectItem>
						<SelectItem value="preorders">Archived Preorders</SelectItem>
					</SelectContent>
				</Select>
				<TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
					<TabsTrigger value="outline">Archived Orders</TabsTrigger>
					<TabsTrigger value="preorders">Archived Preorders</TabsTrigger>
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
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setShowDeleteDialog(true)}
						>
							Delete All
						</Button>
					</div>
				)}
				{activeTab === "preorders" && (
					<Button
						variant="destructive"
						size="sm"
						onClick={() => setShowDeleteDialog(true)}
					>
						Delete All
					</Button>
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
				<ArchivedPreorders
					preorders={preorders?.data as z.infer<typeof preorderSchema>[]}
				/>
			</TabsContent>
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Delete All{" "}
							{activeTab === "outline"
								? "Archived Orders"
								: "Archived Preorders"}
							?
						</DialogTitle>
						<DialogDescription>
							This action cannot be undone. Are you sure you want to delete all{" "}
							{activeTab === "outline"
								? "archived orders"
								: "archived preorders"}
							?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline" disabled={isDeleting}>
								Cancel
							</Button>
						</DialogClose>
						<Button
							variant="destructive"
							onClick={handleDeleteAll}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete All"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Tabs>
	);
}
