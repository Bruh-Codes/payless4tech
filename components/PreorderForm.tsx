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
import { authClient } from "@/lib/auth-client";
import { supabase } from "@/integrations/supabase/client";
import Image from "next/image";

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
			// Check if this is a custom event with product data
			if (event instanceof CustomEvent && event.type === "preorder") {
				const eventDetail = (event as any).detail;

				if (eventDetail && typeof eventDetail === "object") {
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
			// Insert into Supabase
			const { error: dbError } = await supabase.from("preorders").insert([
				{
					full_name: formData.fullName,
					email: formData.email,
					phone_number: formData.phoneNumber,
					item_type: formData.itemType,
					specifications: {
						details: formData.specifications,
						product_id: userDetails?.productId,
						product_name: formData.productName,
						product_image: formData.productImage,
					},
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
			<DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] p-0 overflow-hidden rounded-2xl flex flex-col gap-0">
				<div className="px-6 py-5 bg-muted/20 border-b">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold">
							Preorder Request
						</DialogTitle>
						<DialogDescription>
							Fill out the form below to place a preorder request.
						</DialogDescription>
					</DialogHeader>
				</div>

				<motion.form
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, ease: "easeOut" }}
					onSubmit={handleSubmit}
					className="space-y-6 overflow-y-auto px-6 py-6"
				>
					{formData.productImage && (
						<div className="flex gap-4 p-4 rounded-xl bg-muted/40 border border-border/50 items-center shadow-sm">
							<Image
								src={formData.productImage}
								alt={formData.productName}
								width={96}
								height={96}
								className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border bg-background"
							/>
							<div className="flex flex-col">
								<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
									Requested Item
								</span>
								<span className="font-semibold text-base md:text-lg line-clamp-2 text-foreground">
									{formData.productName}
								</span>
							</div>
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

					<div className="pt-2 pb-4">
						<Button
							type="submit"
							className="w-full h-12 text-base font-semibold rounded-xl transition-all shadow-md"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Submitting Request..." : "Submit Preorder"}
						</Button>
					</div>
				</motion.form>
			</DialogContent>
		</Dialog>
	);
};
