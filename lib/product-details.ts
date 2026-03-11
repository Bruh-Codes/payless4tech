import "server-only";

import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { getEbayProductById } from "@/lib/ebay-server";

export interface ProductDetailData {
	id: string;
	title: string;
	price: { value: number; currency: string };
	originalPrice?: { value: number; currency: string };
	image: string;
	categoryId?: string;
	additionalImages: string[];
	category: string;
	condition: string;
	shipping: string;
	seller: string;
	itemUrl: string;
	isPreorder: boolean;
	estimatedAvailabilityStatus?: string;
	itemEndDate?: string;
	itemGroupId?: string;
	specifications: Array<{ key: string; value: string }>;
	brand?: string;
}

const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getProductDetailsById = cache(async function getProductDetailsById(
	itemId: string,
): Promise<ProductDetailData | null> {
	if (!itemId) {
		return null;
	}

	if (UUID_PATTERN.test(itemId)) {
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseKey =
			process.env.SUPABASE_SERVICE_ROLE_KEY ||
			process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

		if (!supabaseUrl || !supabaseKey) {
			throw new Error("Supabase credentials are not configured.");
		}

		const supabase = createClient(supabaseUrl, supabaseKey);

		const { data: productData, error: productError } = await supabase
			.from("products")
			.select("*")
			.eq("id", itemId)
			.single();

		if (productError || !productData) {
			return null;
		}

		const { data: imagesData } = await supabase
			.from("product_images")
			.select("*")
			.eq("product_id", itemId)
			.order("display_order", { ascending: true });

		const additionalImages =
			imagesData?.map((img: { image_url: string }) => img.image_url) || [];

		let specifications: Array<{ key: string; value: string }> = [];
		if (productData.detailed_specs) {
			try {
				const parsedSpecs = JSON.parse(productData.detailed_specs);
				specifications = Array.isArray(parsedSpecs)
					? parsedSpecs
					: [{ key: "Details", value: productData.detailed_specs }];
			} catch {
				specifications = [
					{ key: "Details", value: productData.detailed_specs },
				];
			}
		}

		return {
			id: productData.id,
			title: productData.name,
			price: { value: productData.price || 0, currency: "GHS" },
			originalPrice: productData.original_price
				? { value: Number(productData.original_price), currency: "GHS" }
				: undefined,
			image: productData.image_url || "",
			categoryId: productData.category,
			additionalImages: additionalImages.filter(Boolean),
			category: productData.category,
			condition: productData.condition || "Unknown",
			shipping: "Within 24hrs",
			seller: "Payless4tech",
			itemUrl: "",
			isPreorder: productData.status === "pre-order",
			estimatedAvailabilityStatus:
				productData.stock > 0 || productData.status === "pre-order"
					? "IN_STOCK"
					: "OUT_OF_STOCK",
			specifications,
		};
	}

	const product = await getEbayProductById(itemId);

	if (!product) {
		return null;
	}

	if (product.estimatedAvailabilityStatus === "OUT_OF_STOCK") {
		return null;
	}

	if (product.itemEndDate) {
		const endDate = new Date(product.itemEndDate);
		if (endDate < new Date()) {
			return null;
		}
	}

	return product as ProductDetailData;
});
