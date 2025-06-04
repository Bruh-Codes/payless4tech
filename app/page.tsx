"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { Map } from "@/components/Map";
import { SocialMediaLinks } from "@/components/SocialMediaLinks";
import { PreorderForm } from "@/components/PreorderForm";
import { Button } from "@/components/ui/button";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { TrustSection } from "@/components/TrustSection";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import Link from "next/link";

const Page = () => {
	const [isPreorderFormOpen, setIsPreorderFormOpen] = useState(false);

	return (
		<>
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-grow">
					{/* Custom Hero Section */}
					<section className="relative h-[85vh] overflow-hidden">
						{/* Background Image */}
						<div className="absolute inset-0 z-0">
							<img
								src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
								alt="Laptop background"
								className="w-full h-full object-cover brightness-[0.6]"
							/>
						</div>

						{/* Hero Content */}
						<div className="relative h-full z-10 flex flex-col items-center justify-center text-white p-6 md:p-12">
							<div className="max-w-4xl text-center animate-fadeIn">
								<h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight">
									Affordable Gadgets You Can Trust
								</h1>
								<p className="text-xl md:text-2xl mb-10 md:mb-12 text-white/90">
									Pre-order from the USA or buy in-store at Payless4Tech
								</p>
								<div className="flex items-center gap-5 justify-center ">
									<Link href={"/shop"}>
										<Button
											size="lg"
											className="bg-sky-500 cursor-pointer hover:bg-sky-500/90 text-white font-bold group button-animation"
										>
											Shop Now
										</Button>
									</Link>

									<Button
										onClick={() => setIsPreorderFormOpen(true)}
										size="lg"
										className="bg-[#F97316] cursor-pointer hover:bg-[#F97316]/90 text-white font-bold "
									>
										Pre order Now!
									</Button>
								</div>
							</div>
						</div>
					</section>

					{/* Featured Categories Section */}
					<FeaturedCategories />

					{/* Trust Section */}
					<TrustSection />

					{/* Laptop Products Section */}
					<section className="py-20">
						<div className="container mx-auto px-4">
							<h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
								Featured Laptops
							</h2>
							<ProductGrid category="laptops" limit={8} />
						</div>
					</section>

					<Map />
					<SocialMediaLinks />

					{/* Preorder CTA Section */}
					<div className="w-full bg-primary/5 shadow-lg animate-fadeIn py-10">
						<div className="container mx-auto px-4 py-6 md:py-8 flex flex-col items-center justify-center space-y-6 text-center">
							<p className="text-lg md:text-xl font-medium text-gray-800 max-w-2xl mx-auto leading-relaxed">
								Can't see the gadget or specification you need? Preorder
								directly from the USA and receive your purchase within 21 days!
							</p>
							<Button
								variant="secondary"
								size="lg"
								onClick={() => setIsPreorderFormOpen(true)}
								className="bg-[#F97316] text-white hover:bg-[#F97316]/80 font-bold px-8 py-3 rounded-lg button-animation"
							>
								Preorder Now
							</Button>
						</div>
					</div>

					<PreorderForm
						isOpen={isPreorderFormOpen}
						onOpenChange={setIsPreorderFormOpen}
					/>
				</main>
			</div>
			<Footer /> <WhatsAppButton />
		</>
	);
};

export default Page;
