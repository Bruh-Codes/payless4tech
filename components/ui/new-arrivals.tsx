"use client";

import { motion } from "framer-motion";
import { newArrivals, Product } from "@/lib/products";
import ProductCard from "@/components/product-card";

const NewArrivals = () => {
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
					{newArrivals.map((product: Product, i: number) => (
						<ProductCard key={product.id} product={product} index={i} />
					))}
				</div>
			</div>
		</section>
	);
};

export default NewArrivals;
