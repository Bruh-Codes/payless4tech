"use client";
import { useEffect, useState, use } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Trash2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

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
	const session = useSession();
	const { addItem } = useCart();
	const [product, setProduct] = useState<Product | null>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [newImages, setNewImages] = useState<File[]>([]);
	const [isEditing, setIsEditing] = useState(false);

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

			const { data: productData, error: productError } = await supabase
				.from("products")
				.select("*")
				.eq("id", id)
				.single();

			if (productError) throw productError;

			const { data: imagesData, error: imagesError } = await supabase
				.from("product_images")
				.select("*")
				.eq("product_id", id)
				.order("display_order", { ascending: true });

			if (imagesError) throw imagesError;

			console.log("Product data:", productData);
			console.log("Additional images:", imagesData);

			const fullProduct = { ...productData, images: imagesData || [] };
			setProduct(fullProduct);
			setSelectedImage(fullProduct.image_url);

			updateMetaTags(fullProduct);
		} catch (error: any) {
			console.error("Error fetching product:", error);
			toast.error("Error", {
				description: "Failed to load product details",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!session) {
			toast.error("Error", {
				description: "You must be logged in to upload images",
			});
			return;
		}

		const files = Array.from(e.target.files || []);
		const currentImageCount = (product?.images?.length || 0) + newImages.length;

		if (currentImageCount + files.length > 5) {
			toast.error("Error", {
				description: "Maximum 5 images allowed per product",
			});
			return;
		}

		setNewImages([...newImages, ...files]);
	};

	const handleSaveImages = async () => {
		if (!session || !product) return;

		setIsLoading(true);
		try {
			for (const file of newImages) {
				const fileExt = file.name.split(".").pop();
				const fileName = `${Math.random()}.${fileExt}`;

				const { error: uploadError, data } = await supabase.storage
					.from("product-images")
					.upload(fileName, file);

				if (uploadError) throw uploadError;

				const {
					data: { publicUrl },
				} = supabase.storage.from("product-images").getPublicUrl(fileName);

				const { error: insertError } = await supabase
					.from("product_images")
					.insert({
						product_id: product.id,
						image_url: publicUrl,
						display_order: (product.images?.length || 0) + 1,
					});

				if (insertError) throw insertError;
			}

			toast("Success", {
				description: "Images uploaded successfully",
			});

			setNewImages([]);
			fetchProduct();
		} catch (error: any) {
			console.error("Error uploading images:", error);
			toast.error("Error", {
				description: error.message || "Failed to upload images",
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

	const handleDelete = async () => {
		if (!product || !session) return;

		try {
			setIsLoading(true);

			// First, delete any related sale_items
			const { error: saleItemsError } = await supabase
				.from("sale_items")
				.delete()
				.eq("product_id", product.id);

			if (saleItemsError) throw saleItemsError;

			// Then delete any related images from storage
			if (product.image_url) {
				const mainImagePath = product.image_url.split("/").pop();
				if (mainImagePath) {
					await supabase.storage.from("product-images").remove([mainImagePath]);
				}
			}

			if (product.images && product.images.length > 0) {
				const additionalImagePaths = product.images
					.map((img) => img.image_url.split("/").pop())
					.filter(Boolean);

				if (additionalImagePaths.length > 0) {
					await supabase.storage
						.from("product-images")
						.remove(additionalImagePaths as string[]);
				}
			}

			// Delete additional images records
			if (product.images && product.images.length > 0) {
				const { error: deleteImagesError } = await supabase
					.from("product_images")
					.delete()
					.eq("product_id", product.id);

				if (deleteImagesError) throw deleteImagesError;
			}

			// Finally delete the product
			const { error: deleteError } = await supabase
				.from("products")
				.delete()
				.eq("id", product.id);

			if (deleteError) throw deleteError;

			toast("Success", {
				description: "Product deleted successfully",
			});

			router.push("/admin");
		} catch (error: any) {
			console.error("Error deleting product:", error);
			toast.error("Error", {
				description: error.message || "Failed to delete product",
			});
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!product) {
		return <div>Product not found</div>;
	}

	if (isEditing) {
		return (
			<div className="min-h-screen">
				<Header />
				<main className="container mx-auto px-4 py-8">
					<div className="flex justify-between items-center mb-4">
						<Button variant="outline" onClick={() => setIsEditing(false)}>
							Cancel Editing
						</Button>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">
									<Trash2 className="mr-2 h-4 w-4" />
									Delete Product
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete Product</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to delete this product? This action
										cannot be undone and will remove all associated images and
										data.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDelete}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</main>
			</div>
		);
	}

	const conditionDisplay = product.condition?.trim() || "New";
	const conditionInfo =
		conditionDefinitions[conditionDisplay as keyof typeof conditionDefinitions];

	return (
		<>
			<div className="min-h-screen">
				<Header />
				<main className="container mx-auto px-4 py-8">
					<div className="flex justify-between items-center mb-4">
						<Button variant="outline" onClick={() => router.back()}>
							Back
						</Button>
						{session && (
							<Button variant="secondary" onClick={() => setIsEditing(true)}>
								Edit Product
							</Button>
						)}
					</div>

					<Card className="p-6">
						<div className="grid md:grid-cols-2 gap-8">
							<div className="space-y-4">
								<div className="aspect-square overflow-hidden rounded-lg">
									<img
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

								{session && (
									<div className="space-y-2">
										<Input
											type="file"
											accept="image/*"
											multiple
											onChange={handleImageUpload}
											disabled={isLoading}
										/>
										{newImages.length > 0 && (
											<Button onClick={handleSaveImages} disabled={isLoading}>
												{isLoading ? "Uploading..." : "Save Images"}
											</Button>
										)}
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
										<div className="bg-secondary/10 p-4 rounded-lg space-y-2">
											<p className="text-sm text-muted-foreground">
												{conditionInfo.definition}
											</p>
											{conditionInfo.hasWarranty && (
												<p className="text-sm text-muted-foreground">
													Comes with a standard 30 days warranty which is
													extendable to 12 months for a fee.{" "}
													<Link
														href="/warranty-policy"
														className="text-primary hover:underline"
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

								{product?.detailed_specs && (
									<div className="mt-4">
										<h2 className="text-xl font-semibold mb-2">
											Detailed Specifications
										</h2>
										<ul className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-gray-600">
											{product.detailed_specs
												.slice(0, product.detailed_specs.length - 1)
												.split("\n\n")
												.map((spec, index) => (
													<li
														key={index}
														className="whitespace-pre-wrap list-disc"
													>
														{spec}
													</li>
												))}
										</ul>
									</div>
								)}

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

								<Button onClick={handleAddToCart} className="w-full" size="lg">
									<ShoppingCart className="mr-2" />
									Add to Cart
								</Button>
							</div>
						</div>
					</Card>
				</main>
			</div>
			<Footer /> <WhatsAppButton />
		</>
	);
};

export default ProductDetails;
