import Link from "next/link";

export const NavLinks = () => {
	return (
		<nav className="flex items-center space-x-6 text-sm font-medium">
			<Link
				href="/shop"
				className="transition-colors hover:text-orange-500"
				aria-label="Browse all products in our shop"
			>
				Shop
			</Link>
			<Link
				href="/category/laptops"
				className="transition-colors hover:text-orange-500"
				aria-label="Browse laptop computers"
			>
				Laptops
			</Link>
			<Link
				href="/category/phones"
				className="transition-colors hover:text-orange-500"
				aria-label="Browse smartphones and mobile phones"
			>
				Phones
			</Link>
			<Link
				href="/category/consumer-electronics"
				className="transition-colors hover:text-orange-500"
				aria-label="Browse consumer electronics and gadgets"
			>
				Consumer Electronics
			</Link>
			<Link
				href="/about-products"
				className="transition-colors hover:text-orange-500"
				aria-label="Learn about our products and services"
			>
				About Our Products
			</Link>
		</nav>
	);
};
