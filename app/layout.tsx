import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/theme-provider";
import icon from "@/public/app.png";
import openGraphImage from "@/app/opengraph-image.png";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import QueryProvider from "@/components/QueryProvider";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loading, LoadingSpinner } from "@/components/LoadingSkeletons";

// Dynamically import React Query DevTools only in development
const ReactQueryDevtools = dynamic(() =>
	import("@tanstack/react-query-devtools").then((mod) => ({
		default: mod.ReactQueryDevtools,
	})),
);

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin", "greek", "cyrillic"],
});

export const metadata: Metadata = {
	title: "Payless4Tech — Smart Gadgets, Smarter Prices",
	icons: [icon.src],
	description:
		"Discover unbeatable deals on laptops, phones, and electronics at Payless4Tech. Trusted by tech lovers for quality, affordability, and fast delivery across Ghana and beyond.",
	openGraph: {
		url: "https://payless4tech.com",
		type: "website",
		siteName: "Payless4Tech",
		title: "Payless4Tech — Smart Gadgets, Smarter Prices",
		description:
			"Shop the latest laptops, phones, and electronics with Payless4Tech.",
		emails: ["joy@payless4tech.com"],
		images: [openGraphImage.src],
	},
	twitter: {
		card: "summary_large_image",
		title: "Payless4Tech — Smart Gadgets, Smarter Prices",
		description:
			"Shop the latest laptops, phones, and electronics with Payless4Tech.",
		images: [openGraphImage.src],
	},
	category: "electronics",
	keywords: [
		"laptops",
		"phones",
		"electronics",
		"smart gadgets",
		"smart prices",
	],
	metadataBase: new URL(process.env.BETTER_AUTH_URL as string),
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.variable} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
					<NextTopLoader
						color="#FF8904"
						initialPosition={0.04}
						crawlSpeed={300}
						height={2}
						crawl={true}
						easing="ease"
						speed={350}
						shadow="0 0 10px #FF8904,0 0 5px #FF8904"
						zIndex={9999}
					/>
					<QueryProvider>
						<CartProvider>{children}</CartProvider>
						<WhatsAppButton />
						<Toaster richColors />
						{process.env.NODE_ENV === "development" && (
							<Suspense fallback={<Loading />}>
								<ReactQueryDevtools />
							</Suspense>
						)}
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
