"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import {
	MoreVertical,
	Trash2,
	CheckCircle,
	XCircle,
	Star,
	UploadCloud,
	X,
} from "lucide-react";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

export interface Product {
	id: string;
	name: string;
	description: string;
	price: string;
	image_url: string;
	category: "consumer-electronics" | "laptops" | "phones";
	status: "available" | "unavailable" | "new" | "low-stock";
	stock?: string;
	condition?: string;
	original_price?: string;
	image?: File | null;
	additionalImages?: File[];
	detailed_specs?: string;
}

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formSchema } from "./AddProductsSheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ProductFormData, useProductForm } from "@/hooks/useProductForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductCardProps {
	product: Product;
	onEdit: (product: Product) => void;
	onDelete: (id: string) => void;
	onStatusChange: (id: string, status: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
	product,
	onEdit,
	onDelete,
	onStatusChange,
}) => {
	const [toggleSheet, setToggleSheet] = useState(false);
	const [disableUpdate, setDisableUpdate] = useState(true);

	// Separate refs for main and additional images
	const mainImageInputRef = useRef<HTMLInputElement>(null);
	const additionalImagesInputRef = useRef<HTMLInputElement>(null);

	// Separate state for main and additional images
	const [newMainImage, setNewMainImage] = useState<File | null>(null);
	const [newAdditionalImages, setNewAdditionalImages] = useState<File[]>([]);
	const [hasImageChanges, setHasImageChanges] = useState(false);
	const [mainImageRemoved, setMainImageRemoved] = useState(false);
	const [isDeletingLoading, setisDeletingLoading] = useState(false);

	// Use the hook for product creation
	const {
		isLoading,
		handleFormChange,
		handleSubmit: hookHandleSubmit,
		handleDeleteMainImage,
		handleDeleteAdditionalImage,
	} = useProductForm({
		isEditing: true,
		productId: product.id,
		refetchAdditionalImages: () => {
			refetchAdditionalImages();
		},
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			...product,
			price: String(product.price ?? ""),
			stock: String(product.stock ?? ""),
			original_price: String(product.original_price ?? ""),
		},
	});

	// Reset form when product changes
	useEffect(() => {
		form.reset({
			...product,
			price: String(product.price ?? ""),
			stock: String(product.stock ?? ""),
			original_price: String(product.original_price ?? ""),
		});
		setNewMainImage(null);
		setNewAdditionalImages([]);
		setHasImageChanges(false);
		setMainImageRemoved(false);
	}, [product]);

	const renderStatusBadge = (status: string) => {
		switch (status) {
			case "new":
				return (
					<span className="bg-purple-300 text-purple-800 font-semibold px-3 py-2 rounded-2xl">
						New
					</span>
				);
			case "available":
				return (
					<span className="bg-green-200 text-green-800 font-semibold px-3 py-2 rounded-2xl">
						Available
					</span>
				);
			case "unavailable":
				return (
					<span className="bg-red-200 text-red-800 font-semibold px-3 py-2 rounded-2xl">
						Unavailable
					</span>
				);
			case "low-stock":
				return (
					<span className="bg-yellow-200 text-yellow-800 font-semibold px-3 py-2 rounded-2xl">
						Low Stock
					</span>
				);
			default:
				return null;
		}
	};

	const { data: additionalImages, refetch: refetchAdditionalImages } = useQuery(
		{
			queryKey: ["productAdditionalImages", product.id],
			queryFn: async () => {
				const response = await supabase
					.from("product_images")
					.select("*")
					.eq("product_id", product.id)
					.order("display_order", { ascending: true });

				return response.data;
			},
		}
	);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const result = formSchema.safeParse(values);
		if (!result.success) {
			toast.error("Validation errors. Check the console");
			console.log("Validation errors:", result.error.flatten());
			return;
		}

		const formDataForHook: ProductFormData = {
			id: values.id as string,
			name: values.name,
			description: values.description,
			price: values.price,
			original_price: values.original_price || "",
			category: values.category,
			condition: values.condition,
			detailed_specs: values.detailed_specs || "",
			stock: values.stock || "",
			status: values.status || "",
			// Include new main image if selected
			image: newMainImage,
			// Include new additional images
			additionalImages: newAdditionalImages,
		};

		// Set each field individually using handleFormChange
		Object.entries(formDataForHook).forEach(([key, value]) => {
			handleFormChange(key as keyof typeof formDataForHook, value);
		});

		// Create a synthetic form event and submit using the hook
		const syntheticEvent = {
			preventDefault: () => {},
		} as React.FormEvent;

		await hookHandleSubmit(syntheticEvent, formDataForHook);
	};

	useEffect(() => {
		const subscription = form.watch((formValues) => {
			const isDifferent = Object.keys(formValues).some((key) => {
				const originalValue = product[key as keyof Product];
				const currentValue = formValues[key as keyof Product];

				// Normalize empty and null values
				const normalize = (val: any) =>
					val === null || val === undefined ? "" : String(val).trim();

				return normalize(originalValue) !== normalize(currentValue);
			});

			// Check if there are changes in form data OR new images selected
			setDisableUpdate(!(isDifferent || hasImageChanges));
		});

		return () => subscription.unsubscribe();
	}, [form, product, hasImageChanges]);

	// Handle main image upload
	const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setNewMainImage(file);
		setHasImageChanges(true);

		// Update form with new image URL for preview
		form.setValue("image_url", URL.createObjectURL(file));
	};

	// Handle additional images upload
	const handleAdditionalImagesChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = e.target.files;
		if (!files) return;

		const fileArray = Array.from(files);
		const updatedAdditionalImages = [...newAdditionalImages, ...fileArray];

		setNewAdditionalImages(updatedAdditionalImages);
		setHasImageChanges(true);

		// Update form
		form.setValue("additionalImages", updatedAdditionalImages);
	};

	// Remove new main image
	const removeNewMainImage = () => {
		setNewMainImage(null);
		// Reset to original image if no new image selected
		form.setValue("image_url", product.image_url);
		setHasImageChanges(newAdditionalImages.length > 0);
	};

	// Remove new additional image
	const removeNewAdditionalImage = (indexToRemove: number) => {
		const updatedFiles = newAdditionalImages.filter(
			(_, i) => i !== indexToRemove
		);
		setNewAdditionalImages(updatedFiles);
		form.setValue("additionalImages", updatedFiles);
		setHasImageChanges(newMainImage !== null || updatedFiles.length > 0);
	};

	return (
		<Card className="overflow-hidden h-full flex flex-col">
			<div className="relative aspect-video overflow-hidden bg-gray-100">
				{product.image_url && (
					<Image
						src={product.image_url}
						alt={product.name}
						width={200}
						height={200}
						priority
						className="w-full h-full object-cover"
						onError={(e) => {
							e.currentTarget.src = " ";
						}}
					/>
				)}
				<div className="absolute top-4 right-2">
					{renderStatusBadge(product.status)}
				</div>
			</div>

			<CardContent className="flex flex-col flex-1 p-4">
				{product?.condition !== "New" && product?.condition !== "none" && (
					<p
						className={cn("font-normal text-xs truncate w-fit", {
							"text-yellow-700 bg-yellow-100 px-2 py-1 rounded":
								product.condition === "Open Box",
							"text-blue-700 bg-blue-100 px-2 py-1 rounded":
								product.condition === "Renewed",
							"text-gray-700 bg-gray-100 px-2 py-1 rounded":
								product.condition === "Used",
						})}
					>
						{product.condition}
					</p>
				)}
				<div className="flex items-center justify-between mb-2">
					<h3 className="font-semibold text-lg truncate">{product.name}</h3>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="secondary"
								size="sm"
								className="h-8 w-8 p-0 cursor-pointer"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => onDelete(product.id)}>
								<Trash2 className="mr-2 h-4 w-4" />
								<span>Delete</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onStatusChange(product.id, "new")}
							>
								<Star className="mr-2 h-4 w-4" />
								<span>Mark as New</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onStatusChange(product.id, "available")}
							>
								<CheckCircle className="mr-2 h-4 w-4" />
								<span>Mark as Available</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onStatusChange(product.id, "unavailable")}
							>
								<XCircle className="mr-2 h-4 w-4" />
								<span>Mark as Unavailable</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<p className="text-muted-foreground text-sm line-clamp-2 mb-2">
					{product.description}
				</p>

				<div className="mt-auto">
					{product.original_price && (
						<span className="text-xs line-through text-red-600 font-bold">
							Ghc{" "}
							{Number(product.original_price).toLocaleString(undefined, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</span>
					)}
					<div className="flex justify-between items-center">
						<span className="text-lg font-bold">
							Ghc
							{Number(product.price).toLocaleString(undefined, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</span>
						<span className="text-sm text-amber-400 font-semibold">
							Stock: {product.stock ?? 0}
						</span>
					</div>
					<div className="text-xs text-muted-foreground mt-1 capitalize">
						{product.category}
					</div>
				</div>
			</CardContent>

			<CardFooter className="p-4 pt-0">
				<Sheet onOpenChange={setToggleSheet} open={toggleSheet}>
					<SheetTrigger asChild onClick={() => setToggleSheet(true)}>
						<Button className="flex gap-1 hover:cursor-pointer items-center">
							Edit Product
						</Button>
					</SheetTrigger>
					<SheetContent side="left">
						<SheetHeader>
							<SheetTitle>Edit Product</SheetTitle>
							<SheetDescription>
								Make changes to this product here. Click save when you're done.
							</SheetDescription>
						</SheetHeader>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="p-5 overflow-y-auto"
							>
								<div className="grid gap-4">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Product Name</FormLabel>
												<FormControl>
													<Input
														placeholder="Product name"
														{...field}
														onChange={(e) => field.onChange(e.target.value)}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="stock"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Stock</FormLabel>
												<FormControl>
													<Input
														type="number"
														min={1}
														placeholder="Stock"
														{...field}
														onChange={(e) => field.onChange(e.target.value)}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="price"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Price (Ghc)</FormLabel>
												<FormControl>
													<Input
														type="number"
														min={1}
														placeholder="Price"
														{...field}
														onChange={(e) =>
															field.onChange(e.target.value.toString())
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="original_price"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Market Price (Ghc)</FormLabel>
												<FormControl>
													<Input
														type="number"
														min={0}
														placeholder="Market Price"
														{...field}
														onChange={(e) => field.onChange(e.target.value)}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="description"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Description</FormLabel>
												<FormControl>
													<Textarea
														rows={3}
														placeholder="Product description"
														{...field}
														onChange={(e) => field.onChange(e.target.value)}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="detailed_specs"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Detailed Specifications</FormLabel>
												<FormControl>
													<Textarea
														rows={3}
														placeholder="Detailed Specifications"
														{...field}
														onChange={(e) => field.onChange(e.target.value)}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Main Image Upload Section */}
									<FormField
										control={form.control}
										name="image_url"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Main Product Image</FormLabel>
												<FormControl>
													<div className="flex flex-col items-start gap-2">
														<Input
															type="file"
															accept="image/*"
															className="hidden"
															ref={mainImageInputRef}
															onChange={handleMainImageChange}
														/>

														<Button
															variant="outline"
															type="button"
															onClick={() => mainImageInputRef.current?.click()}
															className="flex items-center gap-2 cursor-pointer hover:bg-blue-300 bg-blue-200 text-blue-900"
														>
															<UploadCloud className="w-4 h-4" />
															Upload New Main Image
														</Button>
													</div>
												</FormControl>

												{/* Current and new main image preview */}
												<div className="grid grid-cols-2 gap-4 mt-4">
													{/* Current main image */}
													{!newMainImage && !mainImageRemoved && (
														<div className="relative border rounded-lg overflow-hidden shadow-sm group">
															<Image
																priority
																alt={product.name}
																src={product.image_url}
																width={200}
																height={200}
																className="object-cover w-full h-[150px]"
															/>
															<span className="absolute bg-blue-500 text-white top-1 left-1 text-xs px-2 py-0.5 rounded">
																Current Main Image
															</span>
															<Button
																type="button"
																onClick={async () => {
																	await handleDeleteMainImage();
																	setMainImageRemoved(true);
																	setHasImageChanges(true);
																}}
																className="absolute top-1 right-1 bg-red-500 text-white rounded-full size-5 hover:bg-red-600 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition"
															>
																<X className="w-3 h-3" />
															</Button>
														</div>
													)}

													{/* New main image */}
													{newMainImage && (
														<div className="relative border rounded-lg overflow-hidden shadow-sm group">
															<Image
																alt={newMainImage.name}
																src={URL.createObjectURL(newMainImage)}
																width={200}
																height={200}
																className="object-cover w-full h-[150px]"
															/>
															<span className="absolute bg-green-500 text-white top-1 left-1 text-xs px-2 py-0.5 rounded">
																New Main Image
															</span>
															<Button
																type="button"
																onClick={removeNewMainImage}
																className="absolute top-1 right-1 bg-red-500 text-white rounded-full size-5 hover:bg-red-600 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition"
															>
																<X className="w-3 h-3" />
															</Button>
															<p className="text-sm text-center py-2 px-1 bg-gray-50 text-gray-700 truncate">
																{newMainImage.name}
															</p>
														</div>
													)}
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Additional Images Upload Section */}
									<FormField
										control={form.control}
										name="additionalImages"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Additional Product Images</FormLabel>
												<FormControl>
													<div className="flex flex-col items-start gap-2">
														<Input
															type="file"
															accept="image/*"
															className="hidden"
															multiple={true}
															ref={additionalImagesInputRef}
															onChange={handleAdditionalImagesChange}
														/>

														<Button
															variant="outline"
															type="button"
															onClick={() =>
																additionalImagesInputRef.current?.click()
															}
															className="flex items-center gap-2 cursor-pointer hover:bg-green-300 bg-green-200 text-green-900"
														>
															<UploadCloud className="w-4 h-4" />
															Upload Additional Images
														</Button>
													</div>
												</FormControl>

												{/* Current and new additional images preview */}
												<div className="grid grid-cols-2 gap-4 mt-4">
													{/* Current additional images */}
													{additionalImages &&
														additionalImages.map((additionalImage, idx) => {
															const imageUrl = additionalImage?.image_url;

															return (
																<div
																	key={idx}
																	className="relative border rounded-lg overflow-hidden shadow-sm group"
																>
																	{isLoading ? (
																		<div className="w-full h-[150px] flex items-center justify-center bg-black">
																			<span className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 h-8 w-8"></span>
																		</div>
																	) : imageUrl ? (
																		<Image
																			alt={additionalImage.id}
																			src={imageUrl}
																			width={200}
																			height={200}
																			className="object-cover w-full h-[150px]"
																		/>
																	) : (
																		<div className="w-full h-[150px] flex items-center justify-center text-gray-400 text-sm italic">
																			No Image
																		</div>
																	)}

																	<span className="absolute bg-gray-800 text-white top-1 left-1 text-xs px-2 py-0.5 rounded">
																		Current Additional
																	</span>

																	{!isLoading && (
																		<Button
																			disabled={isLoading}
																			type="button"
																			onClick={() =>
																				handleDeleteAdditionalImage(
																					additionalImage?.id
																				)
																			}
																			className="absolute shrink-0 cursor-pointer top-1 right-1 bg-red-500 text-white rounded-full size-5 hover:bg-red-600 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition"
																		>
																			<X className="w-3 h-3" />
																		</Button>
																	)}
																</div>
															);
														})}

													{/* New additional images */}
													{newAdditionalImages.map((file, idx) => (
														<div
															key={idx}
															className="relative border rounded-lg overflow-hidden shadow-sm group"
														>
															<Image
																alt={file.name}
																src={URL.createObjectURL(file)}
																width={200}
																height={200}
																className="object-cover w-full h-[150px]"
															/>
															<span className="absolute bg-green-500 text-white top-1 left-1 text-xs px-2 py-0.5 rounded">
																New Additional
															</span>
															<Button
																type="button"
																onClick={() => removeNewAdditionalImage(idx)}
																className="absolute shrink-0 cursor-pointer top-1 right-1 bg-red-500 text-white rounded-full size-5 hover:bg-red-600 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition"
															>
																<X className="w-3 h-3" />
															</Button>
															<p className="text-sm text-center py-2 px-1 bg-gray-50 text-gray-700 truncate">
																{file.name}
															</p>
														</div>
													))}
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="category"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Category</FormLabel>
													<Select
														onValueChange={field.onChange}
														value={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select category" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectGroup>
																<SelectItem value="consumer-electronics">
																	Electronics
																</SelectItem>
																<SelectItem value="laptops">Laptops</SelectItem>
																<SelectItem value="phones">Phones</SelectItem>
															</SelectGroup>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="status"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Status</FormLabel>
													<Select
														onValueChange={field.onChange}
														value={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select status" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectGroup>
																<SelectItem value="available">
																	Available
																</SelectItem>
																<SelectItem value="unavailable">
																	Unavailable
																</SelectItem>
																<SelectItem value="new">New</SelectItem>
																<SelectItem value="low-stock">
																	Low Stock
																</SelectItem>
															</SelectGroup>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="condition"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Condition</FormLabel>
													<Select
														onValueChange={field.onChange}
														value={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select condition" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value={"none"}>None</SelectItem>
															<SelectItem value="Open Box">Open Box</SelectItem>
															<SelectItem value="Renewed">Renewed</SelectItem>
															<SelectItem value="Used">Used</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
								<SheetFooter>
									<Button disabled={disableUpdate || isLoading} type="submit">
										{isLoading ? "Updating product..." : "Update Product"}
									</Button>
								</SheetFooter>
							</form>
						</Form>
					</SheetContent>
				</Sheet>
			</CardFooter>
		</Card>
	);
};

export default ProductCard;
