"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	Truck,
	ShieldCheck,
	ArrowLeft,
	Store,
	Package,
	ChevronRight,
	ShoppingCart,
} from "lucide-react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import ProductCard from "@/components/product-card";
import { useCart } from "@/contexts/CartContext";
import PreorderSection from "@/components/PreorderSection";
import Image from "next/image";
import { useEbayCategorySearch } from "@/hooks/useEbayCategorySearch";
import { convertEbayToLocalProduct } from "@/lib/ebay";
import { Product } from "@/lib/products";
import { ProductCardSkeleton } from "@/components/LoadingSkeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

const ProductDetail = () => {
	const params = useParams();
	const router = useRouter();
	const { addItem, state } = useCart();
	const id = params.id as string;

	// State for image gallery and specs
	const [selectedImage, setSelectedImage] = useState(0);
	const [showAllSpecs, setShowAllSpecs] = useState(false);

	// Use React Query to fetch product by ID
	const {
		data: productById,
		isLoading: isLoadingProduct,
		error: productError,
	} = useQuery({
		queryKey: ["product", id],
		queryFn: async () => {
			const response = await fetch(`/api/ebay/product/${id}`);
			if (!response.ok) {
				throw new Error("Failed to fetch product");
			}
			return response.json();
		},
		enabled: !!id,
	});

	// Use direct API product
	const product = productById;
	const isLoading = isLoadingProduct;

	// For related products, use category search instead of item group to get different products in same category
	const { data: relatedData, isLoading: isLoadingRelated } =
		useEbayCategorySearch(product?.categoryId, true, 10); // Use category search for related products

	console.log("relatedData", relatedData);
	console.log("itemGroup", product?.itemGroupId);
	// Filter out current product from related items
	const related =
		relatedData?.items
			.filter((item: { id: string }) => item.id !== product?.id) // Exclude current product
			.map(convertEbayToLocalProduct) || [];

	const handleAddToCart = () => {
		if (product) {
			addItem({
				id: product.id,
				name: product.title,
				price: product.price,
				quantity: 1,
				image_url: product.image,
			});
		}
	};

	const handlePreorder = () => {
		if (product) {
			// Dispatch custom event to open PreorderSection form
			const preorderEvent = new CustomEvent("preorder", {
				detail: {
					productName: product.title,
					category: product.category,
					specifications: "",
				},
			});
			window.dispatchEvent(preorderEvent);
		}
	};

	const isInCart = state.items.some((item) => item.id === product?.id);

	// Show loading skeleton while fetching product
	if (isLoading) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<div className="container mx-auto px-4 py-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Product Image Skeleton */}
						<div className="space-y-4">
							<Skeleton className="aspect-square rounded-2xl" />
							<div className="grid grid-cols-4 gap-2">
								{[...Array(4)].map((_, i) => (
									<Skeleton key={i} className="aspect-square rounded-lg" />
								))}
							</div>
						</div>
						{/* Product Info Skeleton */}
						<div className="space-y-6">
							<div className="space-y-2">
								<Skeleton className="h-8 w-3/4" />
								<Skeleton className="h-6 w-1/2" />
							</div>
							<div className="space-y-4">
								{[...Array(3)].map((_, i) => (
									<Skeleton key={i} className="h-4" />
								))}
							</div>
							<Skeleton className="h-12" />
						</div>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	if (!product) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<div className="container mx-auto px-4 py-16">
					<div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
						<div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
							<Package className="w-12 h-12 text-muted-foreground" />
						</div>
						<h1 className="font-display text-3xl font-bold text-foreground mb-3">
							Product not found
						</h1>
						<p className="text-muted-foreground mb-8 leading-relaxed">
							{productError?.message ||
								"This product may have been removed or doesn't exist. Try searching for similar items."}
						</p>
						<div className="flex flex-col sm:flex-row gap-3">
							<Button onClick={() => router.push("/")} variant="outline">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Home
							</Button>
							<Button onClick={() => router.push("/shop")}>
								<ShoppingCart className="h-4 w-4 mr-2" />
								Browse Products
							</Button>
						</div>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	// Currency symbol mapping
	const getCurrencySymbol = (currency?: string) => {
		switch (currency) {
			case "GHS":
				return "₵";
			case "USD":
			default:
				return "₵"; // Default to GHS since our API returns GHS prices
		}
	};

	// Format price based on currency
	const formatPrice = (price: number, currency?: string) => {
		if (currency === "GHS" || !currency) {
			// Ghana Cedis formatting: use commas, no decimal places for whole numbers
			return price.toLocaleString("en-GH", {
				minimumFractionDigits: price % 1 === 0 ? 0 : 2,
				maximumFractionDigits: 2,
			});
		}
		// USD formatting
		return price.toFixed(2);
	};

	// Price display - handle price object properly
	const priceValue = (product as any).price?.value || 0;
	const priceCurrency = (product as any).price?.currency || "GHS";

	const currencySymbol = getCurrencySymbol(priceCurrency);

	const discount = product.originalPrice
		? Math.round(
				((product.originalPrice - priceValue) / product.originalPrice) * 100,
			)
		: 0;

	// Use real specifications from eBay API
	const productSpecs = product.specifications || [];

	// Use real additional images from eBay API
	const productImages = [
		product.image,
		// Use additionalImages from eBay API response
		...((product as any).additionalImages || []),
	].filter(Boolean);

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
				{/* Breadcrumb */}
				<nav className="flex items-center gap-1.5 text-sm text-gray-900/70 dark:text-muted-foreground mb-6">
					<button
						onClick={() => router.push("/")}
						className="hover:text-foreground transition-colors"
					>
						Home
					</button>
					<ChevronRight className="h-3.5 w-3.5" />
					<button
						onClick={() => router.push(`/search?q=${product.category}`)}
						className="hover:text-foreground transition-colors capitalize"
					>
						{product.category}
					</button>
					<ChevronRight className="h-3.5 w-3.5" />
					<span className="text-foreground truncate max-w-[200px]">
						{product.title}
					</span>
				</nav>

				{/* Product Hero */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
					{/* Image Gallery */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="space-y-3"
					>
						{/* Main Image */}
						<div className="relative w-full rounded-xl overflow-hidden bg-secondary/30 border border-border aspect-[4/3] max-h-90">
							<Image
								width={200}
								height={200}
								src={productImages[selectedImage] || ""}
								alt={product.title}
								className="h-full w-full object-cover"
							/>
							{discount > 0 && (
								<span className="absolute top-3 left-3 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
									-{discount}% OFF
								</span>
							)}
						</div>

						{/* Thumbnail Gallery */}
						<div className="flex gap-2 justify-start overflow-x-auto pb-2">
							{productImages.map((image, index) => (
								<div
									key={index}
									onClick={() => setSelectedImage(index)}
									className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer transition-all ${
										selectedImage === index
											? "border-2 border-orange-500"
											: "border-2 border-border hover:border-primary/30"
									}`}
								>
									<Image
										width={96}
										height={96}
										src={image || "/placeholder.png"}
										alt={`${product.title} view ${index + 1}`}
										className="w-full h-full object-cover"
									/>
								</div>
							))}
						</div>
					</motion.div>

					{/* Info */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="flex flex-col"
					>
						<span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
							{product.category}
						</span>
						<h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
							{product.title}
						</h1>

						{/* Price */}
						<div className="flex items-baseline gap-3 mb-6">
							<span className="text-3xl font-bold text-foreground">
								{currencySymbol}
								{formatPrice(priceValue, priceCurrency)}
							</span>
							{product.originalPrice && (
								<span className="text-lg text-muted-foreground line-through">
									{currencySymbol}
									{formatPrice(product.originalPrice, priceCurrency)}
								</span>
							)}
							{discount > 0 && (
								<span className="text-sm font-semibold text-primary">
									Save {discount}%
								</span>
							)}
						</div>

						{/* Quick Info */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
							<div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
								<Package className="h-5 w-5 text-primary shrink-0" />
								<div>
									<p className="text-xs text-muted-foreground">Condition</p>
									<p className="text-sm font-semibold text-foreground">
										{product.condition}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
								<Truck className="h-5 w-5 text-primary shrink-0" />
								<div>
									<p className="text-xs text-muted-foreground">Shipping</p>
									<p className="text-sm font-semibold text-foreground">
										{product.shipping}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
								<Store className="h-5 w-5 text-primary shrink-0" />
								<div>
									<p className="text-xs text-muted-foreground">Seller</p>
									<p className="text-sm font-semibold text-foreground">
										{product.seller}
									</p>
								</div>
							</div>
						</div>

						{/* CTA */}
						<div className="flex flex-col gap-3 mb-6 min-w-0">
							{product.isPreorder ? (
								<Button
									size="lg"
									className="w-full text-base font-semibold bg-orange-500 hover:bg-orange-600 min-h-[48px]"
									onClick={handlePreorder}
								>
									Pre-order Now
								</Button>
							) : (
								<Button
									size="lg"
									className="w-full text-base font-semibold min-h-[48px]"
									onClick={handleAddToCart}
									disabled={isInCart}
								>
									{isInCart ? (
										<>
											<ShoppingCart className="h-4 w-4 mr-2" />
											In Cart
										</>
									) : (
										<>
											<ShoppingCart className="h-4 w-4 mr-2" />
											Add to Cart
										</>
									)}
								</Button>
							)}
						</div>

						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<ShieldCheck className="h-4 w-4 text-primary" />
							<span>30-day return policy · Secure checkout</span>
						</div>
					</motion.div>
				</div>

				{/* Specs */}
				<motion.section
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-16"
				>
					<h2 className="font-display text-xl font-bold text-foreground mb-4">
						Specifications
					</h2>
					<div className="rounded-2xl border border-border bg-secondary dark:bg-card overflow-hidden">
						{productSpecs
							?.slice(0, showAllSpecs ? productSpecs.length : 4)
							.map((spec: any, i: number) => (
								<div
									key={spec.key}
									className={`flex items-center justify-between px-5 py-3.5 ${i < (showAllSpecs ? productSpecs.length : 4) - 1 ? "border-b border-border" : ""}`}
								>
									<span className="text-sm text-muted-foreground">
										{spec.key}
									</span>
									<span className="text-sm font-medium text-foreground">
										{spec.value}
									</span>
								</div>
							))}
						{productSpecs && productSpecs.length > 4 && (
							<button
								onClick={() => setShowAllSpecs(!showAllSpecs)}
								className="w-full px-5 py-3 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
							>
								{showAllSpecs
									? "View Less"
									: `View More (${productSpecs.length - 4} more)`}
							</button>
						)}
					</div>
				</motion.section>

				{/* Related */}
				{(related.length > 0 || isLoadingRelated) && (
					<section className="mb-16">
						<div className="flex justify-between flex-wrap mb-6">
							<h2 className="font-display text-xl font-bold text-foreground">
								You May Also Like
							</h2>
							{/* View More Button */}
							{product?.categoryId &&
								!isLoadingRelated &&
								related.length > 0 && (
									<div className="text-center">
										<Link href={`/shop?categories=${product?.category}`}>
											<Button
												variant="outline"
												className="inline-flex items-center gap-2"
											>
												<span>View More Products</span>
												<ChevronRight className="h-4 w-4" />
											</Button>
										</Link>
									</div>
								)}
						</div>

						{isLoadingRelated ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
								{[...Array(4)].map((_, i) => (
									<ProductCardSkeleton key={i} />
								))}
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
								{related.map((p: Product, i: number) => (
									<ProductCard key={p.id} product={p} index={i} />
								))}
							</div>
						)}
					</section>
				)}
			</main>
			<PreorderSection />
			<Footer />
		</div>
	);
};

export default ProductDetail;
