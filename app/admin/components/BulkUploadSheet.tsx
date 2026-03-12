"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	Upload,
	FileSpreadsheet,
	Download,
	CheckCircle2,
	XCircle,
	AlertTriangle,
	Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Papa from "papaparse";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UploadResult {
	message: string;
	total: number;
	successful: number;
	failed: number;
	errors: string[];
	warnings?: string[];
}

interface ImageMap {
	[filename: string]: string; // Original filename -> Supabase Public URL
}

const LEGACY_TEMPLATE_SAMPLE_ROW = {
	name: "iPhone 15 Pro Max 256GB",
	description: "Brand new iPhone 15 Pro Max with 256GB storage",
	price: "8500",
	original_price: "9200",
	category: "smartphones",
	condition: "New",
	status: "available",
	stock: "10",
	image_url: "iphone15.jpg",
	additional_images: "iphone15-side.jpg, iphone15-back.jpg",
	detailed_specs: "Processor:A17 Pro|Display:6.7-inch|Camera:48MP",
} as const;

const MALFORMED_LEGACY_ADDITIONAL_IMAGE = "iphone15-side.jpg";
const MALFORMED_LEGACY_SHIFTED_DETAILS = "iphone15-back.jpg";

function isLegacyTemplateSampleRow(row: Record<string, unknown>) {
	const valueOf = (key: string) => String(row[key] ?? "").trim();
	const matchesCore =
		valueOf("name") === LEGACY_TEMPLATE_SAMPLE_ROW.name &&
		valueOf("description") === LEGACY_TEMPLATE_SAMPLE_ROW.description &&
		valueOf("price") === LEGACY_TEMPLATE_SAMPLE_ROW.price &&
		valueOf("original_price") === LEGACY_TEMPLATE_SAMPLE_ROW.original_price &&
		valueOf("category") === LEGACY_TEMPLATE_SAMPLE_ROW.category &&
		valueOf("condition") === LEGACY_TEMPLATE_SAMPLE_ROW.condition &&
		valueOf("status") === LEGACY_TEMPLATE_SAMPLE_ROW.status &&
		valueOf("stock") === LEGACY_TEMPLATE_SAMPLE_ROW.stock &&
		valueOf("image_url") === LEGACY_TEMPLATE_SAMPLE_ROW.image_url;

	if (!matchesCore) {
		return false;
	}

	const additionalImages = valueOf("additional_images");
	const detailedSpecs = valueOf("detailed_specs");

	return (
		additionalImages === LEGACY_TEMPLATE_SAMPLE_ROW.additional_images ||
		(additionalImages === MALFORMED_LEGACY_ADDITIONAL_IMAGE &&
			detailedSpecs === MALFORMED_LEGACY_SHIFTED_DETAILS)
	);
}

