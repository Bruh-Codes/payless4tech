"use client";

import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { Map } from "@/components/Map";
import { SocialMediaLinks } from "@/components/SocialMediaLinks";
import { PreorderForm } from "@/components/PreorderForm";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { TrustSection } from "@/components/TrustSection";
import heroImage from "@/public/hero.jpg";
import SlideShow from "@/components/Swiper";
import JBL from "@/public/jbl.jpg";
import JBL2 from "@/public/jbl2.jpg";
import JBL3 from "@/public/jbl3.jpg";
import JBL4 from "@/public/jbl4.jpg";
import ps5 from "@/public/ps5.jpg";

const Index = () => {
    const [isPreorderFormOpen, setIsPreorderFormOpen] = useState(false);
    const productsRef = useRef<HTMLDivElement>(null);

    const scrollToProducts = () => {
        productsRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const slides = [
        { img: heroImage, alt: "" },
        { img: JBL, alt: "" },
        { img: JBL2, alt: "" },
        { img: JBL3, alt: "" },
        { img: JBL4, alt: "" },
        { img: ps5, alt: "" },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                {/* Custom Hero Section */}
                <section className="relative h-screen overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute w-full inset-0 z-0">
                        <SlideShow slides={slides} />
                    </div>

                    {/* Hero Content */}
                    <div className="relative h-full z-10 flex flex-col items-center justify-center text-white p-6 md:p-12">
                        <div className="max-w-4xl text-center animate-fadeIn">
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                Affordable Renewed Products You Can Trust
                            </h1>
                            <p className="text-xl font-semibold max-w-md mx-auto md:text-2xl mb-10 md:mb-12 text-orange-300">
                                Pre-order from the USA or buy in-store at Payless4Tech
                            </p>
                            <div className="flex items-center gap-5 justify-center ">
                                <Button
                                    onClick={scrollToProducts}
                                    size="lg"
                                    className="bg-sky-500 cursor-pointer hover:bg-sky-500/90 text-white font-bold group button-animation"
                                >
                                    Shop Now
                                    <ArrowDown
                                        className="ml-2 group-hover:animate-bounce"
                                        size={18}
                                    />
                                </Button>
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
                <section className="py-20" ref={productsRef}>
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
                            Can't see the gadget or specification you need? Preorder directly
                            from the USA and receive your purchase within 21 days!
                        </p>
                        <Button
                            size="lg"
                            onClick={() => setIsPreorderFormOpen(true)}
                            className="bg-[#F97316] cursor-pointer text-white font-bold px-8 py-3 rounded-lg button-animation"
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
    );
};

export default Index;

