"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Product } from "@/lib/products";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
	product: Product;
	index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
	const router = useRouter();
	const { addItem, state: cartState } = useCart();
	const discount = product.originalPrice
		? Math.round(
				((product.originalPrice - product.price) / product.originalPrice) * 100,
			)
		: 0;

	const isInCart = cartState.items.some((item) => item.id === product.id);

	const handleAddToCart = (e: React.MouseEvent) => {
		e.stopPropagation();
		addItem({
			id: product.id,
			name: product.title,
			price: product.price,
			quantity: 1,
			image_url: product.image,
		});
	};

	const handlePreorder = (e: React.MouseEvent) => {
		e.stopPropagation();
		// Create custom event with detail property
		const preorderEvent = new CustomEvent("preorder", {
			detail: {
				productId: product.id,
				productName: product.title,
				productCategory: product.category,
				productImage: product.image,
			},
		});

		window.dispatchEvent(preorderEvent);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-50px" }}
			transition={{
				delay: Math.min(index * 0.03, 0.15),
				duration: 0.3,
				ease: "easeOut",
			}}
			whileHover={{ y: -2 }}
			onClick={() =>
				router.push(`/search?q=${encodeURIComponent(product.title)}`)
			}
			className="group cursor-pointer rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
		>
			{/* Image */}
			<div className="relative aspect-square overflow-hidden bg-secondary/30">
				<img
					src={product.image}
					alt={product.title}
					className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					loading="lazy"
				/>
				<span
					className={`absolute top-3 right-3 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-md backdrop-blur-sm ${
						product.condition === "New"
							? "bg-emerald-500 text-white border-emerald-600"
							: product.condition === "Refurbished"
								? "bg-slate-700 text-white border-slate-800"
								: product.condition === "Like New"
									? "bg-amber-600 text-white border-amber-700"
									: "bg-rose-500 text-white border-rose-600"
					}`}
				>
					{product.condition === "New"
						? "New"
						: product.condition === "Refurbished"
							? "Renewed"
							: product.condition === "Like New"
								? "Open Box"
								: "Unavailable"}
				</span>
			</div>

			{/* Info */}
			<div className="p-4">
				<h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
					{product.title}
				</h3>

				<div className="flex items-baseline gap-2 mb-3">
					<span className="text-lg font-bold text-foreground">
						${product.price.toFixed(2)}
					</span>
					{product.originalPrice && (
						<>
							<span className="text-sm text-muted-foreground line-through">
								${product.originalPrice.toFixed(2)}
							</span>
							{discount > 0 && (
								<span className="text-sm font-bold text-emerald-500">
									(Save {discount}%)
								</span>
							)}
						</>
					)}
				</div>

				<div className="flex gap-2">
					{product.isPreorder ? (
						<Button
							size="sm"
							variant="outline"
							className="flex-1 text-xs"
							onClick={handlePreorder}
						>
							Pre-Order
						</Button>
					) : isInCart ? (
						<Button
							size="sm"
							variant="secondary"
							className="flex-1 text-xs bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
							onClick={(e) => e.stopPropagation()}
						>
							In Cart ✓
						</Button>
					) : (
						<Button
							size="sm"
							className="flex-1 text-xs"
							onClick={handleAddToCart}
						>
							Add to Cart
						</Button>
					)}
				</div>
			</div>
		</motion.div>
	);
};

export default ProductCard;
