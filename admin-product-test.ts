import { createClient } from "@supabase/supabase-js";

// Ensure you run this with bun:
// bun --env-file=.env.local run admin-product-test.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
	"";

if (!supabaseUrl || !supabaseKey) {
	console.error("Missing Supabase URL or Key in environment variables");
	process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
	console.warn(
		"WARNING: You are using the publishable key. If RLS is enabled on these tables, inserts will likely fail with 'permission denied'.",
	);
	console.warn(
		"Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file if this happens.\n",
	);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEMO_PRODUCTS = [
	{
		name: "MacBook Pro 14-inch M3 Pro",
		description: "Apple MacBook Pro with M3 Pro chip, 18GB RAM, 512GB SSD",
		price: 28500,
		original_price: "32000",
		category: "laptops",
		image_url:
			"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000",
		status: "available",
		stock: 12,
		condition: "New",
		detailed_specs:
			"M3 Pro chip, 14.2-inch Liquid Retina XDR display, 18GB memory, 512GB SSD",
	},
	{
		name: "iPhone 15 Pro Max 256GB Titanium",
		description: "The latest iPhone with A17 Pro chip and titanium design",
		price: 18500,
		original_price: "19500",
		category: "phones",
		image_url:
			"https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1000",
		status: "available",
		stock: 25,
		condition: "New",
		detailed_specs:
			"A17 Pro chip, 6.7-inch Super Retina XDR display, Pro camera system, 256GB storage",
	},
	{
		name: "Sony WH-1000XM5 Wireless Headphones",
		description: "Industry leading noise canceling headphones",
		price: 4500,
		original_price: "5000",
		category: "audio",
		image_url:
			"https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1000",
		status: "new",
		stock: 50,
		condition: "New",
		detailed_specs:
			"Active Noise Canceling, 30-hour battery life, multipoint connection",
	},
	{
		name: "Samsung Galaxy S24 Ultra 512GB",
		description: "Samsung's flagship smartphone with Galaxy AI",
		price: 17800,
		original_price: "18900",
		category: "phones",
		image_url:
			"https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=1000",
		status: "unavailable",
		stock: 0,
		condition: "New",
		detailed_specs:
			"Snapdragon 8 Gen 3, 6.8-inch Dynamic AMOLED 2X, 200MP camera, 512GB storage",
	},
];

const DEMO_SALES = [
	{
		name: "John Doe",
		email: "john.doe@example.com",
		phone_number: "0241234567",
		status: "paid",
		fulfillment_status: "delivered",
		total_amount: 28500,
		delivery_address: "123 Independence Ave, Accra",
		id: "223e4567-e89b-12d3-a456-426614174001",
		product: [
			{ name: "MacBook Pro 14-inch M3 Pro", price: 28500, quantity: 1 },
		],
	},
	{
		name: "Jane Smith",
		email: "jane.smith@example.com",
		phone_number: "0509876543",
		status: "paid",
		fulfillment_status: "delivered",
		total_amount: 18500,
		delivery_address: "45 Liberation Rd, Kumasi",
		id: "223e4567-e89b-12d3-a456-426614174002",
		created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
		product: [
			{ name: "iPhone 15 Pro Max 256GB Titanium", price: 18500, quantity: 1 },
		],
	},
	{
		name: "Kwame Asare",
		email: "kwame.asare@test.com",
		phone_number: "0245556666",
		status: "paid",
		fulfillment_status: "delivered",
		total_amount: 5500,
		delivery_address: "10 Ring Road, Accra",
		id: "323e4567-e89b-12d3-a456-426614174003",
		created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
		product: [{ name: "AirPods Pro (2nd Gen)", price: 5500, quantity: 1 }],
	},
];

const DEMO_PREORDERS = [
	{
		full_name: "Kwame Mensah",
		email: "kwame.mensah@example.com",
		phone_number: 271112233, // bigint in db
		item_type: "laptop",
		specifications: {
			brand: "Dell",
			model: "XPS 15",
			ram: "32GB",
			storage: "1TB SSD",
		},
		fulfillment_status: "pending",
		id: "123e4567-e89b-12d3-a456-426614175001",
	},
	{
		full_name: "Ama Osei",
		email: "ama.osei@example.com",
		phone_number: 543334455, // bigint in db
		item_type: "phone",
		specifications: {
			brand: "Google",
			model: "Pixel 8 Pro",
			color: "Bay Blue",
			storage: "256GB",
		},
		fulfillment_status: "pending",
		id: "123e4567-e89b-12d3-a456-426614175002",
	},
];

const DEMO_ARCHIVED_SALES = [
	{
		name: "Michael Johnson",
		email: "michael.j@example.com",
		phone_number: "0249998888",
		status: "paid",
		fulfillment_status: "delivered",
		total_amount: 8500,
		delivery_address: "Spintex Road, Accra",
		id: "123e4567-e89b-12d3-a456-426614174003",
		product: [
			{ name: "Sony WH-1000XM5 Wireless Headphones", price: 8500, quantity: 1 },
		],
	},
];

async function seedDatabase() {
	console.log("Starting database seeding...");

	// 1. Seed Products
	console.log("Seeding products...");
	for (const product of DEMO_PRODUCTS) {
		const { error } = await supabase.from("products").insert([product]);
		if (error && error.code !== "23505")
			console.error("Error inserting product:", product.name, error.message);
	}

	// 2. Seed Sales
	console.log("Seeding sales...");
	for (const sale of DEMO_SALES) {
		const { error } = await supabase.from("sales").insert([sale]);
		if (error && error.code !== "23505")
			console.error("Error inserting sale:", sale.id, error.message);
	}

	// 3. Seed Preorders
	console.log("Seeding preorders...");
	for (const preorder of DEMO_PREORDERS) {
		const { error } = await supabase.from("preorders").insert([preorder]);
		if (error && error.code !== "23505")
			console.error("Error inserting preorder:", preorder.id, error.message);
	}

	// 4. Seed Archived Sales
	console.log("Seeding archived sales...");
	for (const archived_sale of DEMO_ARCHIVED_SALES) {
		const { error } = await supabase
			.from("archived_sales")
			.insert([archived_sale]);
		if (error && error.code !== "23505")
			console.error(
				"Error inserting archived sale:",
				archived_sale.id,
				error.message,
			);
	}

	console.log("Database seeding completed!");
}

seedDatabase().catch(console.error);
