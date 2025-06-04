"use client";

import { ProductGrid } from "@/components/ProductGrid";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
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
import { SidebarFilter } from "@/components/SidebarFilter";
import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

const categories = [
	{ name: "Laptops", path: "laptops" },
	{ name: "Consumer Electronics", path: "consumer-electronics" },
	{ name: "Phones", path: "phones" },
];

export default function CategoryPage() {
	const params = useParams();
	const category = params.category as string;

	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const searchParams = useSearchParams();

	const brandParam = searchParams.get("brand");
	const [selectedBrand, setSelectedBrand] = useState<string | null>(brandParam);
	const router = useRouter();

	const handleFilterChange = (
		newCategory: string | null,
		brand: string | null
	) => {
		// If the category changes, navigate to the new category page with brand as query param
		if (newCategory && newCategory !== category) {
			const url = brand
				? `/category/${newCategory}?brand=${encodeURIComponent(brand)}`
				: `/category/${newCategory}`;
			router.push(url);
			setSelectedCategory(newCategory);
			setSelectedBrand(brand);
		} else {
			// If same category, just update brand filter
			setSelectedCategory(newCategory);
			setSelectedBrand(brand);
			// Optionally update the URL query param for brand
			const url = brand
				? `/category/${category}?brand=${encodeURIComponent(brand)}`
				: `/category/${category}`;
			router.push(url);
		}
	};

	return (
		<>
			<div>
				<Header />
				<main className="flex flex-col lg:flex-row">
					<aside className="p-5">
						<SidebarFilter
							selectedCategory={selectedCategory}
							selectedBrand={selectedBrand}
							onFilterChange={handleFilterChange}
						/>
					</aside>

					<div className="container mx-auto p-5">
						<Breadcrumb className="mb-6">
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink asChild>
										<Link href="/">Home</Link>
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbPage>{category}</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>

						<Card className="mb-8 p-6">
							<h1 className="text-3xl font-bold capitalize mb-2">{category}</h1>
							<p className="text-muted-foreground mb-4">
								Browse our selection of premium {category}.
							</p>
							<div className="flex gap-2 flex-wrap">
								{categories.map((cat) => (
									<Link
										key={cat.path}
										href={`/category/${cat.path}`}
										className={`px-4 py-2 rounded-md text-sm ${
											category === cat.path
												? "bg-primary text-primary-foreground"
												: "bg-secondary hover:bg-secondary/80"
										}`}
										onClick={() => {
											setSelectedCategory(cat.path);
											setSelectedBrand(null); // Clear brand filter
										}}
									>
										{cat.name}
									</Link>
								))}
							</div>
						</Card>
						<ProductGrid category={category} brandFilter={selectedBrand} />
					</div>
				</main>
			</div>
			<Footer /> <WhatsAppButton />
		</>
	);
}
