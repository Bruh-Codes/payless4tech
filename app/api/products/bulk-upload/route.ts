import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

// Expected CSV columns
const VALID_CATEGORIES = [
	"consumer-electronics",
	"laptops",
	"tablets",
	"audio",
	"gaming",
	"accessories",
	"smartphones",
];

const VALID_STATUSES = ["available", "unavailable", "low-stock"];

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
} as const;

const MALFORMED_LEGACY_ADDITIONAL_IMAGE = "iphone15-side.jpg";
const MALFORMED_LEGACY_SHIFTED_DETAILS = "iphone15-back.jpg";

interface ParsedProduct {
	name: string;
	description: string;
	price: number;
	original_price: string;
	category: string;
	condition: string;
	status: string;
	stock: number;
	image_url: string;
	additional_images: string[];
	detailed_specs: string;
}

interface ParsedProductWarning {
	message: string;
}

interface BulkUploadRowInput {
	name?: string;
	description?: string;
	price?: string;
	original_price?: string;
	category?: string;
	condition?: string;
	status?: string;
	stock?: string;
	image_url?: string;
	additional_images?: string;
	detailed_specs?: string;
}

const HEADER_ALIASES: Record<string, keyof ParsedProduct | "skip"> = {
	name: "name",
	description: "description",
	price: "price",
	original_price: "original_price",
	"original price": "original_price",
	category: "category",
	condition: "condition",
	status: "status",
	stock: "stock",
	image_url: "image_url",
	"image url": "image_url",
	additional_images: "additional_images",
	"additional images": "additional_images",
	detailed_specs: "detailed_specs",
	"detailed specs": "detailed_specs",
};

function normalizeHeader(header: string) {
	return header.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function parseSpecLine(line: string) {
	const cleanedLine = line
		.trim()
		.replace(/^[\u2022*-]\s*/, "")
		.replace(/^\d+[.)]\s*/, "");

	if (!cleanedLine) {
		return null;
	}

	const patterns = [
		/^(.*?)\t+(.+)$/,
		/^(.*?):\s*(.+)$/,
		/^(.*?)\s+\|\s+(.+)$/,
		/^(.*?)\s*=\s*(.+)$/,
		/^(.*?)\s[-–]\s(.+)$/,
		/^(.*?)\s{2,}(.+)$/,
	];

	for (const pattern of patterns) {
		const match = cleanedLine.match(pattern);
		const key = match?.[1]?.trim();
		const value = match?.[2]?.trim();

		if (key && value) {
			return { key, value };
		}
	}

	return { key: "Details", value: cleanedLine };
}

function normalizeDetailedSpecs(rawSpecs: string) {
	const detailedSpecs = rawSpecs.trim();

	if (!detailedSpecs) {
		return "";
	}

	const normalizedText = detailedSpecs.replace(/\|/g, "\n");
	const specsArray = normalizedText
		.split(/\r?\n/)
		.map(parseSpecLine)
		.filter((spec): spec is { key: string; value: string } => Boolean(spec));

	if (!specsArray.length) {
		return detailedSpecs;
	}

	return JSON.stringify(specsArray);
}

function isLegacyTemplateRow(row: Record<string, string>) {
	const matchesCoreFields =
		(row.name || "").trim() === LEGACY_TEMPLATE_SAMPLE_ROW.name &&
		(row.description || "").trim() === LEGACY_TEMPLATE_SAMPLE_ROW.description &&
		(row.price || "").trim() === LEGACY_TEMPLATE_SAMPLE_ROW.price &&
		(row.original_price || "").trim() === LEGACY_TEMPLATE_SAMPLE_ROW.original_price &&
		(row.category || "").trim() === LEGACY_TEMPLATE_SAMPLE_ROW.category &&
		(row.condition || "").trim() === LEGACY_TEMPLATE_SAMPLE_ROW.condition &&
		(row.status || "").trim() === LEGACY_TEMPLATE_SAMPLE_ROW.status &&
		(row.stock || "").trim() === LEGACY_TEMPLATE_SAMPLE_ROW.stock &&
		(row.image_url || "").trim() === LEGACY_TEMPLATE_SAMPLE_ROW.image_url;

	if (!matchesCoreFields) {
		return false;
	}

	const additionalImages = (row.additional_images || "").trim();
	const detailedSpecs = (row.detailed_specs || "").trim();

	return (
		additionalImages === LEGACY_TEMPLATE_SAMPLE_ROW.additional_images ||
		(additionalImages === MALFORMED_LEGACY_ADDITIONAL_IMAGE &&
			detailedSpecs === MALFORMED_LEGACY_SHIFTED_DETAILS)
	);
}

