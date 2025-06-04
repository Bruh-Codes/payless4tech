import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface CategoryData {
	category: string;
	brands: string[];
}

interface SidebarFilterProps {
	onFilterChange: (category: string | null, brand: string | null) => void;
	selectedCategory: string | null;
	selectedBrand: string | null;
}

export const SidebarFilter = ({
	onFilterChange,
	selectedCategory,
	selectedBrand,
}: SidebarFilterProps) => {
	const [categories, setCategories] = useState<CategoryData[]>([]);
	const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
	const isMobile = useIsMobile();
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		const manualCategories = ["Monitor"];
		try {
			const { data: products, error } = await supabase
				.from("products")
				.select("category, name");

			if (error) {
				console.error("Error fetching categories:", error);
				return;
			}

			// Group products by category and extract unique brands
			const categoryMap = new Map<string, Set<string>>();

			products.forEach((product) => {
				// Skip products with empty categories
				if (!product.category) return;

				if (!categoryMap.has(product.category)) {
					categoryMap.set(product.category, new Set());
				}
				// Extract brand from product name (assuming brand is first word)
				const brand = product.name.split(" ")[0];
				categoryMap.get(product.category)?.add(brand);
			});

			// Convert map to array of CategoryData and sort alphabetically
			const categoriesData: CategoryData[] = Array.from(categoryMap)
				.map(([category, brandsSet]) => ({
					category,
					brands: Array.from(brandsSet).sort(),
				}))
				.sort((a, b) => a.category.localeCompare(b.category));

			setCategories(categoriesData);
			// Expand the selected category if there is one
			if (selectedCategory) {
				setExpandedCategories([selectedCategory]);
			}
		} catch (error) {
			console.error("Error in fetchCategories:", error);
		}
	};

	const toggleCategory = (category: string) => {
		setExpandedCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
	};

	const clearFilters = () => {
		onFilterChange(null, null);
		setIsOpen(false);
	};

	const handleBrandSelect = (category: string, brand: string) => {
		onFilterChange(category, brand);
		setIsOpen(false);
	};

	const filterContent = (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex justify-between items-center">
				<h3 className="font-semibold text-lg">Filters</h3>
				{(selectedCategory || selectedBrand) && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearFilters}
						className="text-muted-foreground hover:text-primary"
					>
						Clear all
					</Button>
				)}
			</div>

			<div className="space-y-4">
				{categories.map((categoryData) => (
					<div key={categoryData.category} className="space-y-2">
						<button
							onClick={() => toggleCategory(categoryData.category)}
							className="flex items-center justify-between w-full text-left py-2 hover:text-primary transition-colors"
						>
							<span
								className={cn(
									"font-medium",
									selectedCategory === categoryData.category && "text-primary"
								)}
							>
								{categoryData.category}
							</span>
							{expandedCategories.includes(categoryData.category) ? (
								<ChevronDown className="h-4 w-4" />
							) : (
								<ChevronRight className="h-4 w-4" />
							)}
						</button>

						{expandedCategories.includes(categoryData.category) && (
							<div className="ml-4 space-y-2">
								{categoryData.brands.map((brand) => (
									<button
										key={brand}
										onClick={() =>
											handleBrandSelect(categoryData.category, brand)
										}
										className={cn(
											"block w-full text-left py-1 px-2 rounded hover:bg-accent transition-colors",
											selectedCategory === categoryData.category &&
												selectedBrand === brand &&
												"bg-primary/10 text-primary"
										)}
									>
										{brand}
									</button>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);

	return (
		<>
			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetTrigger asChild>
					<Button variant="outline" size="sm" className="lg:hidden mb-4">
						Filters {(selectedCategory || selectedBrand) && "(1)"}
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="w-[300px]">
					<SheetHeader>
						<SheetTitle>Filters</SheetTitle>
					</SheetHeader>
					{filterContent}
				</SheetContent>
			</Sheet>
			<div className="hidden lg:block w-[250px] border-r min-h-screen bg-background">
				{filterContent}
			</div>
		</>
	);
};
