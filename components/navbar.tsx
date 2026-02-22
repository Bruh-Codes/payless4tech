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
	Twitter,
	ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/public/71f241a6-a4bb-422f-b7e6-29032fee0ed6.png";

import { categories, Product } from "@/lib/products";
import { searchEbayProducts } from "@/lib/ebay";
import { convertEbayToLocalProduct } from "@/lib/ebay";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ThemeToggle from "./ui/theme-toggle";
import { AuthButtons } from "./auth/AuthButtons";
import Cart from "./Cart";
import Link from "next/link";

// Extract static social links to avoid recreation on every render
const SocialLinks = [
	{ href: "https://x.com/payless4tech", icon: Twitter, label: "Twitter" },
	{
		href: "https://www.instagram.com/payless4tech",
		icon: Instagram,
		label: "Instagram",
	},
	{
		href: "https://web.facebook.com/p/Payless4Tech",
		icon: Facebook,
		label: "Facebook",
	},
	{
		href: "https://wa.me/+233245151416",
		icon: MessageCircle,
		label: "WhatsApp",
	},
];

const DesktopSocialLinks = () => (
	<>
		{SocialLinks.map(({ href, icon: Icon, label }) => (
			<a
				key={label}
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className="hover:text-primary transition-colors"
			>
				<Icon className="h-3.5 w-3.5" />
			</a>
		))}
		<span className="text-xs ml-2">Accra, Ghana</span>
	</>
);

const Navbar = memo(() => {
	const [query, setQuery] = useState("");
	const [debouncedQuery] = useDebounce(query, 300);
	const [showDropdown, setShowDropdown] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
	// Search source from environment variable, default to 'local'
	const router = useRouter();
	// eBay search with category support
	const desktopDropdownRef = useRef<HTMLFormElement>(null);
	const mobileDropdownRef = useRef<HTMLFormElement>(null);
	const desktopCategoryDropdownRef = useRef<HTMLDivElement>(null);
	const mobileCategoryDropdownRef = useRef<HTMLDivElement>(null);

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
			<nav className="sticky p-2 md:p-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-2xl">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					{/* Top bar with socials */}
					<div className="hidden md:flex items-center justify-end gap-3 py-1.5 text-muted-foreground border-b border-border/30">
						<DesktopSocialLinks />
					</div>

					<div className="flex h-16 items-center justify-between gap-4">
						{/* Logo */}
						<Link href="/" className="shrink-0">
							<Image
								src={logo}
								alt="Payless4Tech"
								className="h-6 md:h-8 w-auto"
							/>
						</Link>

						{/* Category Dropdown and Search Bar - Desktop */}
						<div className="hidden flex-1 max-w-2xl md:flex items-center gap-2">
							{/* Category Dropdown */}
							<div className="relative" ref={desktopCategoryDropdownRef}>
								<Button
									variant={"ghost"}
									onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
									className="flex items-center gap-2 text-sm text-foreground min-w-[160px] justify-between"
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
													<Button
														type="button"
														onClick={() => handleCategorySelect(category.slug)}
														className="flex items-center gap-2 w-full mb-2 text-left category-dropdown-item"
													>
														<p className="text-sm font-semibold text-foreground">
															{category.name}
														</p>
													</Button>
													{category.children && (
														<div className="border-l border-border/30 pl-3 space-y-1">
															{category.children.map((child) => (
																<Button
																	type="button"
																	key={child.slug}
																	onClick={() =>
																		handleCategorySelect(child.slug)
																	}
																	className="block w-full text-left text-sm text-muted-foreground/70 hover:text-primary hover:bg-accent/10 transition-colors cursor-pointer p-2 rounded-md category-dropdown-item"
																>
																	{child.name}
																</Button>
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
								className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-accent"
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
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<input
										type="text"
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										onFocus={() => query.trim() && setShowDropdown(true)}
										placeholder={`Search for tech deals.. e.g. iPhone 11 Pro`}
										className="w-full rounded-lg border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
									/>
								</div>

								{/* Dropdown results */}
								{showDropdown && (
									<div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-lg z-50 max-h-80 overflow-y-auto">
										{isLoading ? (
											<div className="px-4 py-6 text-center">
												<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
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
														className="flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors text-left"
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
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
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
														className="w-full px-4 py-2.5 text-sm font-medium text-primary hover:bg-accent transition-colors border-t border-border"
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
						<div className="hidden md:flex items-center gap-4">
							<ThemeToggle />

							<Cart />

							<AuthButtons />
						</div>

						{/* Mobile Toggle */}
						<div className="flex items-center gap-1 md:hidden">
							<div className="flex gap-2 items-center">
								<Cart />
								<AuthButtons className="hidden md:flex" />
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="text-foreground"
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
										className="flex items-center gap-2 text-sm text-foreground min-w-[160px] justify-between"
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
																		<p className="text-xs text-muted-foreground/70 hover:text-primary transition-colors">
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
								<ThemeToggle />
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
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
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
									className="text-muted-foreground/70 hover:text-primary"
								>
									<Instagram className="h-4 w-4" />
								</Link>
								<Link
									href="https://web.facebook.com/p/Payless4Tech"
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground/70 hover:text-primary"
								>
									<Facebook className="h-4 w-4" />
								</Link>
								<Link
									href="https://wa.me/+233245151416"
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground/70 hover:text-primary"
								>
									<MessageCircle className="h-4 w-4" />
								</Link>
								<span className="text-xs text-muted-foreground ml-auto">
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
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onFocus={() => query.trim() && setShowDropdown(true)}
							placeholder={`Search for tech deals.. e.g. iPhone 11 Pro`}
							className="w-full rounded-lg border border-border bg-gray-400/30 dark:bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
						/>
					</div>

					{/* Dropdown results */}
					{showDropdown && (
						<div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-lg z-50 max-h-80 overflow-y-auto">
							{isLoading ? (
								<div className="px-4 py-6 text-center">
									<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
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
											className="flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors text-left"
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
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
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
											className="w-full px-4 py-2.5 text-sm font-medium text-primary hover:bg-accent transition-colors border-t border-border"
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
		</>
	);
});

Navbar.displayName = "Navbar";

export default Navbar;
