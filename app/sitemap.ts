import { supabase } from "@/integrations/supabase/client";
import { MetadataRoute } from "next";

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL;

type changeFrequency =
	| "always"
	| "hourly"
	| "daily"
	| "weekly"
	| "monthly"
	| "yearly"
	| "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const changeFrequency = "weekly" as changeFrequency;

	// Static routes
	const staticRoutes = [
		"",
		"/shop",
		"/laptops",
		"/phones",
		"/consumer-electronics",
		"/about-products",
		"/faq",
		"/warranty-policy",
	].map((route) => ({
		url: `${BETTER_AUTH_URL}${route}`,
		lastModified: new Date(),
		changeFrequency: "monthly" as changeFrequency,
		priority: 0.8,
	}));

	try {
		// Fetch all products from database
		const { data: products, error } = await supabase
			.from("products")
			.select("id, updated_at")
			.eq("status", "available");

		if (error) {
			console.error("Error fetching products for sitemap:", error);
			return [...staticRoutes];
		}

		// Create product routes
		const productRoutes =
			products?.map((product) => ({
				url: `${BETTER_AUTH_URL}/product/${product.id}`,
				lastModified: product.updated_at
					? new Date(product.updated_at)
					: new Date(),
				changeFrequency,
				priority: 1,
			})) || [];

		return [...staticRoutes, ...productRoutes];
	} catch (error) {
		console.error("Error generating sitemap:", error);
		return [...staticRoutes];
	}
}
