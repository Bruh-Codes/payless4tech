import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
	turbopack: {},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "i.ebayimg.sandbox.ebay.com",
			},
			{
				protocol: "http",
				hostname: "i.ebayimg.sandbox.ebay.com",
			},
			{
				protocol: "https",
				hostname: "i.ebayimg.com",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "www.awesomescreenshot.com",
			},
			{
				protocol: "https",
				hostname: "unsplash.com",
			},

			{
				protocol: "https",
				hostname: "ntudizdvtyhhrxpafuyj.supabase.co",
			},
			{
				protocol: "https",
				hostname: "www.apple.com",
			},
			{
				protocol: "https",
				hostname: "media.wired.com",
			},
			{
				protocol: "https",
				hostname: "upload.wikimedia.org",
			},
		],
		formats: ["image/webp", "image/avif"],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
	},
};

const withConfiguredPWA = withPWA({
	disable: process.env.NODE_ENV === "development",
	dest: "public",
	register: true,
	skipWaiting: true,
}) as unknown as (config: NextConfig) => NextConfig;

export default withConfiguredPWA(nextConfig);
