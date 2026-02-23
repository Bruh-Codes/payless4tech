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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const preorderSchema = z.object({
	id: z.number(),
	email: z.string(),
	full_name: z.string(),
	phone_number: z.string(),
	item_type: z.string(),
	specifications: z.string(),
	fulfillment_status: z.enum(["pending", "delivered", "cancelled"]),
});

const columns = (
	handleDeletePermanent: (id: number) => void,
	handleRestoreArchived: (id: number) => void,
): ColumnDef<z.infer<typeof preorderSchema>>[] => [
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
					<DropdownMenuSeparator />
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

const ArchivedPreorders = ({
	preorders,
	isLoading = false,
}: {
	preorders: z.infer<typeof preorderSchema>[];
	isLoading?: boolean;
}) => {
	const queryClient = useQueryClient();
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [data, setData] = React.useState<z.infer<typeof preorderSchema>[]>(
		preorders || [],
	);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});

	React.useEffect(() => {
		const sortedPreorders = preorders?.sort((a, b) => {
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
		setData((sortedPreorders ?? []) as z.infer<typeof preorderSchema>[]);
	}, [preorders]);

	// Delete permanent mutation
	const deletePermanentMutation = useMutation({
		mutationFn: async (id: string | number) => {
			const { error } = await supabase
				.from("archived_preorders")
				.delete()
				.eq("id", id.toString());
			if (error) throw error;
			return id;
		},
		onSuccess: () => {
			toast.success("Record deleted successfully.");
			queryClient.invalidateQueries({
				queryKey: ["admin", "archived_preorders"],
			});
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	// Restore archived mutation
	const restoreArchivedMutation = useMutation({
		mutationFn: async (id: string | number) => {
			// Get the archived preorder by id
			const { data, error: fetchError } = await supabase
				.from("archived_preorders")
				.select("*")
				.eq("id", id)
				.single();

			if (fetchError) {
				throw new Error(fetchError.message);
			}

			// Insert into preorders
			const { error: insertError } = await supabase
				.from("preorders")
				.insert([data]);

			if (insertError) {
				throw new Error(insertError.message);
			}

			// Delete from archived_preorders
			const { error: deleteError } = await supabase
				.from("archived_preorders")
				.delete()
				.eq("id", id);

			if (deleteError) {
				throw new Error(deleteError.message);
			}

			return id;
		},
		onSuccess: () => {
			toast.success("Preorder restored successfully.");
			queryClient.invalidateQueries({
				queryKey: ["admin", "archived_preorders"],
			});
			queryClient.invalidateQueries({ queryKey: ["admin", "preorders"] });
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	const handleDeletePermanent = (id: string | number) => {
		deletePermanentMutation.mutate(id);
	};

	const handleRestoreArchived = (id: string | number) => {
		restoreArchivedMutation.mutate(id);
	};

	const table = useReactTable({
		data,
		columns: columns(handleDeletePermanent, handleRestoreArchived),
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
									return (
										<ContextMenu key={row.id}>
											<ContextMenuTrigger asChild>
												<TableRow
													data-state={row.getIsSelected() && "selected"}
													className=""
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
													onClick={() => handleRestoreArchived(row.original.id)}
												>
													Restore
												</ContextMenuItem>
												<ContextMenuSeparator />
												<ContextMenuItem
													onClick={() => handleDeletePermanent(row.original.id)}
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
		</>
	);
};

export default ArchivedPreorders;
