"use client";

import { motion } from "framer-motion";
import { useMixedFeaturedProducts } from "@/hooks/useFeaturedProducts";
import ProductCard from "@/components/product-card";
import { convertEbayToLocalProduct } from "@/lib/ebay";
import { ProductCardSkeleton } from "@/components/LoadingSkeletons";

const TopDeals = () => {
	const { data, isLoading } = useMixedFeaturedProducts(true);

	const products = data?.items?.map(convertEbayToLocalProduct) || [];

	return (
		<section className="py-10 md:py-14">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="mb-10"
				>
					<h2 className="font-display text-3xl font-bold text-foreground">
						Featured <span className="text-brand-color">Deals</span>
					</h2>
					<p className="mt-2 text-muted-foreground">
						Amazing discounts on top products
					</p>
				</motion.div>

				{/* Products Grid */}
				{isLoading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{Array.from({ length: 4 }).map((_, i) => (
							<ProductCardSkeleton key={i} />
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{products.map((product, i) => (
							<ProductCard key={product.id} product={product} index={i} />
						))}
					</div>
				)}
			</div>
		</section>
	);
};

export default TopDeals;
