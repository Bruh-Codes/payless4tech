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

		const handleOpenCart = (e: React.MouseEvent) => {
			e.stopPropagation();
			window.dispatchEvent(new CustomEvent("open-cart"));
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
				className="group relative bg-[#fbfbfd] dark:bg-[#1c1c1e] rounded-[24px] overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.02)] border border-black/5 dark:border-white/5 flex flex-col h-full"
			>
				{/* Product Image */}
				<div className="aspect-square relative flex items-center justify-center p-8">
					{product.image &&
					(product.image.startsWith("http://") ||
						product.image.startsWith("https://") ||
						product.image.startsWith("/")) ? (
						<div className="flex h-full w-full items-center justify-center relative">
							<Image
								src={product.image}
								alt={product.title}
								className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-sm"
								loading="lazy"
								sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 250px"
								fill
							/>
						</div>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
							No Valid Image
						</div>
					)}
				</div>

				{/* Product Info */}
				<div className="p-6 pt-2 flex flex-col flex-1">
					<h3 className="font-medium text-lg text-foreground mb-4 line-clamp-2 leading-tight group-hover:opacity-80 transition-opacity">
						{product.title}
					</h3>

					{/* Spacer to push pricing and buttons to bottom */}
					<div className="mt-auto">
						{/* Price */}
						<div className="flex items-center gap-2 mb-5">
							<span className="text-xl tracking-tight font-semibold text-foreground">
								{currencySymbol}
								{formatPrice(priceValue, product.currency)}
							</span>
						</div>

						{/* Add to Cart Button */}
						{!hideActions && (
							<div className="flex gap-2 w-full">
								{isEbayProduct ? (
									<Button
										onClick={(e) => {
											e.stopPropagation();
											const productName = encodeURIComponent(product.title);
											router.push(`/product/${product.id}?name=${productName}`);
										}}
										className="w-full h-11 bg-[#f5f5f7] dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-foreground rounded-full font-medium transition-all duration-300 ease-out"
									>
										<Eye className="h-4 w-4 mr-2" />
										View Details
									</Button>
								) : product.isPreorder ? (
									<Button
										onClick={handlePreorder}
										className="w-full h-11 bg-foreground hover:bg-foreground/90 text-background rounded-full font-medium transition-all duration-300 ease-out hover:scale-[1.02]"
									>
										<Package className="h-4 w-4 mr-2" />
										Pre-Order
									</Button>
								) : isInCart ? (
									<Button
										onClick={handleOpenCart}
										className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-all duration-300"
									>
										<Check className="h-4 w-4 mr-2" />
										In Cart
									</Button>
								) : (
									<Button
										onClick={handleAddToCart}
										className="w-full h-11 bg-foreground hover:bg-foreground/90 text-background rounded-full font-medium transition-all duration-300 ease-out hover:scale-[1.02]"
									>
										<ShoppingCart className="h-4 w-4 mr-2" />
										Buy Now
									</Button>
								)}
							</div>
						)}

						{isAdmin && (
							<div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
								<div className="flex justify-between items-center">
									<span className="bg-gray-100 dark:bg-white/10 text-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
										Stock: {product.stock || 0}
									</span>
								</div>
								<Button
									onClick={(e) => {
										e.stopPropagation();
										if (onClickOverride) onClickOverride();
									}}
									variant="outline"
									className="w-full h-10 rounded-full font-medium"
								>
									Edit Product
								</Button>
							</div>
						)}
					</div>
				</div>
			</motion.div>
		);
	},
);

export default ProductCard;
