"use client";
import { useEffect, useState, use } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { db as supabase } from "@/lib/database";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Trash2 } from "lucide-react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { cn } from "@/lib/utils";
import { PreorderForm } from "@/components/PreorderForm";

interface ProductImage {
	created_at: string;
	display_order: number | null;
	id: string;
	image_url: string;
	product_id: string;
	updated_at: string;
}

interface Product {
	id: string;
	name: string;
	description: string | null;
	price: number;
	condition: string;
	category: string;
	image_url: string | null;
	original_price: number | null;
	detailed_specs: string | null;
	status: string;
	images?: ProductImage[];
}

const conditionDefinitions = {
	New: {
		definition:
			"Unused merchandise. Comes with all original packaging, accessories, and warranty (if applicable).",
		hasWarranty: false,
	},
	"Open Box": {
		definition:
			"Items that have been unboxed but are unused or barely used. They may have been returned or opened for display purposes in USA. Includes all original accessories and packaging, with minimal to no signs of wear.",
		hasWarranty: true,
	},
	Renewed: {
		definition:
			"Pre-owned items from USA that have been professionally restored to like-new condition. Includes thorough testing, cleaning, and replacement of any defective parts.",
		hasWarranty: true,
	},
	Used: {
		definition:
			"Pre-owned from items from USA with signs of wear but are fully functional. These items are tested and cleaned but may not include original accessories or packaging.",
		hasWarranty: true,
	},
};

