import { NextRequest, NextResponse } from "next/server";
import { getItemsByItemGroup } from "@/lib/ebay-server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ itemGroupId: string }> },
) {
	const { itemGroupId } = await params;

	if (!itemGroupId) {
		return NextResponse.json(
			{ error: "Item group ID is required" },
			{ status: 400 },
		);
	}

	try {
		const data = await getItemsByItemGroup(itemGroupId, "GHS");
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching items by item group:", error);
		return NextResponse.json(
			{ error: "Failed to fetch items by item group" },
			{ status: 500 },
		);
	}
}
