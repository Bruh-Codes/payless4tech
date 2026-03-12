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

	const normalizePath = (path: string) => {
		if (!path) return "/";
		if (path.length > 1 && path.endsWith("/")) {
			return path.slice(0, -1);
		}
		return path;
	};

	const isActive = (url: string) => {
		const normalizedCurrent = normalizePath(currentPath);
		const normalizedUrl = normalizePath(url);

		// Keep dashboard exact; parent routes should stay active for nested detail pages.
		if (normalizedUrl === "/admin") {
			return normalizedCurrent === "/admin";
		}

		return (
			normalizedCurrent === normalizedUrl ||
			normalizedCurrent.startsWith(`${normalizedUrl}/`)
		);
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
									{item.icon && <item.icon className="size-5!  stroke-[2.4]" />}
									<span className="text-[15px] ">{item.title}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</Link>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
