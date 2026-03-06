import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
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
import { Loading } from "@/components/LoadingSkeletons";
import { GoogleAnalyticsPageView } from "@/components/GoogleAnalyticsPageView";
import { MetaPixelPageView } from "@/components/MetaPixelPageView";

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
	const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
	const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://www.googletagmanager.com" />
				<link rel="preconnect" href="https://connect.facebook.net" />
				<link rel="dns-prefetch" href="https://www.googletagmanager.com" />
				{/* Preload the first Hero image - adjust as per the first slide in Hero.tsx */}
				<link
					rel="preload"
					as="image"
					href="/images/hero/hero__cvgr5aj1ttsi_large_2x.webp"
					type="image/webp"
				/>
			</head>
			<body className={`${inter.variable} antialiased m-0 p-0`}>
				{googleAnalyticsId && (
					<>
						<Script
							src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
							strategy="lazyOnload"
						/>
						<Script id="google-analytics" strategy="lazyOnload">
							{`
								window.dataLayer = window.dataLayer || [];
								function gtag(){dataLayer.push(arguments);}
								window.gtag = gtag;
								gtag('js', new Date());
								gtag('config', '${googleAnalyticsId}', { send_page_view: false });
							`}
						</Script>
					</>
				)}
				{metaPixelId && (
					<>
						<Script id="meta-pixel" strategy="lazyOnload">
							{`
								!function(f,b,e,v,n,t,s){
									if(f.fbq)return;n=f.fbq=function(){n.callMethod?
									n.callMethod.apply(n,arguments):n.queue.push(arguments)};
									if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
									n.queue=[];t=b.createElement(e);t.async=!0;
									t.src=v;s=b.getElementsByTagName(e)[0];
									s.parentNode.insertBefore(t,s)
								}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
								fbq('init', '${metaPixelId}');
							`}
						</Script>
						<noscript>
							<img
								height="1"
								width="1"
								style={{ display: "none" }}
								src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
								alt=""
							/>
						</noscript>
					</>
				)}
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem={false}
					disableTransitionOnChange
					storageKey="theme"
				>
					<NextTopLoader
						color="#693ad4"
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
						<CartProvider>
							<Suspense fallback={null}>
								{googleAnalyticsId && (
									<GoogleAnalyticsPageView measurementId={googleAnalyticsId} />
								)}
								{metaPixelId && <MetaPixelPageView />}
							</Suspense>
							<main>{children}</main>
						</CartProvider>
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
