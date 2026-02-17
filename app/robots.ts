import { MetadataRoute } from "next";

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL;

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			disallow: "/private/",
		},
		sitemap: `${BETTER_AUTH_URL}/sitemap.xml`,
	};
}
