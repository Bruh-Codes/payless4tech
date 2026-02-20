"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, UploadCloud, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { ProductFormData, useProductForm } from "@/hooks/useProductForm";

export const formSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, "Product name is required"),
	description: z.string().min(1, "Description is required"),
	price: z.string().min(1, "Price is required"),
	original_price: z.string(),
	stock: z.string(),
	category: z.string().min(1, "category is required"),
	condition: z.string().min(1, "Condition is required"),
	detailed_specs: z.string().min(1, "Detailed specifications are required"),
	image_url: z.string().url("Must be a valid URL"),
	status: z.enum(["available", "unavailable", "new", "low-stock"]),
	image: z.union([z.instanceof(File), z.null(), z.undefined()]),
	additionalImages: z.union([z.array(z.instanceof(File)), z.undefined()]),
});

export function AddProductsSheet() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			id: "0",
			name: "",
			description: "",
			price: "1", // string
			image_url: "",
			category: "consumer-electronics",
			status: "available",
			stock: "0", // string
			additionalImages: [],
			condition: "",
			detailed_specs: "",
			image: undefined,
			original_price: "1", // string
		},
	});

	// Use the hook for product creation
	const {
		newProduct,
		isLoading,
		session,
		handleFormChange,
		handleSubmit: hookHandleSubmit,
	} = useProductForm({
		isEditing: false,
		onProductAdded: () => {
			setToggleSheet(false);
			setSelectedFiles([]);
			form.reset();
			// if (onProductAdded) {
			// 	onProductAdded();
			// }
		},
	});

	const [toggleSheet, setToggleSheet] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const fileArray = Array.from(files);
		const totalFiles = selectedFiles.length + fileArray.length;

		if (totalFiles > 5) {
			toast.error("You can only upload a maximum of 5");
			return;
		}

		const newFiles = [...selectedFiles, ...fileArray];
		setSelectedFiles(newFiles);

		// First image becomes image_url, rest become additionalImages
		const [first, ...rest] = newFiles;

		if (first) {
			handleFormChange("image", first);
		}
		handleFormChange("additionalImages", rest);
		// form.setValue("image_url", URL.createObjectURL(first)); // !change this into server image url
		// form.setValue("additionalImages", rest); // Remaining images
		// setExtraImages(rest);
	};

	const removeFile = (indexToRemove: number) => {
		const updatedFiles = selectedFiles.filter(
			(_, index) => index !== indexToRemove,
		);
		setSelectedFiles(updatedFiles);

		// Update hook with updated files
		const [first, ...rest] = updatedFiles;
		handleFormChange("image", first || null);
		handleFormChange("additionalImages", rest);
	};

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const result = formSchema.safeParse(values);
		if (!result.success) {
			toast.error("Validation errors. Please check all fields");
			console.log("Validation errors:", result.error.flatten());
			return;
		}

		// Generate a unique id if not provided
		let generatedId = values.id;
		if (!generatedId || generatedId === "0") {
			if (typeof crypto !== "undefined" && crypto.randomUUID) {
				generatedId = crypto.randomUUID();
			} else {
				generatedId = `${Date.now()}-${Math.random()
					.toString(36)
					.slice(2, 10)}`;
			}
		}

		const formDataForHook: ProductFormData = {
			id: generatedId,
			name: values.name,
			description: values.description,
			price: values.price,
			original_price: values.original_price || "",
			category: values.category,
			condition: values.condition,
			detailed_specs: values.detailed_specs || "",
			stock: values.stock || "",
			status: values.status || "",
			image: selectedFiles[0] ?? null, // First file as main image (File | null)
			additionalImages: selectedFiles.length > 1 ? selectedFiles.slice(1) : [], // File[]
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
		if (form.getValues("image_url")) {
			form.clearErrors("image_url");
		}
	}, [form.getValues("image_url")]);

	return (
		<Sheet open={toggleSheet} onOpenChange={setToggleSheet}>
			<SheetTrigger asChild onClick={() => setToggleSheet(true)}>
				<Button className="flex gap-1 hover:cursor-pointer items-center">
					<Plus className="h-4 w-4" />
					Add Product
				</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Add New Product</SheetTitle>
					<SheetDescription>
						Fill in the details for the new product.
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
										<FormLabel>Price (₵)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
												placeholder="Price"
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
								name="original_price"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Market Price (₵)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
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

							<FormField
								control={form.control}
								name="image_url"
								render={() => {
									return (
										<FormItem>
											<FormLabel>Upload Product Images</FormLabel>
											<FormControl>
												<div className="flex flex-col items-start gap-2">
													<Input
														type="file"
														accept="image/*"
														multiple={false}
														className="hidden"
														ref={fileInputRef}
														onChange={(e) => {
															handleChange(e);
															const files = e.target.files;
															if (files && files.length > 0) {
																// Set the first file's URL for validation
																form.setValue(
																	"image_url",
																	URL.createObjectURL(files[0]),
																);
															} else {
																form.setValue("image_url", "");
															}
														}}
													/>
													<Button
														variant="outline"
														type="button"
														onClick={handleClick}
														className="flex items-center gap-2 cursor-pointer hover:bg-green-300 bg-green-200 text-green-900"
													>
														<UploadCloud className="w-4 h-4" />
														Upload Product Images
													</Button>

													{selectedFiles.length > 0 && (
														<>
															<ul className="grid grid-cols-2 gap-4 mt-4">
																{selectedFiles.map((file, idx) => (
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
																				{ "bg-blue-500 text-white": idx === 0 },
																			)}
																		>
																			{idx === 0
																				? "Product image"
																				: "Additional"}
																		</span>
																		<Button
																			type="button"
																			onClick={() => removeFile(idx)}
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
													)}
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
														<SelectItem value="available">Available</SelectItem>
														<SelectItem value="unavailable">
															Unavailable
														</SelectItem>
														<SelectItem value="new">New</SelectItem>
														<SelectItem value="low-stock">Low Stock</SelectItem>
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
							<Button type="submit">
								{isLoading ? "please wait..." : "Add To Products"}
							</Button>
						</SheetFooter>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	);
}
