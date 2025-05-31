"use client"; // only needed in app directory

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
			<AlertTriangle className="w-16 h-16 text-orange-500 mb-4" />
			<h2 className="text-3xl font-bold mb-2 text-gray-800">Page Not Found</h2>
			<p className="text-gray-600 mb-6">
				Sorry, the page you're looking for doesn't exist or was moved.
			</p>
			<Link
				href="/"
				className="px-6 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-md"
			>
				Return Home
			</Link>
		</div>
	);
}
