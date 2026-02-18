"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	Star,
	Truck,
	ShieldCheck,
	ArrowLeft,
	Store,
	Package,
	ChevronRight,
	ShoppingCart,
} from "lucide-react";
import Footer from "@/components/Footer";
import { getProductById, searchProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import ProductCard from "@/components/product-card";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import PreorderSection from "@/components/PreorderSection";
import Image from "next/image";

const specs: Record<string, { key: string; value: string }[]> = {
	smartphones: [
		{ key: "Display", value: '6.7" Super Retina XDR OLED' },
		{ key: "Processor", value: "Latest Gen Chipset" },
		{ key: "Storage", value: "256GB" },
		{ key: "Battery", value: "4500 mAh" },
		{ key: "Camera", value: "48MP Triple Camera System" },
		{ key: "OS", value: "Latest OS Version" },
	],
	laptops: [
		{ key: "Display", value: '15.6" Retina / FHD+' },
		{ key: "Processor", value: "Latest Gen CPU" },
		{ key: "RAM", value: "16GB / 32GB" },
		{ key: "Storage", value: "512GB SSD" },
		{ key: "Battery", value: "Up to 18 hours" },
		{ key: "OS", value: "macOS / Windows 11" },
	],
	audio: [
		{ key: "Type", value: "Over-ear / In-ear / Speaker" },
		{ key: "Driver", value: "40mm / Custom" },
		{ key: "Battery", value: "Up to 30 hours" },
		{ key: "Connectivity", value: "Bluetooth 5.3" },
		{ key: "Noise Cancelling", value: "Active (ANC)" },
		{ key: "Water Resistance", value: "IPX4 / IP67" },
	],
	tablets: [
		{ key: "Display", value: '10.9" - 12.9" Liquid Retina' },
		{ key: "Processor", value: "Latest Gen Chip" },
		{ key: "Storage", value: "128GB / 256GB" },
		{ key: "Battery", value: "Up to 10 hours" },
		{ key: "Camera", value: "12MP Wide" },
		{ key: "Connectivity", value: "WiFi 6E" },
	],
	gaming: [
		{ key: "Platform", value: "Console / Handheld" },
		{ key: "Storage", value: "825GB SSD / 64GB" },
		{ key: "Resolution", value: "Up to 4K @ 120fps" },
		{ key: "Audio", value: "3D Audio / Stereo" },
		{ key: "Connectivity", value: "WiFi 6, Bluetooth 5.1" },
		{ key: "Controller", value: "Included" },
	],
	accessories: [
		{ key: "Type", value: "Wearable / Peripheral" },
		{ key: "Battery", value: "Up to 36 hours" },
		{ key: "Connectivity", value: "Bluetooth 5.3 / USB-C" },
		{ key: "Compatibility", value: "iOS & Android" },
		{ key: "Water Resistance", value: "IP68 / WR100" },
		{ key: "Sensors", value: "Heart Rate, GPS, Accelerometer" },
	],
};

const ProductDetail = () => {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const { addItem, state } = useCart();
	const product = getProductById(id || "");
	const [showAllSpecs, setShowAllSpecs] = useState(false);
	const [selectedImage, setSelectedImage] = useState(0);

	const handleAddToCart = () => {
		if (product) {
			addItem({
				id: product.id,
				name: product.title,
				price: product.price,
				quantity: 1,
				image_url: product.image,
			});
		}
	};

	const handlePreorder = () => {
		if (product) {
			// Dispatch custom event to open PreorderSection form
			const preorderEvent = new CustomEvent("preorder", {
				detail: {
					productName: product.title,
					category: product.category,
					specifications: "",
				},
			});
			window.dispatchEvent(preorderEvent);
		}
	};

	const isInCart = state.items.some((item) => item.id === product?.id);

	if (!product) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<div className="flex flex-col items-center justify-center py-32">
					<p className="text-5xl mb-4">
						<Package />
					</p>
					<h1 className="font-display text-2xl font-bold text-foreground mb-2">
						Product not found
					</h1>
					<div className="space-y-6 text-foreground specifications-text mb-6">
						<p className="text-muted-foreground">
							This product may have been removed or doesn't exist.
						</p>
						<Button onClick={() => router.push("/")} variant="outline">
							<ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
						</Button>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	const discount = product.originalPrice
		? Math.round(
				((product.originalPrice - product.price) / product.originalPrice) * 100,
			)
		: 0;

	const productSpecs = specs[product.category] || specs.accessories;
	const related = searchProducts(product.category)
		.filter((p) => p.id !== product.id)
		.slice(0, 4);

	// Mock product images - in real app, these would come from API
	const productImages = [
		product.image,
		// Add some variations of the same product
		product.image.includes("placeholder")
			? `https://picsum.photos/seed/${product.id}-1/600/600.jpg`
			: product.image.replace(/\/[^\/]*$/, "/view1.jpg"),
		product.image.includes("placeholder")
			? `https://picsum.photos/seed/${product.id}-2/600/600.jpg`
			: product.image.replace(/\/[^\/]*$/, "/view2.jpg"),
		product.image.includes("placeholder")
			? `https://picsum.photos/seed/${product.id}-3/600/600.jpg`
			: product.image.replace(/\/[^\/]*$/, "/view3.jpg"),
		product.image.includes("placeholder")
			? `https://picsum.photos/seed/${product.id}-4/600/600.jpg`
			: product.image.replace(/\/[^\/]*$/, "/view4.jpg"),
	].filter(Boolean);

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
				{/* Breadcrumb */}
				<nav className="flex items-center gap-1.5 text-sm text-gray-900/70 dark:text-muted-foreground mb-6">
					<button
						onClick={() => router.push("/")}
						className="hover:text-foreground transition-colors"
					>
						Home
					</button>
					<ChevronRight className="h-3.5 w-3.5" />
					<button
						onClick={() => router.push(`/search?q=${product.category}`)}
						className="hover:text-foreground transition-colors capitalize"
					>
						{product.category}
					</button>
					<ChevronRight className="h-3.5 w-3.5" />
					<span className="text-foreground truncate max-w-[200px]">
						{product.title}
					</span>
				</nav>

				{/* Product Hero */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
					{/* Image Gallery */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="space-y-3"
					>
						{/* Main Image */}
						<div className="relative w-full rounded-xl overflow-hidden bg-secondary/30 border border-border aspect-[4/3] max-h-90">
							<Image
								width={200}
								height={200}
								src={productImages[selectedImage] || ""}
								alt={product.title}
								className="h-full w-full object-cover"
							/>
							{discount > 0 && (
								<span className="absolute top-3 left-3 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
									-{discount}% OFF
								</span>
							)}
						</div>

						{/* Thumbnail Gallery */}
						<div className="flex gap-2 justify-between overflow-x-auto pb-2">
							{productImages.map((image, index) => (
								<div
									key={index}
									onClick={() => setSelectedImage(index)}
									className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer transition-all ${
										selectedImage === index
											? "border-2 border-orange-500"
											: "border-2 border-border hover:border-primary/30"
									}`}
								>
									<Image
										width={96}
										height={96}
										src={image || "/placeholder.png"}
										alt={`${product.title} view ${index + 1}`}
										className="w-full h-full object-cover"
									/>
								</div>
							))}
						</div>
					</motion.div>

					{/* Info */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="flex flex-col"
					>
						<span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
							{product.category}
						</span>
						<h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
							{product.title}
						</h1>

						{/* Rating */}
						<div className="flex items-center gap-2 mb-4">
							<div className="flex">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`}
									/>
								))}
							</div>
							<span className="text-sm font-medium text-foreground">
								{product.rating}
							</span>
							<span className="text-sm text-muted-foreground">
								({product.reviews} reviews)
							</span>
						</div>

						{/* Price */}
						<div className="flex items-baseline gap-3 mb-6">
							<span className="text-3xl font-bold text-foreground">
								${product.price.toFixed(2)}
							</span>
							{product.originalPrice && (
								<span className="text-lg text-muted-foreground line-through">
									${product.originalPrice.toFixed(2)}
								</span>
							)}
							{discount > 0 && (
								<span className="text-sm font-semibold text-primary">
									Save ${(product.originalPrice! - product.price).toFixed(2)}
								</span>
							)}
						</div>

						{/* Quick Info */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
							<div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
								<Package className="h-5 w-5 text-primary shrink-0" />
								<div>
									<p className="text-xs text-muted-foreground">Condition</p>
									<p className="text-sm font-semibold text-foreground">
										{product.condition}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
								<Truck className="h-5 w-5 text-primary shrink-0" />
								<div>
									<p className="text-xs text-muted-foreground">Shipping</p>
									<p className="text-sm font-semibold text-foreground">
										{product.shipping}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
								<Store className="h-5 w-5 text-primary shrink-0" />
								<div>
									<p className="text-xs text-muted-foreground">Seller</p>
									<p className="text-sm font-semibold text-foreground">
										{product.seller}
									</p>
								</div>
							</div>
						</div>

						{/* CTA */}
						<div className="flex flex-col gap-3 mb-6 min-w-0">
							{product.isPreorder ? (
								<Button
									size="lg"
									className="w-full text-base font-semibold bg-orange-500 hover:bg-orange-600 min-h-[48px]"
									onClick={handlePreorder}
								>
									Pre-order Now
								</Button>
							) : (
								<Button
									size="lg"
									className="w-full text-base font-semibold min-h-[48px]"
									onClick={handleAddToCart}
									disabled={isInCart}
								>
									{isInCart ? (
										<>
											<ShoppingCart className="h-4 w-4 mr-2" />
											In Cart
										</>
									) : (
										<>
											<ShoppingCart className="h-4 w-4 mr-2" />
											Add to Cart
										</>
									)}
								</Button>
							)}
						</div>

						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<ShieldCheck className="h-4 w-4 text-primary" />
							<span>30-day return policy · Secure checkout</span>
						</div>
					</motion.div>
				</div>

				{/* Specs */}
				<motion.section
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-16"
				>
					<h2 className="font-display text-xl font-bold text-foreground mb-4">
						Specifications
					</h2>
					<div className="rounded-2xl border border-border bg-secondary dark:bg-card overflow-hidden">
						{productSpecs
							?.slice(0, showAllSpecs ? productSpecs.length : 4)
							.map((spec, i) => (
								<div
									key={spec.key}
									className={`flex items-center justify-between px-5 py-3.5 ${i < (showAllSpecs ? productSpecs.length : 4) - 1 ? "border-b border-border" : ""}`}
								>
									<span className="text-sm text-muted-foreground">
										{spec.key}
									</span>
									<span className="text-sm font-medium text-foreground">
										{spec.value}
									</span>
								</div>
							))}
						{productSpecs && productSpecs.length > 4 && (
							<button
								onClick={() => setShowAllSpecs(!showAllSpecs)}
								className="w-full px-5 py-3 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
							>
								{showAllSpecs
									? "View Less"
									: `View More (${productSpecs.length - 4} more)`}
							</button>
						)}
					</div>
				</motion.section>

				{/* Related */}
				{related.length > 0 && (
					<section className="mb-16">
						<h2 className="font-display text-xl font-bold text-foreground mb-6">
							You May Also Like
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							{related.map((p, i) => (
								<ProductCard key={p.id} product={p} index={i} />
							))}
						</div>
					</section>
				)}
			</main>
			<PreorderSection />
			<Footer />
		</div>
	);
};

export default ProductDetail;
