
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

const categories = [
	{ name: "Laptops", path: "laptops" },
	{ name: "Consumer Electronics", path: "consumer-electronics" },
	{ name: "Phones", path: "phones" },
];

export default async function CategoryPage({
	params,
}: {
	 params: Promise<{ category: string }> 
}) {
	const { category } = await params
	return (
		<div>
			<Header />
			<div className="container mx-auto py-8">
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
							>
								{cat.name}
							</Link>
						))}
					</div>
				</Card>
				<ProductGrid category={category} />
			</div>
		</div>
	);
}
