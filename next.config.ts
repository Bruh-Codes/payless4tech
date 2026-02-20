import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
	/* config options here */
	typescript: {
		ignoreBuildErrors: true,
	},
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
				hostname: "unsplash.com",
			},
			{
				protocol: "https",
				hostname: "vqqaszvcbtyohpjbcijw.supabase.co",
			},
			{
				protocol: "https",
				hostname: "unkoharlhghudncqhldz.supabase.co",
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

export const pwaConfig = withPWA({
	// disable: process.env.NODE_ENV === "development",
	dest: "public",
	register: true,
	skipWaiting: true,
});

export default nextConfig;
