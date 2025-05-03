import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const MobileNav = () => {
	const routes = [
		{
			href: "/shop",
			label: "Shop",
		},
		{
			href: "/category/laptops",
			label: "Laptops",
		},
		{
			href: "/category/phones",
			label: "Phones",
		},
		{
			href: "/category/consumer-electronics",
			label: "Consumer Electronics",
		},
		{
			href: "/about-products",
			label: "About Our Products",
		},
	];

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					className="lg:hidden cursor-pointer hover:bg-orange-400"
				>
					<Menu className="h-6 w-6" />
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-[300px] sm:w-[400px]">
				<nav className="flex flex-col gap-4">
					{routes.map((route) => (
						<Link
							key={route.href}
							href={route.href}
							className={cn(
								"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:bg-orange-400"
							)}
						>
							{route.label}
						</Link>
					))}
				</nav>
			</SheetContent>
		</Sheet>
	);
};
