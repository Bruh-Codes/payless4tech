"use client";

import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Navbar from "@/components/navbar";

interface Order {
	id: string;
	name: string;
	total_amount: number;
	status: string;
	fulfillment_status: string;
	created_at: string;
	phone_number: string;
	delivery_address: string;
	email: string;
	extended_warranty: boolean;
	product: Array<{
		name: string;
		quantity: number;
		price: number;
	}>;
}

const OrdersPage = () => {
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();

	const {
		data: orders,
		isPending,
		error,
	} = useQuery<Order[]>({
		queryKey: ["orders", session?.user.id],
		queryFn: async () => {
			const response = await fetch("/api/orders");
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch orders");
			}
			return data.orders || [];
		},
		enabled: !!session?.user.id,
	});

	const getStatusIcon = (fulfillmentStatus: string) => {
		switch (fulfillmentStatus) {
			case "delivered":
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case "shipped":
				return <Truck className="h-4 w-4 text-blue-600" />;
			case "processing":
				return <Package className="h-4 w-4 text-yellow-600" />;
			case "cancelled":
				return <AlertCircle className="h-4 w-4 text-red-600" />;
			default:
				return <Clock className="h-4 w-4 text-gray-600" />;
		}
	};

	const getStatusColor = (fulfillmentStatus: string) => {
		switch (fulfillmentStatus) {
			case "delivered":
				return "bg-green-100 text-green-800";
			case "shipped":
				return "bg-blue-100 text-blue-800";
			case "processing":
				return "bg-yellow-100 text-yellow-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (!isSessionPending && (!session || !session.user)) {
		return (
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">
						<h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
						<p className="text-muted-foreground mb-6">
							Please sign in to view your order history and track your orders.
						</p>
						<Link href="/login">
							<Button>Sign In</Button>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (isSessionPending || isPending) {
		return (
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
						<p className="mt-4 text-muted-foreground">Loading your orders...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">
						<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
						<h1 className="text-3xl font-bold mb-4">Error Loading Orders</h1>
						<p className="text-muted-foreground mb-6">
							{error.message ||
								"Failed to load your orders. Please try again later."}
						</p>
						<Button onClick={() => window.location.reload()}>Try Again</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<div className="max-w-4xl mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">Your Orders</h1>
					<p className="text-muted-foreground">
						Track your order status and view your purchase history
					</p>
				</div>

				{orders?.length === 0 ? (
					<Card>
						<CardContent className="text-center py-12">
							<Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h2 className="text-xl font-semibold mb-2">No orders yet</h2>
							<p className="text-muted-foreground mb-4">
								You haven't placed any orders. Start shopping to see your orders
								here!
							</p>
							<Button onClick={() => (window.location.href = "/")}>
								Start Shopping
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-6">
						{orders?.map((order) => (
							<Card key={order.id} className="overflow-hidden">
								<CardHeader className="bg-muted/50">
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="text-lg">
												Order #{order.id.slice(0, 8)}
											</CardTitle>
											<p className="text-sm text-muted-foreground">
												Placed on{" "}
												{new Date(order.created_at).toLocaleDateString()}
											</p>
										</div>
										<div className="flex items-center gap-2">
											{getStatusIcon(order.fulfillment_status)}
											<Badge
												className={getStatusColor(order.fulfillment_status)}
											>
												{order.fulfillment_status?.charAt(0).toUpperCase() +
													order.fulfillment_status?.slice(1) || "Pending"}
											</Badge>
										</div>
									</div>
								</CardHeader>
								<CardContent className="p-6">
									<div className="grid md:grid-cols-2 gap-6">
										<div>
											<h3 className="font-semibold mb-3">Order Details</h3>
											<div className="space-y-2 text-sm">
												<div>
													<span className="font-medium">Customer:</span>{" "}
													{order.name}
												</div>
												<div>
													<span className="font-medium">Email:</span>{" "}
													{order.email}
												</div>
												<div>
													<span className="font-medium">Phone:</span>{" "}
													{order.phone_number}
												</div>
												<div>
													<span className="font-medium">Delivery Address:</span>{" "}
													{order.delivery_address}
												</div>
												{order.extended_warranty && (
													<div>
														<Badge variant="secondary">
															Extended Warranty Included
														</Badge>
													</div>
												)}
											</div>
										</div>

										<div>
											<h3 className="font-semibold mb-3">Items</h3>
											<div className="space-y-2">
												{order.product?.map((item, index) => (
													<div
														key={index}
														className="flex justify-between text-sm"
													>
														<span>
															{item.name} x{item.quantity}
														</span>
														<span className="font-medium">
															₵{(item.price * item.quantity).toFixed(2)}
														</span>
													</div>
												))}
												<div className="border-t pt-2 mt-2">
													<div className="flex justify-between font-semibold">
														<span>Total:</span>
														<span>₵{order.total_amount.toFixed(2)}</span>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="mt-6 p-4 bg-muted/30 rounded-lg">
										<h4 className="font-medium mb-2">Order Status Timeline</h4>
										<div className="space-y-2 text-sm">
											<div className="flex items-center gap-2">
												<CheckCircle className="h-4 w-4 text-green-600" />
												<span>Order Confirmed</span>
											</div>
											{order.fulfillment_status !== "pending" && (
												<div className="flex items-center gap-2">
													<Package className="h-4 w-4 text-blue-600" />
													<span>Processing</span>
												</div>
											)}
											{order.fulfillment_status === "shipped" && (
												<div className="flex items-center gap-2">
													<Truck className="h-4 w-4 text-blue-600" />
													<span>Shipped</span>
												</div>
											)}
											{order.fulfillment_status === "delivered" && (
												<div className="flex items-center gap-2">
													<CheckCircle className="h-4 w-4 text-green-600" />
													<span>Delivered</span>
												</div>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default OrdersPage;
