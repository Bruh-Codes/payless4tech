"use client";

import { motion } from "framer-motion";
import { categories } from "@/lib/products";
import { useRouter } from "next/navigation";

const Categories = () => {
	const router = useRouter();

	return (
		<section className="py-16">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="mb-10"
				>
					<h2 className="font-display text-3xl font-bold text-foreground">
						Shop by <span className="text-brand-color">Category</span>
					</h2>
					<p className="mt-2 text-muted-foreground">
						Find exactly what you need
					</p>
				</motion.div>

				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
					{categories.map((cat, i) => (
						<motion.button
							key={cat.slug}
							initial={{ opacity: 0, y: 10 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{
								delay: Math.min(i * 0.04, 0.2),
								duration: 0.3,
								ease: "easeOut",
							}}
							whileHover={{
								boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
							}}
							onClick={() => router.push(`/search?q=${cat.slug}`)}
							className="group relative rounded-xl overflow-hidden bg-card aspect-square flex flex-col items-center justify-end p-4 transition-all shadow-sm"
						>
							<img
								src={cat.image}
								alt={cat.name}
								className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-300"
								loading="lazy"
							/>
							<div className="absolute inset-0 bg-gradient-to-t group-hover:from-orange-150 from-orange-300/40 via-orange-50/50 to-transparent dark:from-background dark:via-background/70 dark:to-transparent" />
							<div className="relative z-10 text-center transition-all duration-300">
								<span className="text-lg font-semibold text-foreground opacity-60 group-hover:opacity-100 transition-opacity duration-300">
									{cat.name}
								</span>
							</div>
						</motion.button>
					))}
				</div>
			</div>
		</section>
	);
};

export default Categories;
