"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { SidebarFilter } from "@/components/SidebarFilter";
import { PreorderForm } from "@/components/PreorderForm";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useSearchParams } from "next/navigation";

const Shop = () => {
	const [isPreorderFormOpen, setIsPreorderFormOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const searchParams = useSearchParams();
	const brandParam = searchParams.get("brand");
	const [selectedBrand, setSelectedBrand] = useState<string | null>(brandParam);

	const handleFilterChange = (
		category: string | null,
		brand: string | null
	) => {
		setSelectedCategory(category);
		setSelectedBrand(brand);
	};

	return (
		<>
			<div className="min-h-screen">
				<Header />

				<main className="container mx-auto py-8">
					<div className="flex flex-col lg:flex-row gap-5">
						<aside className="w-full md:w-64 px-4">
							<SidebarFilter
								selectedCategory={selectedCategory}
								selectedBrand={selectedBrand}
								onFilterChange={handleFilterChange}
							/>
						</aside>
						<div className="flex-1 w-full">
							<ProductGrid
								className="lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
								category={selectedCategory}
								brandFilter={selectedBrand}
							/>
						</div>
					</div>

					{/* Preorder CTA Section */}
					<div className="w-full bg-primary/5 shadow-lg animate-fadeIn mt-8">
						<div className="container mx-auto px-4 py-6 md:py-8 flex flex-col items-center justify-center space-y-4 text-center">
							<p className="text-lg md:text-xl font-medium text-gray-800 max-w-2xl mx-auto leading-relaxed">
								Can't see the gadget or specification you need? Preorder
								directly from the USA and receive your purchase within 21 days!
							</p>
							<Button
								variant="secondary"
								size="lg"
								onClick={() => setIsPreorderFormOpen(true)}
								className="bg-[#F97316] text-white font-bold px-8 py-3 rounded-lg 
                       transition-all duration-300 
                       hover:bg-[#F56E00] hover:scale-105 hover:shadow-lg 
                       active:scale-95
                       animate-fadeIn"
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

export default Shop;
