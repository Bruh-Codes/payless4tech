"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";
import { Header } from "@/components/Header";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const Login = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (event === "SIGNED_IN" && session) {
				toast.success("Success", {
					description: "Successfully logged in",
				});
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

	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	return (
		<>
			<div>
				<Header />
				<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
					<LoginForm />
				</div>
			</div>
			<Footer />
			<WhatsAppButton />
		</>
	);
};

export default Login;
