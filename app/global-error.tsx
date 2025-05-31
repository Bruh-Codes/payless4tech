"use client";

import { AlertOctagon } from "lucide-react";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html>
			<body className="flex items-center justify-center h-screen bg-[#fff5f5] text-red-800">
				<div className="text-center p-8 bg-white border border-red-300 shadow-lg rounded-lg max-w-md w-full">
					<div className="flex justify-center mb-4 text-red-600">
						<AlertOctagon size={56} strokeWidth={1.5} />
					</div>
					<h2 className="text-2xl font-bold mb-2">Something Went Wrong</h2>
					<p className="text-sm mb-4 text-red-700">
						{error?.message || "An unexpected error occurred."}
					</p>

					{error?.digest && (
						<p className="text-xs text-gray-500 mb-4">
							Error ID: {error.digest}
						</p>
					)}

					<button
						onClick={reset}
						className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
					>
						Try Again
					</button>
				</div>
			</body>
		</html>
	);
}
