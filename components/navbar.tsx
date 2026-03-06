"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useDebounce } from "use-debounce";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
	Search,
	Menu,
	X,
	Instagram,
	Facebook,
	MessageCircle,
	ChevronDown,
	ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/public/images/logo/payless-logo.png";

import { categories, Product } from "@/lib/products";
import { searchEbayProducts } from "@/lib/ebay";
import { convertEbayToLocalProduct } from "@/lib/ebay";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AuthButtons } from "./auth/AuthButtons";
import Cart from "./Cart";
import Link from "next/link";
import { cn } from "@/lib/utils";

const Navbar = memo(() => {
	const [query, setQuery] = useState("");
	const [debouncedQuery] = useDebounce(query, 300);
	const [showDropdown, setShowDropdown] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
	const [navbarBg, setNavbarBg] = useState(
		"bg-background/80 backdrop-blur-2xl",
	);
	// eBay search with category support
	const router = useRouter();
	// eBay search with category support
	const desktopDropdownRef = useRef<HTMLFormElement>(null);
	const mobileDropdownRef = useRef<HTMLFormElement>(null);
	const desktopCategoryDropdownRef = useRef<HTMLDivElement>(null);
	const mobileCategoryDropdownRef = useRef<HTMLDivElement>(null);

	// Listen for hero slide changes to update navbar background
	useEffect(() => {
		const handleHeroSlideChange = (event: CustomEvent) => {
			const { navbarBg } = event.detail;
			if (navbarBg) {
				setNavbarBg(navbarBg);
			}
		};

		window.addEventListener(
			"heroSlideChange",
			handleHeroSlideChange as EventListener,
		);
		return () =>
			window.removeEventListener(
				"heroSlideChange",
				handleHeroSlideChange as EventListener,
			);
	}, []);

	// Determine text color based on navbar background
	const isDarkNavbar =
		navbarBg.includes("bg-black") || navbarBg.includes("bg-gray-900");
	const textColor = isDarkNavbar ? "text-white" : "text-foreground";
	const borderColor = isDarkNavbar ? "border-none" : "border-border";

	// Use React Query for search — eagerly fetch up to 20 results for dropdown
	const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
		useInfiniteQuery({
			queryKey: ["navbar-search", debouncedQuery],
			queryFn: async ({ pageParam }: { pageParam: number }) => {
				if (debouncedQuery.trim().length === 0)
					return { items: [], totalCount: 0, pageNumber: 1 };
				const response = await searchEbayProducts(
					debouncedQuery,
					pageParam,
					10, // Fetch 10 per page for faster loading
					"GHS",
					"bestMatch",
				);
				return {
					...response,
					items: response.items.map(convertEbayToLocalProduct),
				};
			},
			getNextPageParam: (lastPage: any) => {
				// Stop if fewer items than requested
				if (!lastPage.items || lastPage.items.length < 10) return undefined;
				return lastPage.pageNumber + 1;
			},
			initialPageParam: 1,
			enabled: debouncedQuery.trim().length > 0,
		});

	// Flatten all pages for display
	const allResults = data?.pages?.flatMap((page) => page.items) || [];

	// Auto-fetch more pages until we have 20 results (no scroll detection needed for dropdown)
	useEffect(() => {
		if (
			!isFetchingNextPage &&
			hasNextPage &&
			allResults.length > 0 &&
			allResults.length < 20
		) {
			fetchNextPage();
		}
	}, [isFetchingNextPage, hasNextPage, allResults.length, fetchNextPage]);

	// Check if we should show "View all results" button (after 20 results)
	const showViewAllButton = allResults.length >= 20 && !isFetchingNextPage;

	useEffect(() => {
		if (debouncedQuery.trim().length > 0) {
			setShowDropdown(true);
		} else {
			setShowDropdown(false);
		}
	}, [debouncedQuery]);

	const handleSelect = useCallback(
		(product: Product) => {
			setShowDropdown(false);
			setQuery("");
			// Navigate to search results page with pre-loaded data
			// Pass the existing search results to avoid new API call
			const searchQuery = encodeURIComponent(product.title);
			const existingResults = JSON.stringify(allResults);
			router.push(
				`/search?q=${searchQuery}&preload=true&data=${encodeURIComponent(existingResults)}`,
			);
		},
		[router, allResults],
	);

	const handleCategorySelect = useCallback(
		(categorySlug: string) => {
			setCategoryDropdownOpen(false);
			router.push(`/search?q=${encodeURIComponent(categorySlug)}`);
		},
		[router],
	);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (query.trim()) {
				setShowDropdown(false);
				router.push(`/search?q=${encodeURIComponent(query.trim())}`);
			}
		},
		[query, router],
	);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Node;
			const isInsideSearch =
				(desktopDropdownRef.current &&
					desktopDropdownRef.current.contains(target)) ||
				(mobileDropdownRef.current &&
					mobileDropdownRef.current.contains(target));

			if (!isInsideSearch) {
				setShowDropdown(false);
			}
			// Only close category dropdown if clicking outside, not on category items
			const isInsideCategory =
				(desktopCategoryDropdownRef.current &&
					desktopCategoryDropdownRef.current.contains(target)) ||
				(mobileCategoryDropdownRef.current &&
					mobileCategoryDropdownRef.current.contains(target)) ||
				(e.target as Element).closest(".category-dropdown-item");

			if (!isInsideCategory) {
				setCategoryDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside, {
			passive: true,
		});
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<>
			<nav
				className={`fixed top-0 left-0 right-0 px-4 py-1 z-50 border-b ${borderColor} ${navbarBg}`}
			>
				<div className="mx-auto max-w-7xl  sm:px-6 lg:px-8">
					{/* Top bar with socials */}
					{/* <div className="hidden md:flex items-center justify-end gap-3 py-1.5 text-muted-foreground border-b border-border/30">
						<DesktopSocialLinks />
					</div> */}

					<div className="flex h-12 items-center justify-between gap-4">
						<Link href="/" className="shrink-0 flex items-center">
							<Image
								src={logo}
								alt="Payless4Tech"
								// Using mix-blend-multiply to remove the solid white bg on light slides.
								// On dark slides, we invert it so the dark text becomes white and the white background becomes transparent against dark.
								className={cn(
									"h-20 w-auto transition-all duration-300 object-contain",
									// isDarkNavbar
									// 	? "brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
									// 	: "mix-blend-multiply drop-shadow-sm",
								)}
								priority
							/>
						</Link>

						{/* Category Dropdown and Search Bar - Desktop */}
						<div className="hidden flex-1 max-w-2xl md:flex items-center gap-2">
							{/* Category Dropdown */}
							<div className="relative" ref={desktopCategoryDropdownRef}>
								<Button
									variant={"ghost"}
									onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
									className={`flex items-center gap-2 text-sm min-w-[160px] justify-between ${textColor} ${isDarkNavbar ? "hover:bg-white/10" : "hover:bg-gray-200"} transition-colors`}
								>
									<span>Shop by category</span>
									<ChevronDown
										className={`size-4 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`}
									/>
								</Button>

								{categoryDropdownOpen && (
									<div className="absolute top-full left-0 mt-3 rounded-lg border border-border bg-popover shadow-lg z-50 min-w-[700px] max-h-96 overflow-y-auto p-4">
										<div className="grid grid-cols-3 gap-4">
											{categories.map((category) => (
												<div key={category.slug} className="pb-4">
													<button
														type="button"
														onClick={() => handleCategorySelect(category.slug)}
														className="flex items-center gap-2 w-full mb-2 text-left category-dropdown-item"
													>
														<p className="text-sm font-semibold text-foreground">
															{category.name}
														</p>
													</button>
													{category.children && (
														<div className="border-l border-border/30 pl-3 space-y-1">
															{category.children.map((child) => (
																<button
																	type="button"
																	key={child.slug}
																	onClick={() =>
																		handleCategorySelect(child.slug)
																	}
																	className="block w-full text-left text-sm text-foreground hover:bg-accent/10 transition-colors cursor-pointer p-2 rounded-md category-dropdown-item"
																>
																	{child.name}
																</button>
															))}
														</div>
													)}
												</div>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Shop Link */}
							<Link
								href="/shop"
								className={`flex items-center gap-2 text-sm font-medium ${textColor} transition-colors px-3 py-2 rounded-xl ${isDarkNavbar ? "hover:bg-white/10" : "hover:bg-gray-200"}`}
							>
								<ShoppingBag className="h-4 w-4" />
								Shop
							</Link>

							{/* Search Form */}
							<form
								onSubmit={handleSubmit}
								className="flex-1 relative"
								ref={desktopDropdownRef}
							>
								<div className="relative w-full">
									<Search
										className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkNavbar ? "text-white/60" : "text-muted-foreground"}`}
									/>
									<input
										type="text"
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										onFocus={() => query.trim() && setShowDropdown(true)}
										placeholder={`Search for tech deals.. e.g. iPhone 11 Pro`}
										className={`w-full rounded-lg border ${isDarkNavbar ? "border-white/20 bg-white/10 hover:bg-white/20" : "border-black/10 bg-black/5 hover:bg-black/10"} py-2.5 pl-10 pr-4 text-sm ${textColor} ${isDarkNavbar ? "placeholder:text-white/60" : "placeholder:text-muted-foreground"} focus:outline-none focus:ring-2 focus:ring-brand-color focus:border-brand-color transition-all`}
									/>
								</div>

								{/* Dropdown results */}
								{showDropdown && (
									<div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-lg z-50 max-h-80 overflow-y-auto">
										{isLoading ? (
											<div className="px-4 py-6 text-center">
												<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
												<p className="text-sm text-muted-foreground mt-2">
													Searching Inventory...
												</p>
											</div>
										) : allResults.length > 0 ? (
											<>
												{allResults.map((product, index) => (
													<button
														type="button"
														key={`${product.id}-${index}`}
														onClick={() => handleSelect(product)}
														className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-200 dark:hover:bg-accent transition-colors text-left"
													>
														{product.image && (
															<Image
																width={32}
																height={32}
																src={product.image}
																alt={product.title}
																className="h-8 w-8 rounded object-cover shrink-0"
															/>
														)}
														<p className="text-sm font-medium text-foreground flex-1 min-w-0">
															{product.title}
														</p>
													</button>
												))}
												{isFetchingNextPage && (
													<div className="px-4 py-3 text-center">
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mx-auto"></div>
														<p className="text-xs text-muted-foreground mt-1">
															Loading more...
														</p>
													</div>
												)}
												{showViewAllButton && (
													<button
														type="button"
														onClick={() => {
															setShowDropdown(false);
															router.push(
																`/search?q=${encodeURIComponent(query)}`,
															);
														}}
														className="w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:hover:bg-accent transition-colors border-t border-border"
													>
														View all results →
													</button>
												)}
											</>
										) : (
											<div className="px-4 py-6 text-center">
												<p className="text-sm text-muted-foreground">
													No results for "{query}" in inventory
												</p>
												<p className="text-xs text-muted-foreground mt-1">
													Try "iPhone", "MacBook", or "headphones"
												</p>
											</div>
										)}
									</div>
								)}
							</form>
						</div>

						{/* Right Actions */}
						<div
							className={`hidden md:flex items-center gap-2 lg:gap-4 ${
								isDarkNavbar
									? "dark [&_button]:bg-white/10 [&_button]:text-white [&_button:hover]:bg-white/20 [&_button]:border-white/20"
									: ""
							}`}
						>
							<Cart />
							<AuthButtons />
						</div>

						{/* Mobile Toggle */}
						<div
							className={`flex items-center gap-1 md:hidden ${isDarkNavbar ? "dark" : ""}`}
						>
							<div
								className={`flex gap-2 items-center ${isDarkNavbar ? "[&_button]:bg-white/10 [&_button]:text-white [&_button:hover]:bg-white/20" : ""}`}
							>
								<Cart />
								<AuthButtons className="hidden md:flex" />
							</div>
							<Button
								variant="ghost"
								size="icon"
								className={`${textColor} ${isDarkNavbar ? "hover:bg-white/10" : "hover:bg-gray-200"}`}
								onClick={() => setMobileOpen(!mobileOpen)}
							>
								{mobileOpen ? (
									<X className="h-5 w-5" />
								) : (
									<Menu className="h-5 w-5" />
								)}
							</Button>
						</div>
					</div>

					{/* Mobile Search */}
					<div
						className={`
							md:hidden w-full transition-all duration-300 ease-in-out
							${mobileOpen ? "max-h-screen pb-4 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}
						`}
					>
						<div className="space-y-3 w-full">
							{/* Mobile Category Dropdown */}
							<div className="flex items-center justify-between">
								<div
									className="relative w-full"
									ref={mobileCategoryDropdownRef}
								>
									<Button
										variant={"ghost"}
										onClick={() =>
											setCategoryDropdownOpen(!categoryDropdownOpen)
										}
										className={`flex items-center gap-2 text-sm ${textColor} min-w-[160px] justify-between`}
									>
										<span>Shop by category</span>
										<ChevronDown
											className={`h-4 w-4 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`}
										/>
									</Button>

									{categoryDropdownOpen && (
										<div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-lg z-[60] max-h-[50vh] overflow-y-auto w-full">
											<div className="p-1">
												{categories.map((category) => (
													<div
														key={category.slug}
														className="border-b border-border/50 last:border-b-0"
													>
														<button
															onClick={() =>
																handleCategorySelect(category.slug)
															}
															className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-accent transition-colors text-left rounded-md category-dropdown-item"
														>
															<div className="flex-1">
																<p className="text-sm font-medium text-foreground">
																	{category.name}
																</p>
															</div>
														</button>
														{category.children && (
															<div className=" pl-2 border-l border-border/30">
																{category.children.map((child) => (
																	<button
																		key={child.slug}
																		onClick={() =>
																			handleCategorySelect(child.slug)
																		}
																		className="flex items-center w-full px-3 py-2 hover:bg-accent transition-colors text-left rounded-md category-dropdown-item"
																	>
																		<p className="text-xs text-foreground transition-colors">
																			{child.name}
																		</p>
																	</button>
																))}
															</div>
														)}
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</div>

							<form onSubmit={handleSubmit} className="relative flex-1">
								{showDropdown && !isLoading && allResults.length > 0 && (
									<div className="mt-2 rounded-lg border border-border bg-popover shadow-lg max-h-60 overflow-y-auto">
										{allResults.map((product) => (
											<Button
												type="button"
												key={`mobile-${product.id}`}
												onClick={() => handleSelect(product)}
												className="flex items-center gap-3 w-full hover:bg-accent transition-colors text-left"
											>
												{product.image && (
													<Image
														width={32}
														height={32}
														src={product.image}
														alt={product.title}
														className="h-full w-full rounded object-cover"
													/>
												)}
												<p className="text-sm text-foreground truncate">
													{product.title}
												</p>
											</Button>
										))}
									</div>
								)}
								{isLoading && (
									<div className="mt-2 text-center py-4">
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mx-auto"></div>
										<p className="text-xs text-muted-foreground mt-1">
											Searching...
										</p>
									</div>
								)}
							</form>

							<div className="flex items-center gap-3 pt-2 border-t border-border/30">
								<Link
									href="https://www.instagram.com/payless4tech"
									target="_blank"
									rel="noopener noreferrer"
									className={`${textColor}`}
								>
									<Instagram className="h-4 w-4" />
								</Link>
								<Link
									href="https://web.facebook.com/p/Payless4Tech"
									target="_blank"
									rel="noopener noreferrer"
									className={`${textColor}`}
								>
									<Facebook className="h-4 w-4" />
								</Link>
								<Link
									href="https://wa.me/+233245151416"
									target="_blank"
									rel="noopener noreferrer"
									className={`${textColor}`}
								>
									<MessageCircle className="h-4 w-4" />
								</Link>
								<span className={`text-xs ${textColor} ml-auto`}>
									Accra, Ghana
								</span>
							</div>
						</div>
					</div>
				</div>
				<form
					onSubmit={handleSubmit}
					className="flex-1 md:hidden relative"
					ref={mobileDropdownRef}
				>
					<div className="relative w-full">
						<Search
							className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkNavbar ? "text-white/60" : "text-muted-foreground"}`}
						/>
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onFocus={() => query.trim() && setShowDropdown(true)}
							placeholder={`Search for tech deals.. e.g. iPhone 11 Pro`}
							className={`w-full rounded-lg border ${isDarkNavbar ? "border-white/20 bg-white/10" : "border-gray-300"} py-2.5 pl-10 pr-4 text-sm ${textColor} ${isDarkNavbar ? "placeholder:text-white/60" : "placeholder:text-muted-foreground"} focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400 transition-all`}
						/>
					</div>

					{/* Dropdown results */}
					{showDropdown && (
						<div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-lg z-50 max-h-80 overflow-y-auto">
							{isLoading ? (
								<div className="px-4 py-6 text-center">
									<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
									<p className="text-sm text-muted-foreground mt-2">
										Searching Inventory...
									</p>
								</div>
							) : allResults.length > 0 ? (
								<>
									{allResults.map((product, index) => (
										<button
											type="button"
											key={`${product.id}-${index}`}
											onClick={() => handleSelect(product)}
											className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-200 dark:hover:bg-accent transition-colors text-left"
										>
											{product.image && (
												<Image
													width={32}
													height={32}
													src={product.image}
													alt={product.title}
													className="h-8 w-8 rounded object-cover shrink-0"
												/>
											)}
											<p className="text-sm font-medium text-foreground flex-1 min-w-0">
												{product.title}
											</p>
										</button>
									))}
									{isFetchingNextPage && (
										<div className="px-4 py-3 text-center">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mx-auto"></div>
											<p className="text-xs text-muted-foreground mt-1">
												Loading more...
											</p>
										</div>
									)}
									{showViewAllButton && (
										<button
											type="button"
											onClick={() => {
												setShowDropdown(false);
												router.push(`/search?q=${encodeURIComponent(query)}`);
											}}
											className="w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:hover:bg-accent transition-colors border-t border-border"
										>
											View all results →
										</button>
									)}
								</>
							) : (
								<div className="px-4 py-6 text-center">
									<p className="text-sm text-muted-foreground">
										No results for "{query}" in inventory
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										Try "iPhone", "MacBook", or "headphones"
									</p>
								</div>
							)}
						</div>
					)}
				</form>
			</nav>
			<div aria-hidden="true" className="h-28 md:h-14" />
		</>
	);
});

Navbar.displayName = "Navbar";

export default Navbar;
