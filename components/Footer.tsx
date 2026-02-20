import { Instagram, Facebook, MessageCircle, Twitter } from "lucide-react";
import { Mail, Phone, MapPin } from "lucide-react";

import logo from "@/public/71f241a6-a4bb-422f-b7e6-29032fee0ed6.png";

import Image from "next/image";
import Link from "next/link";

const Footer = () => {
	return (
		<footer className="border-t border-border dark:bg-card/50 bg-secondary">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
				<div className="flex flex-wrap gap-8">
					<div className="flex-1 p-4">
						<Link href="/" className="shrink-0">
							<Image
								src={logo}
								alt="Payless4Tech"
								className="h-7 md:h-8 w-auto"
							/>
						</Link>
						<p className="text-sm mt-2 text-muted-foreground">
							Your trusted source for premium tech at unbeatable prices. Based
							in Accra, Ghana
						</p>
						<div className="flex gap-3 mt-4">
							<a
								href="https://www.instagram.com/payless4tech"
								target="_blank"
								rel="noopener noreferrer"
								className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
							>
								<Instagram className="h-4 w-4" />
							</a>
							<a
								href="https://web.facebook.com/p/Payless4Tech"
								target="_blank"
								rel="noopener noreferrer"
								className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
							>
								<Facebook className="h-4 w-4" />
							</a>
							<a
								href="https://x.com/payless4tech"
								target="_blank"
								rel="noopener noreferrer"
								className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
							>
								<Twitter className="h-4 w-4" />
							</a>
							<a
								href="https://wa.me/+233245151416"
								target="_blank"
								rel="noopener noreferrer"
								className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
							>
								<MessageCircle className="h-4 w-4" />
							</a>
						</div>
					</div>

					<div className="flex-1 p-4">
						<h4 className="font-display font-semibold text-foreground mb-3">
							Shop
						</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<a
									href="/search?q=smartphones"
									className="hover:text-primary transition-colors"
								>
									Smartphones
								</a>
							</li>
							<li>
								<a
									href="/search?q=laptops"
									className="hover:text-primary transition-colors"
								>
									Laptops
								</a>
							</li>
							<li>
								<a
									href="/search?q=audio"
									className="hover:text-primary transition-colors"
								>
									Audio
								</a>
							</li>
							<li>
								<a
									href="/search?q=gaming"
									className="hover:text-primary transition-colors"
								>
									Gaming
								</a>
							</li>
						</ul>
					</div>

					<div className="flex-1 p-4">
						<h4 className="font-display font-semibold text-foreground mb-3">
							Support
						</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<a
									href="/faq"
									className="hover:text-primary transition-colors"
									aria-label="View frequently asked questions"
								>
									FAQ
								</a>
							</li>
							<li>
								<a
									href="https://wa.me/+233245151416"
									className="hover:text-primary transition-colors"
									aria-label="Contact us on WhatsApp for support"
								>
									Help Center
								</a>
							</li>

							<li>
								<a
									href="/warranty-policy"
									className="hover:text-primary transition-colors"
									aria-label="View our warranty policy information"
								>
									Warranty
								</a>
							</li>
							<li>
								<a
									href="https://wa.me/+233245151416"
									className="hover:text-primary transition-colors"
									aria-label="Contact Payless4Tech on WhatsApp"
								>
									Contact Us
								</a>
							</li>
						</ul>
					</div>

					<div className="flex-1 p-4">
						<h4 className="font-display font-semibold text-foreground mb-3">
							Company
						</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<a
									href="/about-products"
									className="hover:text-primary transition-colors"
								>
									About
								</a>
							</li>

							<li>
								<a
									href="/privacy-policy"
									className="hover:text-primary transition-colors"
								>
									Privacy Policy
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-4">
					<p className="text-xs text-muted-foreground">
						2026 Payless4Tech. All rights reserved.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
						<a
							href="mailto:joy@payless4tech.com"
							className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
						>
							<Mail className="h-4 w-4" />
							<span>joy@payless4tech.com</span>
						</a>
						<a
							href="tel:+233245151416"
							className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
						>
							<Phone className="h-4 w-4" />
							<span>+233 245 151 416</span>
						</a>
						<a
							href="https://maps.google.com/?q=Shop+42,+Accra+Mall,+Spintex+Road,+Accra,+Ghana"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
						>
							<MapPin className="h-4 w-4" />
							<span className="text-xs leading-tight">
								Shop 42, Accra Mall, Spintex Road, Accra, Ghana
							</span>
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
