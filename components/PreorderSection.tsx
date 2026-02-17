"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PreorderForm } from "@/components/PreorderForm";

const PreorderSection = () => {
	const [isPreorderFormOpen, setIsPreorderFormOpen] = useState(false);
	const [formData, setFormData] = useState({});

	useEffect(() => {
		const handlePreorderEvent = (event: Event) => {
			// Check if this is a direct click on preorder button
			if (event instanceof CustomEvent && event.type === "preorder") {
				setIsPreorderFormOpen(true);
			}
		};

		// Add multiple event listeners to ensure we catch the event
		window.addEventListener("preorder", handlePreorderEvent);
		document.addEventListener("preorder", handlePreorderEvent);

		return () => {
			// Clean up both listeners
			window.removeEventListener("preorder", handlePreorderEvent);
			document.removeEventListener("preorder", handlePreorderEvent);
		};
	}, []);

	// Also listen for click events on product cards to open preorder form
	useEffect(() => {
		const handleProductClick = (event: Event) => {
			const target = event.target as HTMLElement;
			const preorderButton = target.closest('[data-preorder="true"]');
			if (preorderButton) {
				// Get product info from the button's data attributes if available
				const productId = preorderButton.getAttribute("data-product-id");
				const productName = preorderButton.getAttribute("data-product-name");
				const productCategory = preorderButton.getAttribute(
					"data-product-category",
				);

				setIsPreorderFormOpen(true);

				// Pre-fill form with product information
				if (productId || productName || productCategory) {
					setFormData((prev) => ({
						...prev,
						productName: productName || "",
						productCategory: productCategory || "",
					}));
				}
			}
		};

		document.addEventListener("click", handleProductClick);

		return () => {
			document.removeEventListener("click", handleProductClick);
		};
	}, []);

	return (
		<>
			<section className="w-full bg-background py-16">
				<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-50px" }}
						transition={{ duration: 0.4, ease: "easeOut" }}
						className="space-y-6"
					>
						<h2 className="text-2xl md:text-3xl font-bold text-foreground">
							Can't see the gadget or specification you need?
						</h2>
						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
							Preorder directly from the USA and receive your purchase within 14
							days!
						</p>
						<Button
							size="lg"
							className="bg-[#F97316] hover:bg-[#F97316]/90 text-white font-bold px-8 py-3 text-base md:text-lg"
							onClick={() => setIsPreorderFormOpen(true)}
						>
							Preorder Now
						</Button>
					</motion.div>
				</div>
			</section>
			<PreorderForm
				isOpen={isPreorderFormOpen}
				onOpenChange={setIsPreorderFormOpen}
				handleOrderSuccess={() => setIsPreorderFormOpen(false)}
			/>
		</>
	);
};

export default PreorderSection;
