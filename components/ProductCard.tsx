import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Product {
	id: string;
	name: string;
	price: number;
	condition: string;
	image_url: string | null;
	original_price: number | null;
	category: string;
	description: string | null;
	detailed_specs: string | null;
	created_at: string;
	updated_at: string;
}

interface ProductCardProps {
	product: Product;
	inCart: boolean;
}

export const ProductCard = ({ product, inCart }: ProductCardProps) => {
	const { addItem } = useCart();

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault(); // Prevent navigation
		addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			quantity: 1,
			image_url: product.image_url,
		});
	};

	const conditionDisplay = product.condition?.trim() || "New";

	return (
		<Card
			key={product.id}
			className={cn(
				"transition-all w-full duration-300 py-0 hover:shadow-xl hover:-translate-y-1 overflow-hidden group h-[400px]",
				{ "border bg-green-500/20 border-green-500": inCart }
			)} // Fixed height and width
		>
			<Link
				href={`/product/${product.id}`}
				className="max-w-full relative h-[60%] overflow-hidden"
			>
				{" "}
				{/* Fixed height for image container */}
				<img
					src={product.image_url || "/placeholder.svg"}
					alt={product.name}
					className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" // Use object-cover
					onError={(e) => {
						console.log("Image failed to load for product:", {
							id: product.id,
							url: product.image_url,
						});
						e.currentTarget.src = "/placeholder.svg";
					}}
				/>
				{product.original_price && (
					<Badge className="absolute top-2 right-2">
						Save ₵{Math.floor(product.original_price - product.price)}
					</Badge>
				)}
			</Link>
			<div className="p-4 h-[40%] flex flex-col justify-between">
				{" "}
				{/* Fixed height for text section */}
				<h3
					className="text-md font-semibold mb-2 truncate"
					title={product.name}
				>
					{product.name}
				</h3>
				<Link
					href={`/product/${product.id}`}
					className="flex items-center justify-between mb-2"
				>
					<span className="text-primary text-xl font-bold">
						₵{product.price.toLocaleString()}
					</span>
					{product.original_price && (
						<span className="text-sm text-muted-foreground line-through">
							₵{product.original_price.toLocaleString()}
						</span>
					)}
				</Link>
				<div className="flex items-center justify-between">
					<Badge
						variant="secondary"
						className="capitalize bg-[#FEC6A1] text-gray-800 hover:bg-[#FEC6A1]/90"
					>
						{conditionDisplay}
					</Badge>
					<Button
						size="sm"
						onClick={(e) => {
							if (!inCart) {
								handleAddToCart(e);
							}
						}}
						className={cn("cursor-pointer hover:opacity-90", {
							"bg-green-500 text-white cursor-not-allowed": inCart,
						})}
						disabled={inCart}
					>
						{inCart ? "In Cart" : "Add to Cart"}
					</Button>
				</div>
			</div>
		</Card>
	);
};
