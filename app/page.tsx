import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ProductCardSkeleton } from "@/components/LoadingSkeletons";

import Navbar from "@/components/navbar";
import Hero from "@/components/Hero";
import PaymentSuccessHandler from "@/components/PaymentSuccessHandler";

// Dynamic imports for better bundle splitting
const Footer = dynamic(() => import("@/components/Footer"), { ssr: true });
const Categories = dynamic(() => import("@/components/ui/categories"), {
	ssr: true,
});
const FeaturedProducts = dynamic(
	() => import("@/components/ui/featured-products"),
	{ ssr: true },
);
const NewArrivals = dynamic(() => import("@/components/ui/new-arrivals"), {
	loading: () => (
		<section className="py-16 bg-muted/30">
			<div className="mx-auto max-w-7xl  sm:px-6 lg:px-8 px-4">
				<div className="mb-10 text-center">
					<div className="h-8 w-32 bg-muted animate-pulse rounded-md mx-auto mb-2" />
					<div className="h-4 w-48 bg-muted animate-pulse rounded-md mx-auto" />
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{Array.from({ length: 4 }).map((_, i) => (
						<ProductCardSkeleton key={i} />
					))}
				</div>
			</div>
		</section>
	),
	ssr: true,
});
const WhyChooseUs = dynamic(() => import("@/components/why-choose-us"), {
	ssr: true,
});
const PreorderSection = dynamic(() => import("@/components/PreorderSection"), {
	ssr: true,
});

const Page = () => {
	return (
		<>
			<div className="min-h-screen bg-background">
				<Suspense fallback={null}>
					<PaymentSuccessHandler />
				</Suspense>
				<Navbar />
				<Hero />
				<Categories />
				<FeaturedProducts />
				<NewArrivals />
				<WhyChooseUs />
				<PreorderSection />
				<Footer />
			</div>
		</>
	);
};

export default Page;
