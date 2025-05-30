import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
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
		],
	},
};

export default nextConfig;
