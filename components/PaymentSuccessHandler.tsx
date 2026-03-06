"use client";

import { useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export const PaymentSuccessHandler = () => {
	const searchParams = useSearchParams();
	const { clearCart } = useCart();

	const handlePaymentSuccess = useCallback(() => {
		const paymentSuccess = searchParams.get("payment_success");
		const reference = searchParams.get("reference");

		if (paymentSuccess === "true" && reference) {
			// Clear the cart on payment success
			clearCart();

			toast.success("Payment successful!", {
				description: `Transaction ID: ${reference}. You can track your order status in "My Orders" from your profile menu.`,
				duration: 6000,
			});

			// Clean up URL parameters
			window.history.replaceState({}, "", window.location.pathname);
		}
	}, [searchParams, clearCart]);

	useEffect(() => {
		handlePaymentSuccess();
	}, [handlePaymentSuccess]);

	return null;
};

export default PaymentSuccessHandler;
