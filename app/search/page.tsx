"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
	searchProducts,
	featuredProducts,
	newArrivals,
	categories,
} from "@/lib/products";
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
import { ProductCardSkeleton } from "@/components/LoadingSkeletons";
import { useIsMobile } from "@/hooks/use-mobile";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

const SearchResults = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const query = searchParams.get("q") || "";

	// Filter states with lazy initialization
	const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
		const categoriesParam = searchParams.get("categories");
		return categoriesParam ? categoriesParam.split(",") : [];
	});
	const [priceRange, setPriceRange] = useState<[number, number]>(() => {
		const minPriceParam = searchParams.get("minPrice");
		const maxPriceParam = searchParams.get("maxPrice");
		if (minPriceParam && maxPriceParam) {
			return [parseInt(minPriceParam), parseInt(maxPriceParam)];
		}
		return [0, 2000];
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

	// Close mobile filters when switching to desktop
	useEffect(() => {
		if (!isMobile) {
			setShowFilters(false);
		}
	}, [isMobile]);
	const [isLoading, setIsLoading] = useState(true);

	const allProducts = [...featuredProducts, ...newArrivals];
	const baseResults = query === "all" ? allProducts : searchProducts(query);

	// Get unique conditions from products
	const availableConditions = useMemo(() => {
		const conditions = new Set(allProducts.map((p) => p.condition));
		return Array.from(conditions);
	}, [allProducts]);

	// Derive max price from products (no state needed)
	const maxPrice = useMemo(() => {
		return Math.max(...allProducts.map((p) => p.price));
	}, [allProducts]);

	// Apply filters and sorting
	const filteredAndSortedResults = useMemo(() => {
		let filtered = baseResults;

		// Filter by categories
		if (selectedCategories.length > 0) {
			filtered = filtered.filter((product) =>
				selectedCategories.includes(product.category),
			);
		}

		// Filter by price range
		filtered = filtered.filter(
			(product) =>
				product.price >= priceRange[0] && product.price <= priceRange[1],
		);

		// Filter by condition
		if (selectedConditions.length > 0) {
			filtered = filtered.filter((product) =>
				selectedConditions.includes(product.condition),
			);
		}

		// Sort results
		const sorted = [...filtered];
		switch (sortBy) {
			case "price-low-high":
				sorted.sort((a, b) => a.price - b.price);
				break;
			case "price-high-low":
				sorted.sort((a, b) => b.price - a.price);
				break;
			case "rating":
				sorted.sort((a, b) => b.rating - a.rating);
				break;
			case "reviews":
				sorted.sort((a, b) => b.reviews - a.reviews);
				break;
			default:
				// Best match - keep original order
				break;
		}

		return sorted;
	}, [baseResults, selectedCategories, priceRange, selectedConditions, sortBy]);

	// Update URL with filter parameters
	useEffect(() => {
		const params = new URLSearchParams();

		// Always set the search query
		if (query) {
			params.set("q", query);
		}

		if (selectedCategories.length > 0) {
			params.set("categories", selectedCategories.join(","));
		}

		if (priceRange[0] > 0 || priceRange[1] < maxPrice) {
			params.set("minPrice", priceRange[0].toString());
			params.set("maxPrice", priceRange[1].toString());
		}

		if (selectedConditions.length > 0) {
			params.set("conditions", selectedConditions.join(","));
		}

		if (sortBy !== "best-match") {
			params.set("sort", sortBy);
		}

		const newUrl = `/search?${params.toString()}`;
		if (newUrl !== window.location.pathname + window.location.search) {
			router.replace(newUrl);
		}
	}, [
		selectedCategories,
		priceRange,
		selectedConditions,
		sortBy,
		query,
		maxPrice,
		router,
	]);

	const clearAllFilters = () => {
		setSelectedCategories([]);
		setPriceRange([0, maxPrice]);
		setSelectedConditions([]);
		setSortBy("best-match");

		// If there's a search query, clear filters but keep search
		if (query.trim()) {
			// Just clear filters, keep the search query
			const params = new URLSearchParams();
			params.set("q", query);
			router.replace(`/search?${params.toString()}`);
		}
	};

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
							{filteredAndSortedResults.length} items found
						</p>
					</motion.div>
				)}

				{/* Filters Bar */}
				<div className="flex justify-start gap-4 items-center mb-6 sticky top-15 md:top-23 z-10 bg-background py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
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
										<div className="space-y-2">
											{categories.map((category) => (
												<label
													key={category.slug}
													className="flex items-center gap-2 cursor-pointer"
												>
													<input
														type="checkbox"
														checked={selectedCategories.includes(category.slug)}
														onChange={(e) => {
															if (e.target.checked) {
																setSelectedCategories([
																	...selectedCategories,
																	category.slug,
																]);
															} else {
																setSelectedCategories(
																	selectedCategories.filter(
																		(c) => c !== category.slug,
																	),
																);
															}
														}}
														className="rounded border-border text-primary focus:ring-primary/20"
													/>
													<span className="text-sm text-foreground">
														{category.name}
													</span>
												</label>
											))}
										</div>
									</div>

									{/* Price Range */}
									<div>
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
											<input
												type="range"
												min="0"
												max={maxPrice}
												value={priceRange[1]}
												onChange={(e) =>
													setPriceRange([
														priceRange[0],
														parseInt(e.target.value),
													])
												}
												className="w-full"
											/>
										</div>
									</div>

									{/* Condition */}
									<div>
										<h4 className="font-medium text-foreground mb-3">
											Condition
										</h4>
										<div className="space-y-2">
											{availableConditions.map((condition) => (
												<label
													key={condition}
													className="flex items-center gap-2 cursor-pointer"
												>
													<input
														type="checkbox"
														checked={selectedConditions.includes(condition)}
														onChange={(e) => {
															if (e.target.checked) {
																setSelectedConditions([
																	...selectedConditions,
																	condition,
																]);
															} else {
																setSelectedConditions(
																	selectedConditions.filter(
																		(c) => c !== condition,
																	),
																);
															}
														}}
														className="rounded border-border text-primary focus:ring-primary/20"
													/>
													<span className="text-sm text-foreground">
														{condition}
													</span>
												</label>
											))}
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
							className="flex-shrink-0 bg-card rounded-lg border border-border p-6 h-fit sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto"
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
								<div className="space-y-2">
									{categories.map((category) => (
										<label
											key={category.slug}
											className="flex items-center gap-2 cursor-pointer"
										>
											<input
												type="checkbox"
												checked={selectedCategories.includes(category.slug)}
												onChange={(e) => {
													if (e.target.checked) {
														setSelectedCategories([
															...selectedCategories,
															category.slug,
														]);
													} else {
														setSelectedCategories(
															selectedCategories.filter(
																(c) => c !== category.slug,
															),
														);
													}
												}}
												className="rounded border-border text-primary focus:ring-primary/20"
											/>
											<span className="text-sm text-foreground">
												{category.name}
											</span>
										</label>
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
									<input
										type="range"
										min="0"
										max={maxPrice}
										value={priceRange[1]}
										onChange={(e) =>
											setPriceRange([priceRange[0], parseInt(e.target.value)])
										}
										className="w-full"
									/>
								</div>
							</div>

							{/* Condition */}
							<div className="mb-6">
								<h4 className="font-medium text-foreground mb-3">Condition</h4>
								<div className="space-y-2">
									{availableConditions.map((condition) => (
										<label
											key={condition}
											className="flex items-center gap-2 cursor-pointer"
										>
											<input
												type="checkbox"
												checked={selectedConditions.includes(condition)}
												onChange={(e) => {
													if (e.target.checked) {
														setSelectedConditions([
															...selectedConditions,
															condition,
														]);
													} else {
														setSelectedConditions(
															selectedConditions.filter((c) => c !== condition),
														);
													}
												}}
												className="rounded border-border text-primary focus:ring-primary/20"
											/>
											<span className="text-sm text-foreground">
												{condition}
											</span>
										</label>
									))}
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
								{filteredAndSortedResults.map((product: any, i: number) => (
									<ProductCard key={product.id} product={product} index={i} />
								))}
							</div>
						) : (
							<div className="text-center py-20">
								<p className="text-4xl mb-4">
									<span className="block text-5xl mb-2">?</span>
									No results found
								</p>

								<p className="text-muted-foreground">
									Try adjusting your filters or search for something like
									"iPhone", "MacBook", or "headphones"
								</p>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
};

export default SearchResults;
