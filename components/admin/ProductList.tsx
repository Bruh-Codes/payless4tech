import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Archive } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Product {
	id: string;
	name: string;
	description: string | null;
	price: number;
	condition: string;
	image_url: string | null;
	category: string;
	detailed_specs: string | null;
	original_price: number | null;
	created_at: string;
	updated_at: string;
}

export const ProductList = () => {
	const [products, setProducts] = useState<Product[]>([]);

	const fetchProducts = async () => {
		const { data, error } = await supabase
			.from("products")
			.select("*")
			.order("created_at", { ascending: false });

		if (!error && data) {
			setProducts(data);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	const handleDelete = async (productId: string) => {
		try {
			const { error } = await supabase
				.from("products")
				.delete()
				.eq("id", productId);

			if (error) throw error;

			toast("Success", {
				description: "Product deleted successfully",
			});

			fetchProducts();
		} catch (error) {
			console.error("Error deleting product:", error);
			toast.error("Error", {
				description: "Failed to delete product",
			});
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Products</CardTitle>
				<CardDescription>
					View and manage your product inventory.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					{products.map((product) => (
						<Card key={product.id}>
							<CardContent className="flex items-center gap-4 p-4">
								<img
									src={product.image_url || " "}
									alt={product.name}
									className="w-20 h-20 object-cover rounded"
								/>
								<div className="flex-1">
									<div className="flex items-start justify-between">
										<div>
											<h3 className="font-semibold">{product.name}</h3>
											<p className="text-sm text-gray-500">
												{product.description}
											</p>
											<div className="flex items-center gap-2 mt-2">
												<Badge variant="secondary">${product.price}</Badge>
												<Badge>{product.condition}</Badge>
											</div>
										</div>
										<div className="flex gap-2">
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button variant="destructive" size="sm">
														<Trash2 className="h-4 w-4" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Delete Product</AlertDialogTitle>
														<AlertDialogDescription>
															Are you sure you want to delete this product? This
															action cannot be undone.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDelete(product.id)}
															className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														>
															Delete
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</CardContent>
		</Card>
	);
};
