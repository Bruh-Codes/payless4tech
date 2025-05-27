"use client";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarHeader,
} from "@/components/ui/sidebar";
import { LayoutDashboard, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DashboardSidebar = () => {
	const pathname = usePathname();

	const isActive = (path: string) => {
		return pathname === path;
	};

	return (
		<Sidebar>
			<SidebarHeader className="flex items-center px-6 py-4">
				<div className="flex items-center space-x-2">
					<h1 className="text-2xl font-bold text-sidebar-foreground">
						Payless<span className="text-orange-500">4Tech</span>
					</h1>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={isActive("/admin")}
									className="text-lg"
								>
									<Link href="/admin">
										<LayoutDashboard className="size-6" />
										<span>Dashboard</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>

							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									className="text-lg"
									isActive={isActive("/products")}
								>
									<Link href="/admin/products">
										<ShoppingBag className="size-6" />
										<span>Products</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>

							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									className="text-lg"
									isActive={isActive("/customers")}
								>
									<Link href="/admin/customers">
										<Users className="size-6" />
										<span>Customers</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
};

export default DashboardSidebar;
