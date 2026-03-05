import { NextResponse } from "next/server";

type GooglePlaceReview = {
	rating?: number;
	relativePublishTimeDescription?: string;
	text?: { text?: string };
	authorAttribution?: {
		displayName?: string;
		uri?: string;
		photoUri?: string;
	};
	googleMapsUri?: string;
};

export async function GET() {
	const apiKey = process.env.GOOGLE_PLACES_API_KEY;
	const placeId = process.env.GOOGLE_PLACE_ID;

	if (!apiKey || !placeId) {
		return NextResponse.json(
			{
				configured: false,
				error: "Google reviews integration is not configured.",
			},
			{ status: 200 },
		);
	}

	try {
		const response = await fetch(
			`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
			{
				headers: {
					"Content-Type": "application/json",
					"X-Goog-Api-Key": apiKey,
					"X-Goog-FieldMask":
						"displayName,rating,userRatingCount,reviews,googleMapsUri",
				},
				next: { revalidate: 1800 },
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			return NextResponse.json(
				{
					configured: true,
					error: `Google Places request failed: ${response.status}`,
					details: errorText,
				},
				{ status: 502 },
			);
		}

		const place = await response.json();
		const reviews = ((place.reviews as GooglePlaceReview[]) || [])
			.filter((review) => review.text?.text && review.authorAttribution?.displayName)
			.sort((a, b) => (b.rating || 0) - (a.rating || 0))
			.slice(0, 5)
			.map((review) => ({
				authorName: review.authorAttribution?.displayName || "Google User",
				authorUrl: review.authorAttribution?.uri || null,
				authorPhotoUrl: review.authorAttribution?.photoUri || null,
				rating: review.rating || 0,
				relativeTime: review.relativePublishTimeDescription || "",
				text: review.text?.text || "",
				reviewUrl: review.googleMapsUri || null,
			}));

		return NextResponse.json(
			{
				configured: true,
				placeName: place.displayName?.text || "Payless4Tech",
				rating: place.rating || 0,
				reviewCount: place.userRatingCount || 0,
				googleMapsUrl:
					place.googleMapsUri ||
					process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL ||
					`https://www.google.com/search?q=${encodeURIComponent("Payless4Tech Google Reviews")}`,
				reviews,
			},
			{
				headers: {
					"Cache-Control": "s-maxage=1800, stale-while-revalidate=86400",
				},
			},
		);
	} catch (error) {
		return NextResponse.json(
			{
				configured: true,
				error: "Failed to fetch Google reviews.",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
