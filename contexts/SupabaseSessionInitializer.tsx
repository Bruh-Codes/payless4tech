"use client";

import { supabase } from "@/integrations/supabase/client";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

export function SupabaseSessionInitializer({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SessionContextProvider supabaseClient={supabase}>
			{children}
		</SessionContextProvider>
	);
}
