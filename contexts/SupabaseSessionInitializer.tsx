"use client";

import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function SupabaseSessionInitializer() {
	useEffect(() => {
		const token = localStorage.getItem("supabase.auth.token");
		if (token) {
			supabase.auth
				.setSession({
					access_token: token,
					refresh_token: "",
				})
				.catch(console.error);
		}
	}, []);

	return null;
}
