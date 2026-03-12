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
	IconListDetails,
	IconReport,
	IconSettings,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
// import { NavSecondary } from "@/components/admin/nav-secondary";
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
import Image from "next/image";
import logo from "@/public/images/logo/payless-logo.png";
import { NavUser } from "../nav-user";

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
			title: "Orders",
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
							className="[slot=sidebar-menu-button]:p-1.5! hover:bg-transparent active:bg-transparent"
						>
							<a href="/" className="flex items-center gap-3 w-full">
								<Image
									src={logo}
									alt="Payless4Tech"
									className="h-16 w-auto object-contain drop-shadow-sm dark:brightness-110"
									priority
								/>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				{/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
			</SidebarContent>
			<SidebarFooter className="border-t border-border/40 p-3 space-y-4">
				<NavUser
					showTheme={true}
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
