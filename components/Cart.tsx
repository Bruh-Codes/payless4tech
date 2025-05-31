"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export const Cart = () => {
	const { state, removeItem, updateQuantity, checkout, toggleWarranty } =
		useCart();
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [isCheckOutLoading, setIsCheckOutLoading] = useState(false);

	const Loader = () => (
		<span className="inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
	);
	const [checkoutDetails, setCheckoutDetails] = useState({
		phoneNumber: "",
		alternativePhone: "",
		deliveryAddress: "",
		gpsLocation: "",
		email: "",
		extendedWarranty: false,
	});
	const [triggerSheet, setTriggerSheet] = useState(false);

	const handleCheckout = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsCheckOutLoading(true);
		if (
			!checkoutDetails.phoneNumber ||
			!checkoutDetails.deliveryAddress ||
			!checkoutDetails.email
		) {
			toast.error("Required Fields Missing", {
				description: "Please fill in all required fields",
			});
			return;
		}
		try {
			checkout(checkoutDetails);
			toast.success("Checkout successful", {
				description: "Your order has been placed successfully.",
			});
			setIsCheckOutLoading(false);
			setTriggerSheet(false);
			setCheckoutDetails({
				phoneNumber: "",
				alternativePhone: "",
				deliveryAddress: "",
				gpsLocation: "",
				email: "",
				extendedWarranty: false,
			});
		} catch (error) {
			console.error("Checkout error:", error);
			setIsCheckOutLoading(false);
		}
	};

	const handleWarrantyChange = (checked: boolean) => {
		setCheckoutDetails((prev) => ({ ...prev, extendedWarranty: checked }));
		toggleWarranty(checked);
	};

	return (
		<Sheet onOpenChange={setTriggerSheet} open={triggerSheet}>
			<SheetTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					title="cart"
					aria-label="cart"
					className="relative hover:bg-orange-400 hover:text-white cursor-pointer"
				>
					<ShoppingCart className="h-4 w-4" />
					{state.items.length > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
						>
							{state.items.length}
						</Badge>
					)}
				</Button>
			</SheetTrigger>
			<SheetContent className="w-full sm:max-w-lg p-5">
				<SheetHeader>
					<SheetTitle>Shopping Cart</SheetTitle>
				</SheetHeader>
				<ScrollArea className="h-[calc(100vh-8rem)] pr-4">
					<div className="mt-8">
						{state.items.length === 0 ? (
							<p className="text-center text-muted-foreground">
								Your cart is empty
							</p>
						) : (
							<div className="space-y-4">
								{state.items.map((item) => (
									<div
										key={item.id}
										className="flex items-center flex-col sm:flex-row justify-between space-x-4 bg-white/50 p-4 rounded-lg shadow-sm"
									>
										<div className="flex items-center space-x-4">
											<img
												src={item.image_url || " "}
												alt={item.name}
												className="h-16 w-16 rounded-md object-cover"
											/>
											<div>
												<h3 className="font-medium truncate max-w-[200px]">
													{item.name}
												</h3>
												<p className="text-sm text-muted-foreground">
													₵{item.price.toLocaleString()}
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											<Button
												variant="outline"
												size="icon"
												onClick={() =>
													updateQuantity(
														item.id,
														Math.max(0, item.quantity - 1)
													)
												}
											>
												-
											</Button>
											<span>{item.quantity}</span>
											<Button
												variant="outline"
												size="icon"
												onClick={() =>
													updateQuantity(item.id, item.quantity + 1)
												}
											>
												+
											</Button>
											<Button
												variant="destructive"
												size="icon"
												onClick={() => removeItem(item.id)}
											>
												×
											</Button>
										</div>
									</div>
								))}
								<div className="border-t pt-4 space-y-4">
									<div className="flex justify-between font-medium">
										<span>Subtotal</span>
										<span>
											₵
											{state.total.toLocaleString(undefined, {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</span>
									</div>
									{checkoutDetails.extendedWarranty && (
										<div className="flex justify-between font-medium">
											<span>Extended Warranty</span>
											<span>₵500.00</span>
										</div>
									)}
									<div className="flex justify-between font-medium text-lg">
										<span>Total</span>
										<span>
											₵
											{(
												state.total +
												(checkoutDetails.extendedWarranty ? 500 : 0)
											).toLocaleString(undefined, {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</span>
									</div>
									{!isCheckingOut ? (
										<Button
											className="w-full mt-4"
											onClick={() => setIsCheckingOut(true)}
										>
											Proceed to Checkout
										</Button>
									) : (
										<form onSubmit={handleCheckout} className="space-y-4">
											<div className="space-y-2">
												<Label htmlFor="email">Email *</Label>
												<Input
													id="email"
													type="email"
													value={checkoutDetails.email}
													onChange={(e) =>
														setCheckoutDetails({
															...checkoutDetails,
															email: e.target.value,
														})
													}
													required
													className="w-full"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="phoneNumber">Phone Number *</Label>
												<Input
													id="phoneNumber"
													value={checkoutDetails.phoneNumber}
													onChange={(e) =>
														setCheckoutDetails({
															...checkoutDetails,
															phoneNumber: e.target.value,
														})
													}
													required
													className="w-full"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="alternativePhone">
													Alternative Phone
												</Label>
												<Input
													type="phone"
													id="alternativePhone"
													value={checkoutDetails?.alternativePhone}
													onChange={(e) =>
														setCheckoutDetails({
															...checkoutDetails,
															alternativePhone: e.target.value,
														})
													}
													className="w-full"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="deliveryAddress">
													Delivery Address *
												</Label>
												<Input
													id="deliveryAddress"
													value={checkoutDetails.deliveryAddress}
													onChange={(e) =>
														setCheckoutDetails({
															...checkoutDetails,
															deliveryAddress: e.target.value,
														})
													}
													required
													className="w-full"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="gpsLocation">GPS Location</Label>
												<Input
													id="gpsLocation"
													value={checkoutDetails.gpsLocation}
													onChange={(e) =>
														setCheckoutDetails({
															...checkoutDetails,
															gpsLocation: e.target.value,
														})
													}
													className="w-full"
												/>
											</div>
											<div className="flex items-center space-x-2 py-2">
												<Checkbox
													id="extendedWarranty"
													checked={checkoutDetails.extendedWarranty}
													onCheckedChange={handleWarrantyChange}
												/>
												<Label htmlFor="extendedWarranty" className="text-sm">
													Add Extended Warranty (12 months) for ₵500
												</Label>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-5 space-x-2">
												<Button
													disabled={isCheckOutLoading}
													type="submit"
													className="w-full"
												>
													{isCheckOutLoading ? (
														<Loader />
													) : (
														"Proceed to Payment"
													)}
												</Button>
												<Button
													disabled={isCheckOutLoading}
													type="button"
													variant="outline"
													className="w-full"
													onClick={() => setIsCheckingOut(false)}
												>
													Back
												</Button>
											</div>
										</form>
									)}
								</div>
							</div>
						)}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
};
