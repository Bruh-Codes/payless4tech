"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loading } from "@/components/LoadingSkeletons";
import { useQuery } from "@tanstack/react-query";

const AdminAuth = ({ children }: { children: React.ReactNode }) => {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const {
		data: isAdmin,
		isPending,
		error: authError,
	} = useQuery({
		queryKey: ["admin-auth", session?.user?.id],
		queryFn: async () => {
			try {
				const response = await authClient.admin.hasPermission({
					permissions: {
						products: ["create", "update", "delete"],
					},
				});
				return response.data?.success;
			} catch (error) {
				console.error("Admin permission check error:", error);
				return false;
			}
		},
		enabled: !!session?.user?.id,
		retry: false, // Don't retry auth checks
	});

	if (isPending) {
		return <Loading />;
	}

	if (authError) {
		console.error("Admin auth error:", authError);
		toast.error("Authentication error", {
			description: authError.message || "Failed to verify admin permissions",
		});
		router.push("/");
		return null;
	}

	if (!isAdmin) {
		toast.error("Unauthorized", {
			description: "You do not have admin privileges",
		});
		router.push("/");
		return null;
	}

	return <>{children}</>;
};

export default AdminAuth;
