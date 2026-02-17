const Loading = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-6 w-6",
		lg: "h-8 w-8",
	};

	return (
		<div className="grid place-content-center absolute inset-0 bg-background min-h-screen">
			<div
				className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]}`}
			/>
		</div>
	);
};

export default Loading;
