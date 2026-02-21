import { createClient } from "@supabase/supabase-js";

// Ensure you run this with bun:
// bun --env-file=.env.local run admin-product-remove.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
	"";

if (!supabaseUrl || !supabaseKey) {
	console.error("Missing Supabase URL or Key in environment variables");
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEMO_PRODUCT_NAMES = [
	"MacBook Pro 14-inch M3 Pro",
	"iPhone 15 Pro Max 256GB Titanium",
	"Sony WH-1000XM5 Wireless Headphones",
	"Samsung Galaxy S24 Ultra 512GB",
];

const DEMO_SALE_IDS = [
	"123e4567-e89b-12d3-a456-426614174001",
	"123e4567-e89b-12d3-a456-426614174002",
];

const DEMO_PREORDER_IDS = ["5001", "5002"];

const DEMO_ARCHIVED_SALE_IDS = ["123e4567-e89b-12d3-a456-426614174003"];

async function removeDemoData() {
	console.log("Starting demo data removal...");

	// 1. Remove Products
	console.log("Removing demo products...");
	const { error: pError } = await supabase
		.from("products")
		.delete()
		.in("name", DEMO_PRODUCT_NAMES);
	if (pError) console.error("Error removing products:", pError.message);

	// 2. Remove Sales
	console.log("Removing demo sales...");
	const { error: sError } = await supabase
		.from("sales")
		.delete()
		.in("id", DEMO_SALE_IDS);
	if (sError) console.error("Error removing sales:", sError.message);

	// 3. Remove Preorders
	console.log("Removing demo preorders...");
	const { error: prError } = await supabase
		.from("preorders")
		.delete()
		.in("id", DEMO_PREORDER_IDS);
	if (prError) console.error("Error removing preorders:", prError.message);

	// 4. Remove Archived Sales
	console.log("Removing demo archived sales...");
	const { error: aError } = await supabase
		.from("archived_sales")
		.delete()
		.in("id", DEMO_ARCHIVED_SALE_IDS);
	if (aError) console.error("Error removing archived sales:", aError.message);

	console.log("Demo data removal completed!");
}

removeDemoData().catch(console.error);
