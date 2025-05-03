import { Mail, Phone, MapPin } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";

export const Footer = () => {
	return (
		<footer className="bg-gray-900 text-white py-12">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Company Info */}
					<div>
						<h3 className="text-xl font-bold mb-4">Payless4Tech</h3>
						<ul className="space-y-3">
							<li className="flex items-center gap-2">
								<Mail size={18} className="text-gray-400" />
								<span>joy@payless4tech.com</span>
							</li>
							<li className="flex items-center gap-2">
								<Phone size={18} className="text-gray-400" />
								<span>+233 245 151 416</span>
							</li>
							<li className="flex items-start gap-2">
								<MapPin size={18} className="text-gray-400 mt-1" />
								<span>Shop 42, Accra Mall, Spintex Road, Accra, Ghana</span>
							</li>
						</ul>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="text-xl font-bold mb-4">Quick Links</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/about-products"
									className="hover:text-white/30 transition-colors"
								>
									About Products
								</Link>
							</li>
							<li>
								<Link
									href="/faq"
									className="hover:text-white/30 transition-colors"
								>
									FAQ
								</Link>
							</li>
							<li>
								<Link
									href="/warranty-policy"
									className="hover:text-white/30 transition-colors"
								>
									Returns & Warranty
								</Link>
							</li>
							<li>
								<Link
									href="/shop"
									className="hover:text-white/30 transition-colors"
								>
									Shop
								</Link>
							</li>
						</ul>
					</div>

					{/* Newsletter */}
					<div>
						<h3 className="text-xl font-bold mb-4">Stay Updated</h3>
						<p className="mb-4 text-gray-300">
							Subscribe href receive updates on new products, exclusive offers,
							and promotions.
						</p>
						<div className="flex flex-col sm:flex-row gap-2">
							<Input
								type="email"
								placeholder="Your email"
								className="bg-gray-800 border-gray-700 focus:border-primary"
							/>
							<Button className="bg-secondary hover:bg-secondary/90 whitespace-nowrap">
								Subscribe
							</Button>
						</div>
					</div>
				</div>

				<div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
					<p>
						&copy; {new Date().getFullYear()} Payless4Tech. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
};
