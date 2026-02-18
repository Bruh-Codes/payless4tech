"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import heroImage from "@/public/hero.png";
import Link from "next/link";

const Hero = () => {
	return (
		<section className="relative overflow-hidden">
			{/* Background image */}
			<div className="absolute inset-0">
				<Image
					src={heroImage}
					alt="Tech devices"
					width={1600}
					height={900}
					className="w-full h-full object-cover"
					priority
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/20 dark:from-background dark:via-background/90 dark:to-background/10" />
			</div>

			<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-26">
				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="max-w-xl"
				>
					<h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
						Affordable Gadgets You Can Trust
					</h1>
					<p className="text-lg text-primary/80 mb-8 max-w-lg">
						Pre-order from the USA or buy in-store at Payless4Tech. Quality
						guaranteed products.
					</p>
					<div className="flex flex-wrap gap-4">
						<Button
							variant="default"
							className=" transition-opacity h-12 px-8 text-base"
							onClick={() => {
								// Dispatch custom event to open PreorderSection form
								const preorderEvent = new CustomEvent("preorder");
								window.dispatchEvent(preorderEvent);
							}}
						>
							Pre-order from USA <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
						<Link href="/shop">
							<Button
								variant="outline"
								className="h-12 px-8 brand-color-bg text-base dark:text-foreground border-border hover:bg-secondary"
							>
								<ShoppingBag className="mr-2 h-4 w-4" /> Shop Now
							</Button>
						</Link>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default Hero;
