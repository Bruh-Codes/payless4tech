"use client";

import { motion } from "framer-motion";
import { useEbaySearch } from "@/hooks/useEbaySearch";
import ProductCard from "@/components/product-card";
import { convertEbayToLocalProduct } from "@/lib/ebay";
import { ProductCardSkeleton } from "../LoadingSkeletons";

const NewArrivals = () => {
	const { data, isLoading, isError } = useEbaySearch("Samsung", 1, true);

	const newArrivals = data?.items.map(convertEbayToLocalProduct) || [];

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
			<section className="py-16 bg-muted/30">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="font-display text-3xl font-bold text-foreground">
							New <span className="text-brand-color">Arrivals</span>
						</h2>
						<p className="mt-2 text-muted-foreground">
							Unable to load new arrivals. Please try again later.
						</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="py-16 bg-muted/30">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="mb-10 text-center"
				>
					<div>
						<h2 className="font-display text-3xl font-bold text-foreground">
							New <span className="text-brand-color">Arrivals</span>
						</h2>
						<p className="mt-2 text-muted-foreground">
							Latest tech at unbeatable prices
						</p>
					</div>
				</motion.div>

				<div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{newArrivals.map((product, i) => (
						<ProductCard key={product.id} product={product} index={i} />
					))}
				</div>
			</div>
		</section>
	);
};

export default NewArrivals;
