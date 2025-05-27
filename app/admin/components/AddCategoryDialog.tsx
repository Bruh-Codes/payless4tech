"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FolderPlus } from "lucide-react";

type AddCategoryDialogProps = {
	onCategoryAdded: (category: string) => void;
};

const AddCategoryDialog = ({ onCategoryAdded }: AddCategoryDialogProps) => {
	const [open, setOpen] = useState(false);
	const [categoryName, setCategoryName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!categoryName.trim()) {
			toast.error("Category name is required");
			return;
		}

		setIsSubmitting(true);

		try {
			// In a real implementation, you would call Supabase to add the category
			// await supabaseClient.from('categories').insert({ name: categoryName });

			// For now we're just simulating the API call
			await new Promise((resolve) => setTimeout(resolve, 500));

			toast.success(`Category "${categoryName}" added successfully`);
			onCategoryAdded(categoryName);
			setCategoryName("");
			setOpen(false);
		} catch (error) {
			toast.error("Failed to add category");
			console.error("Error adding category:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2">
					<FolderPlus className="h-4 w-4" />
					Add Category
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Add New Category</DialogTitle>
						<DialogDescription>
							Create a new product category for your store.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Name
							</Label>
							<Input
								id="name"
								value={categoryName}
								onChange={(e) => setCategoryName(e.target.value)}
								className="col-span-3"
								autoFocus
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Adding..." : "Add Category"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddCategoryDialog;
