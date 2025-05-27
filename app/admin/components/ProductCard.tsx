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
	category: string;
	status: "available" | "unavailable" | "new" | "low-stock";
	stock: string;
	condition?: string;
	originalPrice?: string;
	image?: File | null;
	additionalImages?: File[];
	detailedSpecs?: string;
}
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formSchema } from "./AddProductsSheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			...product,
		},
	});

	const [toggleSheet, setToggleSheet] = useState(false);
	const [disableUpdate, setDisableUpdate] = useState(true);

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

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		console.log(values);
		// setToggleSheet(false); // Close the sheet after submit
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

			setDisableUpdate(!isDifferent);
		});

		return () => subscription.unsubscribe();
	}, [form, product]);

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
					<div className="flex justify-between items-center">
						<span className="text-lg font-bold">
							${parseFloat(product.price).toFixed(2)}
						</span>
						<span className="text-md text-amber-800 font-semibold">
							Stock: {product.stock}
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
													<Input placeholder="Product name" {...field} />
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
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="originalPrice"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Original Price (Ghc)</FormLabel>
												<FormControl>
													<Input
														type="number"
														min={1}
														placeholder="Market Price"
														{...field}
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
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="detailedSpecs"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Detailed Specifications</FormLabel>
												<FormControl>
													<Textarea
														rows={3}
														placeholder="Detailed Specifications"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="image_url"
										render={({ field }) => {
											const fileInputRef = useRef<HTMLInputElement>(null);
											const [selectedFiles, setSelectedFiles] = useState<
												File[]
											>([]);
											const [extraImages, setExtraImages] = useState<File[]>(
												[]
											);

											const handleClick = () => {
												fileInputRef.current?.click();
											};

											const handleChange = (
												e: React.ChangeEvent<HTMLInputElement>
											) => {
												const files = e.target.files;
												if (!files) return;

												const fileArray = Array.from(files);
												const totalFiles =
													selectedFiles.length + fileArray.length;

												if (totalFiles > 5) {
													toast.error("You can only upload a maximum of 5");
													return;
												}

												const newFiles = [...selectedFiles, ...fileArray];
												setSelectedFiles(newFiles);

												// First image becomes image_url, rest become additionalImages
												const [first, ...rest] = newFiles;

												form.setValue("image_url", URL.createObjectURL(first)); // !change this into server image url
												form.setValue("additionalImages", rest); // Remaining images
												setExtraImages(rest);
											};

											return (
												<FormItem>
													<>
														<ul className="grid grid-cols-2 gap-4 mt-4">
															<li className="relative border rounded-lg overflow-hidden shadow-sm group">
																<Image
																	alt={product.name}
																	src={product.image_url}
																	width={200}
																	height={200}
																	className="object-cover w-full"
																/>
																<span
																	className={cn(
																		"absolute bg-blue-500 text-white top-1 left-1 text-xs px-2 py-0.5 rounded"
																	)}
																>
																	Product image
																</span>
															</li>

															{selectedFiles.length > 0 &&
																selectedFiles.map((file, idx) => (
																	<li
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
																		<span
																			className={cn(
																				"absolute top-1 left-1 text-xs bg-white text-gray-800 px-2 py-0.5 rounded",
																				{
																					"bg-blue-500 text-white": idx === 0,
																				}
																			)}
																		>
																			{idx === 0
																				? "Product image"
																				: "Additional"}
																		</span>
																		<Button
																			type="button"
																			onClick={() => {
																				const updatedFiles =
																					selectedFiles.filter(
																						(_, i) => i !== idx
																					);
																				setSelectedFiles(updatedFiles);

																				const [newMain, ...newExtras] =
																					updatedFiles;

																				form.setValue(
																					"image_url",
																					URL.createObjectURL(newMain)
																				);
																				form.setValue(
																					"additionalImages",
																					newExtras
																				);
																			}}
																			className="absolute shrink-0 cursor-pointer top-1 right-1 bg-red-500 text-white rounded-full size-5 hover:bg-red-500 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition"
																		>
																			<X />
																		</Button>
																		<p className="text-sm text-center py-2 px-1 bg-gray-50 text-gray-700 truncate">
																			{file.name}
																		</p>
																	</li>
																))}
														</ul>
													</>
													<FormLabel>Product Images</FormLabel>
													<FormControl>
														<div className="flex flex-col items-start gap-2">
															<Input
																type="file"
																accept="image/*"
																multiple
																className="hidden"
																ref={fileInputRef}
																onChange={handleChange}
															/>
															<Button
																variant="outline"
																type="button"
																onClick={handleClick}
																className="flex items-center gap-2 cursor-pointer hover:bg-green-300 bg-green-200 text-green-900"
															>
																<UploadCloud className="w-4 h-4" />
																Upload New Product Images
															</Button>
														</div>
													</FormControl>
													<FormMessage />
												</FormItem>
											);
										}}
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
																<SelectItem value="electronics">
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
															<SelectItem value="New">New</SelectItem>
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
									<Button disabled={disableUpdate} type="submit">
										Update Product
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