export function BulkUploadSheet() {
	const [open, setOpen] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [images, setImages] = useState<File[]>([]);
	const [imageMap, setImageMap] = useState<ImageMap>({});
	const [uploading, setUploading] = useState(false);
	const [uploadingImages, setUploadingImages] = useState(false);
	const [result, setResult] = useState<UploadResult | null>(null);
	const [dragActiveCSV, setDragActiveCSV] = useState(false);
	const [dragActiveImages, setDragActiveImages] = useState(false);
	const [validationWarning, setValidationWarning] = useState<{
		isOpen: boolean;
		missingImages: string[];
		unusedImages: string[];
		filteredImagesToUpload: File[];
	} | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();

	const handleDragCSV = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActiveCSV(true);
		} else if (e.type === "dragleave") {
			setDragActiveCSV(false);
		}
	}, []);

	const handleDragImages = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActiveImages(true);
		} else if (e.type === "dragleave") {
			setDragActiveImages(false);
		}
	}, []);

	const handleDropCSV = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActiveCSV(false);

		const droppedFile = e.dataTransfer.files?.[0];
		if (droppedFile?.name.toLowerCase().endsWith(".csv")) {
			setFile(droppedFile);
			setResult(null);
		} else {
			toast.error("Only CSV files are supported");
		}
	}, []);

	const handleDropImages = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActiveImages(false);

		const droppedFiles = Array.from(e.dataTransfer.files || []);
		const imageFiles = droppedFiles.filter((f) => f.type.startsWith("image/"));
		if (imageFiles.length > 0) {
			setImages((prev) => [...prev, ...imageFiles]);
			setResult(null);
		} else {
			toast.error("Only image files are supported here");
		}
	}, []);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const selected = e.target.files?.[0];
			if (selected) {
				setFile(selected);
				setResult(null);
			}
		},
		[],
	);

	const handleImageSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const selected = Array.from(e.target.files || []);
			if (selected.length > 0) {
				setImages((prev) => [...prev, ...selected]);
				setResult(null);
			}
		},
		[],
	);

	const removeImage = (indexToRemove: number) => {
		setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
	};

	const removeCsv = () => {
		setFile(null);
		setResult(null);
	};

	const uploadImageToSupabase = async (imageFile: File): Promise<string> => {
		// Use the exact filename to ensure predictability matching the CSV
		const fileName = imageFile.name;

		const { error: uploadError } = await supabase.storage
			.from("product-images")
			.upload(fileName, imageFile, { upsert: true });

		if (uploadError) throw uploadError;

		const {
			data: { publicUrl },
		} = supabase.storage.from("product-images").getPublicUrl(fileName);

		return publicUrl;
	};

	const performUploadSequence = async (imagesToUpload: File[]) => {
		setUploading(true);
		setResult(null);

		try {
			// 1. Upload Images First
			let currentMapping: ImageMap = { ...imageMap };

			if (imagesToUpload.length > 0) {
				setUploadingImages(true);
				try {
					// Process image uploads in batches of 5 to prevent browser locking/crashing
					const BATCH_SIZE = 5;
					for (let i = 0; i < imagesToUpload.length; i += BATCH_SIZE) {
						const batch = imagesToUpload.slice(i, i + BATCH_SIZE);
						const promises = batch.map(async (img) => {
							const baseName = img.name.replace(/\.[a-z0-9]+$/i, "");
							if (!currentMapping[baseName]) {
								const url = await uploadImageToSupabase(img);
								currentMapping[baseName] = url;
							}
						});
						await Promise.all(promises);
					}
					setImageMap(currentMapping);
					toast.success("Images uploaded to storage successfully.");
				} catch (imgError: any) {
					console.log(imgError);
					toast.error("Image upload failed: " + imgError.message);
					setUploadingImages(false);
					setUploading(false);
					return; // stop execution if images fail
				}
				setUploadingImages(false);
			}

			// 2. Upload CSV
			const formData = new FormData();
			if (file) formData.append("file", file);
			formData.append("imageMapping", JSON.stringify(currentMapping));

			const response = await fetch("/api/products/bulk-upload", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.error || "Upload failed");
				setResult({
					message: data.error,
					total: 0,
					successful: 0,
					failed: 0,
					errors: [data.error],
				});
			} else {
				setResult(data);
				if (data.successful > 0) {
					toast.success(`${data.successful} products uploaded successfully!`);
					queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
				}
				if (data.failed > 0) {
					toast.warning(`${data.failed} products failed to upload`);
				} else if (data.successful > 0 && data.failed === 0) {
					setTimeout(() => {
						setOpen(false);
						resetState();
					}, 2000);
				}
			}
		} catch (error: any) {
			toast.error("Upload failed: " + error.message);
		} finally {
			setUploading(false);
		}
	};

	const handleUpload = async () => {
		if (!file) return;

		setUploading(true);
		setResult(null);

		const getBaseName = (filename: string) =>
			filename.replace(/\.[a-z0-9]+$/i, "");

		// 1. Pre-parse the CSV to validate image references
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => {
				const referencedImageNames = new Set<string>();

				results.data.forEach((row: any) => {
					if (isLegacyTemplateSampleRow(row)) {
						return;
					}

					// Extract main image
					if (row.image_url && row.image_url.trim() !== "") {
						const name = row.image_url.trim();
						referencedImageNames.add(getBaseName(name));
					}
					// Extract additional images
					if (row.additional_images && row.additional_images.trim() !== "") {
						const parts = row.additional_images
							.split(",")
							.map((img: string) => img.trim())
							.filter((img: string) => img.length > 0);
						parts.forEach((img: string) => {
							referencedImageNames.add(getBaseName(img));
						});
					}
				});

				const providedImageNames = new Set(
					images.map((img) => getBaseName(img.name)),
				);

				// Find missing images (referenced in CSV but not dropped)
				const missingImages = Array.from(referencedImageNames).filter(
					(name) => !providedImageNames.has(name),
				);

				// Find unused images (dropped but not referenced in CSV)
				const unusedImages = Array.from(providedImageNames).filter(
					(name) => !referencedImageNames.has(name),
				);

				// Filter images to only upload those explicitly referenced
				const filteredImagesToUpload = images.filter((img) =>
					referencedImageNames.has(getBaseName(img.name)),
				);

				if (missingImages.length > 0 || unusedImages.length > 0) {
					// Halt and show warning dialog
					setValidationWarning({
						isOpen: true,
						missingImages,
						unusedImages,
						filteredImagesToUpload,
					});
				} else {
					// Everything matches, proceed directly
					performUploadSequence(images);
				}
			},
			error: (error) => {
				toast.error(`Failed to read CSV for validation: ${error.message}`);
			},
		});
	};

	const downloadTemplate = () => {
		const headers = [
			"name",
			"description",
			"price",
			"original_price",
			"category",
			"condition",
			"status",
			"stock",
			"image_url",
			"additional_images",
			"detailed_specs",
		];
		const sampleRow = [
			"iPhone 15 Pro Max 256GB",
			"Brand new iPhone 15 Pro Max with 256GB storage",
			"8500",
			"9200",
			"smartphones",
			"New",
			"available",
			"10",
			"iphone15.jpg",
			"iphone15-side.jpg, iphone15-back.jpg",
			"Chip: A13 Bionic\nDisplay: 6.1-inch Liquid Retina HD display\nStorage: 64GB, 128GB, 256GB\nRear Camera: Dual 12MP Ultra Wide and Wide cameras\nFront Camera: 12MP TrueDepth camera\nFace ID: Supported\nCellular: 4G LTE\nCharging: Fast charging and Qi wireless charging\nConnector: Lightning\nWater Resistance: IP68\nOperating System: iOS\nSim: Dual SIM (nano-SIM and eSIM)",
		];
		const csv = Papa.unparse({
			fields: headers,
			data: [sampleRow],
		});
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "products_template.csv";
		a.click();
		URL.revokeObjectURL(url);
	};

	const resetState = () => {
		setFile(null);
		setImages([]);
		setImageMap({});
		setResult(null);
		setUploading(false);
		setUploadingImages(false);
		setValidationWarning(null);
	};

	return (
		<>
			<Sheet
				open={open}
				onOpenChange={(isOpen) => {
					if (!isOpen && (uploading || uploadingImages)) return;
					setOpen(isOpen);
					if (!isOpen) resetState();
				}}
			>
				<SheetTrigger asChild>
					<Button variant="outline" className="flex gap-2 items-center">
						<Upload className="h-4 w-4" />
						Bulk Upload
					</Button>
				</SheetTrigger>
				<SheetContent
					className="sm:max-w-lg overflow-y-auto p-2"
					onInteractOutside={(e) => {
						if (uploading || uploadingImages) e.preventDefault();
					}}
					onEscapeKeyDown={(e) => {
						if (uploading || uploadingImages) e.preventDefault();
					}}
				>
					<SheetHeader>
						<SheetTitle className="flex items-center gap-2">
							<FileSpreadsheet className="h-5 w-5" />
							Bulk Product Upload
						</SheetTitle>
						<SheetDescription>
							Upload a CSV file to add multiple products at once. The file is
							processed on the server.
						</SheetDescription>
					</SheetHeader>

					<div className="space-y-6 py-6 px-1">
						{/* Template Download */}
						<div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4">
							<div className="flex items-start gap-3">
								<Download className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
								<div className="flex-1">
									<p className="text-sm font-medium">Download CSV Template</p>
									<p className="text-xs text-muted-foreground mt-1">
										Start with a template to ensure your data is formatted
										correctly. Required columns: <strong>name</strong>,{" "}
										<strong>price</strong>. All others are optional.
									</p>
									<Button
										variant="link"
										size="sm"
										className="px-0 mt-1 h-auto text-primary"
										onClick={downloadTemplate}
									>
										Download template.csv
									</Button>
								</div>
							</div>
						</div>

						<div className="rounded-lg border bg-blue-50/60 dark:bg-blue-950/20 p-4 space-y-3">
							<h4 className="text-sm font-medium">How Bulk Upload Works</h4>
							<div className="space-y-2 text-xs text-muted-foreground">
								<p>1. Fill the CSV template with your product details.</p>
								<p>2. (Optional) Add product images.</p>
								<p>
									3. In the CSV, <code>image_url</code> and{" "}
									<code>additional_images</code> should match the uploaded image
									file names.
								</p>
								<p>
									Use the uploaded image file name in <code>image_url</code> (or{" "}
									<code>additional_images</code>), not the product name.
								</p>
								<p>
									4. Upload the CSV. We will match the product to the image using
									that image name.
								</p>
							</div>
						</div>

						{/* Step 1: CSV Drag & Drop Area */}
						<div className="space-y-2">
							<h4 className="text-sm font-medium">Step 1: Upload CSV</h4>
							<p className="text-xs text-muted-foreground pb-2">
								The <code>image_url</code> and <code>additional_images</code>{" "}
								fields can use either full filenames or base names from Step 2
								(e.g. <code>iphone15.jpg</code> or <code>iphone15</code>). If you
								skip Step 2, they can point to existing images already in storage.
							</p>
							<div
								onDragEnter={handleDragCSV}
								onDragLeave={handleDragCSV}
								onDragOver={handleDragCSV}
								onDrop={handleDropCSV}
								onClick={() => fileInputRef.current?.click()}
								className={`
								relative cursor-pointer rounded-lg border-2 border-dashed p-8
								text-center transition-all duration-200
								${
									dragActiveCSV
										? "border-primary bg-primary/5 scale-[1.01]"
										: "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/20"
								}
								${file ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : ""}
							`}
							>
								<input
									ref={fileInputRef}
									type="file"
									accept=".csv"
									onChange={handleFileSelect}
									className="hidden"
								/>
								{file ? (
									<div className="space-y-2">
										<CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
										<p className="font-medium text-sm">{file.name}</p>
										<p className="text-xs text-muted-foreground">
											{(file.size / 1024).toFixed(1)} KB
										</p>
										<Button
											variant="ghost"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												removeCsv();
											}}
											className="text-xs text-red-500 hover:text-red-600"
										>
											Remove
										</Button>
									</div>
								) : (
									<div className="space-y-2">
										<FileSpreadsheet
											className={`h-10 w-10 mx-auto ${dragActiveCSV ? "text-primary" : "text-muted-foreground"}`}
										/>
										<p className="font-medium text-sm">
											{dragActiveCSV
												? "Drop your CSV here"
												: "Drag & drop your CSV file here"}
										</p>
										<p className="text-xs text-muted-foreground">
											or click to browse
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Step 2: Image Drag & Drop Area */}
						<div className="space-y-2">
							<h4 className="text-sm font-medium">
								Step 2: Upload Images (Optional)
							</h4>
							<p className="text-xs text-muted-foreground pb-2">
								Upload images for products in your CSV. The CSV will connect each
								product to its image using the file name. You can use either the
								full filename like <code>iphone15.jpg</code> or just the base name
								like <code>iphone15</code>.
							</p>
							<div
								onDragEnter={handleDragImages}
								onDragLeave={handleDragImages}
								onDragOver={handleDragImages}
								onDrop={handleDropImages}
								onClick={() => imageInputRef.current?.click()}
								className={`
								relative cursor-pointer rounded-lg border-2 border-dashed p-6
								text-center transition-all duration-200
								${
									dragActiveImages
										? "border-primary bg-primary/5 scale-[1.01]"
										: "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/20"
								}
								${images.length > 0 ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : ""}
							`}
							>
								<input
									ref={imageInputRef}
									type="file"
									accept="image/*"
									multiple
									onChange={handleImageSelect}
									className="hidden"
								/>
								{images.length > 0 ? (
									<div className="space-y-4">
										<CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
										<p className="font-medium text-sm">
											{images.length} image{images.length !== 1 && "s"} selected
										</p>
										<div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto p-2">
											{images.map((img, idx) => (
												<div
													key={idx}
													className="flex items-center gap-1 bg-background border rounded px-2 py-1 text-xs shadow-sm"
													onClick={(e) => {
														e.stopPropagation(); // prevent opening file dialog when removing
													}}
												>
													<span className="truncate max-w-[100px]">
														{img.name}
													</span>
													<Button
														variant="ghost"
														size="icon"
														className="h-4 w-4 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 mt-0.5 shrink-0"
														onClick={(e) => {
															e.stopPropagation();
															removeImage(idx);
														}}
													>
														<XCircle className="h-3 w-3" />
													</Button>
												</div>
											))}
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												setImages([]);
											}}
											className="text-xs text-red-500 hover:text-red-600"
										>
											Clear All Images
										</Button>
									</div>
								) : (
									<div className="space-y-2">
										<Upload
											className={`h-8 w-8 mx-auto ${dragActiveImages ? "text-primary" : "text-muted-foreground"}`}
										/>
										<p className="font-medium text-sm">
											{dragActiveImages
												? "Drop images here"
												: "Drag & drop images here"}
										</p>
										<p className="text-xs text-muted-foreground">
											or click to browse
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Upload Button */}
						<Button
							className="w-full"
							disabled={!file || uploading || uploadingImages}
							onClick={handleUpload}
						>
							{uploadingImages ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Uploading Images...
								</>
							) : uploading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Parsing CSV & Importing...
								</>
							) : (
								<>
									<Upload className="h-4 w-4 mr-2" />
									Upload Products
								</>
							)}
						</Button>

						{/* Upload Progress / Results */}
						{(uploading || uploadingImages) && (
							<div className="space-y-2">
								<div className="h-2 w-full bg-muted rounded-full overflow-hidden">
									<div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
								</div>
								<p className="text-xs text-muted-foreground text-center">
									{uploadingImages
										? "Uploading images to your storage bucket..."
										: "Processing rows and adding to catalog..."}
								</p>
							</div>
						)}

						{result && (
							<div className="space-y-3">
								{/* Summary */}
								<div className="grid grid-cols-3 gap-3">
									<div className="rounded-lg border bg-muted/30 p-3 text-center">
										<p className="text-2xl font-bold">{result.total}</p>
										<p className="text-xs text-muted-foreground">Total Rows</p>
									</div>
									<div className="rounded-lg border bg-green-50 dark:bg-green-950/30 p-3 text-center">
										<p className="text-2xl font-bold text-green-600">
											{result.successful}
										</p>
										<p className="text-xs text-green-600/70">Successful</p>
									</div>
									<div className="rounded-lg border bg-red-50 dark:bg-red-950/30 p-3 text-center">
										<p className="text-2xl font-bold text-red-600">
											{result.failed}
										</p>
										<p className="text-xs text-red-600/70">Failed</p>
									</div>
								</div>

								{/* Errors */}
								{result.errors.length > 0 && (
									<div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-3">
										<div className="flex items-center gap-2 mb-2">
											<AlertTriangle className="h-4 w-4 text-red-500" />
											<p className="text-sm font-medium text-red-600">
												Errors ({result.errors.length})
											</p>
										</div>
										<div className="max-h-40 overflow-y-auto space-y-1">
											{result.errors.map((error, i) => (
												<div key={i} className="flex items-start gap-2">
													<XCircle className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
													<p className="text-xs text-red-600/80">{error}</p>
												</div>
											))}
										</div>
									</div>
								)}

								{(result.warnings?.length || 0) > 0 && (
									<div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-3">
										<div className="flex items-center gap-2 mb-2">
											<AlertTriangle className="h-4 w-4 text-amber-500" />
											<p className="text-sm font-medium text-amber-700 dark:text-amber-400">
												Helpful Notes ({result.warnings?.length})
											</p>
										</div>
										<p className="text-xs text-amber-700/80 dark:text-amber-300/80 mb-2">
											These items did not block the upload, but you may want to
											review them.
										</p>
										<div className="max-h-40 overflow-y-auto space-y-1">
											{result.warnings?.map((warning, i) => (
												<div key={i} className="flex items-start gap-2">
													<AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
													<p className="text-xs text-amber-700/90 dark:text-amber-300/90">
														{warning}
													</p>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Success message */}
								{result.successful > 0 && result.failed === 0 && (
									<div className="rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20 p-3">
										<div className="flex items-center gap-2">
											<CheckCircle2 className="h-4 w-4 text-green-500" />
											<p className="text-sm font-medium text-green-600">
												All products uploaded successfully!
											</p>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Column Guide */}
						<div className="rounded-lg border p-4">
							<h4 className="text-sm font-medium mb-3">What To Fill In</h4>
							<div className="space-y-1.5 text-xs">
								{[
									["name*", "Product name (required)"],
									["description", "Product description"],
									["price*", "Price in GHS (required, numeric)"],
									["original_price", "Market price in GHS"],
									[
										"category",
										"consumer-electronics, laptops, phones, tablets, etc.",
									],
									["condition", "New, Open Box, Renewed, Used"],
									["status", "available, unavailable, low-stock"],
									["stock", "Stock quantity (number)"],
									[
										"image_url",
										"Main product image file name from Step 1. Example: iphone15.jpg",
									],
									[
										"additional_images",
										"Extra product image file names, separated by commas.",
									],
									[
										"detailed_specs",
										"Format as Key:Value|Key:Value (e.g. Storage:256GB|Color:Black).",
									],
								].map(([col, desc]) => (
									<div key={col} className="flex items-start gap-2">
										<code className="bg-muted rounded px-1.5 py-0.5 text-[11px] font-mono shrink-0">
											{col}
										</code>
										<span className="text-muted-foreground">{desc}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</SheetContent>
			</Sheet>

			<AlertDialog
				open={validationWarning?.isOpen || false}
				onOpenChange={(isOpen) =>
					setValidationWarning((prev) => (prev ? { ...prev, isOpen } : null))
				}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Image Validation Warning</AlertDialogTitle>
						<AlertDialogDescription className="space-y-4">
							{validationWarning?.missingImages &&
								validationWarning.missingImages.length > 0 && (
									<div>
										<strong className="text-red-500 font-semibold block mb-1">
											Missing Images ({validationWarning.missingImages.length}):
										</strong>
										<p className="text-sm">
											These image names are in the CSV, but the files were not
											uploaded in Step 1. Fix this by uploading the missing image
											files or removing those image names from the CSV.
										</p>
										<div className="bg-red-50 dark:bg-red-950/20 text-red-600 rounded p-2 mt-2 max-h-24 overflow-y-auto text-xs">
											{validationWarning.missingImages.join(", ")}
										</div>
									</div>
								)}

							{validationWarning?.unusedImages &&
								validationWarning.unusedImages.length > 0 && (
									<div>
										<strong className="text-amber-500 font-semibold block mb-1">
											Unused Images ({validationWarning.unusedImages.length}):
										</strong>
										<p className="text-sm">
											These image files were uploaded in Step 1 but are not used
											in the CSV. They will be skipped unless you add their names
											to <code>image_url</code> or <code>additional_images</code>.
										</p>
										<div className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded p-2 mt-2 max-h-24 overflow-y-auto text-xs">
											{validationWarning.unusedImages.join(", ")}
										</div>
									</div>
								)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setValidationWarning(null)}>
							Review Files
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (validationWarning) {
									const filesToUpload =
										validationWarning.filteredImagesToUpload;
									setValidationWarning(null);
									performUploadSequence(filesToUpload);
								}
							}}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							Proceed Anyway
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
