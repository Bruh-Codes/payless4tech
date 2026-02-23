"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Mail,
	Truck,
	User,
	MapPin,
	Receipt,
	ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { salesType } from "@/components/admin/SalesTableWrapper";

export default function OrderDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const orderId = params.id as string;

	const [order, setOrder] = useState<salesType | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchOrder = async () => {
			try {
				const { data, error } = await supabase
					.from("sales")
					.select("*")
					.eq("id", orderId)
					.single();

				if (error) throw error;
				setOrder(data);
			} catch (err) {
				console.error("Failed to fetch order:", err);
				toast.error("Could not load order details.");
			} finally {
				setIsLoading(false);
			}
		};

		if (orderId) {
			fetchOrder();
		}
	}, [orderId]);

	const handleMarkDelivered = async () => {
		try {
			const { error } = await supabase
				.from("sales")
				.update({ fulfillment_status: "delivered" })
				.eq("id", orderId);

			if (error) throw error;

			toast.success("Order marked as delivered!");
			setOrder((prev: any) => ({ ...prev, fulfillment_status: "delivered" }));
		} catch (err) {
			console.error("Failed to update status:", err);
			toast.error("Failed to change order status.");
		}
	};

	const handleSendEmail = () => {
		toast.info("Email integration coming soon!", {
			description: `Placeholder: Will send an email to ${order?.email}`,
		});
	};

	if (isLoading) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<span className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 h-8 w-8"></span>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="flex h-screen w-full flex-col items-center justify-center space-y-4">
				<h2 className="text-xl font-bold">Order Not Found</h2>
				<Button variant="outline" onClick={() => router.push("/admin")}>
					Back to Dashboard
				</Button>
			</div>
		);
	}

	// Safely parse product array
	let productsList: any[] = [];
	if (typeof order.product === "string") {
		try {
			productsList = JSON.parse(order.product);
		} catch (e) {
			console.error("Failed to parse product array:", e);
		}
	} else if (Array.isArray(order.product)) {
		productsList = order.product;
	}

	const formattedAmount = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "GHS",
	}).format(parseFloat(order.total_amount));

	return (
		<div className="p-6 md:p-10 mx-auto max-w-5xl space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" onClick={() => router.back()}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>

				<Badge variant="outline" className="ml-auto">
					Payment: {order.status}
				</Badge>

				<Badge
					variant="outline"
					className={`capitalize ${
						order.fulfillment_status === "delivered"
							? "bg-green-100 text-green-800"
							: "bg-blue-100 text-blue-800 border-blue-300"
					}`}
				>
					{order.fulfillment_status}
				</Badge>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Customer & Delivery Context */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" /> Customer & Delivery
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-y-3 text-sm">
							<div className="text-muted-foreground">Email:</div>
							<div className="font-medium truncate" title={order.email}>
								{order.email}
							</div>

							<div className="text-muted-foreground">Phone:</div>
							<div className="font-medium">{order.phone_number || "N/A"}</div>

							<div className="text-muted-foreground">Alt. Phone:</div>
							<div className="font-medium">
								{order.alternative_phone || "None"}
							</div>

							<div className="text-muted-foreground flex items-center gap-1">
								<MapPin className="h-4 w-4" /> Address:
							</div>
							<div
								className="font-medium truncate"
								title={order.delivery_address}
							>
								{order.delivery_address || "N/A"}
							</div>

							<div className="text-muted-foreground">GPS Location:</div>
							<div className="font-medium truncate" title={order.gps_location}>
								{order.gps_location || "N/A"}
							</div>

							<div className="text-muted-foreground flex items-center gap-1">
								<ShieldCheck className="h-4 w-4" /> Warranty:
							</div>
							<div className="font-medium">
								{order.extended_warranty ? (
									<span className="text-green-600 font-semibold">Active</span>
								) : (
									"Declined"
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Order Items Purchased */}
				<Card className="flex pb-0 flex-col">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Receipt className="h-5 w-5" /> Purchased Items
						</CardTitle>
					</CardHeader>
					<CardContent className="flex-1 overflow-auto max-h-64 space-y-3 pr-2">
						{productsList.length > 0 ? (
							productsList.map((item: any, i: number) => (
								<div
									key={i}
									className="flex flex-col sm:flex-row justify-between bg-muted/40 p-3 rounded-lg border text-sm"
								>
									<div
										className="flex-1 font-medium truncate pr-2"
										title={item.name}
									>
										{item.name}
									</div>
									<div className="flex items-center gap-4 text-muted-foreground whitespace-nowrap">
										<span>Qty: {item.quantity}</span>
										<span className="w-16 text-right">GHS {item.price}</span>
									</div>
								</div>
							))
						) : (
							<p className="text-sm italic text-muted-foreground">
								No items parseable.
							</p>
						)}
					</CardContent>
					<div className="p-4 bg-muted/60 border-t mt-auto flex justify-between items-center rounded-b-lg">
						<span className="font-semibold text-muted-foreground">
							Total Amount:
						</span>
						<span className="text-lg font-bold">{formattedAmount}</span>
					</div>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Actions</CardTitle>
					<CardDescription>
						Manage the fulfillment lifecycle of this order.
					</CardDescription>
				</CardHeader>
				{order.fulfillment_status === "delivered" ? (
					<CardContent>
						<div className="flex items-center gap-3 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400">
							<ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-500" />
							<div>
								<h4 className="font-semibold">Order Fulfilled</h4>
								<p className="text-sm">
									This order has been successfully delivered and completed.
								</p>
							</div>
						</div>
						<div className="mt-4 flex gap-4">
							<Button variant="secondary" onClick={handleSendEmail}>
								<Mail className="h-4 w-4 mr-2" /> Send Follow-up Email
							</Button>
						</div>
					</CardContent>
				) : (
					<CardFooter className="flex flex-wrap gap-4">
						{order.status === "pending" ? (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<span tabIndex={0} className="cursor-not-allowed">
											<Button disabled className="pointer-events-none">
												<Truck className="h-4 w-4 mr-2" /> Mark as Delivered
											</Button>
										</span>
									</TooltipTrigger>
									<TooltipContent side="top">
										<p>Payment must be fulfilled before delivery.</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						) : (
							<Button onClick={handleMarkDelivered}>
								<Truck className="h-4 w-4 mr-2" /> Mark as Delivered
							</Button>
						)}

						<Button variant="secondary" onClick={handleSendEmail}>
							<Mail className="h-4 w-4 mr-2" /> Send Missing Info Email
						</Button>
					</CardFooter>
				)}
			</Card>
		</div>
	);
}
