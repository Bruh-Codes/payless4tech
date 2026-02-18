"use client";

import {
	useState,
	useMemo,
	useCallback,
	useTransition,
	useEffect,
} from "react";

import dynamic from "next/dynamic";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import { featuredProducts } from "@/lib/products";
import { ProductCardSkeleton } from "@/components/LoadingSkeletons";
import { useIsMobile } from "@/hooks/use-mobile";

const ProductCard = dynamic(
	() => import("@/components/product-card").then((mod) => mod.default),
	{
		loading: () => <ProductCardSkeleton />,
		ssr: false,
	},
);

const categories = [
	{ name: "All Products", slug: "all" },
	{ name: "Smartphones", slug: "smartphones" },
	{ name: "Laptops", slug: "laptops" },
	{ name: "Tablets", slug: "tablets" },
	{ name: "Audio", slug: "audio" },
	{ name: "Gaming", slug: "gaming" },
	{ name: "Accessories", slug: "accessories" },
	{ name: "Consumer Electronics", slug: "consumer-electronics" },
];

const brands = [
	"Apple",
	"Samsung",
	"LG",
	"Sony",
	"HP",
	"Dell",
	"Lenovo",
	"JBL",
];

const sortOptions = [
	{ label: "Newest", value: "newest" },
	{ label: "Price: Low to High", value: "price-asc" },
	{ label: "Price: High to Low", value: "price-desc" },
	{ label: "Popular", value: "popular" },
];

