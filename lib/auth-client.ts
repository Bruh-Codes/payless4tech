import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { ac, user, admin } from "./permissions";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	plugins: [adminClient({ ac, roles: { user, admin } }), magicLinkClient()],
});
