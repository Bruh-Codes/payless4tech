import Link from "next/link";

export const NavLinks = () => {
  return (
    <nav className="flex items-center space-x-6 text-sm font-medium">
      <Link href="/shop" className="transition-colors hover:text-orange-500">
        Shop
      </Link>
      <Link href="/category/laptops" className="transition-colors hover:text-orange-500">
        Laptops
      </Link>
      <Link href="/category/phones" className="transition-colors hover:text-orange-500">
        Phones
      </Link>
      <Link href="/category/consumer-electronics" className="transition-colors hover:text-orange-500">
        Consumer Electronics
      </Link>
      <Link href="/about-products" className="transition-colors hover:text-orange-500">
        About Our Products
      </Link>
    </nav>
  );
};