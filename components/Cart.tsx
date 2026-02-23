"use client";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import Image from "next/image";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const Cart = () => {
	const {
		state,
		removeItem,
		updateQuantity,
		checkout,
		toggleWarranty,
		isInitialized,
	} = useCart();
	const [isCheckOutLoading, setIsCheckOutLoading] = useState(false);
	const [triggerSheet, setTriggerSheet] = useState(false);
	const [checkoutSheetOpen, setCheckoutSheetOpen] = useState(false);

	const [checkoutDetails, setCheckoutDetails] = useState({
		phoneNumber: "",
		alternativePhone: "",
		deliveryAddress: "",
		name: "",
		email: "",
		extendedWarranty: false,
	});

	// Get user session and pre-fill form
	const { data: session } = authClient.useSession();

	useEffect(() => {
		if (session?.user) {
			setCheckoutDetails((prev) => ({
				...prev,
				name: session.user.name || prev.name,
				email: session.user.email || prev.email,
			}));
		}
	}, [session]);

	const handleCheckout = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsCheckOutLoading(true);

		try {
			await checkout(checkoutDetails);
			toast.success("Order placed successfully!");
			setCheckoutSheetOpen(false);
			setTriggerSheet(false);
		} catch (error) {
			console.error("Checkout failed:", error);
			toast.error("Checkout failed. Please try again.");
		} finally {
			setIsCheckOutLoading(false);
		}
	};

	const handleWarrantyChange = (checked: boolean) => {
		setCheckoutDetails((prev) => ({ ...prev, extendedWarranty: checked }));
		toggleWarranty(checked);
	};

	return (
		<>
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
						{isInitialized && state.items.length > 0 && (
							<Badge
								variant="destructive"
								className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
							>
								{state.items.length}
							</Badge>
						)}
					</Button>
				</SheetTrigger>
				<SheetContent className="w-full sm:max-w-lg p-5 flex flex-col">
					<SheetHeader>
						<SheetTitle>Shopping Cart</SheetTitle>
					</SheetHeader>
					<ScrollArea className="h-[calc(100vh-16rem)] flex-1 pr-4">
						<div className="mt-8">
							{!isInitialized ? (
								<div className="flex justify-center items-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
								</div>
							) : state.items.length === 0 ? (
								<p className="text-center text-muted-foreground">
									Your cart is empty
								</p>
							) : (
								<div className="space-y-4">
									{state.items.map((item) => (
										<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
											<div className="flex items-center space-x-4">
												<Image
													height={70}
													width={70}
													src={item.image_url || " "}
													alt={item.name}
													className="h-16 w-16 rounded-md object-cover"
												/>
												<div>
													<h3 className="font-medium truncate max-w-[200px]">
														{item.name}
													</h3>
													<p className="text-sm text-muted-foreground">
														₵
														{(typeof item.price === "object"
															? (item.price as any).value
															: item.price
														).toLocaleString()}
													</p>
												</div>
											</div>
											<div className="flex items-center space-x-3">
												<div className="flex items-center bg-background border rounded-lg p-0.5">
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 rounded-l-md hover:bg-muted transition-colors"
														onClick={() =>
															updateQuantity(
																item.id,
																Math.max(1, item.quantity - 1),
															)
														}
													>
														<Minus className="h-4 w-4" />
													</Button>
													<div className="w-10 text-center text-sm font-medium border-x">
														{item.quantity}
													</div>
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 rounded-r-md hover:bg-muted transition-colors"
														onClick={() =>
															updateQuantity(item.id, item.quantity + 1)
														}
													>
														<Plus className="h-4 w-4" />
													</Button>
												</div>
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all duration-200"
													onClick={() => removeItem(item.id)}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</ScrollArea>
					{/* Fixed bottom section */}
					{state.items.length >= 1 && (
						<div className="border-t space-y-4">
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
										state.total + (checkoutDetails.extendedWarranty ? 500 : 0)
									).toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</span>
							</div>
							<Button
								className="w-full"
								onClick={() => setCheckoutSheetOpen(true)}
							>
								Proceed to Checkout
							</Button>
						</div>
					)}
				</SheetContent>
			</Sheet>

			{/* Separate Checkout Sheet */}
			<Sheet open={checkoutSheetOpen} onOpenChange={setCheckoutSheetOpen}>
				<SheetContent className="w-full sm:max-w-lg p-5">
					<SheetHeader>
						<SheetTitle className="flex gap-2">
							<ShoppingBag />
							Checkout Information
						</SheetTitle>
					</SheetHeader>
					<ScrollArea className="h-[calc(100vh-8rem)] pr-4">
						<form onSubmit={handleCheckout} className="space-y-4 mt-8">
							<div className="space-y-2">
								<Label htmlFor="name">Name *</Label>
								<Input
									id="name"
									value={checkoutDetails.name}
									onChange={(e) =>
										setCheckoutDetails({
											...checkoutDetails,
											name: e.target.value,
										})
									}
									required
									className="w-full"
								/>
							</div>
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
								<Label htmlFor="phone">Phone Number *</Label>
								<Input
									id="phone"
									type="tel"
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
								<Label htmlFor="address">Delivery Address *</Label>
								<Input
									id="address"
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
							<div className="flex items-center space-x-2">
								<Checkbox
									id="warranty"
									checked={checkoutDetails.extendedWarranty}
									onCheckedChange={handleWarrantyChange}
								/>
								<Label htmlFor="warranty">
									Add Extended Warranty (+₵500.00)
								</Label>
							</div>
							<div className="flex justify-between font-bold">
								<span>Total</span>
								<span>
									₵
									{(
										state.total + (checkoutDetails.extendedWarranty ? 500 : 0)
									).toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</span>
							</div>
							<div className="space-y-2">
								<Button
									type="submit"
									className="w-full"
									disabled={isCheckOutLoading}
								>
									{isCheckOutLoading ? (
										<>
											{/* <Loader /> */}
											Processing...
										</>
									) : (
										"Complete Order"
									)}
								</Button>
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={() => setCheckoutSheetOpen(false)}
								>
									Back to Cart
								</Button>
							</div>
						</form>
					</ScrollArea>
				</SheetContent>
			</Sheet>
		</>
	);
};

export default Cart;
