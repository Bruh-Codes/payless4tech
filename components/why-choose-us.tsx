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
		<section className="py-16 bg-secondary/30">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="text-center mb-12"
				>
					<h2 className="font-display text-3xl font-bold text-foreground">
						Why <span className="text-brand-color">Payless4Tech?</span>
					</h2>
					<p className="mt-2 text-muted-foreground">
						The smarter way to shop for tech in Ghana
					</p>
				</motion.div>

				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{features.map(({ icon: Icon, title, desc }, i) => (
						<motion.div
							key={title}
							initial={{ opacity: 0, y: 10 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{
								delay: Math.min(i * 0.05, 0.2),
								duration: 0.3,
								ease: "easeOut",
							}}
							className="rounded-xl border border-border bg-card p-6 text-center hover:border-primary/30 transition-all"
						>
							<div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
								<Icon className="h-6 w-6 text-primary" />
							</div>
							<h3 className="font-display text-lg font-semibold text-foreground mb-2">
								{title}
							</h3>
							<p className="text-sm text-muted-foreground mb-3">{desc}</p>
							{title === "30-Day Replacement" && (
								<a
									href="/warranty-policy"
									className="text-xs text-primary hover:underline font-medium"
								>
									Learn more →
								</a>
							)}
						</motion.div>
					))}
				</div>

				{/* Payment Methods */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="mt-16 flex flex-col items-start rounded-xl border border-border bg-card p-8"
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
	);
};

export default WhyChooseUs;
