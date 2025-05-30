import { Shield, Headphones, CreditCard, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const TrustSection = () => {
	const trustBadges = [
		{
			icon: <Shield className="h-6 w-6" />,
			title: "30-Day Replacement",
			description: "Guaranteed replacement for any faulty device",
			link: "/warranty-policy",
		},
		{
			icon: <Headphones className="h-6 w-6" />,
			title: "Friendly Support",
			description: "Get help in-store or online anytime",
		},
		{
			icon: <Check className="h-6 w-6" />,
			title: "Quality Assurance",
			description: "All devices are tested and certified",
			link: "/about-products",
		},
		{
			icon: <CreditCard className="h-6 w-6" />,
			title: "Secure Payment",
			description: "Multiple payment options available",
		},
	];

	return (
		<section className="py-20 bg-white border-y">
			<div className="container mx-auto px-4">
				<div className="flex flex-col space-y-8">
					{/* Trust Badges */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						{trustBadges.map((badge, index) => (
							<div
								key={index}
								className="flex flex-col items-center text-center p-6 transition-all duration-300 hover:bg-gray-50 rounded-lg"
							>
								<div className="text-primary bg-primary/10 dark:text-black dark:bg-black/10 p-3 rounded-full mb-4 transition-all duration-300 hover:scale-110">
									{badge.icon}
								</div>
								<h3 className="font-bold text-lg mb-2 dark:text-black">
									{badge.title}
								</h3>
								<p className="text-sm text-gray-600">{badge.description}</p>
								{badge.link && (
									<Link
										href={badge.link}
										className="mt-3 text-primary text-sm hover:underline font-medium dark:text-blue-800"
									>
										Learn more
									</Link>
								)}
							</div>
						))}
					</div>

					{/* Payment Methods */}
					<div className="flex flex-col items-center mt-8">
						<h3 className="text-xl font-medium mb-6 dark:text-black">
							Accepted Payment Methods
						</h3>
						<div className="flex flex-wrap justify-center gap-5">
							<Badge
								variant="outline"
								className="py-2 px-4 text-xs font-normal border-gray-300 hover-scale"
							>
								<img
									src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png"
									alt="Visa"
									className="h-6 w-auto"
								/>
							</Badge>
							<Badge
								variant="outline"
								className="py-2 px-4 text-xs font-normal border-gray-300 hover-scale"
							>
								<img
									src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
									alt="Mastercard"
									className="h-6 w-auto"
								/>
							</Badge>
							<Badge
								variant="outline"
								className="py-2 px-4 text-xs font-normal border-gray-300 hover-scale"
							>
								<div className="flex items-center gap-1">
									<div className="bg-yellow-400 rounded-full w-5 h-5"></div>
									<span className="font-medium dark:text-black">
										MTN Mobile Money
									</span>
								</div>
							</Badge>
							<Badge
								variant="outline"
								className="py-2 px-4 text-xs font-normal border-gray-300 hover-scale"
							>
								<span className="font-medium text-blue-500">Bank Transfer</span>
							</Badge>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
