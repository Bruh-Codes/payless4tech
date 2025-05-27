"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductStatusChart from "./ProductStatusChart";
import RecentProductsList from "./RecentProductsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Analytics = () => {
	return (
		<Tabs defaultValue="overview" className="space-y-4">
			<TabsList>
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="recent">Recent Products</TabsTrigger>
			</TabsList>
			<TabsContent value="overview">
				<Card>
					<CardHeader>
						<CardTitle>Product Status Overview</CardTitle>
					</CardHeader>
					<CardContent className="pl-2">
						<ProductStatusChart />
					</CardContent>
				</Card>
			</TabsContent>
			<TabsContent value="recent">
				<Card>
					<CardContent>
						<RecentProductsList />
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
};

export default Analytics;
