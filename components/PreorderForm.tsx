import { useEffect, useState, useCallback } from "react";
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
import Script from "next/script";
import { Clock, ShieldCheck, CreditCard, AlertCircle } from "lucide-react";

declare global {
	interface Window {
		PaystackPop: any;
	}
}

const PREORDER_FEE_GHS = 100; // ₵100 preorder fee
const PREORDER_FEE_PESEWAS = PREORDER_FEE_GHS * 100; // Paystack expects pesewas

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
	const [paystackReady, setPaystackReady] = useState(false);
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
			setIsSubmitting(false);
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

	// Check if Paystack inline JS is loaded
	useEffect(() => {
		const checkPaystack = () => {
			if (typeof window !== "undefined" && window.PaystackPop) {
				setPaystackReady(true);
				return true;
			}
			return false;
		};

		if (!checkPaystack()) {
			// Poll for Paystack availability
			const interval = setInterval(() => {
				if (checkPaystack()) clearInterval(interval);
			}, 500);
			return () => clearInterval(interval);
		}
		return undefined;
	}, []);

	const submitPreorderToSupabase = useCallback(
		async (paymentReference: string) => {
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
						payment_reference: paymentReference,
						preorder_fee: PREORDER_FEE_GHS,
						payment_status: "paid",
					},
				},
			]);

			if (dbError) throw dbError;
		},
		[formData, userDetails?.productId],
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate required fields
		if (
			!formData.fullName ||
			!formData.email ||
			!formData.phoneNumber ||
			!formData.productName
		) {
			toast.error("Please fill in all required fields.");
			return;
		}

		setIsSubmitting(true);

		// Wait for Paystack to be available
		if (!window.PaystackPop) {
			// Give it a moment to load
			await new Promise<void>((resolve, reject) => {
				let attempts = 0;
				const check = setInterval(() => {
					attempts++;
					if (window.PaystackPop) {
						clearInterval(check);
						setPaystackReady(true);
						resolve();
					} else if (attempts > 10) {
						clearInterval(check);
						reject(new Error("Paystack failed to load"));
					}
				}, 300);
			});
		}

		try {
			// Close the modal first so its overlay doesn't block the Paystack popup
			onOpenChange(false);

			const handler = window.PaystackPop.setup({
				key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
				email: formData.email,
				amount: PREORDER_FEE_PESEWAS,
				currency: "GHS",
				ref: `preorder_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
				metadata: {
					custom_fields: [
						{
							display_name: "Customer Name",
							variable_name: "customer_name",
							value: formData.fullName,
						},
						{
							display_name: "Product",
							variable_name: "product_name",
							value: formData.productName,
						},
						{
							display_name: "Order Type",
							variable_name: "order_type",
							value: "preorder_fee",
						},
					],
				},
				onClose: function () {
					setIsSubmitting(false);
					toast.info("Payment cancelled", {
						description:
							"Your pre-order has not been submitted. You can try again.",
					});
				},
				callback: function (response: { reference: string }) {
					// Wrap async logic in sync callback (Paystack rejects async functions)
					(async () => {
						try {
							await submitPreorderToSupabase(response.reference);

							toast.success("Pre-order Submitted Successfully! 🎉", {
								description:
									"Your ₵100 processing fee has been received. Our team will contact you within 1–14 business days.",
								duration: 7000,
							});
							handleOrderSuccess && handleOrderSuccess(true);

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
							console.error("Error submitting preorder after payment:", error);
							toast.error("Payment received but submission failed", {
								description: `Your payment ref: ${response.reference}. Please contact support with this reference.`,
								duration: 10000,
							});
						} finally {
							setIsSubmitting(false);
						}
					})();
				},
			});
			handler.openIframe();
		} catch (error: any) {
			console.error("Error initializing payment:", error?.message || error);
			toast.error(
				error?.message === "Paystack failed to load"
					? "Payment system is still loading. Please wait a moment and try again."
					: "Failed to initialize payment. Please try again.",
			);
			setIsSubmitting(false);
		}
	};

	return (
		<>
			{/* Load Paystack Inline JS */}
			<Script
				src="https://js.paystack.co/v1/inline.js"
				onLoad={() => setPaystackReady(true)}
				strategy="afterInteractive"
			/>

			<Dialog open={isOpen} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] p-0 overflow-hidden rounded-2xl flex flex-col gap-0">
					<div className="px-6 py-5 bg-muted/20 border-b">
						<DialogHeader>
							<DialogTitle className="text-xl font-bold">
								Pre-order Request
							</DialogTitle>
							<DialogDescription>
								Fill out the form below and pay the processing fee to place your
								pre-order request.
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
						{/* Info Banner */}
						<div className="rounded-xl border border-purple-200 dark:border-purple-800/50 bg-purple-50/60 dark:bg-purple-950/20 p-4 space-y-3">
							<div className="flex items-start gap-3">
								<Clock className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
								<div>
									<p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
										Delivery in 1–14 business days
									</p>
									<p className="text-xs text-purple-700/80 dark:text-purple-300/70 mt-0.5">
										We&apos;ll source and deliver your item within 14 business
										days maximum.
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
								<div>
									<p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
										₵100 processing fee required
									</p>
									<p className="text-xs text-purple-700/80 dark:text-purple-300/70 mt-0.5">
										A one-time fee of ₵100 is required to process your
										pre-order.
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
								<div>
									<p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
										Refundable if item is unavailable
									</p>
									<p className="text-xs text-purple-700/80 dark:text-purple-300/70 mt-0.5">
										Your fee will be fully refunded if we are unable to find the
										item at the requested price.
									</p>
								</div>
							</div>
						</div>

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
										setFormData((prev) => ({
											...prev,
											fullName: e.target.value,
										}))
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

						{/* Fee Summary */}
						<div className="rounded-xl border border-border bg-muted/30 p-4">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium text-muted-foreground">
									Processing Fee
								</span>
								<span className="text-lg font-bold text-foreground">
									₵{PREORDER_FEE_GHS.toFixed(2)}
								</span>
							</div>
						</div>

						{/* Warning */}
						<div className="flex items-start gap-2.5 text-xs text-muted-foreground">
							<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
							<p>
								By clicking below, you&apos;ll be prompted to pay the ₵100
								processing fee via Paystack. Your pre-order will only be
								submitted after a successful payment.
							</p>
						</div>

						<div className="pt-2 pb-4">
							<Button
								type="submit"
								className="w-full h-12 text-base font-semibold rounded-xl transition-all shadow-md"
								disabled={isSubmitting || !paystackReady}
							>
								{isSubmitting
									? "Processing Payment..."
									: !paystackReady
										? "Loading Payment..."
										: `Pay ₵${PREORDER_FEE_GHS} & Submit Pre-order`}
							</Button>
						</div>
					</motion.form>
				</DialogContent>
			</Dialog>
		</>
	);
};
