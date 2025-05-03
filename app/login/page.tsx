"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/Header";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Login = () => {
	const session = useSession();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		console.log("Session state changed:", session);
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			console.log("Auth state change event:", event);
			console.log("Session:", session);

			if (event === "SIGNED_IN" && session) {
				console.log("User signed in, navigating to home");
				toast("Success", {
					description: "Successfully logged in",
				});
				router.push("/");
			}

			if (event === "SIGNED_OUT") {
				setError(null);
			}
		});

		// Check initial session
		const checkSession = async () => {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();
			if (session) {
				console.log("Initial session exists, navigating to home");
				router.push("/");
			}
			if (error) {
				setError(error.message);
			}
			setIsLoading(false);
		};

		checkSession();

		return () => {
			subscription.unsubscribe();
		};
	}, [router.push, toast]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	return (
		<div>
			<Header />
			<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
				{error && (
					<Alert variant="destructive" className="mb-4">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
				<LoginForm />
			</div>
		</div>
	);
};

export default Login;
