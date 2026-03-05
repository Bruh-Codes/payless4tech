"use client";
import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { memo } from "react";
import { ShoppingCart, Eye, Package, Check } from "lucide-react";

interface ProductCardProps {
	product: Product & { itemUrl?: string };
	index?: number;
	hideActions?: boolean;
	onClickOverride?: () => void;
	isAdmin?: boolean;
}

const ProductCard = memo(
	({
		product,
		index = 0,
		hideActions = false,
		onClickOverride,
		isAdmin = false,
	}: ProductCardProps) => {
		const router = useRouter();
		const { addItem, state: cartState } = useCart();

		// Currency symbol mapping
		const getCurrencySymbol = (currency?: string) => {
			switch (currency) {
				case "GHS":
					return "₵";
				case "USD":
				default:
					return "₵"; // Default to GHS since our API returns GHS prices
			}
		};

		// Format price based on currency
		const formatPrice = (price: number, currency?: string) => {
			if (currency === "GHS" || !currency) {
				// Ghana Cedis formatting: use commas, no decimal places for whole numbers
				return price.toLocaleString("en-GH", {
					minimumFractionDigits: price % 1 === 0 ? 0 : 2,
					maximumFractionDigits: 2,
				});
			}
			// USD formatting
			return price.toFixed(2);
		};

		const currencySymbol = getCurrencySymbol(product.currency);

		const priceValue =
			typeof product.price === "object"
				? (product.price as any).value
				: product.price;
		const originalPriceValue = product.originalPrice
			? typeof product.originalPrice === "object"
				? (product.originalPrice as any).value
				: product.originalPrice
			: undefined;

		const discount = originalPriceValue
			? Math.round(
					((originalPriceValue - priceValue) / originalPriceValue) * 100,
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
				price: priceValue,
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
			if (onClickOverride) {
				onClickOverride();
				return;
			}
			// Always navigate to product details page without name parameter
			router.push(`/product/${product.id}`);
		};

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: "-50px" }}
				transition={{
					delay: Math.min(index * 0.1, 0.3),
					duration: 0.4,
					ease: "easeOut",
				}}
				whileHover={{
					y: -4,
					boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
				}}
				onClick={handleProductClick}
				className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
			>
				{/* Product Image */}
				<div className="aspect-square overflow-hidden bg-muted/20">
					{product.image &&
					(product.image.startsWith("http://") ||
						product.image.startsWith("https://") ||
						product.image.startsWith("/")) ? (
						<div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-muted/30 to-transparent p-4">
							<Image
								src={product.image}
								alt={product.title}
								className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
								loading="lazy"
								sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
								width={300}
								height={300}
							/>
						</div>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
							No Valid Image
						</div>
					)}
				</div>

				{/* Product Info */}
				<div className="p-4">
					<h3 className="font-semibold text-lg text-foreground mb-3 group-hover:text-brand-color transition-colors line-clamp-2">
						{product.title}
					</h3>

					{/* Price */}
					<div className="flex items-center gap-2 mb-4">
						<span className="text-2xl font-bold text-foreground">
							{currencySymbol}
							{formatPrice(priceValue, product.currency)}
						</span>
					</div>

					{/* Add to Cart Button */}
					{!hideActions && (
						<div className="flex gap-2">
							{isEbayProduct ? (
								<Button
									onClick={(e) => {
										e.stopPropagation();
										const productName = encodeURIComponent(product.title);
										router.push(`/product/${product.id}?name=${productName}`);
									}}
									className="w-full h-11 bg-brand-color hover:bg-brand-color/90 text-white rounded-xl transition-all duration-300 hover:scale-[1.02] group-hover:shadow-lg"
								>
									<Eye className="h-4 w-4 mr-2" />
									View Details
								</Button>
							) : product.isPreorder ? (
								<Button
									onClick={handlePreorder}
									className="w-full h-11 bg-purple-700 hover:bg-purple-800 text-white rounded-xl transition-all duration-300 hover:scale-[1.02] group-hover:shadow-lg"
								>
									<Package className="h-4 w-4 mr-2" />
									Pre-Order
								</Button>
							) : isInCart ? (
								<Button
									onClick={(e) => e.stopPropagation()}
									className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all duration-300 hover:scale-[1.02] group-hover:shadow-lg"
								>
									<Check className="h-4 w-4 mr-2" />
									In Cart
								</Button>
							) : (
								<Button
									onClick={handleAddToCart}
									className="w-full h-11 bg-brand-color hover:bg-brand-color/90 text-white rounded-xl transition-all duration-300 hover:scale-[1.02] group-hover:shadow-lg"
								>
									<ShoppingCart className="h-4 w-4 mr-2" />
									Add to Cart
								</Button>
							)}
						</div>
					)}

					{isAdmin && (
						<div className="flex flex-col gap-2 mt-4">
							<div className="flex justify-between items-center">
								<span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-lg shadow-sm border border-purple-200">
									Stock: {product.stock || 0}
								</span>
							</div>
							<Button
								onClick={(e) => {
									e.stopPropagation();
									if (onClickOverride) onClickOverride();
								}}
								variant="outline"
								className="w-full h-11 rounded-xl border-primary/20 hover:bg-primary/5"
							>
								Edit Product
							</Button>
						</div>
					)}
				</div>
			</motion.div>
		);
	},
);

export default ProductCard;
