"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2, Image } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export const SlideshowImageList = () => {
	const [images, setImages] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchImages();

		// Set up realtime subscription
		const channel = supabase
			.channel("slideshow_changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "slideshow_images",
				},
				() => {
					fetchImages();
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	const fetchImages = async () => {
		try {
			const { data, error } = await supabase
				.from("slideshow_images")
				.select("*")
				.order("display_order", { ascending: true })
				.order("updated_at", { ascending: false });

			if (error) throw error;
			setImages(data || []);
		} catch (error: any) {
			console.error("Error fetching slideshow images:", error);
			toast.error("Error", {
				description: "Failed to fetch slideshow images",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (id: string, imageUrl: string) => {
		try {
			// First, delete from storage
			const imagePath = imageUrl.split("/").pop();
			if (imagePath) {
				const { error: storageError } = await supabase.storage
					.from("slideshow-images")
					.remove([imagePath]);

				if (storageError) throw storageError;
			}

			// Then delete from database
			const { error: dbError } = await supabase
				.from("slideshow_images")
				.delete()
				.eq("id", id);

			if (dbError) throw dbError;

			toast("Success", {
				description: "Image deleted successfully",
			});

			// Fetch updated list
			fetchImages();
		} catch (error: any) {
			console.error("Error deleting image:", error);
			toast.error("Error", {
				description: "Failed to delete image",
			});
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Slideshow Images</CardTitle>
				<CardDescription>
					Manage images in the homepage slideshow
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{images.map((image) => (
						<div key={image.id} className="relative group">
							<div className="aspect-video relative rounded-lg overflow-hidden border">
								<img
									src={image.image_url}
									alt={image.title || "Slideshow image"}
									className="w-full h-full object-cover"
								/>
								<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
									<Button
										variant="destructive"
										size="icon"
										onClick={() => handleDelete(image.id, image.image_url)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
							{image.title && (
								<p className="mt-2 text-sm font-medium">{image.title}</p>
							)}
							{image.description && (
								<p className="text-sm text-muted-foreground">
									{image.description}
								</p>
							)}
							{image.display_order !== null && (
								<p className="text-sm text-muted-foreground">
									Order: {image.display_order}
								</p>
							)}
						</div>
					))}
					{images.length === 0 && (
						<div className="col-span-full text-center py-8">
							<Image className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-2 text-sm font-semibold">No images</h3>
							<p className="mt-1 text-sm text-gray-500">
								Add images to the slideshow using the form above
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};
