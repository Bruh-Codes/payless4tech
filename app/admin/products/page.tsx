"use client";

import { useState, useEffect } from "react";
import StockProductList from "../components/StockProductList";
import { Product } from "../components/ProductCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminProductGridSkeleton } from "@/components/LoadingSkeletons";

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

const Products = () => {
	const [deleteModal, setDeleteModal] = useState<{
		open: boolean;
		product: Product | null;
	}>({
		open: false,
		product: null,
	});
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [allProducts, setAllProducts] = useState<Product[]>([]);
	const [isInitialLoading, setIsInitialLoading] = useState(true);

	const queryClient = useQueryClient();

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 300); // 300ms debounce

		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Reset page when search term changes
	useEffect(() => {
		setCurrentPage(0);
		// Always clear products to force fresh fetch from database
		setAllProducts([]);
	}, [debouncedSearchTerm]);

	const handleDeleteClick = (productId: string) => {
		// Find the product from the products data
		const product = allProducts?.find((p) => p.id === productId) || null;
		setDeleteModal({ open: true, product });
	};

	const handleShowMore = () => {
		setCurrentPage((prev) => prev + 1);
	};

	const handleSearch = (term: string) => {
		setSearchTerm(term);
	};

	const handleCategoryFilter = (category: string) => {
		setCategoryFilter(category);
		setCurrentPage(0); // Reset to first page when filtering
		setAllProducts([]); // Clear existing products
	};

	const handleStatusFilter = (status: string) => {
		setStatusFilter(status);
		setCurrentPage(0); // Reset to first page when filtering
		setAllProducts([]); // Clear existing products
	};

	const handleConfirmDelete = async () => {
		if (!deleteModal.product) return;

		try {
			// Delete from Supabase
			const { error } = await supabase
				.from("products")
				.delete()
				.eq("id", deleteModal.product.id);

			if (error) {
				throw error;
			}

			// Invalidate queries to refresh data
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });

			toast.success("Product deleted successfully");

			// Close modal
			setDeleteModal({ open: false, product: null });
		} catch (error) {
			console.error("Delete error:", error);
			toast.error("Failed to delete product");
			setDeleteModal({ open: false, product: null });
		}
	};

	const handleCancelDelete = () => {
		setDeleteModal({ open: false, product: null });
	};

	const {
		data: products,
		error,
		isPending,
		isFetching,
	} = useQuery({
		queryKey: [
			"admin",
			"products",
			currentPage,
			debouncedSearchTerm,
			categoryFilter,
			statusFilter,
		],
		queryFn: async () => {
			try {
				let query = supabase.from("products").select("*", { count: "exact" });

				// Apply search filter - ensure we have a proper string
				if (debouncedSearchTerm && typeof debouncedSearchTerm === "string") {
					const searchQuery = debouncedSearchTerm.trim();
					if (searchQuery) {
						query = query.or(
							`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`,
						);
					}
				}

				// Apply category filter
				if (
					categoryFilter &&
					categoryFilter !== "all" &&
					typeof categoryFilter === "string"
				) {
					query = query.eq("category", categoryFilter);
				}

				// Apply status filter
				if (
					statusFilter &&
					statusFilter !== "all" &&
					typeof statusFilter === "string"
				) {
					query = query.eq("status", statusFilter);
				}

				// Apply pagination
				const limit = 20;
				const offset = currentPage * limit;
				query = query
					.range(offset, offset + limit - 1)
					.order("created_at", { ascending: false });

				const { data, error, count } = await query;

				// Check if there are more products to load
				const hasMoreData = (count || 0) > offset + limit;
				setHasMore(hasMoreData);

				// Update all products state
				if (currentPage === 0) {
					setAllProducts(data || []);
					setIsInitialLoading(false);
				} else {
					setAllProducts((prev: Product[]) => [...prev, ...(data || [])]);
				}

				return { data: data || [], error, count, hasMore: hasMoreData };
			} catch (err) {
				console.error("Unexpected error:", err);
				throw err;
			}
		},
		staleTime: 0, // Always fetch fresh data when filters change
	});

	return (
		<div className="w-full">
			<div className="flex flex-col mb-6">
				<div className="flex gap-5 items-center">
					<SidebarTrigger />
					<h1 className="text-3xl font-bold">Products</h1>
				</div>
				<p className="text-muted-foreground mt-2 pl-12">
					Manage your inventory, add new products, and update existing stock.
				</p>
			</div>
			{isInitialLoading ? (
				<AdminProductGridSkeleton count={8} />
			) : (
				<StockProductList
					products={allProducts}
					onDelete={handleDeleteClick}
					onSearch={handleSearch}
					onCategoryFilter={handleCategoryFilter}
					onStatusFilter={handleStatusFilter}
					onShowMore={handleShowMore}
					hasMore={hasMore}
					isLoading={isFetching}
					searchTerm={searchTerm}
					categoryFilter={categoryFilter}
					statusFilter={statusFilter}
				/>
			)}

			{/* Delete Confirmation Modal */}
			<AlertDialog
				open={deleteModal.open}
				onOpenChange={(open) => !open && handleCancelDelete()}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Delete Product</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this product? This action cannot
							be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={handleCancelDelete}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmDelete}>
							Delete Product
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			{/* End Delete Modal */}
		</div>
	);
};

export default Products;
