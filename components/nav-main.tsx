"use client";

import { type Icon } from "@tabler/icons-react";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: Icon;
	}[];
}) {
	const currentPath = usePathname();
	const isActive = (url: string) => {
		const getLastSegment = (path: string) => {
			const segments = path.split("/").filter(Boolean);
			return segments.length > 0 ? `/${segments[segments.length - 1]}` : "/";
		};
		return getLastSegment(currentPath) === getLastSegment(url);
	};
	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					{items.map((item) => (
						<Link key={item.title} href={item.url}>
							<SidebarMenuItem>
								<SidebarMenuButton
									tooltip={item.title}
									isActive={isActive(item.url)}
								>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</Link>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
