"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock, User } from "lucide-react";

const AdminLoginPage = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
				credentials: "include"
			});

			const data = await response.json();

			if (response.ok) {
				toast.success("Success", {
					description: "Successfully logged in",
				});
				router.push("/admin");
			} else {
				toast.error("Login Failed", {
					description: data.error || "Invalid email or password",
				});
			}
		} catch (error) {
			console.error("Login error:", error);
			toast.error("Error", {
				description: "An error occurred during login",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
						<Lock className="h-6 w-6 text-primary" />
					</div>
					<CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
					<CardDescription>
						Sign in to access the Payless4Tech admin panel
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="admin@example.com"
									value={formData.email}
									onChange={handleChange}
									disabled={isLoading}
									required
									className="pl-10"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="Your password"
									value={formData.password}
									onChange={handleChange}
									disabled={isLoading}
									required
									className="pl-10"
								/>
							</div>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing in...
								</>
							) : (
								"Sign In"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default AdminLoginPage;