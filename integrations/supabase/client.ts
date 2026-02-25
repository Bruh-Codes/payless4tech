import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a fallback client for build time
const createSupabaseClient = () => {
	if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
		// Return a mock client for build time
		return {
			from: () => ({
				select: () => Promise.resolve({ data: [], error: null }),
				insert: () => Promise.resolve({ data: null, error: null }),
				update: () => Promise.resolve({ data: null, error: null }),
				delete: () => Promise.resolve({ data: null, error: null }),
			}),
			auth: {
				getSession: () => Promise.resolve({ data: { session: null }, error: null }),
				signIn: () => Promise.resolve({ data: null, error: null }),
				signOut: () => Promise.resolve({ error: null }),
			},
		} as any;
	}

	return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		auth: {
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: true,
		},
	});
};

export const supabase = createSupabaseClient();