function getCategorySlug(category: string) {
	const normalizedCategory = category.toLowerCase().replace(/\s+/g, "-");
	if (normalizedCategory === "phones") {
		return "smartphones";
	}

	return VALID_CATEGORIES.includes(normalizedCategory)
		? normalizedCategory
		: "consumer-electronics";
}

async function getExistingBucketImageMap() {
	const existingImages: Record<string, string> = {};
	const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

	if (!baseUrl) {
		return existingImages;
	}

	let offset = 0;
	const pageSize = 100;

	while (true) {
		const { data, error } = await supabase.storage.from("product-images").list("", {
			limit: pageSize,
			offset,
		});

		if (error || !data || data.length === 0) {
			break;
		}

		for (const item of data) {
			if (!item.name) continue;
			const baseName = item.name.replace(/\.[a-z0-9]+$/i, "");
			existingImages[baseName] =
				`${baseUrl}/storage/v1/object/public/product-images/${item.name}`;
		}

		if (data.length < pageSize) {
			break;
		}

		offset += pageSize;
	}

	return existingImages;
}

function validateProduct(
	row: Record<string, string>,
	rowIndex: number,
	imageMapping: Record<string, string> = {},
):
	| { valid: true; product: ParsedProduct; warnings: ParsedProductWarning[] }
	| { valid: false; error: string } {
	if (isLegacyTemplateRow(row)) {
		row = {
			...row,
			image_url: "",
			additional_images: "",
		};
	}

	const name = row.name?.trim();
	const description = row.description?.trim() || "";
	const priceStr = row.price?.trim();
	const originalPrice = row.original_price?.trim() || "";
	const category = row.category?.trim() || "consumer-electronics";
	const condition = row.condition?.trim() || "New";
	const status = row.status?.trim() || "available";
	const stockStr = row.stock?.trim() || "0";
	const warnings: ParsedProductWarning[] = [];

	let imageUrl = row.image_url?.trim() || "";
	// Helper to resolve an image name to a URL
	const resolveImageUrl = (imgName: string) => {
		if (!imgName) return "";
		if (
			imgName.startsWith("http://") ||
			imgName.startsWith("https://") ||
			imgName.startsWith("/")
		) {
			return imgName;
		}
		const baseName = imgName.replace(/\.[a-z0-9]+$/i, "");
		if (imageMapping[baseName]) {
			return imageMapping[baseName];
		}
		return "";
	};

	imageUrl = resolveImageUrl(imageUrl);
	if (row.image_url?.trim() && !imageUrl) {
		return {
			valid: false,
			error: `Row ${rowIndex}: The main image "${row.image_url.trim()}" could not be found. Upload that image in Step 1 or change the "image_url" value in your CSV.`,
		};
	}

	// Extract additional images from row 9, split by commas, and map them if available
	const rawAdditionalImages = row.additional_images?.trim() || "";
	let additionalImages: string[] = [];
	const missingAdditionalImages: string[] = [];
	if (rawAdditionalImages) {
		const parts = rawAdditionalImages
			.split(",")
			.map((img) => img.trim())
			.filter((img) => img.length > 0);
		for (const imgName of parts) {
			const resolvedUrl = resolveImageUrl(imgName);
			if (resolvedUrl) additionalImages.push(resolvedUrl);
			else missingAdditionalImages.push(imgName);
		}
	}

	if (missingAdditionalImages.length > 0) {
		return {
			valid: false,
			error: `Row ${rowIndex}: These additional images could not be found: ${missingAdditionalImages.join(", ")}. Upload them in Step 1 or remove them from "additional_images" in your CSV.`,
		};
	}

	let detailedSpecs = row.detailed_specs?.trim() || "";
	detailedSpecs = normalizeDetailedSpecs(detailedSpecs);

	if (!name) {
		return {
			valid: false,
			error: `Row ${rowIndex}: Product name is missing. Add a value in the "name" column.`,
		};
	}

	const price = parseFloat(priceStr || "0");
	if (isNaN(price) || price <= 0) {
		return {
			valid: false,
			error: `Row ${rowIndex}: Price "${priceStr}" is not valid. Enter a number greater than 0 in the "price" column.`,
		};
	}

	const stock = parseInt(stockStr, 10);
	if (stockStr && (isNaN(stock) || stock < 0)) {
		return {
			valid: false,
			error: `Row ${rowIndex}: Stock "${stockStr}" is not valid. Enter 0 or a positive whole number in the "stock" column.`,
		};
	}

	const normalizedCategory = getCategorySlug(category);
	if (category && normalizedCategory !== category.toLowerCase().replace(/\s+/g, "-")) {
		warnings.push({
			message: `Row ${rowIndex}: Category "${category}" was changed to "${normalizedCategory}" to match your shop filters.`,
		});
	}

	// Normalize status
	let normalizedStatus = status.toLowerCase().replace(/\s+/g, "-");
	if (!VALID_STATUSES.includes(normalizedStatus)) {
		warnings.push({
			message: `Row ${rowIndex}: Status "${status}" is not recognized, so it was changed to "available".`,
		});
		normalizedStatus = "available";
	}

	// Normalize condition
	let normalizedCondition = condition;
	const conditionLower = condition.toLowerCase();
	if (conditionLower === "new") normalizedCondition = "New";
	else if (conditionLower.includes("open")) normalizedCondition = "Open Box";
	else if (conditionLower.includes("renew")) normalizedCondition = "Renewed";
	else if (conditionLower === "used") normalizedCondition = "Used";
	else if (condition && !["new", "used"].includes(conditionLower)) {
		warnings.push({
			message: `Row ${rowIndex}: Condition "${condition}" was kept as entered. Make sure it is the label you want customers to see.`,
		});
	}

	return {
		valid: true,
		warnings,
		product: {
			name,
			description,
			price,
			original_price: originalPrice,
			category: normalizedCategory,
			condition: normalizedCondition,
			status: normalizedStatus,
			stock: isNaN(stock) ? 0 : stock,
			image_url: imageUrl,
			additional_images: additionalImages,
			detailed_specs: detailedSpecs,
		},
	};
}

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File | null;
		const rowsJson = formData.get("rows") as string | null;
		const imageMappingStr = formData.get("imageMapping") as string | null;

		let imageMapping: Record<string, string> = {};
		if (imageMappingStr) {
			try {
				imageMapping = JSON.parse(imageMappingStr);
			} catch (e) {
				console.warn("Failed to parse imageMapping JSON:", e);
			}
		}
		let normalizedRows: Record<string, string>[] = [];
		let rowNumberOffset = 1;

		if (rowsJson) {
			try {
				const parsedRows = JSON.parse(rowsJson) as BulkUploadRowInput[];
				normalizedRows = parsedRows
					.map((row) => ({
						name: String(row.name ?? "").trim(),
						description: String(row.description ?? "").trim(),
						price: String(row.price ?? "").trim(),
						original_price: String(row.original_price ?? "").trim(),
						category: String(row.category ?? "").trim(),
						condition: String(row.condition ?? "").trim(),
						status: String(row.status ?? "").trim(),
						stock: String(row.stock ?? "").trim(),
						image_url: String(row.image_url ?? "").trim(),
						additional_images: String(row.additional_images ?? "").trim(),
						detailed_specs: String(row.detailed_specs ?? "").trim(),
					}))
					.filter((row) => Object.values(row).some((value) => value.length > 0));
			} catch (error) {
				return NextResponse.json(
					{ error: `Rows payload could not be parsed: ${String(error)}` },
					{ status: 400 },
				);
			}

			if (normalizedRows.length === 0) {
				return NextResponse.json(
					{ error: "Add at least one product row before uploading." },
					{ status: 400 },
				);
			}
		} else {
			if (!file) {
				return NextResponse.json(
					{ error: "No file or rows were provided" },
					{ status: 400 },
				);
			}

			const fileName = file.name.toLowerCase();
			if (!fileName.endsWith(".csv")) {
				return NextResponse.json(
					{ error: "Only CSV files are supported" },
					{ status: 400 },
				);
			}

			const text = await file.text();
			const parsedCsv = Papa.parse<string[]>(text, {
				skipEmptyLines: true,
			});

			if (parsedCsv.errors.length > 0) {
				return NextResponse.json(
					{ error: `CSV parsing failed: ${parsedCsv.errors[0]?.message}` },
					{ status: 400 },
				);
			}

			const csvRows = parsedCsv.data
				.map((row) => row.map((value) => String(value ?? "").trim()))
				.filter((row) => row.some((value) => value.length > 0));

			if (csvRows.length < 2) {
				return NextResponse.json(
					{ error: "CSV file must have a header row and at least one data row" },
					{ status: 400 },
				);
			}

			const headerRow = csvRows[0] as string[];
			const normalizedHeaders = headerRow.map(normalizeHeader);
			const headerMap = normalizedHeaders.map(
				(header) => HEADER_ALIASES[header] || "skip",
			);

			const hasRequiredHeaders =
				headerMap.includes("name") && headerMap.includes("price");

			if (!hasRequiredHeaders) {
				return NextResponse.json(
					{
						error:
							'CSV must include "name" and "price" headers. Download the template and try again.',
					},
					{ status: 400 },
				);
			}

			rowNumberOffset = 2;
			normalizedRows = csvRows.slice(1).map((currentRow) =>
				currentRow.reduce(
					(acc, value, index) => {
						const field = headerMap[index];
						if (field && field !== "skip") {
							acc[field] = value;
						}
						return acc;
					},
					{} as Record<string, string>,
				),
			);
		}

		const existingBucketImageMap = await getExistingBucketImageMap();
		const resolvedImageMapping = { ...existingBucketImageMap, ...imageMapping };

		// Validate and parse data rows
		const results = {
			total: normalizedRows.length,
			successful: 0,
			failed: 0,
			errors: [] as string[],
			warnings: [] as string[],
		};

		// Process in batches of 50 to avoid overwhelming Supabase
		const BATCH_SIZE = 50;
		const dataRows = normalizedRows;

		for (
			let batchStart = 0;
			batchStart < dataRows.length;
			batchStart += BATCH_SIZE
		) {
			const batch = dataRows.slice(batchStart, batchStart + BATCH_SIZE);
			const validProducts: ParsedProduct[] = [];

			for (let i = 0; i < batch.length; i++) {
				const rowIndex = batchStart + i + rowNumberOffset;
				const currentRow = batch[i];
				if (!currentRow) {
					continue;
				}
				const result = validateProduct(currentRow, rowIndex, resolvedImageMapping);

				if (result.valid) {
					results.warnings.push(...result.warnings.map((warning) => warning.message));
					validProducts.push(result.product);
				} else {
					results.failed++;
					results.errors.push(result.error);
				}
			}

			if (validProducts.length > 0) {
				// Insert products individually to retrieve their generated IDs for linking additional images
				for (const product of validProducts) {
					const { data: insertedProduct, error: singleError } = await supabase
						.from("products")
						.insert({
							name: product.name,
							description: product.description,
							price: product.price,
							original_price: product.original_price,
							category: product.category,
							condition: product.condition,
							status: product.status,
							stock: product.stock,
							image_url: product.image_url || null,
							detailed_specs: product.detailed_specs,
							created_at: new Date().toISOString(),
						})
						.select("id")
						.single();

					if (singleError) {
						results.failed++;
						results.errors.push(
							`Failed to insert "${product.name}": ${singleError.message}`,
						);
						continue;
					}

					// Insert additional images if they exist
					if (
						product.additional_images &&
						product.additional_images.length > 0
					) {
						const additionalImagesData = product.additional_images.map(
							(url, idx) => ({
								product_id: insertedProduct.id,
								image_url: url,
								display_order: idx + 1,
							}),
						);

						const { error: imagesError } = await supabase
							.from("product_images")
							.insert(additionalImagesData);

						if (imagesError) {
							results.errors.push(
								`Failed to link additional images for "${product.name}": ${imagesError.message}`,
							);
							// We still count the product as successful since the main record was created,
							// but we log the image error.
						}
					}

					results.successful++;
				}
			}
		}

		return NextResponse.json({
			message: `Bulk upload complete: ${results.successful} products added, ${results.failed} failed`,
			...results,
		});
	} catch (error: any) {
		console.error("Bulk upload error:", error);
		return NextResponse.json(
			{ error: `Upload failed: ${error.message}` },
			{ status: 500 },
		);
	}
}
