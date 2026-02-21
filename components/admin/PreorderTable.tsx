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
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const schema = z.object({
	id: z.union([z.number(), z.string()]),
	email: z.string(),
	full_name: z.string(),
	phone_number: z.string(),
	item_type: z.string(),
	specifications: z.any(),
	fulfillment_status: z.enum(["pending", "delivered", "cancelled"]),
});

const columns = (
	handleDelete: (id: number) => void,
	handleMarkAsDelivered: (id: number) => void,
	handleViewDetails: (id: string | number) => void,
): ColumnDef<z.infer<typeof schema>>[] => [
	{
		accessorKey: "full_name",
		header: "Full Name",
		cell: ({ row }) => (
			<Badge variant="outline" className={cn("text-muted-foreground px-1.5")}>
				{row.original.full_name}
			</Badge>
		),
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => (
			<Badge variant="outline" className={cn("text-muted-foreground px-1.5")}>
				{row.original.email}
			</Badge>
		),
	},

	{
		accessorKey: "Phone Number",
		header: "Phone",
		cell: ({ row }) => (
			<div className="w-32">
				<Badge variant="outline" className={cn("text-muted-foreground px-1.5")}>
					{row.original.phone_number || "N/A"}
				</Badge>
			</div>
		),
	},
	{
		accessorKey: "item_type",
		header: "Item Type",
		cell: ({ row }) => (
			<div className="w-32">
				<Badge variant="outline" className={cn("text-muted-foreground px-1.5")}>
					{row.original.item_type || "N/A"}
				</Badge>
			</div>
		),
	},
	{
		accessorKey: "specifications",
		header: "Specifications",
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
						onClick={() => handleMarkAsDelivered(Number(row.original.id))}
						disabled={
							row?.original.fulfillment_status?.toLowerCase() !== "pending"
						}
					>
						Mark Delivered
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

	const queryClient = useQueryClient();
	const router = useRouter();

	const { data, error } = useQuery({
		queryKey: ["admin", "preorders"],
		queryFn: async () => {
			let { data: preorder, error } = await supabase
				.from("preorders")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching preorders:", error);
				return [];
			}

			const sortedPreorders = (preorder || []).sort((a, b) => {
				if (
					a.fulfillment_status === "pending" &&
					b.fulfillment_status !== "pending"
				)
					return -1;
				if (
					a.fulfillment_status !== "pending" &&
					b.fulfillment_status === "pending"
				)
					return 1;
				return 0;
			});
			return sortedPreorders;
		},
		staleTime: 1000 * 60 * 3, // 3 minutes
	});

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

	const handleViewDetails = (id: string | number) => {
		router.push(`/admin/preorders/${id}`);
	};

	const handleDelete = (productId: number | string) => {
		deleteMutation.mutate(productId);
	};

	const handleMarkAsDelivered = (id: number | string) => {
		markAsDeliveredMutation.mutate(id);
	};

	const table = useReactTable({
		data: data ?? [],
		columns: columns(handleDelete, handleMarkAsDelivered, handleViewDetails),
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

	return !data ? (
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
									const isPending =
										row.original.fulfillment_status === "pending";
									return (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
											onDoubleClick={() => handleViewDetails(row.original.id)}
											className={
												isPending
													? "bg-blue-100 hover:bg-blue-200 text-white dark:bg-yellow-900/30 cursor-pointer"
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
		</>
	);
};

export default PreorderTable;
