"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loading } from "@/components/LoadingSkeletons";
import { useQuery } from "@tanstack/react-query";

const AdminAuth = ({ children }: { children: React.ReactNode }) => {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const { data: isAdmin, isPending } = useQuery({
		queryKey: ["admin-auth", session?.user?.id],
		queryFn: async () => {
			const response = await authClient.admin.hasPermission({
				permissions: {
					products: ["create", "update", "delete"],
				},
			});
			return response.data?.success;
		},
		enabled: !!session?.user?.id,
	});

	if (isPending) {
		return <Loading />;
	}

	if (!isAdmin) {
		toast.error("Unauthorized", {
			description: "You do not have admin privileges",
		});
		router.push("/");
	}

	return <>{children}</>;
};

export default AdminAuth;
