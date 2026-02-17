"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import Navbar from "@/components/navbar";

const Login = () => {
	return (
		<>
			<Navbar />
			<div className="flex dark:bg-background bg-secondary min-h-[calc(100vh-6rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ">
				<LoginForm />
			</div>
			<WhatsAppButton />
		</>
	);
};

export default Login;
