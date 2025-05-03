"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProductFormData {
	name: string;
	description: string;
	price: string;
	condition: string;
	originalPrice: string;
	category: string;
	image: File | null;
	additionalImages: File[];
	detailedSpecs: string;
}

interface UseProductFormProps {
	productId?: string;
	isEditing?: boolean;
	onProductAdded?: () => void;
}

export const useProductForm = ({
	productId,
	isEditing = false,
	onProductAdded,
}: UseProductFormProps) => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [session, setSession] = useState<any>(null);
	const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
	const [existingAdditionalImages, setExistingAdditionalImages] = useState<
		{ id: string; image_url: string }[]
	>([]);
	const [newProduct, setNewProduct] = useState<ProductFormData>({
		name: "",
		description: "",
		price: "",
		condition: "",
		category: "",
		image: null,
		additionalImages: [],
		originalPrice: "",
		detailedSpecs: "",
	});

	useEffect(() => {
		checkAuth();
		if (isEditing && productId) {
			loadExistingProduct();
		}
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			if (!session) {
				router.push("/");
			}
		});

		return () => subscription.unsubscribe();
	}, [router.push, productId, isEditing]);

	const checkAuth = async () => {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		setSession(session);
		if (!session) {
			toast.error("Unauthorized", {
				description: "Please login to access this page",
			});
			router.push("/");
		}
	};

	const loadExistingProduct = async () => {
		if (!productId) return;

		try {
			console.log("Loading product with ID:", productId);

			const { data: product, error: productError } = await supabase
				.from("products")
				.select("*")
				.eq("id", productId)
				.single();

			if (productError) throw productError;

			const { data: additionalImages, error: imagesError } = await supabase
				.from("product_images")
				.select("*")
				.eq("product_id", productId)
				.order("display_order", { ascending: true });

			if (imagesError) throw imagesError;

			console.log("Loaded product data:", product);
			console.log("Loaded additional images:", additionalImages);

			if (product) {
				setExistingImageUrl(product.image_url);
				setExistingAdditionalImages(additionalImages || []);
				setNewProduct({
					name: product.name || "",
					description: product.description || "",
					price: product.price.toString(),
					condition: product.condition || "",
					category: product.category || "",
					image: null,
					additionalImages: [],
					originalPrice: product.original_price
						? product.original_price.toString()
						: "",
					detailedSpecs: product.detailed_specs || "",
				});
			}
		} catch (error: any) {
			console.error("Error loading product:", error);
			toast.error("Error", {
				description: "Failed to load product details",
			});
		}
	};

	const handleFormChange = (
		field: keyof ProductFormData,
		value: string | File | null | File[]
	) => {
		setNewProduct((prev) => ({ ...prev, [field]: value }));
	};

	const deleteImageFromStorage = async (imageUrl: string) => {
		const path = imageUrl.split("/").pop();
		if (!path) return;

		const { error } = await supabase.storage
			.from("product-images")
			.remove([path]);

		if (error) {
			console.error("Error deleting image from storage:", error);
			throw error;
		}
	};

	const handleDeleteMainImage = async () => {
		if (!existingImageUrl || !productId) return;

		try {
			setIsLoading(true);
			await deleteImageFromStorage(existingImageUrl);

			const { error: updateError } = await supabase
				.from("products")
				.update({ image_url: null })
				.eq("id", productId);

			if (updateError) throw updateError;

			setExistingImageUrl(null);
			toast("Success", {
				description: "Main image deleted successfully",
			});
		} catch (error: any) {
			console.error("Error deleting main image:", error);
			toast.error("Error", {
				description: "Failed to delete main image",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteAdditionalImage = async (imageId: string) => {
		try {
			setIsLoading(true);
			const imageToDelete = existingAdditionalImages.find(
				(img) => img.id === imageId
			);
			if (!imageToDelete) return;

			await deleteImageFromStorage(imageToDelete.image_url);

			const { error: deleteError } = await supabase
				.from("product_images")
				.delete()
				.eq("id", imageId);

			if (deleteError) throw deleteError;

			setExistingAdditionalImages((prev) =>
				prev.filter((img) => img.id !== imageId)
			);
			toast("Success", {
				description: "Additional image deleted successfully",
			});
		} catch (error: any) {
			console.error("Error deleting additional image:", error);
			toast.error("Error", {
				description: "Failed to delete additional image",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const uploadImage = async (file: File) => {
		const fileExt = file.name.split(".").pop();
		const fileName = `${Math.random()}.${fileExt}`;

		const { error: uploadError, data } = await supabase.storage
			.from("product-images")
			.upload(fileName, file);

		if (uploadError) throw uploadError;

		const {
			data: { publicUrl },
		} = supabase.storage.from("product-images").getPublicUrl(fileName);

		return publicUrl;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!session) {
			toast.error("Error", {
				description: "You must be logged in to manage products",
			});
			return;
		}

		setIsLoading(true);

		try {
			let mainImageUrl = existingImageUrl;
			let additionalImageUrls: string[] = [];

			if (newProduct.image) {
				mainImageUrl = await uploadImage(newProduct.image);
			}

			if (newProduct.additionalImages.length > 0) {
				additionalImageUrls = await Promise.all(
					newProduct.additionalImages.map(uploadImage)
				);
			}

			const productData = {
				name: newProduct.name,
				description: newProduct.description,
				price: parseFloat(newProduct.price),
				condition: newProduct.condition,
				category: newProduct.category,
				original_price: newProduct.originalPrice
					? parseFloat(newProduct.originalPrice)
					: null,
				detailed_specs: newProduct.detailedSpecs || null,
				...(mainImageUrl && { image_url: mainImageUrl }),
			};

			let error;

			if (isEditing && productId) {
				const { error: updateError } = await supabase
					.from("products")
					.update(productData)
					.eq("id", productId);
				error = updateError;

				if (!error && additionalImageUrls.length > 0) {
					const { error: imageError } = await supabase
						.from("product_images")
						.insert(
							additionalImageUrls.map((url, index) => ({
								product_id: productId,
								image_url: url,
								display_order:
									(existingAdditionalImages.length || 0) + index + 1,
							}))
						);

					if (imageError) throw imageError;
				}
			} else {
				const { error: insertError, data } = await supabase
					.from("products")
					.insert([productData])
					.select()
					.single();
				error = insertError;

				if (!error && data && additionalImageUrls.length > 0) {
					const { error: imageError } = await supabase
						.from("product_images")
						.insert(
							additionalImageUrls.map((url, index) => ({
								product_id: data.id,
								image_url: url,
								display_order: index + 1,
							}))
						);

					if (imageError) throw imageError;
				}
			}

			if (error) throw error;

			toast("Success", {
				description: isEditing
					? "Product updated successfully"
					: "Product added successfully",
			});

			if (onProductAdded) {
				onProductAdded();
			}

			if (isEditing) {
				router.push(`/product/${productId}`);
			} else {
				setNewProduct({
					name: "",
					description: "",
					price: "",
					condition: "",
					category: "",
					image: null,
					additionalImages: [],
					originalPrice: "",
					detailedSpecs: "",
				});
			}
		} catch (error: any) {
			console.error("Error details:", error);
			toast.error("Error", {
				description:
					error.message ||
					(isEditing ? "Failed to update product" : "Failed to add product"),
			});
		} finally {
			setIsLoading(false);
		}
	};

	return {
		newProduct,
		isLoading,
		session,
		existingImageUrl,
		existingAdditionalImages,
		handleFormChange,
		handleSubmit,
		handleDeleteMainImage,
		handleDeleteAdditionalImage,
	};
};
