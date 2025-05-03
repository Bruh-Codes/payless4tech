"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
const PaymentCallback = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		const reference = searchParams.get("reference");
		const status = searchParams.get("status");
		const trxref = searchParams.get("trxref");

		console.log("Payment callback received:", {
			reference,
			status,
			trxref,
		});

		if (status === "success") {
			toast("Payment Successful", {
				description: "Your order has been confirmed. Reference: " + reference,
			});
			router.push("/");
		} else {
			console.error("Payment failed:", { reference, status, trxref });
			toast.error("Payment Failed", {
				description:
					"There was an issue processing your payment. Please try again or contact support.",
			});
			// router.push("/cart");
		}
	}, [searchParams, router.push, toast]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<h1 className="text-2xl font-bold mb-4">Processing Payment...</h1>
				<p>Please wait while we confirm your payment.</p>
			</div>
		</div>
	);
};

const Page = () => (
	<Suspense fallback={<div>Loading...</div>}>
		<PaymentCallback />
	</Suspense>
);

export default Page;
