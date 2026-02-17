export interface Product {
	id: string;
	title: string;
	price: number;
	originalPrice?: number;
	image: string;
	category: string;
	condition: string;
	rating: number;
	reviews: number;
	shipping: string;
	seller: string;
	isPreorder?: boolean;
}

export const categories = [
	{
		name: "Smartphones",
		slug: "smartphones",
		image:
			"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
		children: [
			{ name: "iPhone", slug: "iphone" },
			{ name: "Samsung Galaxy", slug: "samsung-galaxy" },
			{ name: "Google Pixel", slug: "google-pixel" },
			{ name: "OnePlus", slug: "oneplus" },
		],
	},
	{
		name: "Laptops",
		slug: "laptops",
		image:
			"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
		children: [
			{ name: "Gaming Laptops", slug: "gaming-laptops" },
			{ name: "Ultrabooks", slug: "ultrabooks" },
			{ name: "Business Laptops", slug: "business-laptops" },
			{ name: "Student Laptops", slug: "student-laptops" },
		],
	},
	{
		name: "Tablets",
		slug: "tablets",
		image:
			"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80",
		children: [
			{ name: "iPad", slug: "ipad" },
			{ name: "Android Tablets", slug: "android-tablets" },
			{ name: "Windows Tablets", slug: "windows-tablets" },
		],
	},
	{
		name: "Audio",
		slug: "audio",
		image:
			"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
		children: [
			{ name: "Headphones", slug: "headphones" },
			{ name: "Earbuds", slug: "earbuds" },
			{ name: "Speakers", slug: "speakers" },
			{ name: "Audio Accessories", slug: "audio-accessories" },
		],
	},
	{
		name: "Gaming",
		slug: "gaming",
		image:
			"https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&q=80",
		children: [
			{ name: "Gaming Consoles", slug: "gaming-consoles" },
			{ name: "Gaming Accessories", slug: "gaming-accessories" },
			{ name: "PC Gaming", slug: "pc-gaming" },
		],
	},
	{
		name: "Accessories",
		slug: "accessories",
		image:
			"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
		children: [
			{ name: "Cases & Covers", slug: "cases-covers" },
			{ name: "Chargers & Cables", slug: "chargers-cables" },
			{ name: "Smart Watches", slug: "smart-watches" },
			{ name: "Other Accessories", slug: "other-accessories" },
		],
	},
];

export const featuredProducts: Product[] = [
	{
		id: "1",
		title: "iPhone 14 Pro Max 256GB - Deep Purple",
		price: 849.99,
		originalPrice: 1099.99,
		image:
			"https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&q=80",
		category: "smartphones",
		condition: "Refurbished",
		rating: 4.8,
		reviews: 342,
		shipping: "Free Shipping",
		seller: "TechDeals Pro",
		isPreorder: false,
	},
	{
		id: "2",
		title: "MacBook Air M2 13-inch 512GB",
		price: 999.99,
		originalPrice: 1299.99,
		image:
			"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
		category: "laptops",
		condition: "Like New",
		rating: 4.9,
		reviews: 567,
		shipping: "Free Shipping",
		seller: "Apple Reseller",
		isPreorder: true,
	},
	{
		id: "3",
		title: "Sony WH-1000XM5 Wireless Headphones",
		price: 278.0,
		originalPrice: 399.99,
		image:
			"https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80",
		category: "audio",
		condition: "New",
		rating: 4.7,
		reviews: 891,
		shipping: "Free Shipping",
		seller: "AudioWorld",
		isPreorder: false,
	},
	{
		id: "4",
		title: "iPad Pro 12.9-inch M2 WiFi 256GB",
		price: 899.99,
		originalPrice: 1099.99,
		image:
			"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80",
		category: "tablets",
		condition: "Refurbished",
		rating: 4.8,
		reviews: 234,
		shipping: "Free Shipping",
		seller: "TabletKing",
		isPreorder: true,
	},
	{
		id: "5",
		title: "PlayStation 5 Digital Edition Console",
		price: 399.99,
		originalPrice: 449.99,
		image:
			"https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&q=80",
		category: "gaming",
		condition: "New",
		rating: 4.9,
		reviews: 1203,
		shipping: "Free Shipping",
		seller: "GameStation",
		isPreorder: false,
	},
	{
		id: "6",
		title: "Samsung Galaxy S24 Ultra 512GB",
		price: 1049.99,
		originalPrice: 1419.99,
		image:
			"https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80",
		category: "smartphones",
		condition: "Like New",
		rating: 4.7,
		reviews: 456,
		shipping: "Free Shipping",
		seller: "MobileMart",
		isPreorder: false,
	},
	{
		id: "7",
		title: "Apple Watch Ultra 2 49mm Titanium",
		price: 699.99,
		originalPrice: 799.99,
		image:
			"https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&q=80",
		category: "accessories",
		condition: "New",
		rating: 4.8,
		reviews: 178,
		shipping: "Free Shipping",
		seller: "WatchHub",
		isPreorder: true,
	},
	{
		id: "8",
		title: "Dell XPS 15 Intel i9 32GB RTX 4060",
		price: 1599.99,
		originalPrice: 2199.99,
		image:
			"https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80",
		category: "laptops",
		condition: "Refurbished",
		rating: 4.6,
		reviews: 312,
		shipping: "Free Shipping",
		seller: "LaptopWorld",
		isPreorder: false,
	},
];

export function searchProducts(query: string): Product[] {
	const q = query.toLowerCase();
	return featuredProducts.filter(
		(p) =>
			p.title.toLowerCase().includes(q) ||
			p.category.toLowerCase().includes(q) ||
			p.seller.toLowerCase().includes(q),
	);
}
