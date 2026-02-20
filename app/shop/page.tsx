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
import { searchEbayProducts } from "@/lib/ebay";
import { convertEbayToLocalProduct } from "@/lib/ebay";
import { ProductCardSkeleton } from "@/components/LoadingSkeletons";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { Slider } from "@/components/ui/slider";

const ProductCard = dynamic(
	() => import("@/components/product-card").then((mod) => mod.default),
	{
		loading: () => <ProductCardSkeleton />,
		ssr: false,
	},
);

const categories = [
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
	const activeCategory =
		searchParams.get("categories") ||
		searchParams.get("category") ||
		"smartphones";
	const searchQuery = searchParams.get("q") || "";
	const [isPending, startTransition] = useTransition();
	const isMobile = useIsMobile();

	// Initialize filter states from URL parameters
	const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
		const brandsParam = searchParams.get("brands");
		return brandsParam ? brandsParam.split(",") : [];
	});
	const [priceRange, setPriceRange] = useState<[number, number]>(() => {
		const minPriceParam = searchParams.get("minPrice");
		const maxPriceParam = searchParams.get("maxPrice");
		const min = minPriceParam ? parseInt(minPriceParam) : 0;
		const max = maxPriceParam ? parseInt(maxPriceParam) : 10000;
		return [min, max];
	});
	const [selectedConditions, setSelectedConditions] = useState<string[]>(() => {
		const conditionsParam = searchParams.get("conditions");
		return conditionsParam ? conditionsParam.split(",") : [];
	});
	const [sortBy, setSortBy] = useState<string>(() => {
		return searchParams.get("sort") || "newest";
	});
	const [filtersOpen, setFiltersOpen] = useState(false);

	// eBay search query based on filters
	const ebayQuery = useMemo(() => {
		let query = searchQuery || activeCategory;

		return query;
	}, [searchQuery, activeCategory]);

	// Create filter object for the API call
	const searchFilters = useMemo(() => {
		const filters: any = {};

		if (activeCategory) {
			filters.category = activeCategory;
		}
		if (selectedBrands.length > 0) {
			filters.brands = selectedBrands;
		}
		if (priceRange[0] > 0) {
			filters.minPrice = priceRange[0];
		}
		if (priceRange[1] < 10000) {
			filters.maxPrice = priceRange[1];
		}
		if (selectedConditions.length > 0) {
			filters.conditions = selectedConditions;
		}
		if (sortBy !== "newest") {
			// Map UI sort values to API sort values
			const sortMapping: Record<string, string> = {
				"price-asc": "price",
				"price-desc": "-price",
				newest: "newlyListed",
				popular: "bestMatch",
			};
			filters.sortOrder = sortMapping[sortBy] as
				| "newlyListed"
				| "bestMatch"
				| "price"
				| "-price";
		}

		return filters;
	}, [activeCategory, selectedBrands, priceRange, selectedConditions, sortBy]);

	// Use React Query for search
	const { data, isLoading, isError } = useQuery({
		queryKey: ["shop-search", ebayQuery, activeCategory, searchFilters],
		queryFn: () =>
			searchEbayProducts(
				ebayQuery,
				1,
				50,
				"GHS",
				searchFilters.sortOrder || "newlyListed",
				activeCategory,
				searchFilters.minPrice,
				searchFilters.maxPrice,
				searchFilters.conditions,
				searchFilters.brands,
			),
		enabled: true,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});

	const ebayProducts = data?.items.map(convertEbayToLocalProduct) || [];

	// Close mobile filters when switching to desktop
	useEffect(() => {
		if (!isMobile) {
			setFiltersOpen(false);
		}
	}, [isMobile]);

	// Update URL when filters change
	useEffect(() => {
		const params = new URLSearchParams();
		if (searchQuery.trim()) {
			params.set("q", searchQuery);
		}
		if (activeCategory) {
			params.set("categories", activeCategory);
		}
		if (selectedBrands.length > 0) {
			params.set("brands", selectedBrands.join(","));
		}
		if (priceRange[0] > 0) {
			params.set("minPrice", priceRange[0].toString());
		}
		if (priceRange[1] < 10000) {
			params.set("maxPrice", priceRange[1].toString());
		}
		if (selectedConditions.length > 0) {
			params.set("conditions", selectedConditions.join(","));
		}
		if (sortBy !== "newest") {
			params.set("sort", sortBy);
		}
		router.replace(`/shop?${params.toString()}`);
	}, [
		searchQuery,
		activeCategory,
		selectedBrands,
		priceRange,
		selectedConditions,
		sortBy,
	]);

	const setCategory = useCallback(
		(slug: string) => {
			startTransition(() => {
				const params = new URLSearchParams(searchParams);
				params.set("categories", slug);
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
		(type: "min" | "max", value: number) => {
			startTransition(() => {
				if (type === "min") {
					setPriceRange([value, priceRange[1]]);
				} else {
					setPriceRange([priceRange[0], value]);
				}
			});
		},
		[priceRange],
	);

	const clearFilters = useCallback(() => {
		startTransition(() => {
			setSelectedBrands([]);
			setPriceRange([0, 10000]);
			setSelectedConditions([]);
			setSortBy("newest");
			// Update URL to reflect cleared filters
			const params = new URLSearchParams();
			if (searchQuery.trim()) {
				params.set("q", searchQuery);
			}
			if (activeCategory) {
				params.set("category", activeCategory);
			}
			router.replace(`/shop?${params.toString()}`);
		});
	}, [router, searchQuery, activeCategory]);

	// Remove client-side filtering since we're using server-side filtering
	// The API already returns filtered results
	const filteredProducts = useMemo(() => {
		return ebayProducts;
	}, [ebayProducts]);

	const activeFiltersCount =
		1 + // Always count the category filter since we always have one selected
		selectedBrands.length +
		selectedConditions.length +
		(priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0) +
		(sortBy !== "newest" ? 1 : 0);

	return (
		<>
			<div className=" bg-background">
				<Navbar />
				<div className="md:pl-7 max-w-7xl mx-auto h-[calc(100vh-6rem)] overflow-clip">
					{/* Top bar */}
					<div className="p-3 flex sticky top-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h1 className="text-2xl font-bold text-foreground">
								{activeCategory
									? categories.find((c) => c.slug === activeCategory)?.name
									: searchQuery
										? `Results for "${searchQuery}"`
										: "Smartphones"}
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
												activeCategory === cat.slug
													? "bg-primary/10 font-medium text-primary"
													: "text-muted-foreground hover:bg-secondary hover:text-foreground"
											}`}
										>
											{cat.name}
											{activeCategory === cat.slug && (
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
									<div className="flex items-center gap-2">
										<input
											type="number"
											value={priceRange[0]}
											onChange={(e) =>
												handlePriceChange("min", parseInt(e.target.value) || 0)
											}
											className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
											placeholder="Min"
										/>
										<span className="text-muted-foreground">-</span>
										<input
											type="number"
											value={priceRange[1]}
											onChange={(e) =>
												handlePriceChange(
													"max",
													parseInt(e.target.value) || 10000,
												)
											}
											className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
											placeholder="Max"
										/>
									</div>
									<div className="flex items-center gap-4 mt-2">
										<Slider
											value={priceRange}
											onValueChange={(value) => {
												if (value && value.length === 2) {
													setPriceRange([value[0] || 0, value[1] || 10000]);
												}
											}}
											min={0}
											max={10000}
											step={10}
											className="w-full"
										/>
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
							{isLoading ? (
								<div className="p-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{[...Array(12)].map((_, i) => (
										<ProductCardSkeleton key={i} />
									))}
								</div>
							) : isError ? (
								<div className="flex flex-col items-center justify-center py-20 text-center">
									<p className="text-lg font-medium text-foreground">
										Unable to load products
									</p>
									<p className="mt-1 text-sm text-muted-foreground">
										Please try again later
									</p>
								</div>
							) : filteredProducts.length === 0 ? (
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
									{filteredProducts.map((product: any, index: number) => (
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
