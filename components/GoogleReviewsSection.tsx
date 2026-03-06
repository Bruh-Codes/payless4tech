"use client";

import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type ReviewsResponse = {
	configured: boolean;
	placeName?: string;
	rating?: number;
	reviewCount?: number;
	googleMapsUrl?: string;
	reviews?: Array<{
		authorName: string;
		authorUrl: string | null;
		authorPhotoUrl: string | null;
		rating: number;
		relativeTime: string;
		text: string;
		reviewUrl: string | null;
	}>;
	error?: string;
};

const renderStars = (count: number) =>
	Array.from({ length: 5 }).map((_, index) => (
		<Star
			key={index}
			className={`h-4 w-4 ${index < Math.round(count) ? "fill-current" : ""}`}
		/>
	));

export default function GoogleReviewsSection() {
	const { data, isLoading } = useQuery<ReviewsResponse>({
		queryKey: ["google-reviews"],
		queryFn: async () => {
			const response = await fetch("/api/google-reviews");
			return response.json();
		},
		staleTime: 30 * 60 * 1000,
	});

	const isConfigured = Boolean(data?.configured);
	const googleMapsUrl =
		data?.googleMapsUrl ||
		"https://www.google.com/search?q=Payless4Tech+Google+Reviews";
	const reviews = data?.reviews || [];
	const averageRating = data?.rating || 0;
	const reviewCount = data?.reviewCount || 0;

	return (
		<section className="bg-background py-16">
			<div className="mx-auto max-w-7xl  sm:px-6 lg:px-8 px-4">
				<div className="mb-10 flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
							Customer Reviews
						</p>
						<h2 className="mt-2 text-3xl font-bold text-foreground">
							Built on repeat buyers and referrals
						</h2>
						<p className="mt-3 max-w-2xl text-muted-foreground">
							Live customer trust signals pulled from your Google Business
							profile when the Google Places credentials are configured.
						</p>
					</div>
					<div className="rounded-2xl border border-border bg-secondary px-5 py-4">
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-1 text-amber-500">
								{renderStars(averageRating)}
							</div>
							<span className="text-2xl font-bold text-foreground">
								{isLoading ? "..." : averageRating.toFixed(1)}
							</span>
						</div>
						<p className="mt-2 text-sm text-muted-foreground">
							{isConfigured
								? `Based on ${reviewCount.toLocaleString()} Google reviews`
								: "Add Google Places credentials to load live review data"}
						</p>
					</div>
				</div>

				{isConfigured && reviews.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-3">
						{reviews.slice(0, 3).map((review, index) => (
							<article
								key={`${review.authorName}-${index}`}
								className="rounded-2xl border border-border bg-card p-6 shadow-sm"
							>
								<div className="flex items-center gap-1 text-amber-500">
									{renderStars(review.rating)}
								</div>
								<p className="mt-4 text-sm leading-6 text-muted-foreground">
									{review.text}
								</p>
								<div className="mt-4 flex items-center justify-between gap-3">
									<div>
										<p className="text-sm font-medium text-foreground">
											{review.authorName}
										</p>
										{review.relativeTime && (
											<p className="text-xs text-muted-foreground">
												{review.relativeTime}
											</p>
										)}
									</div>
									{review.authorUrl && (
										<Link
											href={review.authorUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs font-medium text-primary hover:underline"
										>
											Author
										</Link>
									)}
								</div>
							</article>
						))}
					</div>
				) : (
					<div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
						{isLoading
							? "Loading live Google reviews..."
							: data?.error ||
								"Google reviews are not configured yet. Add your Google Places API key and Place ID to enable the live feed."}
					</div>
				)}

				<div className="mt-8">
					<Link
						href={googleMapsUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
					>
						View Google Reviews
						<ExternalLink className="h-4 w-4" />
					</Link>
				</div>
			</div>
		</section>
	);
}
