import { DataTable } from "./data-table";
import { Columns } from "./Columns";

export type product = {
	id: number;
	name: string;
	category: string;
	price: number;
	date: string;
	status: string;
};

const recentProducts: product[] = [
	{
		id: 1,
		name: "Apple MacBook Pro M2",
		category: "laptops",
		price: 1299.99,
		date: "2023-05-05",
		status: "new",
	},
	{
		id: 2,
		name: "Samsung Galaxy S22",
		category: "phones",
		price: 899.99,
		date: "2023-05-04",
		status: "available",
	},
	{
		id: 3,
		name: "Sony WH-1000XM5 Headphones",
		category: "electronics",
		price: 349.99,
		date: "2023-05-03",
		status: "available",
	},
	{
		id: 4,
		name: "Dell XPS 15",
		category: "laptops",
		price: 1499.99,
		date: "2023-05-02",
		status: "new",
	},
	{
		id: 5,
		name: "Google Pixel 7",
		category: "phones",
		price: 599.99,
		date: "2023-05-01",
		status: "low-stock",
	},
];

const RecentProductsList = () => {
	return (
		<div className="container mx-auto">
			<DataTable showSearch={false} columns={Columns} data={recentProducts} />
		</div>
	);
};

export default RecentProductsList;
