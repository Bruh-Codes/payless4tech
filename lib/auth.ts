import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { account, session, user as schemaUser, verification } from "@/schema";
import { admin as AdminPlugin, magicLink } from "better-auth/plugins";
import { ac, user, admin } from "./permissions";
import { Resend } from "resend";
import MagicLinkEmail from "@/components/emails/MagicLinkEmail";
// const resend = new Resend(process.env.RESEND_API_KEY);

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || "http:localhost:3000";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

export const auth = betterAuth({
	baseURL: BETTER_AUTH_URL,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schemaUser,
			session,
			account,
			verification,
		},
	}),

	socialProviders: {
		google: {
			clientId: GOOGLE_CLIENT_ID || "",
			clientSecret: GOOGLE_CLIENT_SECRET || "",
		},
	},
	trustedOrigins: ["http://localhost:3000", BETTER_AUTH_URL],

	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"],
			allowDifferentEmails: false,
			allowUnlinkingAll: true,
		},
	},

	plugins: [
		AdminPlugin({ ac, roles: { user, admin } }),
		// magicLink({
		// 	sendMagicLink: async ({ email, token, url }, ctx) => {
		// 		const { error } = await resend.emails.send({
		// 			from: "Payless4Tech <onboarding@support.payless4tech.com>",
		// 			to: [email],
		// 			subject: "Your Magic Sign-In Link for Payless4Tech",
		// 			react: MagicLinkEmail({ link: url }),
		// 		});
		// 		if (error) console.log(error);
		// 		// send email to user
		// 	},
		// }),
	],
});
