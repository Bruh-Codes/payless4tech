import { createAccessControl } from "better-auth/plugins";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
	...defaultStatements,
	user: ["create", "update", "delete"],
	products: ["create", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
	user: ["create"],
});
export const admin = ac.newRole({
	...adminAc.statements,
	user: ["create", "update", "delete"],
	products: ["create", "update", "delete"],
});
