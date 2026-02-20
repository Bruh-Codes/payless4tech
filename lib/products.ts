export interface Product {
	id: string;
	title: string;
	price: number;
	originalPrice?: number;
	currency?: string; // Add currency field
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
