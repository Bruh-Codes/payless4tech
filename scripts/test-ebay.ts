import { searchEbayProducts } from "../lib/ebay-server";

async function main() {
	const query = "Apple iPhone 8 Plus 64GB Unlocked - Excellent";
	console.log(`Searching for: ${query}`);
	try {
		const results = await searchEbayProducts(query);
		console.log(`Found ${results.items.length} items`);
	} catch (error) {
		console.error("Error:", error);
	}
}

main();
