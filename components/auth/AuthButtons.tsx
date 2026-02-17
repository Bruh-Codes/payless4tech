"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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

export const AuthButtons = () => {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const { data: session } = authClient.useSession();

	const handleLogout = async () => {
		try {
			setIsLoading(true);
			const { error } = await supabase.auth.signOut();
			if (error) throw error;

			toast("Logged out successfully", {
				description: "You have been logged out of your account",
			});
			router.push("/");
		} catch (error) {
			console.error("Error logging out:", error);

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
					{isPending ? (
						<Skeleton className="h-9 w-24 bg-blue-100" />
					) : isAdmin?.data?.success ? (
						<Link href="/admin" className="m-0">
							<Button size="sm">Dashboard</Button>
						</Link>
					) : null}

					<DropdownMenu modal={false}>
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
								</div>
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							className="w-56 cursor-pointer"
							align="end"
							forceMount
						>
							<DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
								{isLoading ? "Logging out..." : "Log out"}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</>
			) : (
				<Link href="/login">
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
