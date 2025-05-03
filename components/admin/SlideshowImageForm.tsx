import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SlideshowImageForm = ({
	onImageAdded,
}: {
	onImageAdded: () => void;
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [newImage, setNewImage] = useState({
		title: "",
		description: "",
		displayOrder: "",
		image: null as File | null,
	});

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setNewImage({ ...newImage, image: e.target.files[0] });
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			if (!newImage.image) {
				throw new Error("Please select an image");
			}

			// Upload image to storage
			const fileExt = newImage.image.name.split(".").pop();
			const fileName = `${Math.random()}.${fileExt}`;

			const { error: uploadError, data } = await supabase.storage
				.from("slideshow-images")
				.upload(fileName, newImage.image);

			if (uploadError) throw uploadError;

			const {
				data: { publicUrl },
			} = supabase.storage.from("slideshow-images").getPublicUrl(fileName);

			// Insert record into slideshow_images table
			const { error: insertError } = await supabase
				.from("slideshow_images")
				.insert([
					{
						image_url: publicUrl,
						title: newImage.title,
						description: newImage.description,
						display_order: parseInt(newImage.displayOrder) || null,
						active: true,
					},
				]);

			if (insertError) throw insertError;

			toast("Success", {
				description: "Slideshow image added successfully",
			});

			setNewImage({
				title: "",
				description: "",
				displayOrder: "",
				image: null,
			});

			onImageAdded();
		} catch (error: any) {
			console.error("Error details:", error);
			toast.error("Error", {
				description: error.message || "Failed to add slideshow image",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Add Slideshow Image</CardTitle>
				<CardDescription>
					Add a new image to the homepage slideshow.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<Input
						type="file"
						accept="image/*"
						onChange={handleImageChange}
						required
					/>
					<Input
						placeholder="Title (optional)"
						value={newImage.title}
						onChange={(e) =>
							setNewImage({ ...newImage, title: e.target.value })
						}
					/>
					<Input
						placeholder="Description (optional)"
						value={newImage.description}
						onChange={(e) =>
							setNewImage({ ...newImage, description: e.target.value })
						}
					/>
					<Input
						type="number"
						placeholder="Display Order (optional)"
						value={newImage.displayOrder}
						onChange={(e) =>
							setNewImage({ ...newImage, displayOrder: e.target.value })
						}
					/>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? "Adding..." : "Add Image"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};
