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
	<div className="*:data-[slot=card]:from-orange-50/30 *:data-[slot=card]:to-orange-100/20 dark:*:data-[slot=card]:from-primary/5 dark:*:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @md/main:grid-cols-2 @3xl/main:grid-cols-4">
		{Array.from({ length: 4 }).map((_, i) => (
			<div
				key={i}
				className="@container/card rounded-lg border bg-gradient-to-t from-orange-50/30 to-orange-100/20 dark:from-primary/5 dark:to-card dark:bg-card shadow-xs p-6"
			>
				{/* Card Description skeleton */}
				<div className="h-4 w-24 bg-muted/50 animate-pulse rounded-md mb-4" />

				{/* Card Title skeleton (large number) */}
				<div className="h-10 w-16 bg-muted/70 animate-pulse rounded-md mb-2" />

				{/* Additional content skeleton if needed */}
				<div className="h-3 w-32 bg-muted/30 animate-pulse rounded-md" />
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

// Product card skeleton for shop page
export const ProductCardSkeleton = () => (
	<div className="rounded-xl border border-border bg-card overflow-hidden">
		{/* Image skeleton */}
		<div className="relative aspect-square bg-muted/50">
			<div className="absolute inset-0 bg-muted animate-pulse" />
			{/* Condition badge skeleton */}
			<div className="absolute top-3 right-3 h-6 w-16 rounded-lg bg-muted animate-pulse" />
		</div>

		{/* Content skeleton */}
		<div className="p-4 space-y-3">
			{/* Title skeleton */}
			<div className="h-4 w-full bg-muted animate-pulse rounded-md" />
			<div className="h-4 w-3/4 bg-muted animate-pulse rounded-md" />

			{/* Price skeleton */}
			<div className="flex items-baseline gap-2">
				<div className="h-6 w-20 bg-muted animate-pulse rounded-md" />
				<div className="h-4 w-16 bg-muted animate-pulse rounded-md" />
			</div>

			{/* Button skeleton */}
			<div className="h-8 w-full bg-muted/70 animate-pulse rounded-md" />
		</div>
	</div>
);

// Admin product card skeleton for admin dashboard
export const AdminProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
	<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
		{Array.from({ length: count }).map((_, i) => (
			<div key={i} className="relative group w-full h-full">
				{/* Product card skeleton */}
				<div className="rounded-xl border border-border bg-card overflow-hidden">
					{/* Image skeleton */}
					<div className="relative aspect-square bg-muted/50">
						<div className="absolute inset-0 bg-muted animate-pulse" />
						{/* Condition badge skeleton */}
						<div className="absolute top-3 right-3 h-6 w-16 rounded-lg bg-muted animate-pulse" />
					</div>

					{/* Content skeleton */}
					<div className="p-4 space-y-3">
						{/* Title skeleton */}
						<div className="h-4 w-full bg-muted animate-pulse rounded-md" />
						<div className="h-4 w-3/4 bg-muted animate-pulse rounded-md" />

						{/* Price skeleton */}
						<div className="flex items-baseline gap-2">
							<div className="h-6 w-20 bg-muted animate-pulse rounded-md" />
							<div className="h-4 w-16 bg-muted animate-pulse rounded-md" />
						</div>

						{/* Status and stock skeleton */}
						<div className="flex items-center justify-between">
							<div className="h-3 w-16 bg-muted animate-pulse rounded-md" />
							<div className="h-3 w-12 bg-muted animate-pulse rounded-md" />
						</div>
					</div>
				</div>

				{/* Admin actions skeleton */}
				<div className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
					<div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
				</div>
			</div>
		))}
	</div>
);

// Export for consistency - alias to LoadingSpinner
export { LoadingSpinner as Loading };
