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

interface UploadResult {
	message: string;
	total: number;
	successful: number;
	failed: number;
	errors: string[];
}

export function BulkUploadSheet() {
	const [open, setOpen] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [result, setResult] = useState<UploadResult | null>(null);
	const [dragActive, setDragActive] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();

	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		const droppedFile = e.dataTransfer.files?.[0];
		if (droppedFile?.name.toLowerCase().endsWith(".csv")) {
			setFile(droppedFile);
			setResult(null);
		} else {
			toast.error("Only CSV files are supported");
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

	const handleUpload = async () => {
		if (!file) return;

		setUploading(true);
		setResult(null);

		try {
			const formData = new FormData();
			formData.append("file", file);

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
					queryClient.invalidateQueries({ queryKey: ["products"] });
				}
				if (data.failed > 0) {
					toast.warning(`${data.failed} products failed to upload`);
				}
			}
		} catch (error: any) {
			toast.error("Upload failed: " + error.message);
		} finally {
			setUploading(false);
		}
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
			"detailed_specs",
		];
		const sampleRow = [
			"iPhone 15 Pro Max 256GB",
			"Brand new iPhone 15 Pro Max with 256GB storage",
			"8500",
			"9200",
			"phones",
			"New",
			"available",
			"10",
			"https://example.com/iphone15.jpg",
			"A17 Pro chip, 6.7-inch display, 48MP camera",
		];
		const csv = [headers.join(","), sampleRow.join(",")].join("\n");
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
		setResult(null);
		setUploading(false);
	};

	return (
		<Sheet
			open={open}
			onOpenChange={(isOpen) => {
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
			<SheetContent className="sm:max-w-lg overflow-y-auto p-2">
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

					{/* Drag & Drop Area */}
					<div
						onDragEnter={handleDrag}
						onDragLeave={handleDrag}
						onDragOver={handleDrag}
						onDrop={handleDrop}
						onClick={() => fileInputRef.current?.click()}
						className={`
							relative cursor-pointer rounded-lg border-2 border-dashed p-8
							text-center transition-all duration-200
							${
								dragActive
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
										setFile(null);
										setResult(null);
									}}
									className="text-xs text-red-500 hover:text-red-600"
								>
									Remove
								</Button>
							</div>
						) : (
							<div className="space-y-2">
								<Upload
									className={`h-10 w-10 mx-auto ${dragActive ? "text-primary" : "text-muted-foreground"}`}
								/>
								<p className="font-medium text-sm">
									{dragActive
										? "Drop your CSV here"
										: "Drag & drop your CSV file here"}
								</p>
								<p className="text-xs text-muted-foreground">
									or click to browse
								</p>
							</div>
						)}
					</div>

					{/* Upload Button */}
					<Button
						className="w-full"
						disabled={!file || uploading}
						onClick={handleUpload}
					>
						{uploading ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Uploading...
							</>
						) : (
							<>
								<Upload className="h-4 w-4 mr-2" />
								Upload Products
							</>
						)}
					</Button>

					{/* Upload Progress / Results */}
					{uploading && (
						<div className="space-y-2">
							<div className="h-2 w-full bg-muted rounded-full overflow-hidden">
								<div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
							</div>
							<p className="text-xs text-muted-foreground text-center">
								Processing products on the server...
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
						<h4 className="text-sm font-medium mb-3">CSV Column Guide</h4>
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
								["status", "available, unavailable, new, low-stock"],
								["stock", "Stock quantity (number)"],
								["image_url", "Full URL to product image"],
								["detailed_specs", "Detailed specifications"],
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
	);
}
