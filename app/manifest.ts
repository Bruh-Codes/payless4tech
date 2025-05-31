import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Payless4Tech",
		short_name: "payless4tech",
		description:
			"Affordable Renewed Laptops You Can Trust. Pre-order from the USA or buy in-store at Payless4Tech",
		start_url: "/",
		display: "standalone",
		background_color: "#f0f4f8",
		theme_color: "#343434",
		scope: "/",
		screenshots: [
			{
				src: "/pwa1.png",
				type: "image/png",
				sizes: "1886x824",
				form_factor: "wide",
			},
		],
		icons: [
			{
				src: "/app.png",
				sizes: "200x200",
				type: "image/png",
			},
		],
	};
}
