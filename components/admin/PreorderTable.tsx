"use client";

import * as React from "react";
import {
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconDotsVertical,
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
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";

export const schema = z.object({
	id: z.union([z.number(), z.string()]),
	email: z.string(),
	full_name: z.string(),
	phone_number: z.string(),
	item_type: z.string(),
	product_name: z.string().nullable().optional(),
	product_image: z.string().nullable().optional(),
	product_id: z.string().nullable().optional(),
	specifications: z.any(),
	fulfillment_status: z.enum(["pending", "delivered", "cancelled"]),
});

const columns = (
	handleDelete: (id: string | number) => void,
	handleMarkAsDelivered: (id: string | number) => void,
	handleMarkAsUndelivered: (id: string | number) => void,
	handleViewDetails: (id: string | number) => void,
): ColumnDef<z.infer<typeof schema>>[] => [
	{
		accessorKey: "Product",
		header: "Product Ref",
		cell: ({ row }) => (
			<div className="flex items-center gap-3 w-48">
				{row.original.product_image ? (
					<img
						src={row.original.product_image}
						alt="product"
						className="h-10 w-10 min-w-10 rounded object-cover border"
					/>
				) : (
					<div className="h-10 w-10 min-w-10 rounded bg-muted flex items-center justify-center border text-xs text-muted-foreground">
						N/A
					</div>
				)}
				<div className="flex flex-col overflow-hidden">
					<span className="font-medium text-sm truncate">
						{row.original.product_name || "Custom Request"}
					</span>
					{row.original.item_type && (
						<span className="text-xs text-muted-foreground truncate capitalize">
							{row.original.item_type}
						</span>
					)}
				</div>
			</div>
		),
	},
	{
		accessorKey: "full_name",
		header: "Customer",
		cell: ({ row }) => (
			<div className="flex flex-col">
				<span className="font-medium">{row.original.full_name}</span>
				<span className="text-xs text-muted-foreground">
					{row.original.email}
				</span>
				<span className="text-xs text-muted-foreground">
					{row.original.phone_number || "N/A"}
				</span>
			</div>
		),
	},
	{
		accessorKey: "specifications",
		header: "Specifications / Notes",
		cell: ({ row }) => {
			let specs = row.original.specifications;

			// Parse JSON if needed
			if (typeof specs === "string" && specs.startsWith("{")) {
				try {
					specs = JSON.parse(specs);
				} catch (e) {
					// Fallback
				}
			}

			// Render object as strings
			const content =
				typeof specs === "object" && specs !== null
					? Object.entries(specs)
							.map(([k, v]) => `${k}: ${v}`)
							.join(", ")
					: String(specs || "N/A");

			return (
				<div
					className="max-w-[250px] truncate text-sm text-muted-foreground"
					title={content}
				>
					{content}
				</div>
			);
		},
	},
	{
		accessorKey: "fulfillment_status",
		header: "Status",
		cell: ({ row }) => (
			<Badge
				variant={
					row.original.fulfillment_status === "delivered"
						? "default"
						: row.original.fulfillment_status === "cancelled"
							? "destructive"
							: "secondary"
				}
				className="capitalize"
			>
				{row.original.fulfillment_status}
			</Badge>
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
						onClick={() => handleMarkAsDelivered(row.original.id)}
						disabled={
							row?.original.fulfillment_status?.toLowerCase() !== "pending"
						}
					>
						Mark Delivered
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => handleMarkAsUndelivered(row.original.id)}
						disabled={
							row?.original.fulfillment_status?.toLowerCase() !== "delivered"
						}
					>
						Mark Undelivered
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						disabled={
							row?.original.fulfillment_status?.toLowerCase() === "pending"
						}
						onClick={() => handleDelete(Number(row.original.id))}
						variant="destructive"
					>
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
];

const PreorderTable = () => {
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
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
			"preorders",
			pagination.pageIndex,
			pagination.pageSize,
			debouncedQuery,
		],
		queryFn: async () => {
			const from = pagination.pageIndex * pagination.pageSize;
			const to = from + pagination.pageSize - 1;

			let req = supabase
				.from("preorders")
				.select("*", { count: "exact" })
				.order("fulfillment_status", { ascending: false })
				.order("created_at", { ascending: false })
				.range(from, to);

			if (debouncedQuery) {
				req = req.or(
					`full_name.ilike.%${debouncedQuery}%,email.ilike.%${debouncedQuery}%,phone_number.ilike.%${debouncedQuery}%,item_type.ilike.%${debouncedQuery}%`,
				);
			}

			const { data: preorder, error, count } = await req;

			if (error) {
				console.error("Error fetching preorders:", error);
				return { data: [], count: 0 };
			}

			return { data: preorder || [], count: count || 0 };
		},
		staleTime: 1000 * 60 * 3, // 3 minutes
	});

	const data = queryResult?.data ?? [];
	const totalCount = queryResult?.count ?? 0;

	// Modal State
	const [alertState, setAlertState] = React.useState<{
		open: boolean;
		action: "delete" | "undelivered" | null;
		id: string | number | null;
	}>({ open: false, action: null, id: null });

	React.useEffect(() => {
		if (error) {
			toast.error(error.message);
		}
	}, [error]);

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: async (productId: number | string) => {
			// Fetch the preorder to archive
			const { data: preorder, error: fetchError } = await supabase
				.from("preorders")
				.select("*")
				.eq("id", productId.toString())
				.single();

			if (fetchError) {
				throw new Error("Failed to fetch preorder for archiving.");
			}

			// Insert into archived_preorders
			const { error: archiveError } = await supabase
				.from("archived_preorders")
				.insert([preorder]);

			if (archiveError) {
				throw new Error("Failed to archive preorder.");
			}

			// Delete from preorders
			const { error: deleteError } = await supabase
				.from("preorders")
				.delete()
				.eq("id", productId.toString());

			if (deleteError) {
				throw new Error("Failed to delete preorder.");
			}

			return productId;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "preorders"] });
			toast.success("Preorder archived successfully.");
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	// Mark as delivered mutation
	const markAsDeliveredMutation = useMutation({
		mutationFn: async (id: number | string) => {
			const { error } = await supabase
				.from("preorders")
				.update({ fulfillment_status: "delivered" })
				.eq("id", id.toString());

			if (error) throw error;
			return id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "preorders"] });
			toast.success("Marked as delivered.");
		},
		onError: () => {
			toast.error("Failed to mark as delivered.");
		},
	});

	// Mark as undelivered mutation
	const markAsUndeliveredMutation = useMutation({
		mutationFn: async (id: number | string) => {
			const { error } = await supabase
				.from("preorders")
				.update({ fulfillment_status: "pending" })
				.eq("id", id.toString());

			if (error) throw error;
			return id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "preorders"] });
			toast.success("Marked as undelivered.");
		},
		onError: () => {
			toast.error("Failed to mark as undelivered.");
		},
	});

	const handleViewDetails = (id: string | number) => {
		router.push(`/admin/preorders/${id}`);
	};

	const handleDelete = (productId: number | string) => {
		setAlertState({ open: true, action: "delete", id: productId });
	};

	const handleMarkAsDelivered = (id: number | string) => {
		markAsDeliveredMutation.mutate(id);
	};

	const handleMarkAsUndelivered = (id: number | string) => {
		setAlertState({ open: true, action: "undelivered", id });
	};

	const confirmAction = () => {
		if (alertState.action === "delete" && alertState.id) {
			deleteMutation.mutate(alertState.id);
		} else if (alertState.action === "undelivered" && alertState.id) {
			markAsUndeliveredMutation.mutate(alertState.id);
		}
		setAlertState({ open: false, action: null, id: null });
	};

	const table = useReactTable({
		data: data ?? [],
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
		<div className="space-y-4">
			<AlertDialog
				open={alertState.open}
				onOpenChange={(open) => {
					if (!open) setAlertState({ open: false, action: null, id: null });
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							{alertState.action === "delete"
								? "This action cannot be undone. This will permanently delete the preorder and archive it."
								: "This will revert the preorder status back to pending."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmAction}
							className="bg-primary hover:bg-primary/90 text-primary-foreground"
						>
							Confirm
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<div className="flex items-center">
				<Input
					placeholder="Search by name, email, phone, or item type..."
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
							{Array.isArray(data) && data.length === 0
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
									return (
										<ContextMenu key={row.id}>
											<ContextMenuTrigger asChild>
												<TableRow
													data-state={row.getIsSelected() && "selected"}
													onDoubleClick={() =>
														handleViewDetails(row.original.id)
													}
													className="cursor-pointer"
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
													onClick={() => handleMarkAsDelivered(row.original.id)}
													disabled={
														row?.original.fulfillment_status?.toLowerCase() !==
														"pending"
													}
												>
													Mark Delivered
												</ContextMenuItem>
												<ContextMenuItem
													onClick={() =>
														handleMarkAsUndelivered(row.original.id)
													}
													disabled={
														row?.original.fulfillment_status?.toLowerCase() !==
														"delivered"
													}
												>
													Mark Undelivered
												</ContextMenuItem>
												<ContextMenuSeparator />
												<ContextMenuItem
													disabled={
														row?.original.fulfillment_status?.toLowerCase() ===
														"pending"
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
		</div>
	);
};

export default PreorderTable;
