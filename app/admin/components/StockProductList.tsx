"use client";

import React, { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { toast } from "sonner";
import AdminProductCard, { Product as AdminProductType } from "./ProductCard";
import { AddProductsSheet } from "./AddProductsSheet";
import { BulkUploadSheet } from "./BulkUploadSheet";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { AdminProductGridSkeleton } from "@/components/LoadingSkeletons";

interface ProductListProps {
	products: AdminProductType[];
	onDelete?: (id: string) => void;
	onSearch?: (term: string) => void;
	onCategoryFilter?: (category: string) => void;
	onStatusFilter?: (status: string) => void;
	onShowMore?: () => void;
	hasMore?: boolean;
	isLoading?: boolean;
	searchTerm?: string;
	categoryFilter?: string;
	statusFilter?: string;
}

const StockProductList: React.FC<ProductListProps> = ({
	products,
	onDelete,
	onSearch,
	onCategoryFilter,
	onStatusFilter,
	onShowMore,
	hasMore = true,
	isLoading = false,
	searchTerm: externalSearchTerm = "",
	categoryFilter: externalCategoryFilter = "",
	statusFilter: externalStatusFilter = "",
}) => {
	// Use external state if provided, otherwise use internal state
	const [internalSearchTerm, setInternalSearchTerm] =
		useState(externalSearchTerm);
	const [internalCategoryFilter, setInternalCategoryFilter] = useState(
		externalCategoryFilter,
	);
	const [internalStatusFilter, setInternalStatusFilter] =
		useState(externalStatusFilter);

	const searchTerm =
		externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
	const categoryFilter =
		externalCategoryFilter !== undefined
			? externalCategoryFilter
			: internalCategoryFilter;
	const statusFilter =
		externalStatusFilter !== undefined
			? externalStatusFilter
			: internalStatusFilter;

	const queryClient = useQueryClient();

	// Delete product mutation
	const deleteProductMutation = useMutation({
		mutationFn: async (id: string) => {
			// First, get product by id to retrieve its image URL
			const { data: productData, error: fetchError } = await supabase
				.from("products")
				.select("*")
				.eq("id", id)
				.single();

			if (fetchError) {
				throw new Error("Failed to fetch product for deletion");
			}

			const imageUrl = productData?.image_url || "";
			if (imageUrl) {
				const path = imageUrl.split(
					"/storage/v1/object/public/product-images/",
				)[1];
				if (path) {
					const { error: imageError } = await supabase.storage
						.from("product-images")
						.remove([path.replace("product-images/", "")]);
					if (imageError) {
						throw new Error("Failed to delete product image");
					}
				}
			}

			const { error } = await supabase.from("products").delete().eq("id", id);

			if (error) {
				throw new Error("Failed to delete product");
			}

			return id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
			toast.success("Product deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to delete product");
		},
	});

	// Update status mutation
	const updateStatusMutation = useMutation({
		mutationFn: async ({ id, status }: { id: string; status: string }) => {
			const { error } = await supabase
				.from("products")
				.update({ status })
				.eq("id", id);
			if (error) {
				throw new Error("Error updating product status");
			}
			return { id, status };
		},
		onSuccess: ({ status }) => {
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
			toast.success(`Product marked as ${status}`);
		},
		onError: () => {
			toast.error("Failed to update product status");
		},
	});

	// Toggle flag mutation (for is_featured and is_new_arrival)
	const toggleFlagMutation = useMutation({
		mutationFn: async ({
			id,
			field,
			value,
		}: {
			id: string;
			field: "is_featured" | "is_new_arrival";
			value: boolean;
		}) => {
			const { error } = await supabase
				.from("products")
				.update({ [field]: value })
				.eq("id", id);
			if (error) {
				throw new Error(`Error updating product ${field}`);
			}
			return { id, field, value };
		},
		onSuccess: ({ field }) => {
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
			toast.success(`Product ${field} updated successfully`);
		},
		onError: () => {
			toast.error("Failed to update product flag");
		},
	});

	const dynamicCategories = useMemo(() => {
		const allCategories = products.map((p) => p.category).filter(Boolean);
		const unique = Array.from(new Set(allCategories));
		const standard = [
			"consumer-electronics",
			"laptops",
			"phones",
			"audio",
			"others",
		];
		return unique.filter((c) => !standard.includes(c));
	}, [products]);

	const dynamicStatuses = useMemo(() => {
		const allStatuses = products.map((p) => p.status).filter(Boolean);
		const unique = Array.from(new Set(allStatuses));
		const standard = ["available", "unavailable", "new", "low-stock"];
		return unique.filter((s) => !standard.includes(s));
	}, [products]);

	const handleDelete = (id: string) => {
		deleteProductMutation.mutate(id);
	};

	const handleStatusUpdate = (id: string, status: string) => {
		updateStatusMutation.mutate({ id, status });
	};

	const handleToggleFlag = (
		id: string,
		field: "is_featured" | "is_new_arrival",
		value: boolean,
	) => {
		toggleFlagMutation.mutate({ id, field, value });
	};

	// Update handlers to use external functions if provided
	const handleSearchChange = (term: string) => {
		if (onSearch) {
			onSearch(term);
		} else {
			setInternalSearchTerm(term);
		}
	};

	const handleCategoryChange = (category: string) => {
		if (onCategoryFilter) {
			onCategoryFilter(category);
		} else {
			setInternalCategoryFilter(category);
		}
	};

	const handleStatusFilterChange = (status: string) => {
		if (onStatusFilter) {
			onStatusFilter(status);
		} else {
			setInternalStatusFilter(status);
		}
	};

	const clearFilters = () => {
		handleSearchChange("");
		handleCategoryChange("");
		handleStatusFilterChange("");
	};

	// Since we're now doing server-side filtering, we don't need client-side filtering
	// The products prop already contains the filtered results

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row gap-4 justify-between">
				<div className="flex flex-1 gap-4 items-center">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search products..."
							className="pl-8"
							value={searchTerm}
							onChange={(e) => handleSearchChange(e.target.value)}
						/>
					</div>

					<div className="flex items-center gap-4">
						<Select value={categoryFilter} onValueChange={handleCategoryChange}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="all">All Categories</SelectItem>
									<SelectItem value="consumer-electronics">
										Electronics
									</SelectItem>
									<SelectItem value="laptops">Laptops</SelectItem>
									<SelectItem value="phones">Phones</SelectItem>
									<SelectItem value="audio">Audio</SelectItem>
									<SelectItem value="others">Others</SelectItem>
									{dynamicCategories.map((cat) => (
										<SelectItem key={cat} value={cat}>
											{cat}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>

						<Select
							value={statusFilter}
							onValueChange={handleStatusFilterChange}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="available">Available</SelectItem>
									<SelectItem value="unavailable">Unavailable</SelectItem>
									<SelectItem value="new">New</SelectItem>
									<SelectItem value="low-stock">Low Stock</SelectItem>
									{dynamicStatuses.map((stat) => (
										<SelectItem key={stat} value={stat}>
											{stat}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>

						{(searchTerm || categoryFilter || statusFilter) && (
							<Button
								variant="ghost"
								size="sm"
								onClick={clearFilters}
								className="flex items-center gap-1 h-8"
							>
								<X className="h-4 w-4" />
								Clear
							</Button>
						)}
					</div>
				</div>

				<div className="flex gap-2">
					<BulkUploadSheet />
					<AddProductsSheet />
				</div>
			</div>

			{isLoading && products.length === 0 ? (
				<AdminProductGridSkeleton count={8} />
			) : products.length === 0 ? (
				<div className="text-center py-10">
					<Filter className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
					<p className="text-muted-foreground">No products found</p>
				</div>
			) : (
				<>
					{isLoading && (
						<div className="mb-6">
							<AdminProductGridSkeleton count={4} />
						</div>
					)}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{products.map((product) => (
							<AdminProductCard
								key={product.id}
								product={product}
								onDelete={onDelete || handleDelete}
								onStatusChange={handleStatusUpdate}
								onToggleFlag={handleToggleFlag}
							/>
						))}
					</div>

					{hasMore && (
						<div className="flex justify-center mt-6">
							<Button
								variant="outline"
								size="sm"
								onClick={onShowMore}
								disabled={isLoading}
							>
								{isLoading ? "Loading..." : "Show More"}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default StockProductList;
