import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getProductDetailsById } from "@/lib/product-details";

const getProductUrl = (id: string) => {
	const baseUrl = process.env.BETTER_AUTH_URL || "https://payless4tech.com";
	return `${baseUrl.replace(/\/$/, "")}/product/${id}`;
};

const getBrandName = (
	product: Awaited<ReturnType<typeof getProductDetailsById>>,
) => {
	if (!product) {
		return "Payless4Tech";
	}

	if (product.brand) {
		return product.brand;
	}

	const brandSpec = product.specifications.find(
		(spec) => spec.key.toLowerCase() === "brand",
	);

	return brandSpec?.value || "Payless4Tech";
};

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const product = await getProductDetailsById(id);

	if (!product) {
		return {
			title: "Product Not Found | Payless4Tech",
			description: "The requested product could not be found.",
		};
	}

	const currentPrice = product.price.value;
	const currency = product.price.currency || "GHS";
	const title = `${product.title} | Payless4Tech Ghana`;
	const description = `${product.title} in ${product.condition} condition for ${currency} ${currentPrice.toLocaleString("en-GH")}. Shop Payless4Tech for trusted tech deals in Ghana.`;
	const productUrl = getProductUrl(product.id);

	return {
		title,
		description,
		openGraph: {
			type: "website",
			title,
			description,
			url: productUrl,
			images: product.image ? [{ url: product.image, alt: product.title }] : [],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: product.image ? [product.image] : [],
		},
		alternates: {
			canonical: productUrl,
		},
		other: {
			"og:type": "product",
			"product:price:amount": String(currentPrice),
			"product:price:currency": currency,
		},
	};
}

export default async function ProductPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const product = await getProductDetailsById(id);

	if (!product) {
		notFound();
	}

	const structuredData = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.title,
		description: `${product.title} in ${product.condition} condition, available from Payless4Tech.`,
		image: [product.image, ...(product.additionalImages || [])].filter(Boolean),
		brand: {
			"@type": "Brand",
			name: getBrandName(product),
		},
		offers: {
			"@type": "Offer",
			price: String(product.price.value),
			priceCurrency: product.price.currency || "GHS",
			availability:
				product.estimatedAvailabilityStatus === "OUT_OF_STOCK"
					? "https://schema.org/OutOfStock"
					: "https://schema.org/InStock",
			itemCondition: product.condition.toLowerCase().includes("refurb")
				? "https://schema.org/RefurbishedCondition"
				: product.condition.toLowerCase().includes("used")
					? "https://schema.org/UsedCondition"
					: "https://schema.org/NewCondition",
			url: getProductUrl(product.id),
		},
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(structuredData),
				}}
			/>
			<ProductDetailClient product={product} />
		</>
	);
}
