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

type SpecEntry = {
	key: string;
	value: string;
};

type OrderProductItem = {
	id?: string;
	name?: string;
	quantity?: number;
	price?: number;
	image_url?: unknown;
	image?: unknown;
	product_image?: unknown;
	productImage?: unknown;
	specifications?: unknown;
	detailed_specs?: unknown;
	specs?: unknown;
};

function toTitleCase(value: string) {
	if (!value) return "Pending";
	return value
		.replace(/[_-]+/g, " ")
		.split(" ")
		.map((word) =>
			word.length ? word[0]?.toUpperCase() + word.slice(1).toLowerCase() : word,
		)
		.join(" ");
}

function parseOrderProducts(raw: unknown): OrderProductItem[] {
	if (!raw) return [];
	if (Array.isArray(raw)) return raw as OrderProductItem[];
	if (typeof raw === "string") {
		try {
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? (parsed as OrderProductItem[]) : [];
		} catch {
			return [];
		}
	}
	return [];
}

function parseSpecs(raw: unknown): SpecEntry[] {
	if (!raw) return [];

	if (Array.isArray(raw)) {
		return raw
			.map((entry) => {
				if (
					entry &&
					typeof entry === "object" &&
					"key" in entry &&
					"value" in entry
				) {
					const key = String((entry as any).key || "").trim();
					const value = String((entry as any).value || "").trim();
					if (key && value) return { key, value };
				}
				return null;
			})
			.filter((entry): entry is SpecEntry => Boolean(entry));
	}

	if (typeof raw === "string") {
		const trimmed = raw.trim();
		if (!trimmed) return [];

		try {
			const parsed = JSON.parse(trimmed);
			return parseSpecs(parsed);
		} catch {
			const normalized = trimmed.replace(/\|/g, "\n");
			return normalized
				.split(/\r?\n/)
				.map((line) => line.trim())
				.filter(Boolean)
				.map((line) => {
					const separatorIndex = line.indexOf(":");
					if (separatorIndex > 0) {
						return {
							key: line.slice(0, separatorIndex).trim(),
							value: line.slice(separatorIndex + 1).trim(),
						};
					}
					return { key: "Details", value: line };
				});
		}
	}

	return [];
}

function getItemSpecsSource(item: OrderProductItem) {
	return item.specifications ?? item.detailed_specs ?? item.specs ?? null;
}

function getItemImageSource(item: OrderProductItem) {
	return (
		item.image_url ?? item.image ?? item.product_image ?? item.productImage ?? null
	);
}

