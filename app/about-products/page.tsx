import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const conditions = [
	{
		name: "New",
		definition:
			"Unused merchandise. Comes with all original packaging, accessories, and warranty (if applicable).",
		hasWarranty: false,
	},
	{
		name: "Open Box",
		definition:
			"Items that have been unboxed but are unused or barely used. They may have been returned or opened for display purposes in USA. Includes all original accessories and packaging, with minimal to no signs of wear.",
		hasWarranty: true,
	},
	{
		name: "Renewed",
		definition:
			"Pre-owned gadgets from USA that have been professionally restored to like-new condition. Includes thorough testing, cleaning, and replacement of any defective parts.",
		hasWarranty: true,
	},
	{
		name: "Used",
		definition:
			"Pre-owned from items from USA with signs of wear but are fully functional. These items are tested and cleaned but may not include original accessories or packaging.",
		hasWarranty: true,
	},
];

export default function AboutProducts() {
	return (
		<>
			<div className="min-h-screen">
				<Header />
				<main className="container mx-auto px-4 py-8">
					<Breadcrumb className="mb-6">
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link href="/">Home</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>About Our Products</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>

					<div className="max-w-4xl mx-auto">
						<h1 className="text-3xl font-bold mb-6">About Our Products</h1>
						<p className="text-muted-foreground mb-8">
							At Payless4Tech, we offer products in various conditions to suit
							different needs and budgets. Below you'll find detailed
							information about each condition category.
						</p>

						<div className="grid gap-6">
							{conditions.map((condition) => (
								<Card key={condition.name} className="p-6">
									<div className="flex items-center gap-2 mb-3">
										<h2 className="text-xl font-semibold">{condition.name}</h2>
										<span className="inline-flex items-center rounded-full bg-[#FEC6A1] px-2.5 py-0.5 text-xs font-semibold text-gray-800 transition-colors">
											{condition.name}
										</span>
									</div>
									<p className="text-muted-foreground mb-4">
										{condition.definition}
									</p>
									{condition.hasWarranty && (
										<p className="text-sm bg-primary/5 p-4 rounded-lg">
											Comes with a standard 30 days warranty which is extendable
											to 12 months for a fee.{" "}
											<Link
												href="/warranty-policy"
												className="text-primary hover:underline"
											>
												Learn more about our warranty policy
											</Link>
											.
										</p>
									)}
								</Card>
							))}
						</div>
					</div>
				</main>
			</div>
			<Footer /> <WhatsAppButton />
		</>
	);
}
