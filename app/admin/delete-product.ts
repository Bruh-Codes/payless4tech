"use client";

import { supabase } from "@/integrations/supabase/client";

function getStoragePath(imageUrl: string) {
	const marker = "/storage/v1/object/public/product-images/";
	const [, path = ""] = imageUrl.split(marker);
	return path.replace(/^product-images\//, "");
}

export async function deleteProductWithAssets(productId: string) {
	const { data: productData, error: productError } = await supabase
		.from("products")
		.select("image_url")
		.eq("id", productId)
		.single();

	if (productError) {
		throw new Error("Failed to fetch product for deletion");
	}

	const { data: additionalImages, error: additionalImagesError } = await supabase
		.from("product_images")
		.select("id, image_url")
		.eq("product_id", productId);

	if (additionalImagesError) {
		throw new Error("Failed to fetch additional product images");
	}

	const storagePaths = [
		productData?.image_url ? getStoragePath(productData.image_url) : "",
		...(additionalImages || []).map((image) => getStoragePath(image.image_url || "")),
	].filter(Boolean);

	if (storagePaths.length > 0) {
		const { error: storageError } = await supabase.storage
			.from("product-images")
			.remove(storagePaths);

		if (storageError) {
			throw new Error("Failed to delete product image files");
		}
	}

	const { error: additionalImageDeleteError } = await supabase
		.from("product_images")
		.delete()
		.eq("product_id", productId);

	if (additionalImageDeleteError) {
		throw new Error("Failed to delete additional product image records");
	}

	const { error: productDeleteError } = await supabase
		.from("products")
		.delete()
		.eq("id", productId);

	if (productDeleteError) {
		throw new Error("Failed to delete product");
	}
}
