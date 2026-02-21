"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { categories } from "@/lib/products";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import ProductCard from "@/components/product-card";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ProductCardSkeleton } from "@/components/LoadingSkeletons";
import { useIsMobile } from "@/hooks/use-mobile";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { searchEbayProducts } from "@/lib/ebay";

interface EbayProduct {
	id: string;
	title: string;
	price: {
		value: number;
		currency: string;
	};
	originalPrice?: {
		value: number;
		currency: string;
	};
	image: string;
	category: string;
	condition: string;
	shipping: string;
	seller: string;
	itemUrl: string;
	isPreorder: boolean;
	qualityScore?: number;
}

const SearchResults = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const initialQuery = searchParams.get("q") || "";
	const isPreload = searchParams.get("preload") === "true";
	const preloadedData = searchParams.get("data");

	// Local query state that can be controlled
	const [query, setQuery] = useState(initialQuery);

	// Debug logging

	// Filter states with lazy initialization
	const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
		const categoriesParam = searchParams.get("categories");
		return categoriesParam ? categoriesParam.split(",") : [];
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
		return searchParams.get("sort") || "best-match";
	});
	const [showFilters, setShowFilters] = useState(false);
	const isMobile = useIsMobile();

	// Handle category changes to clear search query
	const handleCategoryChange = (category: string) => {
		setSelectedCategories((prev) => {
			// Toggle single category selection
			const newCategories = prev.includes(category)
				? [] // Deselect if already selected
				: [category]; // Select only this category, replacing others

			// Clear search query when categories are changed
			setQuery("");
			// Update URL without the search query
			const params = new URLSearchParams();
			if (newCategories.length > 0) {
				params.set("categories", newCategories.join(","));
			}
			// Preserve other filters but exclude the search query
			if (priceRange[0] > 0) {
				params.set("minPrice", priceRange[0].toString());
			}
			if (priceRange[1] < 10000) {
				params.set("maxPrice", priceRange[1].toString());
			}
			if (selectedConditions.length > 0) {
				params.set("conditions", selectedConditions.join(","));
			}
			if (sortBy !== "best-match") {
				params.set("sort", sortBy);
			}
			router.replace(`/search?${params.toString()}`);
			return newCategories;
		});
	};

	// Close mobile filters when switching to desktop
	useEffect(() => {
		if (!isMobile) {
			setShowFilters(false);
		}
	}, [isMobile]);

	// Use pre-loaded data if available, otherwise use React Query for eBay search
	let preloadedResults: any[] = [];
	let isPreloadValid = false;

	if (isPreload && preloadedData) {
		try {
			const parsedData = JSON.parse(decodeURIComponent(preloadedData));
			// Normalize data to ensure it matches internal EbayProduct structure
			// Navbar sends 'Product' type (flat price), but we need 'EbayProduct' type (nested price)
			preloadedResults = parsedData.map((item: any) => {
				// Check if price is a number (Local Product format)
				if (typeof item.price === "number") {
					return {
						...item,
						price: {
							value: item.price,
							currency: item.currency || "GHS",
						},
					};
				}
				// Assume it's already in correct format if price is an object
				return item;
			});

			isPreloadValid = preloadedResults.length > 0;
		} catch (err) {
			console.error("Error parsing preloaded data:", err);
			// Fall back to normal search
		}
	}

	// Create filter object for the API call (without maxPrice dependency)
	const searchFilters = useMemo(() => {
		const filters: any = {};

		if (selectedCategories.length > 0) {
			// Use only first category for now to ensure results
			filters.category = selectedCategories[0];
		}
		if (priceRange[0] > 0) {
			filters.minPrice = priceRange[0];
		}
		if (priceRange[1] < 10000) {
			// Use a reasonable default to avoid dependency on maxPrice
			filters.maxPrice = priceRange[1];
		}
		if (selectedConditions.length > 0) {
			filters.conditions = selectedConditions;
		}
		// Map UI sort values to API sort values
		const sortMapping: Record<string, string> = {
			"best-match": "bestMatch",
			"price-low-high": "price",
			"price-high-low": "-price",
			newest: "newlyListed",
		};
		filters.sortOrder = (sortMapping[sortBy] || "bestMatch") as
			| "newlyListed"
			| "bestMatch"
			| "price"
			| "-price";

		return filters;
	}, [selectedCategories, priceRange, selectedConditions, sortBy]);

	// Use React Query for search with infinite scroll
	const {
		data,
		isLoading: searchLoading,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
	} = useInfiniteQuery({
		queryKey: ["search-results", query, searchFilters],
		queryFn: async ({ pageParam }: { pageParam: number }) => {
			return await searchEbayProducts(
				query || "",
				pageParam,
				10,
				"GHS",
				searchFilters.sortOrder,
				searchFilters.category,
				searchFilters.minPrice,
				searchFilters.maxPrice,
				searchFilters.conditions,
				searchFilters.brands,
			);
		},
		getNextPageParam: (lastPage: any) => {
			if (!lastPage.items || lastPage.items.length < 10) return undefined;
			return lastPage.pageNumber + 1;
		},
		initialPageParam: 1,
		enabled:
			!isPreloadValid && (!!query.trim() || selectedCategories.length > 0),
	});

	// Update URL when query, categories, price, conditions, or sort changes
	useEffect(() => {
		const params = new URLSearchParams();
		if (query.trim()) {
			params.set("q", query);
		}
		if (selectedCategories.length > 0) {
			params.set("categories", selectedCategories.join(","));
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
		if (sortBy !== "best-match") {
			params.set("sort", sortBy);
		}
		router.replace(`/search?${params.toString()}`);
	}, [
		query,
		selectedCategories,
		priceRange,
		selectedConditions,
		sortBy,
		searchFilters,
	]);

	// Intersection Observer for infinite scroll
	const { ref, inView } = useInView({
		threshold: 0,
		rootMargin: "200px",
	});

	// Fetch next page when last product is visible
	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	let searchResults: any[] = [];
	let totalCount = 0;
	let isLoading = false;
	let error: any = null;

	if (isPreloadValid) {
		searchResults = preloadedResults;
		totalCount = preloadedResults.length;
		isLoading = false;
		error = null;
	} else {
		// js-combine-iterations: flatMap instead of .map().flat()
		searchResults = data?.pages?.flatMap((page) => page.items) || [];
		totalCount = data?.pages?.[0]?.totalCount || 0;
		isLoading = searchLoading;
		error = null;
	}

	// Use a stable max price for the slider
	const maxPrice = 10000; // Fixed max price for consistent UX

	// rerender-simple-expression-in-memo: no memo needed, just use directly
	const filteredAndSortedResults = searchResults;

	// rerender-functional-setstate: useCallback for stable reference
	const clearAllFilters = useCallback(() => {
		setSelectedCategories([]);
		setPriceRange([0, 10000]); // Reset to default range
		setSelectedConditions([]);
		setSortBy("best-match");

		// Update URL to reflect cleared filters
		const params = new URLSearchParams();
		if (query.trim()) {
			params.set("q", query);
		}
		router.replace(`/search?${params.toString()}`);
	}, [query, router]);

	const activeFilterCount =
		selectedCategories.length +
		selectedConditions.length +
		(priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) +
		(sortBy !== "best-match" ? 1 : 0);

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
				{query.trim() && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-8"
					>
						<h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
							Results for "<span className="text-brand-color">{query}</span>"
						</h1>
						<p className="text-muted-foreground mt-1">
							{error
								? `Error: ${error.message}`
								: `${filteredAndSortedResults.length} items found${totalCount > 0 ? ` (${totalCount} total)` : ""}`}
						</p>
					</motion.div>
				)}

				{/* Filters Bar */}
				<div className="flex justify-start gap-4 items-center sticky top-15 md:top-23 z-10 bg-background py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
					{/* Mobile Filter Sheet */}
					{isMobile ? (
						<Sheet open={showFilters} onOpenChange={setShowFilters}>
							<SheetTrigger asChild>
								<button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground hover:border-primary/30 transition-colors relative z-20">
									<SlidersHorizontal className="h-4 w-4" />
									Filters
									{activeFilterCount > 0 && (
										<span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center z-30">
											{activeFilterCount}
										</span>
									)}
								</button>
							</SheetTrigger>
							<SheetContent side="left">
								<SheetHeader>
									<SheetTitle>Filters</SheetTitle>
								</SheetHeader>

								<div className="space-y-6 mt-4 px-6 overflow-y-auto h-[calc(100vh-7rem)]">
									{/* Categories */}
									<div>
										<h4 className="font-medium text-foreground mb-3">
											Categories
										</h4>
										<div className="flex flex-wrap gap-2">
											{categories.map((category) => (
												<button
													key={category.slug}
													onClick={() => handleCategoryChange(category.slug)}
													className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
														selectedCategories.includes(category.slug)
															? "bg-primary text-primary-foreground border-primary"
															: "bg-secondary text-foreground border-border hover:border-primary/30"
													}`}
												>
													{category.name}
												</button>
											))}
										</div>
									</div>

									{/* Price Range */}
									<div>
										<h4 className="font-medium text-foreground mb-3">
											Price Range
										</h4>
										<div className="space-y-3">
											<Slider
												value={priceRange}
												onValueChange={(value) => {
													if (value && value.length === 2) {
														setPriceRange([
															value[0] || 0,
															value[1] || maxPrice,
														]);
													}
												}}
												min={0}
												max={maxPrice}
												step={10}
												className="w-full"
											/>
										</div>
									</div>

									{/* Clear filters */}
									{activeFilterCount > 0 && (
										<button
											onClick={clearAllFilters}
											className="w-full rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
										>
											Clear all filters
										</button>
									)}
								</div>
							</SheetContent>
						</Sheet>
					) : (
						/* Desktop Filter Button */
						<div className="flex items-center gap-2">
							<button
								onClick={() => setShowFilters(!showFilters)}
								className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground hover:border-primary/30 transition-colors relative z-20"
							>
								<SlidersHorizontal className="h-4 w-4" />
								Filters
								{activeFilterCount > 0 && (
									<span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center z-30">
										{activeFilterCount}
									</span>
								)}
							</button>
						</div>
					)}
					<div className="flex items-center gap-2">
						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger>
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="best-match">Best Match</SelectItem>
									<SelectItem value="price-low-high">
										Price: Low to High
									</SelectItem>
									<SelectItem value="price-high-low">
										Price: High to Low
									</SelectItem>
									<SelectItem value="rating">Highest Rated</SelectItem>
									<SelectItem value="reviews">Most Reviews</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					{activeFilterCount > 0 && (
						<button
							onClick={clearAllFilters}
							className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
						>
							Clear
						</button>
					)}
				</div>

				{/* Filter Sidebar */}
				<div className="flex gap-8">
					{/* Filters Panel - Desktop Only */}
					{showFilters && !isMobile && (
						<motion.div
							initial={{ opacity: 0, width: 0 }}
							animate={{ opacity: 1, width: 280 }}
							exit={{ opacity: 0, width: 0 }}
							className="flex-shrink-0 bg-card space-y-4 rounded-lg border border-border p-6 h-fit sticky top-42 max-h-[calc(100vh-6rem)] overflow-y-auto"
						>
							<div className="flex items-center justify-between mb-6">
								<h3 className="font-semibold text-foreground">Filters</h3>
								<button
									onClick={() => setShowFilters(false)}
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									<X className="h-4 w-4" />
								</button>
							</div>

							{/* Categories */}
							<div className="mb-6">
								<h4 className="font-medium text-foreground mb-3">Categories</h4>
								<div className="flex flex-wrap gap-2">
									{categories.map((category) => (
										<button
											key={category.slug}
											onClick={() => handleCategoryChange(category.slug)}
											className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
												selectedCategories.includes(category.slug)
													? "bg-primary text-primary-foreground border-primary"
													: "bg-secondary text-foreground border-border hover:border-primary/30"
											}`}
										>
											{category.name}
										</button>
									))}
								</div>
							</div>

							{/* Price Range */}
							<div className="mb-6">
								<h4 className="font-medium text-foreground mb-3">
									Price Range
								</h4>
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<input
											type="number"
											value={priceRange[0]}
											onChange={(e) =>
												setPriceRange([
													parseInt(e.target.value) || 0,
													priceRange[1],
												])
											}
											className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
											placeholder="Min"
										/>
										<span className="text-muted-foreground">-</span>
										<input
											type="number"
											value={priceRange[1]}
											onChange={(e) =>
												setPriceRange([
													priceRange[0],
													parseInt(e.target.value) || maxPrice,
												])
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
													setPriceRange([value[0] || 0, value[1] || maxPrice]);
												}
											}}
											min={0}
											max={maxPrice}
											step={10}
											className="w-full"
										/>
									</div>
								</div>
							</div>
						</motion.div>
					)}

					{/* Results Grid */}
					<div className="flex-1">
						{isLoading ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{Array.from({ length: 8 }).map((_, i) => (
									<ProductCardSkeleton key={i} />
								))}
							</div>
						) : filteredAndSortedResults.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{filteredAndSortedResults.map(
									(product: EbayProduct, i: number) => (
										<div
											key={product.id}
											ref={
												i === filteredAndSortedResults.length - 1
													? ref
													: undefined
											}
											style={{
												contentVisibility: "auto",
												containIntrinsicSize: "0 400px",
											}}
										>
											<ProductCard
												product={(() => {
													const {
														price,
														originalPrice,
														qualityScore,
														...rest
													} = product;
													return {
														...rest,
														price: price.value,
														...(originalPrice?.value != null
															? { originalPrice: originalPrice.value }
															: {}),
														rating: 0,
														reviews: 0,
													};
												})()}
												index={i}
											/>
										</div>
									),
								)}
							</div>
						) : (
							<div className="text-center py-20">
								<p className="text-4xl mb-4">
									<span className="block text-5xl mb-2">?</span>
									No results found
								</p>

								<p className="text-muted-foreground">
									{error
										? "There was an error fetching results. Please try again."
										: "Try adjusting your filters or search for something like"}
									{!error && " "}
									{!error && <span>"iPhone", "MacBook", or "headphones"</span>}
								</p>
							</div>
						)}
						{isFetchingNextPage && (
							<div className="p-4 flex justify-center">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
};

export default SearchResults;
