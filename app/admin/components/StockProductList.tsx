"use client";

import React, { useState } from "react";

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

interface ProductListProps {
	products: Product[];
	onRefresh: () => void;
}

const StockProductList: React.FC<ProductListProps> = ({
	products,
	onRefresh,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

	const filteredProducts = products.filter((product) => {
		const matchesSearch =
			product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product?.description?.toLowerCase().includes(searchTerm.toLowerCase());
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

	const handleEdit = (product: Product) => {
		setSelectedProduct(product);
		setIsAddDialogOpen(true);
	};

	const handleDelete = async (id: string) => {
		try {
			toast.success("Product deleted successfully");
			// In a real implementation, you would call the Supabase delete API here
			// await supabaseClient.from('products').delete().eq('id', id);
			onRefresh();
		} catch (error) {
			toast.error("Failed to delete product");
			console.error("Error deleting product:", error);
		}
	};

	const handleStatusChange = async (id: string, status: string) => {
		try {
			toast.success(`Product marked as ${status}`);
			// In a real implementation, you would call the Supabase update API here
			// await supabaseClient.from('products').update({ status }).eq('id', id);
			onRefresh();
		} catch (error) {
			toast.error("Failed to update product status");
			console.error("Error updating product status:", error);
		}
	};

	const handleFormClose = () => {
		setIsAddDialogOpen(false);
		setSelectedProduct(null);
	};

	const handleFormSubmit = () => {
		toast.success(
			selectedProduct
				? "Product updated successfully"
				: "Product added successfully"
		);
		onRefresh();
		handleFormClose();
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
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{filteredProducts.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							onEdit={handleEdit}
							onDelete={handleDelete}
							onStatusChange={handleStatusChange}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default StockProductList;
