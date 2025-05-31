import { MetadataRoute } from "next";
const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

type changeFrequency =
	| "always"
	| "hourly"
	| "daily"
	| "weekly"
	| "monthly"
	| "yearly"
	| "never";

export default function sitemap(): MetadataRoute.Sitemap {
	const changeFrequency = "monthly" as changeFrequency;
	const routes = [
		"",
		"/shop",
		"/laptops",
		"/phones",
		"/consumer-electronics",
		"/about-products",
		"/faq",
	].map((route) => ({
		url: `${NEXT_PUBLIC_SITE_URL}${route}`,
		lastModified: new Date(),
		changeFrequency,
		priority: 1,
	}));
	return [...routes];
}
