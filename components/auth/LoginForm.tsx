"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Mail, Loader2 } from "lucide-react";

export const LoginForm = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [magicLinkLoading, setMagicLinkLoading] = useState(false);
	const [magicLinkEmail, setMagicLinkEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [showMagicLinkSuccess, setShowMagicLinkSuccess] = useState(false);

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		setError(null);

		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/",
			});
		} catch (error: any) {
			console.error("Error logging in with Google:", error);
			setError(error.message || "Failed to login with Google");
			toast.error("Google login failed", {
				description: error.message || "Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleMagicLink = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await authClient.signIn.magicLink(
				{
					email: magicLinkEmail,
					callbackURL: "/",
				},
				{
					onRequest: () => {
						toast.loading("Magic link being created...");
						setMagicLinkLoading(true);
					},
					onResponse: (ctx) => {
						if (ctx.response.status === 429) {
							toast.dismiss();
							toast.error("Too many requests", {
								description:
									"Please try again later or use another sign-in option",
							});
							setMagicLinkLoading(false);
							return;
						}

						if (!ctx.response.ok) {
							toast.error("Error signin in. Please try again", {
								description: ctx.response.statusText,
							});
						}
						if (ctx.response.ok) {
							toast.dismiss();
							toast.success("Magic link has been sent");
							setMagicLinkLoading(false);
						}
					},
				},
			);

			if (error) {
				throw new Error(
					typeof error === "string" ? error : JSON.stringify(error),
				);
			}

			// Show success state
			setShowMagicLinkSuccess(true);
			toast.success("Magic link sent!", {
				description: "Check your email for the login link.",
			});
		} catch (error: any) {
			console.error("Error sending magic link:", error);
			setError(error.message || "Failed to send magic link");
			toast.error("Failed to send magic link", {
				description: error.message || "Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const resetMagicLinkForm = () => {
		setShowMagicLinkSuccess(false);
		setMagicLinkEmail("");
		setError(null);
	};

	// Magic Link Success State
	if (showMagicLinkSuccess) {
		return (
			<Card className="w-full max-w-md mx-auto">
				<CardContent className="pt-6">
					<div className="text-center space-y-6">
						{/* Success Icon */}
						<div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-900/20">
							<Check className="w-8 h-8 text-green-600 dark:text-green-400" />
						</div>

						{/* Success Message */}
						<div className="space-y-2">
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
								Check your email
							</h3>
							<p className="text-gray-600 dark:text-gray-400">
								We've sent a magic link to{" "}
								<span className="font-medium">{magicLinkEmail}</span>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle className="text-2xl font-bold text-center dark:text-white">
					Sign in to your account
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Google Login Button */}
				<div className="space-y-4">
					<Button
						onClick={handleGoogleLogin}
						className="w-full dark:bg-accent bg-secondary hover:bg-primary/10 text-primary dark:hover:bg-accent/80"
						disabled={isLoading}
						variant="outline"
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Signing in with Google...
							</>
						) : (
							<>
								<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
									<path
										fill="#4285F4"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="#34A853"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="#FBBC05"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="#EA4335"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
								Continue with Google
							</>
						)}
					</Button>
				</div>

				{/* Divider */}
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-primary/30" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-white px-2 bg-accent/30 text-primary dark:text-black">
							Or
						</span>
					</div>
				</div>

				{/* Magic Link Login */}
				<form onSubmit={handleMagicLink} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="magic-email" className="text-primary">
							Email
						</Label>
						<Input
							id="magic-email"
							type="email"
							placeholder="Enter your email"
							value={magicLinkEmail}
							onChange={(e) => setMagicLinkEmail(e.target.value)}
							required
							className="bg-secondary"
							disabled={magicLinkLoading}
						/>
					</div>
					{error && (
						<div className="text-sm text-red-600 bg-red-50 p-3 rounded-md dark:bg-red-900/20 dark:text-red-400">
							{error}
						</div>
					)}
					<Button type="submit" className="w-full" disabled={isLoading}>
						{magicLinkLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Sending magic link...
							</>
						) : (
							<>
								<Mail className="mr-2 h-4 w-4" />
								Send Magic Link
							</>
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};
