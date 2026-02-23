"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, PackageCheck, Contact } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import Image from "next/image";

export default function PreorderDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const preorderId = params.id as string;

	const [preorder, setPreorder] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchPreorder = async () => {
			try {
				const { data, error } = await supabase
					.from("preorders")
					.select("*")
					.eq("id", preorderId)
					.single();

				if (error) throw error;
				setPreorder(data);
			} catch (err) {
				console.error("Failed to fetch preorder:", err);
				toast.error("Could not load preorder details.");
			} finally {
				setIsLoading(false);
			}
		};

		if (preorderId) {
			fetchPreorder();
		}
	}, [preorderId]);

	const handleMarkDelivered = async () => {
		try {
			const { error } = await supabase
				.from("preorders")
				.update({ fulfillment_status: "delivered" })
				.eq("id", preorderId);

			if (error) throw error;

			toast.success("Preorder marked as delivered!");
			setPreorder((prev: any) => ({
				...prev,
				fulfillment_status: "delivered",
			}));
		} catch (err) {
			console.error("Failed to update status:", err);
			toast.error("Failed to change preorder status.");
		}
	};

	const handleSendEmail = () => {
		toast.info("Email integration coming soon!", {
			description: `Placeholder: Will send an email to ${preorder?.email}`,
		});
	};

	if (isLoading) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<span className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 h-8 w-8"></span>
			</div>
		);
	}

	if (!preorder) {
		return (
			<div className="flex h-screen w-full flex-col items-center justify-center space-y-4">
				<h2 className="text-xl font-bold">Preorder Not Found</h2>
				<Button
					variant="outline"
					onClick={() => router.push("/admin/preorders")}
				>
					Back to Preorders
				</Button>
			</div>
		);
	}

	// Parse Specs
	let specifications: Record<string, any> = {};
	if (typeof preorder.specifications === "string") {
		try {
			specifications = JSON.parse(preorder.specifications);
		} catch (e) {
			console.error("Invalid JSON specs", e);
		}
	} else if (
		typeof preorder.specifications === "object" &&
		preorder.specifications
	) {
		specifications = preorder.specifications;
	}

	const productName = specifications?.product_name || preorder.product_name;
	const productImage = specifications?.product_image || preorder.product_image;
	const productId = specifications?.product_id || preorder.product_id;

	// Filter out system keys for the raw specs display
	const displaySpecs = { ...specifications };
	delete displaySpecs.product_name;
	delete displaySpecs.product_image;
	delete displaySpecs.product_id;

	return (
		<div className="p-6 md:p-10 mx-auto max-w-5xl space-y-6">
			<div className="flex items-center gap-4">
				<Button
					variant="outline"
					size="icon"
					onClick={() => router.push("/admin/preorders")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<h1 className="text-3xl font-bold tracking-tight">
					Preorder #{preorderId}
				</h1>
				<Badge
					variant="outline"
					className={`ml-auto capitalize ${
						preorder.fulfillment_status === "delivered"
							? "bg-green-100 text-green-800"
							: "bg-yellow-100 text-yellow-800"
					}`}
				>
					{preorder.fulfillment_status}
				</Badge>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Customer Details */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Contact className="h-5 w-5" /> Customer Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-y-2 text-sm">
							<div className="text-muted-foreground">Full Name:</div>
							<div className="font-medium">{preorder.full_name}</div>
							<div className="text-muted-foreground">Email:</div>
							<div className="font-medium">{preorder.email}</div>
							<div className="text-muted-foreground">Phone:</div>
							<div className="font-medium">
								{preorder.phone_number || "N/A"}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Item Requested */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<PackageCheck className="h-5 w-5" /> Order Request
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-4 items-center">
							{productImage ? (
								<Image
									src={productImage}
									alt="product"
									width={80}
									height={80}
									className="h-20 w-20 min-w-20 rounded-lg object-cover border"
								/>
							) : (
								<div className="h-20 w-20 min-w-20 rounded-lg bg-muted flex items-center justify-center border text-xs text-muted-foreground">
									N/A
								</div>
							)}
							<div className="flex flex-col">
								<span className="font-semibold text-lg text-foreground">
									{productName || "Custom Request"}
								</span>
								<div className="text-sm font-medium text-muted-foreground flex gap-1 items-center capitalize mt-1">
									<Badge variant="secondary" className="px-1.5 py-0">
										{preorder.item_type || "N/A"}
									</Badge>
									{productId && (
										<span className="text-xs uppercase ml-2 px-1">
											REF: {productId}
										</span>
									)}
								</div>
							</div>
						</div>

						<div className="mt-4">
							<div className="text-sm text-muted-foreground mb-2">
								Specifications:
							</div>
							{Object.keys(displaySpecs).length > 0 ? (
								<div className="bg-muted/50 p-4 rounded-md text-sm space-y-1">
									{Object.entries(displaySpecs).map(([key, value]) => (
										<div
											key={key}
											className="flex flex-col sm:flex-row sm:justify-between py-2 border-b last:border-0 border-muted-foreground/20"
										>
											<span className="font-semibold capitalize text-muted-foreground">
												{key.replace(/_/g, " ")}:
											</span>
											<span className="text-right sm:w-2/3">
												{String(value)}
											</span>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm italic text-muted-foreground">
									No specific details provided.
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Actions</CardTitle>
					<CardDescription>Manage this preorder interaction.</CardDescription>
				</CardHeader>
				{preorder.fulfillment_status === "delivered" ? (
					<CardContent>
						<div className="flex items-center gap-3 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400">
							<PackageCheck className="h-6 w-6 text-green-600 dark:text-green-500" />
							<div>
								<h4 className="font-semibold">Preorder Fulfilled</h4>
								<p className="text-sm">
									This preorder request has been successfully delivered and
									completed.
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
						<Button onClick={handleMarkDelivered}>
							<PackageCheck className="h-4 w-4 mr-2" /> Mark as Delivered
						</Button>

						<Button variant="secondary" onClick={handleSendEmail}>
							<Mail className="h-4 w-4 mr-2" /> Send Email Updates
						</Button>
					</CardFooter>
				)}
			</Card>
		</div>
	);
}
