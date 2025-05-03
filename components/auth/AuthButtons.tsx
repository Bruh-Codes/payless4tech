"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export const AuthButtons = () => {
	const session = useSession();
	const supabase = useSupabaseClient();
	const [isAdmin, setIsAdmin] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const checkAdminStatus = async () => {
			if (session?.user) {
				console.log("Checking admin status for user:", session.user.email);
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

					const hasAdminRole = userRole?.role === "admin";
					console.log("Admin status:", hasAdminRole);
					setIsAdmin(hasAdminRole);
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
								Admin
							</Button>
						</Link>
					)}
					<Button
						variant="ghost"
						size="sm"
						onClick={handleLogout}
						className="hover:bg-orange-400 hover:text-white cursor-pointer"
						disabled={isLoading}
					>
						{isLoading ? "Logging out..." : `Logout (${session.user.email})`}
					</Button>
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
