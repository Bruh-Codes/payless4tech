"use client";

import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
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

export const AuthButtons = () => {
	const [isAdmin, setIsAdmin] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const session = useSession();
	const router = useRouter();

	useEffect(() => {
		const checkAdminStatus = async () => {
			if (session?.user) {
				try {
					const { data: userRole, error } = await supabase
						.from("user_roles")
						.select("role")
						.eq("user_id", session.user.id)
						.single();

					if (error) {
						console.error("Error fetching user role:", error);
						return;
					}

					setIsAdmin(userRole?.role === "admin");
				} catch (error) {
					console.error("Error in checkAdminStatus:", error);
				}
			} else {
				setIsAdmin(false);
			}
		};

		checkAdminStatus();
	}, [session, supabase]);

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

	return (
		<>
			{session ? (
				<>
					{isAdmin && (
						<Link href="/admin">
							<Button
								variant="ghost"
								size="sm"
								className="bg-blue-100 hover:bg-orange-400 hover:text-white cursor-pointer"
							>
								Dashboard
							</Button>
						</Link>
					)}

					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild disabled={isLoading}>
							<Button
								disabled={isLoading}
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
							onClick={handleLogout}
							className="w-56 cursor-pointer"
							align="end"
							forceMount
						>
							<DropdownMenuItem>Log out</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</>
			) : (
				<Link href="/login">
					<Button
						variant="ghost"
						size="sm"
						className="hover:bg-orange-400 hover:text-white cursor-pointer"
					>
						Login
					</Button>
				</Link>
			)}
		</>
	);
};
