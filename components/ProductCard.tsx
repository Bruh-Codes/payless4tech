"use client";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { PreorderForm } from "./PreorderForm";

interface Product {
	id: string;
	name: string;
	price: number;
	condition: string;
	image_url: string | null;
	original_price: number | null;
	category: string;
	description: string | null;
	detailed_specs: string | null;
	created_at: string;
	updated_at: string;
	status?: string;
}

interface ProductCardProps {
	product: Product;
	inCart: boolean;
}

export const ProductCard = ({ product, inCart }: ProductCardProps) => {
	const { addItem } = useCart();
	const [isPreorderFormOpen, setIsPreorderFormOpen] = useState(false);

	const [preordered, setPreordered] = useState(false);

	const handleOrderSuccess = (data: boolean) => {
		setPreordered(data);
	};

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault(); // Prevent navigation
		addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			quantity: 1,
			image_url: product.image_url,
		});
	};
	const renderStatusBadge = (status: string) => {
		switch (status) {
			case "new":
				return (
					<span className="bg-purple-300 text-purple-800 font-semibold px-3 py-2 rounded-2xl">
						New
					</span>
				);
			case "available":
				return (
					<span className="bg-green-200 text-green-800 font-semibold px-3 py-2 rounded-2xl">
						Available
					</span>
				);
			case "unavailable":
				return (
					<span className="bg-red-200 text-red-800 font-semibold px-3 py-2 rounded-2xl">
						Unavailable
					</span>
				);
			case "low-stock":
				return (
					<span className="bg-yellow-200 text-yellow-800 font-semibold px-3 py-2 rounded-2xl">
						Low Stock
					</span>
				);
			default:
				return null;
		}
	};
	return (
		<>
			<Card
				key={product.id}
				className={cn(
					"transition-all !p-3 w-full duration-300 py-0 hover:shadow-xl hover:-translate-y-1 overflow-hidden group h-[400px]",
					{ "border bg-green-500/20 border-green-500": inCart }
				)} // Fixed height and width
			>
				<CardContent className="flex flex-col flex-1 !p-0">
					<Link
						href={`/product/${product.id}`}
						className="max-w-full relative h-[60%] overflow-hidden"
					>
						<div className="absolute top-4 right-2 z-5">
							{product.status && renderStatusBadge(product?.status)}
						</div>{" "}
						{/* Fixed height for image container */}
						{product.image_url && (
							<Image
								src={product.image_url}
								alt={product.name}
								priority
								fill
								sizes="(max-width: 768px) 100vw,"
								className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" // Use object-cover
							/>
						)}
						{product.original_price && (
							<Badge className="absolute top-2 left-2 bg-orange-400">
								Save ₵{Math.floor(product.original_price - product.price)}
							</Badge>
						)}
					</Link>
					<div className="p-2">
						{product?.condition !== "New" && product?.condition !== "none" && (
							<p
								className={cn("font-normal text-xs truncate w-fit", {
									"text-yellow-700 bg-yellow-100 px-2 py-1 rounded":
										product.condition === "Open Box",
									"text-blue-700 bg-blue-100 px-2 py-1 rounded":
										product.condition === "Renewed",
									"text-gray-700 bg-gray-100 px-2 py-1 rounded":
										product.condition === "Used",
								})}
							>
								{product.condition}
							</p>
						)}
						<div className="flex items-center justify-between mb-2">
							<h3 className="font-semibold text-lg truncate text-gray-600">
								{product.name}
							</h3>
						</div>

						<p
							className="text-muted-foreground text-sm mb-2"
							title={product.description || ""}
						>
							{product.description?.length && product.description.length > 80
								? product.description.slice(0, 60) + "..."
								: product.description}
						</p>

						<div>
							{product.original_price && (
								<span className="text-xs line-through text-red-600 font-bold">
									Ghc{" "}
									{Number(product.original_price).toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</span>
							)}
							<div className="flex justify-between items-center mb-5 leading-3">
								<span className="text-md font-bold">
									Ghc
									{Number(product.price).toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</span>
							</div>

							{product.status === "unavailable" ? (
								<Button
									size="sm"
									onClick={() => setIsPreorderFormOpen(true)}
									className={cn(
										"cursor-pointer hover:opacity-90 mr-auto m-0 ml-auto block w-full",
										{
											"bg-green-500 text-white cursor-not-allowed": inCart,
										},
										{
											"bg-orange-500 hover:bg-orange-600":
												product.status === "unavailable",
										}
									)}
									disabled={preordered || inCart}
								>
									{preordered ? "preordered" : inCart ? "In Cart" : "Preorder"}
								</Button>
							) : (
								<Button
									size="sm"
									onClick={(e) => {
										if (!inCart) {
											handleAddToCart(e);
										}
									}}
									className={cn(
										"cursor-pointer hover:opacity-90 mr-auto m-0 ml-auto block w-full",
										{
											"bg-green-500 text-white cursor-not-allowed": inCart,
										}
									)}
									disabled={inCart}
								>
									{inCart ? "In Cart" : "Add to Cart"}
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
			<PreorderForm
				handleOrderSuccess={handleOrderSuccess}
				isOpen={isPreorderFormOpen}
				onOpenChange={setIsPreorderFormOpen}
			/>
		</>
	);
};
