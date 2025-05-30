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
import ProductCard, { Product } from "./ProductCard";
import { AddProductsSheet } from "./AddProductsSheet";
import { useDebounce } from "use-debounce";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ProductListProps {
	products: Product[];
}

const StockProductList: React.FC<ProductListProps> = ({ products }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [showCount, setShowCount] = useState(20);
	const queryClient = useQueryClient();
	const [debouncedSearchTerm] = useDebounce(searchTerm, 300); // 300ms debounce

	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			const matchesSearch =
				product?.name
					?.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ||
				product?.description
					?.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase());
			const matchesCategory =
				categoryFilter === "" ||
				categoryFilter === "all" ||
				product.category === categoryFilter;

			const matchesStatus =
				statusFilter === "" ||
				statusFilter === "all" ||
				product.status === statusFilter;

			return matchesSearch && matchesCategory && matchesStatus;
		});
	}, [products, debouncedSearchTerm, categoryFilter, statusFilter]);

	const handleEdit = (product: Product) => {
		setSelectedProduct(product);
	};

	const handleDelete = async (id: string) => {
		try {
			// First, get the product by id to retrieve its image URL
			const { data: productData, error: fetchError } = await supabase
				.from("products")
				.select("*")
				.eq("id", id)
				.single();

			if (fetchError) {
				toast.error("Failed to fetch product for deletion");
				return;
			}

			const imageUrl = productData?.image_url || "";
			if (imageUrl) {
				const path = imageUrl.split(
					"/storage/v1/object/public/product-images/"
				)[1];
				if (path) {
					const { error: imageError } = await supabase.storage
						.from("product-images")
						.remove([path.replace("product-images/", "")]);
					if (imageError) {
						toast.error("Failed to delete product image");
						return;
					}
				}
			}

			const { error } = await supabase.from("products").delete().eq("id", id);

			if (error) {
				toast.error("Failed to delete product");
				return;
			}
			queryClient.invalidateQueries({
				queryKey: ["products"],
			});
			toast.success("Product deleted successfully");
		} catch (error) {
			toast.error("Failed to delete product");
			console.error("Error deleting product:", error);
		}
	};

	const handleStatusChange = async (id: string, status: string) => {
		try {
			const { error } = await supabase
				.from("products")
				.update({ status })
				.eq("id", id);
			if (error) {
				toast.error("Error updating product status");
				return;
			}
			toast.success(`Product marked as ${status}`);
			queryClient.invalidateQueries({
				queryKey: ["products"],
			});
		} catch (error) {
			toast.error("Failed to update product status");
			console.error("Error updating product status:", error);
		}
	};

	const clearFilters = () => {
		setSearchTerm("");
		setCategoryFilter("");
		setStatusFilter("");
	};

	const uniqueCategories = Array.from(
		new Set(
			products.map((p) =>
				p.category && p.category.trim() !== "" ? p.category : "all"
			)
		)
	);

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
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					<div className="flex items-center gap-4">
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{uniqueCategories.map((category) => {
										if (category === "all")
											return (
												<SelectItem key={category} value="all">
													All Categories
												</SelectItem>
											);
										return (
											<SelectItem key={category} value={category}>
												{category}
											</SelectItem>
										);
									})}
								</SelectGroup>
							</SelectContent>
						</Select>

						<Select value={statusFilter} onValueChange={setStatusFilter}>
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

				<AddProductsSheet />
			</div>

			{filteredProducts.length === 0 ? (
				<div className="text-center py-10">
					<Filter className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-medium">No products found</h3>
					<p className="text-muted-foreground">
						Try adjusting your search or filter to find what you're looking for.
					</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredProducts.slice(0, showCount).map((product) => (
							<ProductCard
								key={product.id}
								product={product}
								onEdit={handleEdit}
								onDelete={handleDelete}
								onStatusChange={handleStatusChange}
							/>
						))}
					</div>
					{showCount < filteredProducts.length ? (
						<div className="flex justify-center mt-6">
							<Button
								variant="outline"
								onClick={() => setShowCount((prev) => prev + 20)}
							>
								Show More
							</Button>
						</div>
					) : (
						filteredProducts.length > 20 && (
							<div className="text-center py-4 text-muted-foreground">
								No more products to show.
							</div>
						)
					)}
				</>
			)}
		</div>
	);
};

export default StockProductList;
