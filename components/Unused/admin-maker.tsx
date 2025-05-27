"use client";
import React, { useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";

const adminMaker = () => {
	const session = useSession();

	useEffect(() => {
		const promoteToAdmin = async (id: string) => {
			const token = localStorage.getItem("supabase.auth.token");
			try {
				const response = await fetch("/api/admin", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`, // Replace with your actual token
					},
					body: JSON.stringify({ id }),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "An error occurred");
				}

				const data = await response.json();
				console.log("User promoted:", data);
			} catch (error) {
				console.error("Error promoting user:", error);
			}
		};
		// if (session?.user.id) promoteToAdmin(session?.user.id!);
	}, [session?.user.id]);
	return <></>;
};

export default adminMaker;
