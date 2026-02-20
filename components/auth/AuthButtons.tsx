"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";

export const AuthButtons = ({ className }: { className?: ClassValue }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const router = useRouter();

	const { data: session } = authClient.useSession();

	const handleLogout = async () => {
		try {
			setIsLoading(true);
			const { error } = await authClient.signOut();
			if (error) throw error;

			toast("Logged out successfully", {
				description: "You have been logged out of your account",
			});
			router.push("/");
		} catch (error) {
			// console.error("Error logging out:", error);

			toast.error("Error logging out", {
				description: "There was a problem logging out. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const { data: isAdmin, isPending } = useQuery({
		queryKey: ["user-permissions", session?.user?.id],
		queryFn: async () =>
			await authClient.admin.hasPermission({
				permissions: {
					user: ["create", "delete", "update"],
				},
			}),
		enabled: !!session?.user?.id,
	});

	return (
		<>
			{session ? (
				<>
					<div className={cn("flex items-center gap-2", className)}>
						{isPending ? (
							<Skeleton className="h-9 w-24" />
						) : isAdmin?.data?.success ? (
							<Link
								href="/admin"
								className="m-0"
								aria-label="Access admin dashboard"
							>
								<Button size="sm">Dashboard</Button>
							</Link>
						) : null}
					</div>

					<DropdownMenu
						modal={false}
						open={isDropdownOpen}
						onOpenChange={setIsDropdownOpen}
					>
						<DropdownMenuTrigger asChild>
							<button className="p-0 font-normal" disabled={isLoading}>
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={session?.user?.image ?? ""}
											alt={session?.user?.name}
										/>
										<AvatarFallback className="rounded-lg">
											{session?.user?.name?.charAt(0)}
										</AvatarFallback>
									</Avatar>
									{isDropdownOpen ? (
										<ChevronUp className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
									) : (
										<ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
									)}
								</div>
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							className="w-56 cursor-pointer"
							align="end"
							forceMount
						>
							<DropdownMenuItem asChild>
								<Link
									href="/orders"
									className="flex items-center gap-2"
									aria-label="View your order history and track orders"
								>
									<Package className="h-4 w-4" />
									My Orders
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
								{isLoading ? "Logging out..." : "Log out"}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</>
			) : (
				<Link href="/login" aria-label="Sign in to your account">
					<Button
						size="sm"
						className="hover:bg-orange-400 hover:text-white cursor-pointer"
					>
						SignIn
					</Button>
				</Link>
			)}
		</>
	);
};
