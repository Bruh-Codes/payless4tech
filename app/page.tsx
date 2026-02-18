"use client";

import { useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { ProductGridSkeleton } from "@/components/LoadingSkeletons";

// Dynamic imports for better bundle splitting
const Footer = dynamic(() => import("@/components/Footer"));
const Hero = dynamic(() => import("@/components/Hero"));
const Navbar = dynamic(() => import("@/components/navbar"));
const Categories = dynamic(() => import("@/components/ui/categories"));
const FeaturedProducts = dynamic(
	() => import("@/components/ui/featured-products"),
	{
		loading: () => (
			<section className="py-16">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-10">
						<div className="h-8 w-48 bg-muted animate-pulse rounded-md mb-2" />
						<div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
					</div>
					<ProductGridSkeleton count={4} />
				</div>
			</section>
		),
	},
);
const NewArrivals = dynamic(() => import("@/components/ui/new-arrivals"), {
	loading: () => (
		<section className="py-16 bg-muted/30">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-10 text-center">
					<div className="h-8 w-32 bg-muted animate-pulse rounded-md mx-auto mb-2" />
					<div className="h-4 w-48 bg-muted animate-pulse rounded-md mx-auto" />
				</div>
				<ProductGridSkeleton count={4} />
			</div>
		</section>
	),
});
const WhyChooseUs = dynamic(() => import("@/components/why-choose-us"));
const PreorderSection = dynamic(() => import("@/components/PreorderSection"));

const Page = () => {
	const searchParams = useSearchParams();
	const { clearCart } = useCart();

	const handlePaymentSuccess = useCallback(() => {
		const paymentSuccess = searchParams.get("payment_success");
		const reference = searchParams.get("reference");

		if (paymentSuccess === "true" && reference) {
			// Clear the cart on payment success
			clearCart();

			toast.success("Payment successful!", {
				description: `Transaction ID: ${reference}. You can track your order status in "My Orders" from your profile menu.`,
				duration: 6000,
			});

			// Clean up URL parameters
			window.history.replaceState({}, "", window.location.pathname);
		}
	}, [searchParams, clearCart]);

	useEffect(() => {
		handlePaymentSuccess();
	}, [handlePaymentSuccess]);

	return (
		<>
			<div className="min-h-screen bg-background">
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
