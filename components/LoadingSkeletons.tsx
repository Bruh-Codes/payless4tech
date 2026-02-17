import { Skeleton } from "@/components/ui/skeleton";

// Chart skeleton for dashboard
export const ChartSkeleton = () => (
	<div className="h-64 w-full space-y-4">
		<div className="flex justify-between items-center">
			<Skeleton className="h-6 w-32" />
			<Skeleton className="h-8 w-24" />
		</div>
		<div className="relative h-48">
			<Skeleton className="absolute inset-0" />
			<div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-4 w-16" />
			</div>
		</div>
	</div>
);

// Data table skeleton for admin dashboard
export const TableSkeleton = () => (
	<div className="space-y-4">
		<div className="flex justify-between items-center">
			<Skeleton className="h-10 w-64" />
			<Skeleton className="h-10 w-32" />
		</div>
		<div className="border rounded-lg">
			<div className="border-b p-4">
				<div className="grid grid-cols-6 gap-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-4" />
					))}
				</div>
			</div>
			{Array.from({ length: 8 }).map((_, i) => (
				<div key={i} className="border-b p-4 last:border-b-0">
					<div className="grid grid-cols-6 gap-4">
						<Skeleton className="h-4" />
						<Skeleton className="h-4" />
						<Skeleton className="h-4" />
						<Skeleton className="h-4" />
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-8 w-16 rounded-full" />
					</div>
				</div>
			))}
		</div>
	</div>
);

// Admin overview cards skeleton
export const AdminCardsSkeleton = () => (
	<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		{Array.from({ length: 4 }).map((_, i) => (
			<div key={i} className="rounded-lg border p-6 space-y-4">
				<div className="flex items-center justify-between">
					<Skeleton className="h-8 w-8" />
					<Skeleton className="h-4 w-16" />
				</div>
				<Skeleton className="h-8 w-24" />
				<Skeleton className="h-3 w-32" />
			</div>
		))}
	</div>
);

// Loading spinner for general use (component-level loading)
export const LoadingSpinner = ({
	size = "md",
}: {
	size?: "sm" | "md" | "lg";
}) => {
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-6 w-6",
		lg: "h-8 w-8",
	};

	return (
		<div className="h-screen grid place-content-center">
			<div
				className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]}`}
			/>
		</div>
	);
};

// Export for consistency - alias to LoadingSpinner
export { LoadingSpinner as Loading };
