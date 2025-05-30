"use client";

import React from "react";

const AdminAuth = ({ children }: { children: React.ReactNode }) => {
	// const router = useRouter();
	// const [isLoading, setIsLoading] = useState(true);
	// const [refreshSlideshow, setRefreshSlideshow] = useState(0);

	// // useEffect(() => {
	// // 	checkAuth();
	// // }, []);

	// const checkAuth = async () => {
	// 	try {
	// 		const {
	// 			data: { session },
	// 		} = await supabase.auth.getSession();

	// 		if (!session) {
	// 			toast.error("Unauthorized", {
	// 				description: "Please login to access the admin page",
	// 			});
	// 			router.push("/login");
	// 			return;
	// 		}

	// 		// Check if the user has admin role
	// 		const { data: userRole, error } = await supabase
	// 			.from("user_roles")
	// 			.select("role")
	// 			.eq("user_id", session.user.id)
	// 			.single();

	// 		if (error || userRole?.role !== "admin") {
	// 			toast.error("Unauthorized", {
	// 				description: "You do not have admin privileges",
	// 			});
	// 			router.push("/");
	// 			return;
	// 		}

	// 		setIsLoading(false);
	// 	} catch (error) {
	// 		console.error("Auth check error:", error);
	// 		toast.error("Error", {
	// 			description: "An error occurred while checking authentication",
	// 		});
	// 		router.push("/");
	// 	}
	// };

	// if (isLoading) {
	// 	return (
	// 		<div className="flex items-center justify-center min-h-screen">
	// 			<Loader2 className="h-8 w-8 animate-spin" />
	// 		</div>
	// 	);
	// }
	return <>{children}</>;
};

export default AdminAuth;
