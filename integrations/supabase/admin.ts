import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(
	SUPABASE_URL,
	SUPABASE_SERVICE_ROLE_KEY,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	}
);

// Access auth admin api
export const adminAuthClient = supabaseAdmin.auth.admin;
