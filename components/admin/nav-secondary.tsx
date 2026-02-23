"use client";

import * as React from "react";
import { IconLock, type Icon } from "@tabler/icons-react";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function NavSecondary({
	items,
	...props
}: {
	items: {
		title: string;
		url: string;
		icon: Icon;
		locked?: boolean;
	}[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	const pathname = usePathname();
	const { setOpenMobile } = useSidebar();

	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) =>
						item.locked ? (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									disabled
									tooltip={item.title}
									className={cn(
										"text-slate-600 dark:text-slate-300 flex items-center gap-2 text-sm w-full overflow-x-clip py-2 rounded-lg cursor-pointer transition-colors",
									)}
								>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
									<IconLock />
								</SidebarMenuButton>
							</SidebarMenuItem>
						) : (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									onClick={() => {
										setOpenMobile(false);
									}}
									tooltip={item.title}
									className={cn({
										"bg-primary active:bg-primary active:text-white active:dark:bg-lime-600/20 hover:bg-black hover:text-white text-white  dark:bg-lime-600/20 dark:text-lime-400":
											item.url === "/"
												? pathname === "/"
												: pathname.startsWith(item.url),
									})}
								>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						),
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
