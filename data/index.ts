export type customerType = {
	id: number;
	name: string;
	email: string;
	phone: string;
	spent: number;
	orders: number;
	lastOrder: string;
};
// Sample customer data
export const customersData: customerType[] = [
	{
		id: 1,
		name: "John Doe",
		email: "john.doe@example.com",
		phone: "+1 123-456-7890",
		spent: 1245.89,
		orders: 12,
		lastOrder: "2023-05-01",
	},
	{
		id: 2,
		name: "Jane Smith",
		email: "jane.smith@example.com",
		phone: "+1 234-567-8901",
		spent: 3456.78,
		orders: 24,
		lastOrder: "2023-05-12",
	},
	{
		id: 3,
		name: "Robert Johnson",
		email: "robert.j@example.com",
		phone: "+1 345-678-9012",
		spent: 789.12,
		orders: 5,
		lastOrder: "2023-02-25",
	},
	{
		id: 4,
		name: "Emily Davis",
		email: "emily.d@example.com",
		phone: "+1 456-789-0123",
		spent: 2567.34,
		orders: 18,
		lastOrder: "2023-05-15",
	},
	{
		id: 5,
		name: "Michael Wilson",
		email: "michael.w@example.com",
		phone: "+1 567-890-1234",
		spent: 1789.45,
		orders: 15,
		lastOrder: "2023-04-28",
	},
];
