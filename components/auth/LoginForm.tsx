import { Auth } from "@supabase/auth-ui-react";
import { SocialLayout, ThemeSupa, ViewType } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const LoginForm = () => {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const socialAlignments = ["horizontal", "vertical"] as const;
	const [socialLayout, setSocialLayout] = useState<SocialLayout>(
		socialAlignments[1] satisfies SocialLayout
	);

	const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL;

	useEffect(() => {
		let mounted = true;

		// Check if user is already logged in
		const checkSession = async () => {
			try {
				const {
					data: { session },
					error: sessionError,
				} = await supabase.auth.getSession();

				if (!mounted) return;

				if (sessionError) {
					console.error("Session check error:", sessionError);
					setError(sessionError.message);
					return;
				}

				if (session) {
					router.push("/");
				}
			} catch (err) {
				console.error("Error checking session:", err);
				if (mounted) {
					setError("Error checking session status");
				}
			}
		};

		// Listen for auth state changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (!mounted) return;

			if (event === "SIGNED_IN" && session) {
				router.push("/");
			}

			if (event === "SIGNED_OUT") {
				console.log("User signed out, clearing error");
				setError(null);
			}
		});

		checkSession();

		return () => {
			mounted = false;
			subscription?.unsubscribe();
		};
	}, [router.push]);

	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	return (
		<div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
			<div>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Sign in to your account
				</h2>
			</div>

			<div className="mt-8">
				<Auth
					supabaseClient={supabase}
					view={"magic_link"}
					showLinks={false}
					appearance={{
						theme: ThemeSupa,
						style: {
							anchor: { color: "#4F46E5" },
							container: { maxWidth: "100%" },
							message: { color: "#EF4444" },
							input: {
								background: "white",
								borderColor: "#E5E7EB",
								borderRadius: "0.375rem",
								padding: "0.5rem 0.75rem",
							},
							label: { color: "#374151" },
						},
						variables: {
							default: {
								colors: {
									brand: "#4F46E5",
									brandAccent: "#4338CA",
								},
							},
						},
					}}
					providers={["google"]}
					socialLayout={socialLayout}
					redirectTo={redirectUrl}
					theme={"light"}
				/>
			</div>
		</div>
	);
};
