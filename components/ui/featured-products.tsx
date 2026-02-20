"use client";

import { motion } from "framer-motion";
import { useMixedFeaturedProducts } from "@/hooks/useFeaturedProducts";
import ProductCard from "@/components/product-card";
import { convertEbayToLocalProduct } from "@/lib/ebay";
import { ProductCardSkeleton } from "@/components/LoadingSkeletons";

const FeaturedProducts = () => {
	const { data, isLoading, isError } = useMixedFeaturedProducts(true);

	const featuredProducts = data?.items.map(convertEbayToLocalProduct) || [];

	if (isLoading) {
		return (
			<section className="py-16">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-10">
						<div className="h-8 bg-muted animate-pulse rounded w-48 mb-2"></div>
						<div className="h-4 bg-muted animate-pulse rounded w-64"></div>
					</div>
					<div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{Array.from({ length: 20 }).map((_, i) => (
							<ProductCardSkeleton key={i} />
						))}
					</div>
				</div>
			</section>
		);
	}

	if (isError) {
		return (
			<section className="py-16">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center space-y-6">
						<div className="space-y-2">
							<h2 className="font-display text-3xl font-bold text-foreground">
								Trouble Loading{" "}
								<span className="text-brand-color">Featured Deals</span>
							</h2>
							<p className="text-muted-foreground max-w-md mx-auto">
								We're having trouble fetching our latest products. This might be
								a temporary issue.
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<button
								onClick={() => window.location.reload()}
								className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
							>
								Try Again
							</button>
							<a
								href="/shop"
								className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
							>
								Browse All Products
							</a>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="py-16">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="mb-10 flex items-end justify-between"
				>
					<div>
						<h2 className="font-display text-3xl font-bold text-foreground">
							Featured <span className="text-brand-color">Deals</span>
						</h2>
						<p className="mt-2 text-muted-foreground">
							Handpicked savings on premium tech
						</p>
					</div>
					<a
						href="/search?q=all"
						className="text-sm font-medium text-primary hover:underline hidden sm:block"
					>
						View All →
					</a>
				</motion.div>

				<div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{featuredProducts.map((product, i) => (
						<ProductCard key={product.id} product={product} index={i} />
					))}
				</div>
			</div>
		</section>
	);
};

export default FeaturedProducts;
