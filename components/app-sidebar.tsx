"use client";

import * as React from "react";
import {
	IconDashboard,
	IconFolder,
	IconInnerShadowTop,
	IconListDetails,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
	
	navMain: [
		{
			title: "Dashboard",
			url: "/admin",
			icon: IconDashboard,
		},
		{
			title: "Products",
			url: "/admin/products",
			icon: IconListDetails,
		},

		{
			title: "Archive",
			url: "/admin/archive",
			icon: IconFolder,
		},
	],
};



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="/">
								<IconInnerShadowTop className="!size-5" />
								<div className="flex items-center space-x-2">
									<h1 className="text-2xl font-bold text-sidebar-foreground">
										Payless<span className="text-orange-500">4Tech</span>
									</h1>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
