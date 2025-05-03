"use client";

import { Button } from "./ui/button";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const Hero = () => {
	const [api, setApi] = useState<any>();
	const [images, setImages] = useState<any[]>([]);
	const router = useRouter();

	useEffect(() => {
		console.log("Setting up realtime subscription for slideshow images...");
		const channel = supabase
			.channel("slideshow_changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "slideshow_images",
				},
				(payload) => {
					console.log("Slideshow change detected:", payload);
					fetchSlideShowImages();
				}
			)
			.subscribe();

		// Initial fetch
		console.log("Fetching slideshow images...");
		fetchSlideShowImages();

		// Cleanup subscription
		return () => {
			console.log("Cleaning up realtime subscription...");
			channel.unsubscribe();
		};
	}, []);

	const fetchSlideShowImages = async () => {
		try {
			const { data, error } = await supabase
				.from("slideshow_images")
				.select("*")
				.eq("active", true)
				.order("display_order", { ascending: true })
				.order("updated_at", { ascending: false });

			if (error) {
				console.error("Error fetching slideshow images:", error);
				toast("Error", {
					description: "Failed to fetch slideshow images",
				});
				return;
			}

			console.log("Fetched slideshow images:", data);
			setImages(data || []);
		} catch (error) {
			console.error("Unexpected error fetching slideshow images:", error);
			toast("Error", {
				description:
					"An unexpected error occurred while fetching slideshow images",
			});
		}
	};

	useEffect(() => {
		if (!api) return;

		const interval = setInterval(() => {
			api.scrollNext();
		}, 5000);

		return () => clearInterval(interval);
	}, [api]);

	return (
		<section className="pt-24 pb-12 animate-fadeIn">
			<div className="container mx-auto px-4">
				<div className="flex flex-col md:flex-row items-center gap-12">
					<div className="flex-1 text-center md:text-left">
						<div className="block md:hidden mb-2">
							<img
								src="/lovable-uploads/71f241a6-a4bb-422f-b7e6-29032fee0ed6.png"
								alt="Payless4Tech Logo"
								className="h-12 mx-auto"
							/>
						</div>
						<h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
							Authentic Gadgets,
							<br />
							<span className="text-primary">Certified Quality</span>
						</h1>
						<p className="text-lg text-muted-foreground mb-4 max-w-lg">
							Trusted by tech enthusiasts in Ghana for reasonably priced
							authentic gadgets
						</p>
						<div className="bg-green-100 text-green-800 p-3 rounded-lg mb-8 inline-block">
							<span className="font-semibold">
								🚚 Free Delivery within 24hrs in Accra!
							</span>
						</div>
						<div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
							<Button
								size="lg"
								className="text-lg bg-primary hover:bg-primary/90"
								onClick={() => router.push("/shop")}
							>
								Shop Now
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="text-lg border-secondary text-secondary hover:bg-secondary hover:text-white"
								onClick={() => router.push("/warranty-policy")}
							>
								Warranty Policy
							</Button>
						</div>
					</div>
					<div className="flex-1">
						<Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
							<CarouselContent>
								{images.length > 0
									? images.map((image, index) => (
											<CarouselItem key={image.id}>
												<img
													src={image.image_url}
													alt={
														image.title || `Payless4tech showcase ${index + 1}`
													}
													className="w-full h-auto rounded-2xl shadow-2xl"
												/>
											</CarouselItem>
									  ))
									: // Fallback images from Unsplash
									  [
											"https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
											"https://images.unsplash.com/photo-1518770660439-4636190af475",
											"https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
											"https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
									  ].map((image, index) => (
											<CarouselItem key={index}>
												<img
													src={image}
													alt={`Payless4tech showcase ${index + 1}`}
													className="w-full h-auto rounded-2xl shadow-2xl"
												/>
											</CarouselItem>
									  ))}
							</CarouselContent>
						</Carousel>
					</div>
				</div>
			</div>
		</section>
	);
};