const ProductDetails = ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = use(params);
	const router = useRouter();
	const { addItem, state } = useCart();
	const [product, setProduct] = useState<Product | null>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isPreorderFormOpen, setIsPreorderFormOpen] = useState(false);
	const [preordered, setPreordered] = useState(false);

	useEffect(() => {
		fetchProduct();
	}, [id]);

	const updateMetaTags = (product: Product) => {
		const title = document.querySelector('meta[property="og:title"]');
		const description = document.querySelector(
			'meta[property="og:description"]'
		);
		const image = document.querySelector('meta[property="og:image"]');
		const pageTitle = document.querySelector("title");

		if (title) title.setAttribute("content", product.name);
		if (description)
			description.setAttribute(
				"content",
				product.description || "View product details on Payless4Tech"
			);
		if (image) image.setAttribute("content", product.image_url || " ");
		if (pageTitle) pageTitle.textContent = `${product.name} | Payless4Tech`;
	};

	const fetchProduct = async () => {
		try {
			console.log("Fetching product details for ID:", id);

			// Fetch product from Supabase database (published products)
			const { data: productData, error: productError } = await supabase
				.from("products")
				.select("*")
				.eq("id", id)
				.eq("status", "active") // Only show published products
				.single();

			if (productError) throw productError;

			// Fetch additional images if any
			const { data: imagesData, error: imagesError } = await supabase
				.from("product_images")
				.select("*")
				.eq("product_id", id)
				.order("display_order", { ascending: true });

			if (imagesError) throw imagesError;

			const fullProduct = { 
				...productData, 
				images: imagesData || [],
				status: productData.bizhub_quantity > 0 ? 'active' : 'out_of_stock'
			};
			
			setProduct(fullProduct);
			setSelectedImage(fullProduct.image_url || (imagesData && imagesData[0]?.image_url) || "");

			updateMetaTags(fullProduct);
		} catch (error: any) {
			console.error("Error fetching product:", error);
			toast.error("Error", {
				description: error.message || "Failed to load product details",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddToCart = () => {
		if (product) {
			addItem({
				id: product.id,
				name: product.name,
				price: product.price,
				quantity: 1,
				image_url: product.image_url,
			});
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!product) {
		return <div>Product not found</div>;
	}

	const conditionDisplay = product.condition?.trim() || "New";
	const conditionInfo =
		conditionDefinitions[conditionDisplay as keyof typeof conditionDefinitions];

	const handleOrderSuccess = (data: boolean) => {
		setPreordered(data);
	};

	function parsedetailed_specs(
		specText: string
	): { title: string; items: string[] }[] {
		const sections: { title: string; items: string[] }[] = [];
		const lines = specText
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean);

		let currentSection: { title: string; items: string[] } | null = null;

		for (const line of lines) {
			// if it's a section title (e.g., ends with ":" or is capitalized and short)
			if (/^[A-Z][\w\s&]+:$/.test(line)) {
				if (currentSection) sections.push(currentSection);
				currentSection = { title: line.replace(/:$/, ""), items: [] };
			} else if (currentSection) {
				currentSection.items.push(line);
			}
		}

		if (currentSection) sections.push(currentSection);
		return sections;
	}

	const userDetails = {
		email: session?.user.email ?? "",
		fullName:
			session?.user.user_metadata.full_name || session?.user.user_metadata.name,
		phoneNumber: session?.user.phone ?? "",
		itemType: product.category ?? "",
		specifications: product.detailed_specs ?? undefined,
		productName: product.name ?? "",
	};

	const inCart = state.items.some((cartItems) => cartItems.id === product.id);
	return (
		<>
			<div className="min-h-screen">
				<Header />
				<main className="container mx-auto px-4 py-8">
					<div className="flex justify-between items-center mb-4">
						<Button variant="outline" onClick={() => router.back()}>
							Back
						</Button>
						{/* {session && (
							<Button variant="secondary" onClick={() => setIsEditing(true)}>
								Edit Product
							</Button>
						)} */}
					</div>

					<Card className="p-6">
						<div className="grid md:grid-cols-2 gap-8">
							<div className="space-y-4">
								<div className="aspect-square overflow-hidden rounded-lg">
									<Image
										height={575}
										width={575}
										src={selectedImage || " "}
										alt={product?.name}
										className="w-full h-full object-contain"
									/>
								</div>

								{product?.images && product.images.length > 0 && (
									<div className="grid grid-cols-5 gap-2">
										{[
											product.image_url,
											...product.images.map((img) => img.image_url),
										]
											.filter(Boolean)
											.map((imageUrl, index) => (
												<button
													key={index}
													onClick={() => setSelectedImage(imageUrl)}
													className={`aspect-square rounded-lg overflow-hidden border-2 ${
														selectedImage === imageUrl
															? "border-primary"
															: "border-transparent"
													}`}
												>
													<Image
														priority
														loader={({ src }) => src}
														src={imageUrl || ""}
														alt={`${product.name} view ${index + 1}`}
														className="w-full h-full object-contain"
														width={700}
														height={700}
													/>
												</button>
											))}
									</div>
								)}
							</div>

							<div className="space-y-4">
								<h1 className="text-3xl font-bold">{product?.name}</h1>
								<div className="flex flex-col gap-4">
									<div className="flex items-center gap-2">
										<Badge
											variant="secondary"
											className="capitalize bg-[#FEC6A1] text-gray-800 hover:bg-[#FEC6A1]/90"
										>
											{conditionDisplay}
										</Badge>
										<Badge variant="secondary">{product?.category}</Badge>
									</div>
									{conditionInfo && (
										<div className="bg-[#FFF2E5] p-4 rounded-lg space-y-2">
											<p className="text-sm text-muted-foreground">
												{conditionInfo.definition}
											</p>
											{conditionInfo.hasWarranty && (
												<p className="text-sm text-muted-foreground">
													Comes with a standard 30 days warranty which is
													extendable to 12 months for a fee.{" "}
													<Link
														href="/warranty-policy"
														className="text-blue-400 underline"
													>
														Learn more about our warranty policy
													</Link>
													.
												</p>
											)}
										</div>
									)}
								</div>
								<p className="text-gray-600">{product?.description}</p>

								<div className="flex items-center gap-4">
									<span className="text-2xl font-bold">
										₵{product?.price.toLocaleString()}
									</span>
									{product?.original_price && (
										<span className="text-gray-500 line-through">
											₵{product.original_price.toLocaleString()}
										</span>
									)}
								</div>

								{product.status === "unavailable" ? (
									<Button
										size="sm"
										onClick={() => setIsPreorderFormOpen(true)}
										className={cn(
											"cursor-pointer hover:opacity-90 mr-auto m-0 ml-auto block w-full",
											{
												"bg-green-500 text-white cursor-not-allowed": inCart,
											},
											{
												"bg-orange-500 hover:bg-orange-600":
													product.status === "unavailable",
											}
										)}
										disabled={preordered || inCart}
									>
										{preordered
											? "preordered"
											: inCart
											? "In Cart"
											: "Preorder"}
									</Button>
								) : (
									<Button
										size="sm"
										onClick={() => {
											if (!inCart) {
												handleAddToCart();
											}
										}}
										className={cn(
											"cursor-pointer hover:opacity-90 mr-auto m-0 ml-auto block w-full",
											{
												"bg-green-500 text-white cursor-not-allowed": inCart,
											}
										)}
										disabled={inCart}
									>
										{inCart ? "In Cart" : "Add to Cart"}
									</Button>
								)}
							</div>
						</div>
					</Card>
					<div className="w-full">
						{product?.detailed_specs && (
							<div className="mt-4">
								<h2 className="text-xl font-semibold mb-4">
									Detailed Specifications
								</h2>
								<div className="space-y-6 text-gray-700">
									{parsedetailed_specs(product.detailed_specs).map(
										(section, i) => (
											<Card key={i}>
												<CardContent className="p-4">
													<ul className="list-disc grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 list-inside space-y-1 text-sm text-gray-700">
														{section.items.map((item, idx) => (
															<li key={idx}>{item}</li>
														))}
													</ul>
												</CardContent>
											</Card>
										)
									)}
								</div>
							</div>
						)}
					</div>
				</main>
				<PreorderForm
					handleOrderSuccess={handleOrderSuccess}
					isOpen={isPreorderFormOpen}
					onOpenChange={setIsPreorderFormOpen}
					userDetails={userDetails}
				/>
			</div>
			<Footer /> <WhatsAppButton />
		</>
	);
};

export default ProductDetails;