const Page = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const activeCategory = searchParams.get("category") || "all";
	const searchQuery = searchParams.get("q") || "";
	const [isPending, startTransition] = useTransition();
	const isMobile = useIsMobile();

	const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);
	const [sortBy, setSortBy] = useState("newest");
	const [filtersOpen, setFiltersOpen] = useState(false);

	// Close mobile filters when switching to desktop
	useEffect(() => {
		if (!isMobile) {
			setFiltersOpen(false);
		}
	}, [isMobile]);

	const setCategory = useCallback(
		(slug: string) => {
			startTransition(() => {
				const params = new URLSearchParams(searchParams);
				if (slug === "all") params.delete("category");
				else params.set("category", slug);
				router.push(`/shop?${params.toString()}`);
			});
		},
		[searchParams, router],
	);

	const toggleBrand = useCallback((brand: string) => {
		startTransition(() => {
			setSelectedBrands((prev) =>
				prev.includes(brand)
					? prev.filter((b) => b !== brand)
					: [...prev, brand],
			);
		});
	}, []);

	const handlePriceChange = useCallback(
		(value: number) => {
			startTransition(() => {
				setPriceRange([priceRange[0], value]);
			});
		},
		[priceRange[0]],
	);

	const clearFilters = useCallback(() => {
		startTransition(() => {
			router.push("/shop");
		});
	}, [router]);

	const filteredProducts = useMemo(() => {
		let products = [...featuredProducts];

		if (activeCategory !== "all") {
			products = products.filter((p) => p.category === activeCategory);
		}

		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			products = products.filter(
				(p) =>
					p.title.toLowerCase().includes(q) ||
					p.category.toLowerCase().includes(q),
			);
		}

		if (selectedBrands.length > 0) {
			products = products.filter((p) => selectedBrands.includes(p.seller));
		}

		products = products.filter(
			(p) => p.price >= priceRange[0] && p.price <= priceRange[1],
		);

		switch (sortBy) {
			case "price-asc":
				products.sort((a, b) => a.price - b.price);
				break;
			case "price-desc":
				products.sort((a, b) => b.price - a.price);
				break;
			case "popular":
				products.sort((a, b) => b.reviews - a.reviews);
				break;
		}

		return products;
	}, [activeCategory, searchQuery, selectedBrands, priceRange, sortBy]);

	const activeFiltersCount =
		(activeCategory !== "all" ? 1 : 0) +
		selectedBrands.length +
		(priceRange[1] < 15000 ? 1 : 0);

	return (
		<>
			<div className=" bg-background">
				<Navbar />
				<div className="md:pl-7 max-w-7xl mx-auto h-[calc(100vh-6rem)] overflow-clip">
					{/* Top bar */}
					<div className="p-3 flex sticky top-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h1 className="text-2xl font-bold text-foreground">
								{activeCategory !== "all"
									? categories.find((c) => c.slug === activeCategory)?.name
									: searchQuery
										? `Results for "${searchQuery}"`
										: "All Products"}
							</h1>
						</div>
						<div className="flex items-center gap-3">
							<button
								onClick={() => setFiltersOpen(!filtersOpen)}
								className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted md:hidden"
							>
								<SlidersHorizontal className="h-4 w-4" />
								Filters
								{activeFiltersCount > 0 && (
									<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
										{activeFiltersCount}
									</span>
								)}
							</button>
							<div className="relative">
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
									className="appearance-none rounded-lg border border-border bg-secondary py-2 pl-3 pr-8 text-sm text-foreground focus:border-primary focus:outline-none"
								>
									{sortOptions.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
								<ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							</div>
						</div>
					</div>

					<div className="flex gap-6 ">
						{/* Sidebar filters */}
						<aside
							className={cn(
								"w-full flex-shrink-0 px-2 overflow-y-auto max-h-[calc(100vh-10rem)]",
								filtersOpen
									? "fixed inset-0 z-50 overflow-y-auto bg-background p-4 md:static md:z-auto md:p-0"
									: "hidden md:block md:w-56",
							)}
						>
							<div className="flex items-center justify-between md:hidden">
								<h2 className="text-lg font-bold text-foreground">Filters</h2>
								<button
									onClick={() => setFiltersOpen(false)}
									className="rounded-full p-1 text-muted-foreground hover:text-foreground"
								>
									<X className="h-5 w-5" />
								</button>
							</div>

							{/* Categories */}
							<div className="mb-6 mt-4 md:mt-0">
								<h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Category
								</h3>
								<div className="space-y-1">
									{categories.map((cat) => (
										<button
											key={cat.slug}
											onClick={() => {
												setCategory(cat.slug);
												setFiltersOpen(false);
											}}
											className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
												activeCategory === cat.slug ||
												(cat.slug === "all" && activeCategory === "all")
													? "bg-primary/10 font-medium text-primary"
													: "text-muted-foreground hover:bg-secondary hover:text-foreground"
											}`}
										>
											{cat.name}
											{activeCategory === cat.slug && cat.slug !== "all" && (
												<span className="text-xs">✓</span>
											)}
										</button>
									))}
								</div>
							</div>

							{/* Brands */}
							<div className="mb-6">
								<h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Brand
								</h3>
								<div className="space-y-2">
									{brands.map((brand) => (
										<label
											key={brand}
											className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
										>
											<input
												type="checkbox"
												checked={selectedBrands.includes(brand)}
												onChange={() => toggleBrand(brand)}
												className="h-4 w-4 rounded border-border accent-primary"
											/>
											{brand}
										</label>
									))}
								</div>
							</div>

							{/* Price Range */}
							<div className="mb-6">
								<h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Price Range
								</h3>
								<div className="space-y-3">
									<input
										type="range"
										min={0}
										max={15000}
										step={500}
										value={priceRange[1]}
										onChange={(e) => handlePriceChange(Number(e.target.value))}
									/>
									<div className="flex items-center justify-between text-xs text-muted-foreground">
										<span>₵0</span>
										<span>₵{priceRange[1].toLocaleString()}</span>
									</div>
								</div>
							</div>

							{/* Clear filters */}
							{activeFiltersCount > 0 && (
								<button
									onClick={clearFilters}
									className="w-full rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
								>
									Clear all filters
								</button>
							)}
						</aside>

						{/* Products grid */}
						<div className="flex-1 overflow-y-auto h-[calc(100vh-10rem)] relative">
							{isPending && (
								<div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
								</div>
							)}
							{filteredProducts.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-20 text-center">
									<p className="text-lg font-medium text-foreground">
										No products found
									</p>
									<p className="mt-1 text-sm text-muted-foreground">
										Try adjusting your filters or search query
									</p>
								</div>
							) : (
								<div className="p-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{filteredProducts.map((product, index) => (
										<ProductCard
											key={product.id}
											product={product}
											index={index}
										/>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Page;
