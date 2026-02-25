import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client only if service key is available
export const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY 
	? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		})
	: null;

// Access auth admin api
export const adminAuthClient = supabaseAdmin?.auth.admin;
