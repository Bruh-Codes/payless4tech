"use client";
import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { memo } from "react";

interface ProductCardProps {
	product: Product & { itemUrl?: string };
	index?: number;
}

const ProductCard = memo(({ product, index = 0 }: ProductCardProps) => {
	const router = useRouter();
	const { addItem, state: cartState } = useCart();
	// Currency symbol mapping
	const getCurrencySymbol = (currency?: string) => {
		switch (currency) {
			case "GHS":
				return "₵";
			case "USD":
			default:
				return "$";
		}
	};

	// Format price based on currency
	const formatPrice = (price: number, currency?: string) => {
		if (currency === "GHS") {
			// Ghana Cedis formatting: use commas, no decimal places for whole numbers
			return price.toLocaleString("en-GH", {
				minimumFractionDigits: price % 1 === 0 ? 0 : 2,
				maximumFractionDigits: 2,
			});
		}
		// Default USD formatting
		return price.toFixed(2);
	};

	const currencySymbol = getCurrencySymbol(product.currency);

	const discount = product.originalPrice
		? Math.round(
				((product.originalPrice - product.price) / product.originalPrice) * 100,
			)
		: 0;

	// Disable cart functionality for eBay products
	const isEbayProduct = !!product.itemUrl;
	const isInCart =
		!isEbayProduct && cartState.items.some((item) => item.id === product.id);

	const handleAddToCart = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isEbayProduct) return; // Don't add eBay products to cart
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
		if (isEbayProduct) return; // Don't preorder eBay products
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

	const handleProductClick = () => {
		// Always navigate to product details page with name parameter
		const productName = encodeURIComponent(product.title);
		router.push(`/product/${product.id}?name=${productName}`);
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
			onClick={handleProductClick}
			className="group cursor-pointer rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
		>
			{/* Image */}
			<div className="relative aspect-square overflow-hidden bg-secondary/30 group-hover:bg-secondary/40">
				{product.image && (
					<Image
						src={product.image}
						alt={product.title}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
						sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
						width={300}
						height={300}
					/>
				)}
				<span
					className={`absolute top-3 right-3 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-md backdrop-blur-sm ${
						product.condition === "New"
							? "bg-emerald-500 text-white border-emerald-600 group-hover:bg-emerald-600"
							: product.condition === "Refurbished" ||
								  product.condition === "Seller Refurbished"
								? "bg-slate-700 text-white border-slate-800 group-hover:bg-slate-600"
								: product.condition === "Like New"
									? "bg-amber-600 text-white border-amber-700 group-hover:bg-amber-500"
									: "bg-blue-500 text-white border-blue-600 group-hover:bg-blue-600"
					}`}
				>
					{product.condition === "New"
						? "New"
						: product.condition === "Refurbished" ||
							  product.condition === "Seller Refurbished"
							? "Renewed"
							: product.condition === "Like New"
								? "Open Box"
								: product.condition || "Used"}
				</span>
			</div>

			{/* Info */}
			<div className="p-4">
				<h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
					{product.title}
				</h3>

				<div className="flex items-baseline gap-2 mb-3">
					<span className="text-lg font-bold text-foreground">
						{currencySymbol}
						{formatPrice(product.price, product.currency)}
					</span>
					{product.originalPrice && (
						<>
							<span className="text-sm text-muted-foreground line-through">
								{currencySymbol}
								{formatPrice(product.originalPrice, product.currency)}
							</span>
							{discount > 0 && (
								<span className="text-sm font-bold text-orange-500">
									(Save {discount}%)
								</span>
							)}
						</>
					)}
				</div>

				<div className="flex gap-2">
					{isEbayProduct ? (
						<Button
							size="sm"
							variant="outline"
							className="flex-1 text-xs transition-all duration-200 cursor-pointer"
							onClick={(e) => {
								e.stopPropagation();
								const productName = encodeURIComponent(product.title);
								router.push(`/product/${product.id}?name=${productName}`);
							}}
						>
							View Details
						</Button>
					) : product.isPreorder ? (
						<Button
							size="sm"
							variant="outline"
							className="flex-1 text-xs transition-all duration-200 cursor-pointer"
							onClick={handlePreorder}
						>
							Pre-Order
						</Button>
					) : isInCart ? (
						<Button
							size="sm"
							variant="secondary"
							className="flex-1 text-xs bg-green-100 text-green-800 hover:bg-green-200 border-green-300 transition-all duration-200 cursor-pointer"
							onClick={(e) => e.stopPropagation()}
						>
							In Cart ✓
						</Button>
					) : (
						<Button
							size="sm"
							className="flex-1 text-xs transition-all duration-200 hover:bg-primary/90 hover:text-primary-foreground border-primary/30 hover:shadow-primary/20 cursor-pointer"
							onClick={handleAddToCart}
						>
							Add to Cart
						</Button>
					)}
				</div>
			</div>
		</motion.div>
	);
});

export default ProductCard;
