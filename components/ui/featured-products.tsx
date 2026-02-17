"use client";

import { motion } from "framer-motion";
import { featuredProducts } from "@/lib/products";
import ProductCard from "@/components/product-card";

const FeaturedProducts = () => {
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

				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
					{featuredProducts.map((product, i) => (
						<ProductCard key={product.id} product={product} index={i} />
					))}
				</div>
			</div>
		</section>
	);
};

export default FeaturedProducts;
