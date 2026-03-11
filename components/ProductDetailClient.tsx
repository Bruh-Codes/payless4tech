"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	Truck,
	ShieldCheck,
	Package,
	ChevronRight,
	ShoppingCart,
} from "lucide-react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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
import type { ProductDetailData } from "@/lib/product-details";

export default function ProductDetailClient({
	product,
}: {
	product: ProductDetailData;
}) {
	const router = useRouter();
	const { addItem, state } = useCart();
	const [selectedImage, setSelectedImage] = useState(0);
	const [showAllSpecs, setShowAllSpecs] = useState(false);

	const { data: relatedData, isLoading: isLoadingRelated } =
		useEbayCategorySearch(product.categoryId || "", true, 10);

	const related =
		relatedData?.items
			.filter((item: { id: string }) => item.id !== product.id)
			.map(convertEbayToLocalProduct) || [];

	const handleAddToCart = () => {
		addItem({
			id: product.id,
			name: product.title,
			price: product.price.value,
			quantity: 1,
			image_url: product.image,
		});
	};

	const handlePreorder = () => {
		const preorderEvent = new CustomEvent("preorder", {
			detail: {
				productName: product.title,
				category: product.category,
				specifications: "",
			},
		});
		window.dispatchEvent(preorderEvent);
	};

	const isInCart = state.items.some((item) => item.id === product.id);

	const formatPrice = (price: number, currency?: string) => {
		if (currency === "GHS" || !currency) {
			return price.toLocaleString("en-GH", {
				minimumFractionDigits: price % 1 === 0 ? 0 : 2,
				maximumFractionDigits: 2,
			});
		}

		return price.toFixed(2);
	};

	const priceValue = product.price?.value || 0;
	const priceCurrency = product.price?.currency || "GHS";
	const originalPriceValue = product.originalPrice?.value || 0;
	const discount =
		originalPriceValue > priceValue
			? Math.round(
					((originalPriceValue - priceValue) / originalPriceValue) * 100,
				)
			: 0;
	const showDiscountDetails = !product.isPreorder && discount > 0;

	const productSpecs = product.specifications || [];
	const productImages = Array.from(
		new Set(
			[product.image, ...(product.additionalImages || [])].filter(Boolean),
		),
	);

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
				<nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-900/70 dark:text-muted-foreground">
					<button
						onClick={() => router.push("/")}
						className="transition-colors hover:text-foreground"
					>
						Home
					</button>
					<ChevronRight className="h-3.5 w-3.5" />
					<button
						onClick={() => router.push(`/shop?categories=${product.category}`)}
						className="capitalize transition-colors hover:text-foreground"
					>
						{product.category}
					</button>
					<ChevronRight className="h-3.5 w-3.5" />
					<span className="max-w-[200px] truncate text-foreground">
						{product.title}
					</span>
				</nav>

				<div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="space-y-3"
					>
						<div className="relative aspect-4/3 w-full max-h-90 overflow-hidden rounded-xl border border-border bg-secondary/30">
							<div className="flex h-full w-full items-center justify-center bg-linear-to-b from-muted/30 to-transparent p-4 sm:p-6">
								<Image
									width={200}
									height={200}
									src={productImages[selectedImage] || ""}
									alt={product.title}
									className="h-full w-full object-contain"
								/>
							</div>
							{showDiscountDetails && (
								<span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
									-{discount}% OFF
								</span>
							)}
						</div>

						<div className="flex justify-start gap-2 overflow-x-auto pb-2">
							{productImages.map((image, index) => (
								<div
									key={`${image}-${index}`}
									onClick={() => setSelectedImage(index)}
									className={`relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all ${
										selectedImage === index
											? "border-2 border-orange-500"
											: "border-2 border-border hover:border-primary/30"
									}`}
								>
									<div className="flex h-full w-full items-center justify-center bg-muted/20 p-2">
										<Image
											width={96}
											height={96}
											src={image || "/placeholder.png"}
											alt={`${product.title} view ${index + 1}`}
											className="h-full w-full object-contain"
										/>
									</div>
								</div>
							))}
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="flex flex-col"
					>
						<span className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
							{product.category}
						</span>
						<h1 className="mb-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
							{product.title}
						</h1>

						<div className="mb-6 flex items-baseline gap-3">
							<span className="text-3xl font-bold text-foreground">
								GHS {formatPrice(priceValue, priceCurrency)}
							</span>
							{showDiscountDetails && (
								<span className="text-lg text-muted-foreground line-through">
									GHS {formatPrice(originalPriceValue, priceCurrency)}
								</span>
							)}
							{showDiscountDetails && (
								<span className="text-sm font-semibold text-primary">
									Save {discount}%
								</span>
							)}
						</div>

						<div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
								<Package className="h-5 w-5 shrink-0 text-primary" />
								<div>
									<p className="text-xs text-muted-foreground">Condition</p>
									<p className="text-sm font-semibold text-foreground">
										{product.condition}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
								<Truck className="h-5 w-5 shrink-0 text-primary" />
								<div>
									<p className="text-xs text-muted-foreground">Shipping</p>
									<p className="text-sm font-semibold text-foreground">
										{product.shipping}
									</p>
								</div>
							</div>
						</div>

						<div className="mb-6 flex min-w-0 flex-col gap-3">
							{product.isPreorder ? (
								<Button
									size="lg"
									className="min-h-[48px] w-full bg-orange-500 text-base font-semibold hover:bg-orange-600"
									onClick={handlePreorder}
								>
									Pre-order Now
								</Button>
							) : (
								<Button
									size="lg"
									className="min-h-[48px] w-full text-base font-semibold"
									onClick={handleAddToCart}
									disabled={isInCart}
								>
									{isInCart ? (
										<>
											<ShoppingCart className="mr-2 h-4 w-4" />
											In Cart
										</>
									) : (
										<>
											<ShoppingCart className="mr-2 h-4 w-4" />
											Add to Cart
										</>
									)}
								</Button>
							)}
						</div>

						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<ShieldCheck className="h-4 w-4 text-primary" />
							<span>30-day return policy | Secure checkout</span>
						</div>
					</motion.div>
				</div>

				<motion.section
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-16"
				>
					<h2 className="mb-4 font-display text-xl font-bold text-foreground">
						Specifications
					</h2>
					<div className="overflow-hidden rounded-2xl border border-border bg-secondary dark:bg-card">
						{productSpecs
							.slice(0, showAllSpecs ? productSpecs.length : 4)
							.map((spec, i) => (
								<div
									key={`${spec.key}-${i}`}
									className={`flex items-center justify-between px-5 py-3.5 ${
										i < (showAllSpecs ? productSpecs.length : 4) - 1
											? "border-b border-border"
											: ""
									}`}
								>
									<span className="text-sm text-muted-foreground">
										{spec.key}
									</span>
									<span className="text-sm font-medium text-foreground">
										{spec.value}
									</span>
								</div>
							))}
						{productSpecs.length > 4 && (
							<button
								onClick={() => setShowAllSpecs(!showAllSpecs)}
								className="w-full px-5 py-3 text-sm font-medium text-primary transition-colors hover:text-primary/80"
							>
								{showAllSpecs
									? "View Less"
									: `View More (${productSpecs.length - 4} more)`}
							</button>
						)}
					</div>
				</motion.section>

				{(related.length > 0 || isLoadingRelated) && (
					<section className="mb-16">
						<div className="mb-6 flex flex-wrap justify-between">
							<h2 className="font-display text-xl font-bold text-foreground">
								You May Also Like
							</h2>
							{product.categoryId &&
								!isLoadingRelated &&
								related.length > 0 && (
									<div className="text-center">
										<Link href={`/shop?categories=${product.category}`}>
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
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
								{[...Array(4)].map((_, i) => (
									<ProductCardSkeleton key={i} />
								))}
							</div>
						) : (
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
								{related.map((relatedProduct: Product, i: number) => (
									<ProductCard
										key={relatedProduct.id}
										product={relatedProduct}
										index={i}
									/>
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
}
