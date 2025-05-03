"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductList } from "@/components/admin/ProductList";
import { SlideshowImageForm } from "@/components/admin/SlideshowImageForm";
import { SlideshowImageList } from "@/components/admin/SlideshowImageList";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Admin() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [refreshSlideshow, setRefreshSlideshow] = useState(0);

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = async () => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				toast.error("Unauthorized", {
					description: "Please login to access the admin page",
				});
				router.push("/login");
				return;
			}

			// Check if the user has admin role
			const { data: userRole, error } = await supabase
				.from("user_roles")
				.select("role")
				.eq("user_id", session.user.id)
				.single();

			if (error || userRole?.role !== "admin") {
				toast.error("Unauthorized", {
					description: "You do not have admin privileges",
				});
				router.push("/");
				return;
			}

			setIsLoading(false);
		} catch (error) {
			console.error("Auth check error:", error);
			toast.error("Error", {
				description: "An error occurred while checking authentication",
			});
			router.push("/");
		}
	};

	const handleProductAdded = () => {
		toast("Success", {
			description: "Product added successfully. Refreshing list...",
		});
	};

	const handleSlideshowImageAdded = () => {
		setRefreshSlideshow((prev) => prev + 1);
		toast("Success", {
			description: "Slideshow image added successfully",
		});
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10">
			<div className="mb-6">
				<Button
					onClick={() => router.push("/shop")}
					variant="outline"
					className="flex items-center gap-2"
				>
					<Store className="h-4 w-4" />
					Back to Shop
				</Button>
			</div>
			<div className="grid gap-8">
				<ProductForm onProductAdded={handleProductAdded} />
				<div className="space-y-6">
					<SlideshowImageForm onImageAdded={handleSlideshowImageAdded} />
					<SlideshowImageList />
				</div>
				<ProductList />
			</div>
		</div>
	);
}
