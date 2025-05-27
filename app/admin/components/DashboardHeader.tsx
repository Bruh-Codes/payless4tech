import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardHeader = () => {
	return (
		<header className="bg-card sticky top-0 z-10 border-b h-16 flex items-center px-4 md:px-6">
			<div className="flex-1 flex items-center justify-between">
				<SidebarTrigger className="cursor-pointer" />
				<div className="flex items-center space-x-4">
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="relative cursor-pointer h-10 w-10 rounded-full"
							>
								<Avatar className="h-10 w-10">
									<AvatarImage src="" alt="Admin" />
									<AvatarFallback>AD</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-56 cursor-pointer"
							align="end"
							forceMount
						>
							<DropdownMenuItem>Log out</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
};

export default DashboardHeader;
