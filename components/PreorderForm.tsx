import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
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
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Separator } from "./ui/separator";
import { authClient } from "@/lib/auth-client";

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
		productImage?: string;
		productId?: string;
		productCategory?: string;
	};
}

export const PreorderForm = ({
	isOpen,
	onOpenChange,
	handleOrderSuccess,
	userDetails,
}: PreorderFormProps) => {
	const [formData, setFormData] = useState({
		fullName: userDetails?.fullName || "",
		email: userDetails?.email || "",
		phoneNumber: userDetails?.phoneNumber || "",
		itemType: userDetails?.itemType || "other",
		specifications: userDetails?.specifications || "",
		productName: userDetails?.productName || "",
		productImage: userDetails?.productImage || "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const { data: session } = authClient.useSession();

	useEffect(() => {
		if (!isOpen) {
			// Reset form to empty state when closing
			setFormData({
				fullName: "",
				email: "",
				phoneNumber: "",
				itemType: "",
				specifications: "",
				productName: "",
				productImage: "",
			});
		}
	}, [isOpen]);

	// Pre-fill form with user details when available
	useEffect(() => {
		if (session?.user) {
			setFormData((prev) => ({
				...prev,
				fullName: session?.user?.name || prev.fullName,
				email: session?.user?.email || prev.email,
			}));
		}
	}, [session?.user]);

	// Listen for custom preorder events from product cards
	useEffect(() => {
		const handlePreorderEvent = (event: Event) => {
			// console.log("Preorder event received:", event);

			// Check if this is a custom event with product data
			if (event instanceof CustomEvent && event.type === "preorder") {
				const eventDetail = (event as any).detail;

				if (eventDetail && typeof eventDetail === "object") {
					console.log("Pre-filling form with product data:", eventDetail);

					// Update form with product information
					setFormData((prev) => ({
						...prev,
						fullName: prev.fullName || eventDetail.productName || "",
						email: prev.email || "",
						phoneNumber: prev.phoneNumber || "",
						itemType: prev.itemType || eventDetail.productCategory || "",
						specifications: prev.specifications || "",
						productName: prev.productName || eventDetail.productName || "",
						productImage: prev.productImage || eventDetail.productImage || "",
					}));
				}
			}
		};

		// Add multiple event listeners to ensure we catch the event
		window.addEventListener("preorder", handlePreorderEvent);
		document.addEventListener("preorder", handlePreorderEvent);

		return () => {
			// Clean up both listeners
			window.removeEventListener("preorder", handlePreorderEvent);
			document.removeEventListener("preorder", handlePreorderEvent);
		};
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// // Insert into Supabase
			// const { error: dbError } = await supabase.from("preorders").insert([
			// 	{
			// 		full_name: formData.fullName,
			// 		email: formData.email,
			// 		phone_number: formData.phoneNumber,
			// 		item_type: formData.itemType,
			// 		specifications: { details: formData.specifications },
			// 	},
			// ]);

			// if (dbError) throw dbError;

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
				productImage: "",
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
			<DialogContent className="sm:max-w-[600px] max-w-[90vw] p-4">
				<DialogHeader>
					<DialogTitle>Preorder Request</DialogTitle>
					<DialogDescription>
						Fill out the form below to place a preorder request.
					</DialogDescription>
				</DialogHeader>
				<Separator />

				<motion.form
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, ease: "easeOut" }}
					onSubmit={handleSubmit}
					className="space-y-6 overflow-y-auto max-h-[75vh] px-6 py-4"
				>
					{formData.productImage && (
						<div className="space-y-4">
							<Label>Product Image</Label>
							<img
								src={formData.productImage}
								alt={formData.productName}
								className="w-full h-52 object-cover rounded-lg border border-border"
							/>
						</div>
					)}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="space-y-4">
							<Label htmlFor="fullName">Full Name</Label>
							<Input
								id="fullName"
								required
								placeholder="Enter your full name"
								value={formData.fullName}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, fullName: e.target.value }))
								}
							/>
						</div>
						<div className="space-y-4">
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								required
								placeholder="Enter your email address"
								value={formData.email}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, email: e.target.value }))
								}
							/>
						</div>
						<div className="space-y-4">
							<Label htmlFor="phoneNumber">Phone Number</Label>
							<Input
								id="phoneNumber"
								type="tel"
								required
								placeholder="Enter your phone number"
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

					<div className="space-y-4">
						<Label htmlFor="product-name">Product Name</Label>
						<Input
							id="product-name"
							required
							placeholder="Enter product name or model"
							value={formData.productName}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									productName: e.target.value,
								}))
							}
						/>
					</div>

					<div className="space-y-4">
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
					<div className="space-y-4">
						<Label htmlFor="specifications">Optional Note</Label>
						<Textarea
							id="specifications"
							placeholder="Any specific requirements or preferences..."
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
				</motion.form>
			</DialogContent>
		</Dialog>
	);
};
