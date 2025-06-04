import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PreorderFormProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	handleOrderSuccess?: (data: boolean) => void;
	userDetails?: {
		email?: string;
		fullName?: string;
		phoneNumber?: string;
		itemType?: string;
		specifications?: string;
		productName?: string;
	};
}

export const PreorderForm = ({
	isOpen,
	onOpenChange,
	handleOrderSuccess,
	userDetails,
}: PreorderFormProps) => {
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		phoneNumber: "",
		itemType: "",
		specifications: "",
		productName: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (userDetails) {
			setFormData({
				fullName: userDetails.fullName || "",
				email: userDetails.email || "",
				phoneNumber: userDetails.phoneNumber || "",
				itemType: userDetails.itemType || "",
				specifications: userDetails.specifications || "",
				productName: userDetails.productName || "",
			});
		}
	}, [userDetails]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Insert into Supabase
			const { error: dbError } = await supabase.from("preorders").insert([
				{
					full_name: formData.fullName,
					email: formData.email,
					phone_number: formData.phoneNumber,
					item_type: formData.itemType === "",
					specifications: { details: formData.specifications },
				},
			]);

			if (dbError) throw dbError;

			// Send email notification
			// const { error: emailError } = await supabase.functions.invoke(
			// 	"send-preorder-email",
			// 	{
			// 		body: {
			// 			preorderDetails: {
			// 				fullName: formData.fullName,
			// 				email: formData.email,
			// 				phoneNumber: formData.phoneNumber,
			// 				itemType: formData.itemType,
			// 				specifications: formData.specifications,
			// 			},
			// 		},
			// 	}
			// );

			// if (emailError) throw emailError;

			// Show success toast
			toast.success("Preorder Submitted Successfully", {
				description:
					"Thank you for the information, our team will contact you.",
				duration: 5000, // Show for 5 seconds
			});
			handleOrderSuccess && handleOrderSuccess(true);

			// Reset form and close dialog
			setFormData({
				fullName: "",
				email: "",
				phoneNumber: "",
				itemType: "",
				specifications: "",
				productName: "",
			});
			onOpenChange(false);
		} catch (error: any) {
			console.error("Error submitting preorder:", error);
			toast.error("Error", {
				description: "Failed to submit preorder. Please try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Preorder Request</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className="space-y-4 overflow-y-auto h-full"
				>
					<div className="grid grid-cols-2 gap-2">
						<div className="space-y-2">
							<Label htmlFor="fullName">Full Name</Label>
							<Input
								id="fullName"
								required
								value={formData.fullName}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, fullName: e.target.value }))
								}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="phoneNumber">Phone Number</Label>
							<Input
								id="phoneNumber"
								required
								value={formData.phoneNumber}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										phoneNumber: e.target.value,
									}))
								}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							required
							value={formData.email}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, email: e.target.value }))
							}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="product-name">Product Name</Label>
						<Input
							id="product-name"
							required
							value={formData.productName}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									productName: e.target.value,
								}))
							}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="itemType">Item Type</Label>
						<Select
							value={formData.itemType}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, itemType: value }))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select item type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="laptops">Laptop</SelectItem>
								<SelectItem value="phones">Phone</SelectItem>
								<SelectItem value="consumer-electronics">
									Consumer Electronic
								</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="specifications">Specifications</Label>
						<Textarea
							id="specifications"
							required
							placeholder="Please describe your requirements..."
							value={formData.specifications}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									specifications: e.target.value,
								}))
							}
						/>
					</div>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Submitting..." : "Submit Preorder"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};
