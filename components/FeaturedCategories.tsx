import { Card, CardContent } from "@/components/ui/card";
import { Laptop, Gamepad, HardDrive, Headphones } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CategoryCardProps {
	title: string;
	icon: React.ReactNode;
	bgImage?: string;
	link: string;
}

const CategoryCard = ({ title, icon, bgImage, link }: CategoryCardProps) => {
	const router = useRouter();

	return (
		<Card
			className="cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-hover hover:scale-105 relative h-48"
			onClick={() => router.push(link)}
		>
			{bgImage && (
				<div className="absolute inset-0 z-0">
					<Image
						src={bgImage}
						alt={title}
						width={190}
						height={190}
						className="w-full h-full object-cover opacity-60 transition-all duration-500 group-hover:opacity-100 hover:opacity-100"
					/>
				</div>
			)}
			<CardContent className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4 group">
				<div className="mb-4 text-primary bg-primary/10 p-4 rounded-full transition-all duration-300 hover:bg-primary/20">
					{icon}
				</div>
				<h3 className="font-bold text-xl">{title}</h3>
			</CardContent>
		</Card>
	);
};

export const FeaturedCategories = () => {
	const categories = [
		{
			title: "MacBooks",
			icon: <Laptop size={24} />,
			bgImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
			link: "/shop?brand=MacBook",
		},
		{
			title: "HP Laptops",
			icon: <HardDrive size={24} />,
			bgImage: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6",
			link: "/shop?brand=HP",
		},
		{
			title: "Audio devices",
			icon: <Gamepad size={24} />,
			bgImage: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5",
			link: "/category/renewed-gadgets",
		},
		{
			title: "Consumer Electronics",
			icon: <Headphones size={24} />,
			bgImage: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb",
			link: "/category/consumer-electronics",
		},
	];

	return (
		<section className="py-20 bg-gray-50">
			<div className="container mx-auto px-4">
				<h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
					Featured Categories
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{categories.map((category) => (
						<CategoryCard
							key={category.title}
							title={category.title}
							icon={category.icon}
							bgImage={category.bgImage}
							link={category.link}
						/>
					))}
				</div>
			</div>
		</section>
	);
};
