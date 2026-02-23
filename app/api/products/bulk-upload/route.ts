import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

// Expected CSV columns
const VALID_CATEGORIES = [
	"consumer-electronics",
	"laptops",
	"phones",
	"tablets",
	"audio",
	"gaming",
	"accessories",
	"smartphones",
];

const VALID_STATUSES = ["available", "unavailable", "new", "low-stock"];

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

function parseCSVLine(line: string): string[] {
	const result: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
				current += '"';
				i++; // skip escaped quote
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === "," && !inQuotes) {
			result.push(current.trim());
			current = "";
		} else {
			current += char;
		}
	}
	result.push(current.trim());
	return result;
}

function validateProduct(
	row: string[],
	rowIndex: number,
	imageMapping: Record<string, string> = {},
): { valid: true; product: ParsedProduct } | { valid: false; error: string } {
	if (row.length < 3) {
		return {
			valid: false,
			error: `Row ${rowIndex}: Too few columns (${row.length})`,
		};
	}

	const name = row[0]?.trim();
	const description = row[1]?.trim() || "";
	const priceStr = row[2]?.trim();
	const originalPrice = row[3]?.trim() || "";
	const category = row[4]?.trim() || "consumer-electronics";
	const condition = row[5]?.trim() || "New";
	const status = row[6]?.trim() || "available";
	const stockStr = row[7]?.trim() || "0";

	let imageUrl = (row[8] || "")?.trim() || "";
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
		// Fallback: Assume it's in the Supabase bucket with the same name
		const baseUrl =
			process.env.NEXT_PUBLIC_SUPABASE_URL ||
			"https://ntudizdvtyhhrxpafuyj.supabase.co";
		return `${baseUrl}/storage/v1/object/public/product-images/${baseName}`;
	};

	imageUrl = resolveImageUrl(imageUrl);

	// Extract additional images from row 9, split by commas, and map them if available
	const rawAdditionalImages = (row[9] || "")?.trim();
	let additionalImages: string[] = [];
	if (rawAdditionalImages) {
		const parts = rawAdditionalImages
			.split(",")
			.map((img) => img.trim())
			.filter((img) => img.length > 0);
		for (const imgName of parts) {
			const resolvedUrl = resolveImageUrl(imgName);
			if (resolvedUrl) additionalImages.push(resolvedUrl);
		}
	}

	let detailedSpecs = (row[10] || "")?.trim() || "";

	// Parse 'Key:Value|Key:Value' into a JSON string
	if (detailedSpecs && detailedSpecs.includes(":")) {
		try {
			const specsArray = detailedSpecs.split("|").map((pair) => {
				const [key, ...valueParts] = pair.split(":");
				return {
					key: key?.trim() || "Details",
					value: valueParts.join(":").trim(),
				};
			});
			detailedSpecs = JSON.stringify(specsArray);
		} catch (error) {
			console.warn("Could not parse detailed_specs, storing as string.", error);
		}
	}

	if (!name) {
		return { valid: false, error: `Row ${rowIndex}: Product name is required` };
	}

	const price = parseFloat(priceStr || "0");
	if (isNaN(price) || price <= 0) {
		return {
			valid: false,
			error: `Row ${rowIndex}: Invalid price "${priceStr}"`,
		};
	}

	const stock = parseInt(stockStr, 10);

	// Normalize category - allow flexible input
	let normalizedCategory = category.toLowerCase().replace(/\s+/g, "-");
	if (!VALID_CATEGORIES.includes(normalizedCategory)) {
		normalizedCategory = "consumer-electronics"; // default fallback
	}

	// Normalize status
	let normalizedStatus = status.toLowerCase().replace(/\s+/g, "-");
	if (!VALID_STATUSES.includes(normalizedStatus)) {
		normalizedStatus = "available";
	}

	// Normalize condition
	let normalizedCondition = condition;
	const conditionLower = condition.toLowerCase();
	if (conditionLower === "new") normalizedCondition = "New";
	else if (conditionLower.includes("open")) normalizedCondition = "Open Box";
	else if (conditionLower.includes("renew")) normalizedCondition = "Renewed";
	else if (conditionLower === "used") normalizedCondition = "Used";

	return {
		valid: true,
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
		const imageMappingStr = formData.get("imageMapping") as string | null;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		let imageMapping: Record<string, string> = {};
		if (imageMappingStr) {
			try {
				imageMapping = JSON.parse(imageMappingStr);
			} catch (e) {
				console.warn("Failed to parse imageMapping JSON:", e);
			}
		}

		// Validate file type
		const fileName = file.name.toLowerCase();
		if (!fileName.endsWith(".csv")) {
			return NextResponse.json(
				{ error: "Only CSV files are supported" },
				{ status: 400 },
			);
		}

		// Read and parse CSV
		const text = await file.text();
		const lines = text
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter((line) => line.length > 0);

		if (lines.length < 2) {
			return NextResponse.json(
				{ error: "CSV file must have a header row and at least one data row" },
				{ status: 400 },
			);
		}

		// Parse header (skip it - we use positional matching)
		parseCSVLine(lines[0] as string);

		// Validate and parse data rows
		const results = {
			total: lines.length - 1,
			successful: 0,
			failed: 0,
			errors: [] as string[],
		};

		// Process in batches of 50 to avoid overwhelming Supabase
		const BATCH_SIZE = 50;
		const rows = lines.slice(1);

		for (
			let batchStart = 0;
			batchStart < rows.length;
			batchStart += BATCH_SIZE
		) {
			const batch = rows.slice(batchStart, batchStart + BATCH_SIZE);
			const validProducts: ParsedProduct[] = [];

			for (let i = 0; i < batch.length; i++) {
				const rowIndex = batchStart + i + 2; // 1-indexed, skip header
				const parsedRow = parseCSVLine(batch[i] as string);
				const result = validateProduct(parsedRow, rowIndex, imageMapping);

				if (result.valid) {
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