export default function OrderDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const orderId = params.id as string;

	const [order, setOrder] = useState<salesType | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [fallbackProductDataByProductId, setFallbackProductDataByProductId] =
		useState<Record<string, { specs: SpecEntry[]; imageUrl: string }>>({});

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

				const parsedProducts = parseOrderProducts(data?.product);
				const missingDataIds = Array.from(
					new Set(
						parsedProducts
							.filter((item) => {
								const itemId = String(item?.id || "").trim();
								if (!itemId) return false;
								const hasSpecs = parseSpecs(getItemSpecsSource(item)).length > 0;
								const hasImage = Boolean(
									String(getItemImageSource(item) || "").trim(),
								);
								return !hasSpecs || !hasImage;
							})
							.map((item) => String(item?.id || "").trim()),
					),
				);

				if (missingDataIds.length > 0) {
					const { data: productRows, error: specsError } = await supabase
						.from("products")
						.select("id, detailed_specs, image_url")
						.in("id", missingDataIds);

					if (specsError) {
						console.warn(
							"Failed to fetch fallback product data for order items:",
							specsError,
						);
					} else {
						const mappedData: Record<
							string,
							{ specs: SpecEntry[]; imageUrl: string }
						> = {};
						for (const row of productRows || []) {
							const productId = String((row as any)?.id || "").trim();
							if (!productId) continue;
							mappedData[productId] = {
								specs: parseSpecs((row as any)?.detailed_specs || ""),
								imageUrl: String((row as any)?.image_url || "").trim(),
							};
						}
						setFallbackProductDataByProductId(mappedData);
					}
				} else {
					setFallbackProductDataByProductId({});
				}
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

	const productsList = parseOrderProducts(order.product);
	const paymentStatus = String(order.status || "pending").toLowerCase();
	const deliveryStatus = String(order.fulfillment_status || "pending").toLowerCase();

	const formattedAmount = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "GHS",
	}).format(Number.parseFloat(String(order.total_amount || 0)) || 0);

	return (
		<div className="p-6 md:p-10 mx-auto max-w-5xl space-y-6">
			<div className="space-y-3">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
				</div>
				<div className="flex flex-wrap items-center gap-2 pl-12">
					<Badge
						variant="outline"
						className={`capitalize ${
							paymentStatus === "paid"
								? "bg-green-100 text-green-800 border-green-300"
								: "bg-amber-100 text-amber-800 border-amber-300"
						}`}
					>
						Payment: {toTitleCase(paymentStatus)}
					</Badge>

					<Badge
						variant="outline"
						className={`capitalize ${
							deliveryStatus === "delivered"
								? "bg-green-100 text-green-800 border-green-300"
								: deliveryStatus === "cancelled"
									? "bg-red-100 text-red-800 border-red-300"
									: "bg-blue-100 text-blue-800 border-blue-300"
						}`}
					>
						Delivery: {toTitleCase(deliveryStatus)}
					</Badge>
				</div>
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
							productsList.map((item, i) => {
								const itemId = String(item.id || "").trim();
								const inlineSpecs = parseSpecs(getItemSpecsSource(item));
								const fallbackSpecs = itemId
									? fallbackProductDataByProductId[itemId]?.specs || []
									: [];
								const inlineImage = String(getItemImageSource(item) || "").trim();
								const fallbackImage = itemId
									? fallbackProductDataByProductId[itemId]?.imageUrl || ""
									: "";
								const specs = inlineSpecs.length > 0 ? inlineSpecs : fallbackSpecs;
								const imageUrl = inlineImage || fallbackImage;
								const hasValidImage =
									imageUrl.startsWith("http://") ||
									imageUrl.startsWith("https://") ||
									imageUrl.startsWith("/");

								return (
									<div
										key={`${itemId || "item"}-${i}`}
										className="bg-muted/40 p-3 rounded-lg border text-sm space-y-2"
									>
										<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
											<div className="flex items-center gap-3 min-w-0 flex-1">
												<div className="h-12 w-12 rounded-md border bg-background overflow-hidden shrink-0 flex items-center justify-center">
													{hasValidImage ? (
														<img
															src={imageUrl}
															alt={item.name || "Product image"}
															className="h-full w-full object-contain"
															loading="lazy"
														/>
													) : (
														<span className="text-[10px] text-muted-foreground">
															No image
														</span>
													)}
												</div>
												<div
													className="flex-1 font-medium truncate pr-2"
													title={item.name || "Item"}
												>
													{item.name || "Unknown Item"}
												</div>
											</div>
											<div className="flex items-center gap-4 text-muted-foreground whitespace-nowrap">
												<span>Qty: {item.quantity ?? 1}</span>
												<span className="w-24 text-right">
													GHS {item.price ?? 0}
												</span>
											</div>
										</div>

										{specs.length > 0 && (
											<div className="rounded-md border bg-background/70 p-2">
												<p className="mb-1 text-xs font-semibold text-muted-foreground">
													Specifications
												</p>
												<div className="space-y-1">
													{specs.slice(0, 6).map((spec, index) => (
														<div
															key={`${spec.key}-${index}`}
															className="flex items-start justify-between gap-3 text-xs"
														>
															<span className="font-medium text-muted-foreground">
																{spec.key}
															</span>
															<span className="text-right">{spec.value}</span>
														</div>
													))}
													{specs.length > 6 && (
														<p className="text-xs text-muted-foreground">
															+{specs.length - 6} more specs
														</p>
													)}
												</div>
											</div>
										)}
									</div>
								);
							})
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
