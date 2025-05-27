import { Cart } from "./Cart";
import { AuthButtons } from "./auth/AuthButtons";
import { NavLinks } from "./navigation/NavLinks";
import { MobileNav } from "./navigation/MobileNav";
import Link from "next/link";
import MTN from "@/public/mtn.svg";
import masterCard from "@/public/mastercard.svg";
import Image from "next/image";
import logo from "@/public/71f241a6-a4bb-422f-b7e6-29032fee0ed6.png";
import visaCard from "@/public/15207737761691557912.svg";

export const Header = () => {
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container px-5 mx-auto flex h-14 items-center">
				<div className="mr-4 hidden lg:flex">
					<Link href="/" className="mr-6 flex items-center space-x-2">
						<Image src={logo} alt="Logo" className="h-auto w-40" />
					</Link>
					<NavLinks />
				</div>
				<div className="flex w-full flex-1 items-center justify-between space-x-2">
					{/* Mobile Navigation and Logo */}
					<div className="flex items-center gap-2 lg:hidden">
						<MobileNav />
						<Link href="/" className="mr-6 flex items-center space-x-2">
							<Image src={logo} alt="Logo" className="h-auto w-40" />
						</Link>
					</div>
					<div className="w-full flex-1 md:w-auto md:flex-none">
						{/* Add search functionality here if needed */}
					</div>
					<nav className="flex items-center space-x-4">
						{/* Only show payment logos on desktop */}
						<div className="hidden sm:flex gap-5">
							<Image src={MTN} alt="MTN MoMo" className="size-10" />
							<Image src={masterCard} alt="Mastercard" className="size-10" />
							<Image src={visaCard} alt="Visa card" className="size-10" />
						</div>
						<Cart />
						<AuthButtons />
					</nav>
				</div>
			</div>
		</header>
	);
};
