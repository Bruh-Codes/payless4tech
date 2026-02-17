import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { data: orders, error } = await supabase
			.from("sales")
			.select(
				`
        *,
        sale_items (
          id,
          product_id,
          quantity,
          price_at_time
        )
      `,
			)
			.eq("user_id", session.user.id)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching orders:", error);
			return NextResponse.json(
				{ error: "Failed to fetch orders" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ orders });
	} catch (error) {
		console.error("Orders API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
