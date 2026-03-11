"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const slides = [
	{
		id: "m5-chip",
		title: "M5 Chip",
		subtitle: "Power beyond belief.",
		description:
			"The next generation of Apple silicon is here. Groundbreaking speed and efficiency.",
		bgImage: "/images/hero/hero_startframe__ek0dqbh61vau_xlarge.webp",
		textColor: "text-white",
		theme: "dark",
		align: "center",
		bgPosition: "center",
	},

	{
		id: "m5-chip",
		title: "M5 Family",
		subtitle: "Scary fast.",
		description: "The most advanced chips ever built for a personal computer.",
		bgImage: "/images/hero/sensors_chips__s805s5o3gkii_large.webp",
		textColor: "text-white",
		theme: "dark",
		align: "center",
		bgPosition: "center",
	},
	{
		id: "vision-pro",
		title: "Vision Pro",
		subtitle: "Welcome to the era of spatial computing.",
		description: "Blend digital content seamlessly with your physical space.",
		bgImage: "/images/hero/hero__cvgr5aj1ttsi_large_2x.webp",
		textColor: "text-gray-300",
		theme: "light",
		align: "bottom",
		bgPosition: "center 35%",
	},
	{
		id: "macbook-m4",
		title: "MacBook Pro",
		subtitle: "Supercharged by M4.",
		description:
			"Unmatched performance and incredible battery life for pro workflows.",
		bgImage: "/images/hero/display_hero__c32k5z50p94y_large.webp",
		textColor: "text-slate-100",
		theme: "dark",
		align: "bottom",
		bgPosition: "center",
	},
	{
		id: "galaxy-s26",
		title: "Galaxy S26 Ultra",
		subtitle: "Galaxy AI is here.",
		description: "Unleash new ways to create, connect, and more.",
		bgImage: "/images/galaxy-s26-ultra-features-kv.webp",
		textColor: "text-white",
		theme: "dark",
		align: "top",
		bgPosition: "center",
	},

	{
		id: "apple-intelligence",
		title: "Apple Intelligence",
		subtitle: "AI for the rest of us.",
		description: "Personal, private, and powerful.",
		bgImage:
			"/images/hero/design_innovation_startframe__4mig33ckaf6y_large.webp",
		textColor: "text-white",
		theme: "light",
		align: "top",
		bgPosition: "center",
	},
	{
		id: "macbook-pro",
		title: "MacBook Pro",
		subtitle: "Mind-blowing. Head-turning.",
		description: "The most advanced Mac for creators and professionals.",
		bgImage: "/images/hero/mac-macbook-pro-size-unselect-202601-gallery-1.webp",
		textColor: "text-white",
		theme: "light",
		align: "top",
		bgPosition: "center",
	},
];

const SLIDE_DURATION = 6000; // 6 seconds per slide

const Hero = () => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);

	const slide = slides[currentIndex];

	// Early return gracefully if no slides exist
	if (!slide) return null;

	// Auto-advancement logic
	useEffect(() => {
		if (isPaused) return;

		const timer = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % slides.length);
		}, SLIDE_DURATION);

		return () => clearInterval(timer);
	}, [isPaused]);

	// Dispatch navbar styling event based on current slide theme
	useEffect(() => {
		const newSlide = slides[currentIndex];

		if (!newSlide) return;

		const event = new CustomEvent("heroSlideChange", {
			detail: {
				navbarBg:
					newSlide.theme === "dark"
						? "bg-black/40 backdrop-blur-xl border-b border-white/10 text-white"
						: "bg-white/80 backdrop-blur-xl border-b border-black/5 text-black",
			},
		});
		window.dispatchEvent(event);
	}, [currentIndex]);

	// Early return gracefully if no slides exist
	if (!slide) return null;

	return (
		<section
			className="relative -mt-14 h-[85vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden bg-black"
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
		>
			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={slide.id}
					initial={{ opacity: 0, scale: 1.05 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					transition={{ duration: 1.2, ease: "easeInOut" }}
					className="absolute inset-0 z-0"
				>
					<Image
						src={slide.bgImage}
						alt={slide.title}
						fill
						className="object-cover"
						style={{ objectPosition: slide.bgPosition || "center" }}
						priority={currentIndex === 0}
						sizes="100vw"
						quality={90}
					/>
				</motion.div>
			</AnimatePresence>

			<div
				className={`relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col h-full ${
					slide.align === "top"
						? "justify-start pt-32"
						: slide.align === "center"
							? "justify-center pt-20"
							: slide.align === "bottom"
								? "justify-end pb-32"
								: "justify-center pt-20"
				} items-center text-center`}
			>
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={`text-${slide.id}`}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
						className={slide.textColor}
					>
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 1, delay: 0.2 }}
							className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mb-4 opacity-80"
						>
							{slide.subtitle}
						</motion.p>

						<motion.h1
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{
								duration: 0.8,
								delay: 0.3,
								ease: [0.16, 1, 0.3, 1],
							}}
							className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 drop-shadow-sm"
						>
							{slide.title}
						</motion.h1>

						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 1, delay: 0.4 }}
							className="text-lg md:text-2xl font-medium max-w-2xl mx-auto mb-10 opacity-90 drop-shadow-sm"
						>
							{slide.description}
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.8,
								delay: 0.5,
								ease: [0.16, 1, 0.3, 1],
							}}
							className="flex flex-col sm:flex-row items-center justify-center gap-4"
						>
							<Button
								variant="default"
								className={`h-12 px-8 rounded-full text-base font-medium transition-transform hover:scale-105 shadow-xl ${
									slide.theme === "dark"
										? "bg-white text-black hover:bg-gray-100"
										: "bg-black text-white hover:bg-gray-900"
								}`}
								onClick={() => {
									const preorderEvent = new CustomEvent("preorder");
									window.dispatchEvent(preorderEvent);
								}}
							>
								Pre-order from USA <ArrowRight className="ml-2 w-4 h-4" />
							</Button>
							<Link href="/shop">
								<Button
									variant="outline"
									className="h-12 px-8 rounded-full text-base font-medium border-2 backdrop-blur-md transition-all hover:scale-105 border-white mix-blend-difference text-white hover:bg-white hover:text-black"
								>
									Buy Now
								</Button>
							</Link>
						</motion.div>
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Beautiful Minimalist Dot Indicators */}
			<div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-4">
				{slides.map((s, idx) => {
					// Adaptive dot coloring based on slide theme
					const dotColor =
						slide.theme === "dark"
							? currentIndex === idx
								? "bg-white"
								: "bg-white/30"
							: currentIndex === idx
								? "bg-black"
								: "bg-black/20";
					const dotSize = currentIndex === idx ? "w-10 h-1.5" : "w-1.5 h-1.5";
					return (
						<button
							key={s.id}
							onClick={() => setCurrentIndex(idx)}
							className={`rounded-full transition-all duration-500 ease-out hover:bg-opacity-80 backdrop-blur-sm ${dotColor} ${dotSize}`}
							aria-label={`Go to slide ${idx + 1}`}
						/>
					);
				})}
			</div>
		</section>
	);
};

export default Hero;
