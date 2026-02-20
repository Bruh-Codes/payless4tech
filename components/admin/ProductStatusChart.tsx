"use client";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
} from "recharts";

const data = [
	{
		name: "Electronics",
		available: 45,
		unavailable: 5,
		new: 12,
		lowStock: 8,
	},
	{
		name: "Laptops",
		available: 30,
		unavailable: 3,
		new: 8,
		lowStock: 4,
	},
	{
		name: "Phones",
		available: 35,
		unavailable: 2,
		new: 15,
		lowStock: 6,
	},
];

const ProductStatusChart = () => {
	return (
		<div className="h-[300px] w-full">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={data}
					margin={{
						top: 20,
						right: 30,
						left: 20,
						bottom: 5,
					}}
				>
					<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip
						contentStyle={{
							borderRadius: "8px",
							border: "1px solid #e5e5e5",
							boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
						}}
					/>
					<Bar
						dataKey="available"
						name="Available"
						fill="#05CD99"
						radius={[4, 4, 0, 0]}
					/>
					<Bar
						dataKey="unavailable"
						name="Unavailable"
						fill="#EE5D50"
						radius={[4, 4, 0, 0]}
					/>
					<Bar dataKey="new" name="New" fill="#2424be" radius={[4, 4, 0, 0]} />
					<Bar
						dataKey="lowStock"
						name="Low Stock"
						fill="#FFCE20"
						radius={[4, 4, 0, 0]}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

export default ProductStatusChart;
