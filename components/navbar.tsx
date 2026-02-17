"use client";

import { useState, useRef, useEffect } from "react";
import {
	Search,
	Menu,
	X,
	Instagram,
	Facebook,
	MessageCircle,
	ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/public/71f241a6-a4bb-422f-b7e6-29032fee0ed6.png";

import { searchProducts, Product, categories } from "@/lib/products";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ThemeToggle from "./ui/theme-toggle";
import { AuthButtons } from "./auth/AuthButtons";
import { Cart } from "./Cart";
import Link from "next/link";

const Navbar = () => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Product[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
	const router = useRouter();
	const dropdownRef = useRef<HTMLFormElement>(null);
	const categoryDropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (query.trim().length > 0) {
			const found = searchProducts(query);
			setResults(found);
			setShowDropdown(true);
		} else {
			setResults([]);
			setShowDropdown(false);
		}
	}, [query]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setShowDropdown(false);
			}
			if (
				categoryDropdownRef.current &&
				!categoryDropdownRef.current.contains(e.target as Node)
			) {
				setCategoryDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelect = (product: Product) => {
		setShowDropdown(false);
		setQuery("");
		router.push(`/search?q=${encodeURIComponent(product.title)}`);
	};

	const handleCategorySelect = (categorySlug: string) => {
		setCategoryDropdownOpen(false);
		router.push(`/search?q=${encodeURIComponent(categorySlug)}`);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (query.trim()) {
			setShowDropdown(false);
			router.push(`/search?q=${encodeURIComponent(query.trim())}`);
		}
	};

	return (
		<>
			<nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-2xl">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					{/* Top bar with socials */}
					<div className="hidden md:flex items-center justify-end gap-3 py-1.5 text-muted-foreground border-b border-border/30">
						<a
							href="https://instagram.com"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-primary transition-colors"
						>
							<Instagram className="h-3.5 w-3.5" />
						</a>
						<a
							href="https://facebook.com"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-primary transition-colors"
						>
							<Facebook className="h-3.5 w-3.5" />
						</a>
						<a
							href="https://wa.me/+233245151416"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-primary transition-colors"
						>
							<MessageCircle className="h-3.5 w-3.5" />
						</a>
						<span className="text-xs ml-2">Accra, Ghana</span>
					</div>

					<div className="flex h-16 items-center justify-between gap-4">
						{/* Logo */}
						<Link href="/" className="shrink-0">
							<Image src={logo} alt="Payless4Tech" className="h-10 w-auto" />
						</Link>

						{/* Category Dropdown and Search Bar - Desktop */}
						<div className="hidden flex-1 max-w-2xl md:flex items-center gap-2">
							{/* Category Dropdown */}
							<div className="relative" ref={categoryDropdownRef}>
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
													<button
														onClick={() => handleCategorySelect(category.slug)}
														className="flex items-center gap-2 w-full mb-2 text-left"
													>
														<p className="text-sm font-semibold text-foreground">
															{category.name}
														</p>
													</button>
													{category.children && (
														<div className=" border-l border-border/30 pl-3 space-y-1">
															{category.children.map((child) => (
																<button
																	key={child.slug}
																	onClick={() =>
																		handleCategorySelect(child.slug)
																	}
																	className="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
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

							{/* Search Form */}
							<form
								onSubmit={handleSubmit}
								className="flex-1 relative"
								ref={dropdownRef}
							>
								<div className="relative w-full">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<input
										type="text"
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										onFocus={() => query.trim() && setShowDropdown(true)}
										placeholder="Search for tech deals... e.g. iPhone 11 Pro"
										className="w-full rounded-lg border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
									/>
								</div>

								{/* Dropdown results */}
								{showDropdown && (
									<div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-lg z-50 max-h-80 overflow-y-auto">
										{results.length > 0 ? (
											results.map((product) => (
												<button
													type="button"
													key={product.id}
													onClick={() => handleSelect(product)}
													className="flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors text-left"
												>
													<img
														src={product.image}
														alt={product.title}
														className="h-10 w-10 rounded object-cover flex-shrink-0"
													/>
													<div className="min-w-0 flex-1">
														<p className="text-sm font-medium text-foreground truncate">
															{product.title}
														</p>
														<p className="text-xs text-muted-foreground">
															${product.price.toFixed(2)}
														</p>
													</div>
												</button>
											))
										) : (
											<div className="px-4 py-6 text-center">
												<p className="text-sm text-muted-foreground">
													No results for "{query}"
												</p>
												<p className="text-xs text-muted-foreground mt-1">
													Try "iPhone", "MacBook", or "headphones"
												</p>
											</div>
										)}
										{results.length > 0 && (
											<button
												type="button"
												onClick={() => {
													setShowDropdown(false);
													router.push(`/search?q=${encodeURIComponent(query)}`);
												}}
												className="w-full px-4 py-2.5 text-sm font-medium text-primary hover:bg-accent transition-colors border-t border-border"
											>
												View all results for "{query}" →
											</button>
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
							<ThemeToggle />
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
								<div className="relative w-full" ref={categoryDropdownRef}>
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
															className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-accent transition-colors text-left rounded-md"
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
																		className="flex items-center w-full px-3 py-2 hover:bg-accent transition-colors text-left rounded-md"
																	>
																		<p className="text-xs text-muted-foreground hover:text-foreground transition-colors">
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

								<div className="flex gap-2 items-center">
									<AuthButtons />

									<Cart />
								</div>
							</div>

							<form onSubmit={handleSubmit} className="relative flex-1">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<input
										type="text"
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										placeholder="Search for tech deals..."
										className="w-full rounded-lg border border-border bg-secondary/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
									/>
								</div>
								{showDropdown && results.length > 0 && (
									<div className="mt-1 rounded-lg border border-border bg-popover shadow-lg max-h-60 overflow-y-auto">
										{results.map((product) => (
											<button
												type="button"
												key={product.id}
												onClick={() => handleSelect(product)}
												className="flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors text-left"
											>
												<img
													src={product.image}
													alt={product.title}
													className="h-8 w-8 rounded object-cover"
												/>
												<p className="text-sm text-foreground truncate">
													{product.title}
												</p>
											</button>
										))}
									</div>
								)}
							</form>

							<div className="flex items-center gap-3 pt-2 border-t border-border/30">
								<Link
									href="https://www.instagram.com/payless4tech"
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-primary"
								>
									<Instagram className="h-4 w-4" />
								</Link>
								<Link
									href="https://web.facebook.com/p/Payless4Tech"
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-primary"
								>
									<Facebook className="h-4 w-4" />
								</Link>
								<Link
									href="https://wa.me/+233245151416"
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-primary"
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
			</nav>
		</>
	);
};

export default Navbar;
