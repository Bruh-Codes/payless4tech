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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                delay: Math.min(i * 0.04, 0.2),
                duration: 0.3,
                ease: "easeOut",
              }}
              className="flex flex-col items-center gap-3 sm:gap-4 group cursor-pointer"
              onClick={() => router.push(`/shop?category=${cat.slug}`)}
            >
              <div className="w-full aspect-square rounded-2xl bg-[#f5f5f7] dark:bg-[#1c1c1e] flex items-center justify-center p-6 sm:p-8 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 ease-out group-hover:scale-110 drop-shadow-sm"
                  loading="lazy"
                />
              </div>
              <div className="text-center w-full px-2">
                <span className="text-sm sm:text-base font-medium text-foreground transition-colors group-hover:text-brand-color">
                  {cat.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
