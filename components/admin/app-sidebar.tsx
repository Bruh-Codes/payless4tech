"use client";

import * as React from "react";
import {
	IconCamera,
	IconClipboardList,
	IconDashboard,
	IconDatabase,
	IconFileAi,
	IconFileDescription,
	IconFileWord,
	IconFolder,
	IconInnerShadowTop,
	IconListDetails,
	IconReport,
	IconSettings,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
// import { NavSecondary } from "@/components/admin/nav-secondary";
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
import { authClient } from "@/lib/auth-client";

const data = {
	navMain: [
		{
			title: "Dashboard",
			url: "/admin",
			icon: IconDashboard,
		},
		{
			title: "Inventory",
			url: "/admin/products",
			icon: IconListDetails,
		},
		{
			title: "Preorders",
			url: "/admin/preorders",
			icon: IconClipboardList,
		},
		{
			title: "Archives",
			url: "/admin/archive",
			icon: IconFolder,
		},
	],
	navClouds: [
		{
			title: "Capture",
			icon: IconCamera,
			isActive: true,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Proposal",
			icon: IconFileDescription,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Prompts",
			icon: IconFileAi,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "#",
			icon: IconSettings,
		},
	],
	documents: [
		{
			name: "Data Library",
			url: "#",
			icon: IconDatabase,
		},
		{
			name: "Reports",
			url: "#",
			icon: IconReport,
		},
		{
			name: "Word Assistant",
			url: "#",
			icon: IconFileWord,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = authClient.useSession();
	const user = session?.user;
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="[slot=sidebar-menu-button]:p-1.5!"
						>
							<a href="/">
								<IconInnerShadowTop className="size-5!" />
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
				{/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
			</SidebarContent>
			<SidebarFooter>
				<NavUser
					user={{
						name: user?.name || "",
						email: user?.email || "",
						avatar: user?.image || "",
					}}
				/>
			</SidebarFooter>
		</Sidebar>
	);
}
