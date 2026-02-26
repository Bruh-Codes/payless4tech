import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
	/* config options here */
	typescript: {
		ignoreBuildErrors: true,
	},
	/* pg removed - using API proxy instead */
	images: {
		remotePatterns: [
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
	},
};

export const pwaConfig = withPWA({
	// disable: process.env.NODE_ENV === "development",
	dest: "public",
	register: true,
	skipWaiting: true,
});

export default nextConfig;
