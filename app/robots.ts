import { MetadataRoute } from "next";

const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			disallow: "/private/",
		},
		sitemap: `${NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
	};
}
