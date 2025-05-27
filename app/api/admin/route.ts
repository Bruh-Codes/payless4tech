import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/integrations/supabase/admin";

export async function POST(request: NextRequest) {
	// Extract the Authorization token
	const authHeader = (await headers()).get("authorization");
	const token = authHeader?.replace("Bearer ", "");
	if (!token) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
		});
	}

	// Get the user making the request
	const {
		data: { user },
		error,
	} = await supabaseAdmin.auth.getUser(token);
	if (error || !user) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
		});
	}

	// Check if requester is admin
	if (user.user_metadata.role !== "admin") {
		return new Response(JSON.stringify({ error: "Forbidden: Admins only" }), {
			status: 403,
		});
	}

	// Parse the request body
	const { id } = await request.json();

	// Proceed to promote
	const { data, error: updateError } =
		await supabaseAdmin.auth.admin.updateUserById(id, {
			user_metadata: { role: "admin" },
		});

	if (updateError) {
		return new Response(JSON.stringify({ error: updateError.message }), {
			status: 500,
		});
	}

	return new Response(
		JSON.stringify({ message: "User promoted to admin", data }),
		{ status: 200 }
	);
}
