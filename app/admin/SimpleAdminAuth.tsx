"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const SimpleAdminAuth = ({ children }: { children: React.ReactNode }) => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = async () => {
		try {
			const response = await fetch('/api/auth/verify', {
				method: 'GET',
				credentials: 'include'
			});

			if (response.ok) {
				const data = await response.json();
				if (data.user && data.user.role === 'admin') {
					setIsAuthenticated(true);
				} else {
					redirectToLogin();
				}
			} else {
				redirectToLogin();
			}
		} catch (error) {
			console.error('Auth check error:', error);
			redirectToLogin();
		} finally {
			setIsLoading(false);
		}
	};

	const redirectToLogin = () => {
		toast.error("Authentication Required", {
			description: "Please login to access the admin panel",
		});
		router.push("/admin/login");
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
					<p className="text-muted-foreground">Checking authentication...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null; // Will redirect to login
	}

	return <>{children}</>;
};

export default SimpleAdminAuth;