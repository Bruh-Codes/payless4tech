"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Headset, CreditCard, Award, MapPin } from "lucide-react";
import masterCardLogo from "@/public/Mastercard-logo.svg.png";
import visa from "@/public/visa.svg";
import MTN from "@/public/mtn.svg";

import Image from "next/image";
const features = [
	{
		icon: ShieldCheck,
		title: "30-Day Warranty",
		desc: "Guaranteed warranty for any faulty device",
	},
	{
		icon: Headset,
		title: "Friendly Support",
		desc: "Get help in-store or online anytime",
	},
	{
		icon: Award,
		title: "Quality Assurance",
		desc: "All devices are tested and certified",
	},
	{
		icon: CreditCard,
		title: "Secure Payment",
		desc: "Multiple payment options available",
	},
];

const paymentMethods = [
	{
		name: "Visa",
		logo: visa,
	},
	{
		name: "Mastercard",
		logo: masterCardLogo,
	},
	{
		name: "MTN MoMo",
		logo: MTN,
	},
	{
		name: "Bank Transfer",
		logo: null,
	},
];

const WhyChooseUs = () => {
	return (
		<>
			{/* Purple Minimalist Features Section */}
			<section className="py-20 bg-[#1b0325] relative overflow-hidden">
				{/* Elegant subtle gradient background */}
				<div className="absolute inset-0 bg-gradient-to-br from-brand-color/30 via-black to-black pointer-events-none" />
				<div className="mx-auto max-w-7xl  sm:px-6 lg:px-8 px-4 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-50px" }}
						transition={{ duration: 0.4, ease: "easeOut" }}
						className="text-center mb-14"
					>
						<h2 className="font-display text-4xl font-bold text-white tracking-tight">
							Why Payless4Tech?
						</h2>
						<p className="mt-3 text-purple-100/90 text-lg">
							The smarter way to shop for tech in Ghana
						</p>
					</motion.div>

					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
						{features.map(({ icon: Icon, title, desc }, i) => (
							<motion.div
								key={title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-50px" }}
								transition={{
									delay: Math.min(i * 0.1, 0.4),
									duration: 0.6,
									ease: [0.16, 1, 0.3, 1],
								}}
								whileHover={{ y: -8, scale: 1.02 }}
								className="group relative rounded-3xl p-[1px] overflow-hidden bg-gradient-to-b from-white/10 to-transparent shadow-2xl transition-all duration-500 hover:shadow-brand-color/20"
							>
								{/* Inner card content wrapper for double bordered glass effect */}
								<div className="h-full rounded-3xl bg-black/40 backdrop-blur-xl p-8 text-center flex flex-col items-center justify-center border-t border-white/5 group-hover:bg-white/[0.03] transition-colors relative z-10 overflow-hidden">
									{/* Subtle radial glow appearing behind the icon on hover */}
									<div className="absolute inset-x-0 top-0 h-32 bg-brand-color/20 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 rounded-full w-full mx-auto pointer-events-none" />

									<div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center shadow-[inset_0px_1px_1px_rgba(255,255,255,0.2)] border border-white/10 group-hover:border-brand-color/50 group-hover:bg-brand-color/10 transition-colors relative z-20">
										<Icon
											className="h-8 w-8 text-white group-hover:text-purple-300 transition-colors"
											strokeWidth={1.5}
										/>
									</div>
									<h3 className="font-display text-xl font-bold text-white mb-3 relative z-20 tracking-wide">
										{title}
									</h3>
									<p className="text-sm text-purple-100/60 leading-relaxed font-medium mb-4 relative z-20">
										{desc}
									</p>
									{title === "30-Day Warranty" && (
										<a
											href="/warranty-policy"
											className="mt-auto pt-2 text-white hover:text-purple-300 text-sm font-semibold flex items-center justify-center gap-1 transition-colors relative z-20"
										>
											Learn more{" "}
											<span
												className="group-hover:translate-x-1 transition-transform inline-block"
												aria-hidden="true"
											>
												&rarr;
											</span>
										</a>
									)}
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Original Payment Methods & Map Section */}
			<section className="py-16 bg-secondary/30">
				<div className="mx-auto max-w-7xl  sm:px-6 lg:px-8 px-4">
					{/* Payment Methods */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-50px" }}
						transition={{ duration: 0.4, ease: "easeOut" }}
						className="flex flex-col items-start rounded-xl border border-border bg-card p-8"
					>
						<h3 className="font-display text-lg font-semibold text-foreground mb-6 text-center">
							Accepted Payment Methods
						</h3>
						<div className="flex flex-wrap justify-center gap-4 items-center">
							{paymentMethods.map((method) => (
								<motion.div
									key={method.name}
									initial={{ opacity: 0, y: 10 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true, margin: "-50px" }}
									transition={{
										delay: 0.1,
										duration: 0.3,
										ease: "easeOut",
									}}
									className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-sm hover:shadow-md transition-all"
								>
									{method.logo && (
										<Image
											width={50}
											height={50}
											src={method.logo}
											alt={method.name}
											className="h-6 w-auto object-contain"
											loading="lazy"
										/>
									)}
									<span className="text-sm font-medium text-foreground">
										{method.name}
									</span>
								</motion.div>
							))}
						</div>
					</motion.div>

					{/* Map */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-50px" }}
						transition={{ duration: 0.4, ease: "easeOut" }}
						className="mt-8 rounded-xl border border-border bg-card overflow-hidden"
					>
						<div className="p-4 border-b border-border">
							<h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
								<MapPin className="h-5 w-5 text-primary" /> Visit our Accra
								location at Dworwulu
							</h3>
							<p className="text-sm text-muted-foreground mt-1">Accra, Ghana</p>
						</div>
						<iframe
							src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.65855242703!2d-0.19470282688921392!3d5.61733263303381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9bd74af9cc8d%3A0x7f0e394810bc6468!2sPayless4tech!5e0!3m2!1sen!2sgh!4v1771290375948!5m2!1sen!2sgh"
							width="100%"
							height="500"
							style={{ border: 0 }}
							allowFullScreen
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
							title="Store Location - Accra, Ghana"
						/>
					</motion.div>
				</div>
			</section>
		</>
	);
};

export default WhyChooseUs;
