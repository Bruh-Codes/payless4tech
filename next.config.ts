import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
	/* config options here */
	typescript: {
		ignoreBuildErrors: true,
	},
	serverExternalPackages: ['pg', 'pg-connection-string', 'pg-pool', 'pg-protocol'],
	webpack: (config, { isServer }) => {
		if (!isServer) {
			// Don't try to bundle these Node.js modules on the client
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				net: false,
				tls: false,
				dns: false,
				pg: false,
				'pg-native': false,
			};
		}
		return config;
	},
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
