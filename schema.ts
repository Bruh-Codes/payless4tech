import {
	pgTable,
	bigint,
	text,
	timestamp,
	boolean,
	jsonb,
	doublePrecision,
	uuid,
	foreignKey,
	index,
	unique,
	uniqueIndex,
	pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const archivedPreorders = pgTable("archived_preorders", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: uuid().defaultRandom().primaryKey().notNull(),

	fullName: text("full_name"),
	email: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	phoneNumber: bigint("phone_number", { mode: "number" }),
	itemType: text("item_type"),
	specifications: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
	fulfillmentStatus: text("fulfillment_status"),
});

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: "string" }).notNull(),
	createdAt: timestamp({ mode: "string" }),
	updatedAt: timestamp({ mode: "string" }),
});

export const session = pgTable(
	"session",
	{
		id: text().primaryKey().notNull(),
		expiresAt: timestamp({ mode: "string" }).notNull(),
		token: text().notNull(),
		createdAt: timestamp({ mode: "string" }).notNull(),
		updatedAt: timestamp({ mode: "string" }).notNull(),
		ipAddress: text(),
		userAgent: text(),
		userId: text().notNull(),
		impersonatedBy: text(),
		role: text(),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_fkey",
		}),
		unique("session_token_key").on(table.token),
	],
);

export const user = pgTable(
	"user",
	{
		id: text().primaryKey().notNull(),
		name: text().notNull(),
		email: text().notNull(),
		emailVerified: boolean().notNull(),
		image: text(),
		createdAt: timestamp({ mode: "string" }).notNull(),
		updatedAt: timestamp({ mode: "string" }).notNull(),
		role: text(),
		banned: boolean(),
		banReason: text(),
		banExpires: timestamp({ mode: "string" }),
	},
	(table) => [
		index("temp_idx_user_role").using(
			"btree",
			table.role.asc().nullsLast().op("text_ops"),
		),
		unique("user_email_key").on(table.email),
		pgPolicy("anon can select all", {
			as: "permissive",
			for: "select",
			to: ["anon"],
			using: sql`true`,
		}),
	],
);

export const account = pgTable(
	"account",
	{
		id: text().primaryKey().notNull(),
		accountId: text().notNull(),
		providerId: text().notNull(),
		userId: text().notNull(),
		accessToken: text(),
		refreshToken: text(),
		idToken: text(),
		accessTokenExpiresAt: timestamp({ mode: "string" }),
		refreshTokenExpiresAt: timestamp({ mode: "string" }),
		scope: text(),
		password: text(),
		createdAt: timestamp({ mode: "string" }).notNull(),
		updatedAt: timestamp({ mode: "string" }).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_fkey",
		}),
	],
);

export const archivedSales = pgTable("archived_sales", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: uuid().defaultRandom().primaryKey().notNull(),

	userId: text("user_id"),
	name: text("name"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalAmount: bigint("total_amount", { mode: "number" }),
	status: text(),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	phoneNumber: bigint("phone_number", { mode: "number" }),
	alternativePhone: text("alternative_phone"),
	deliveryAddress: text("delivery_address"),
	gpsLocation: text("gps_location"),
	email: text(),
	extendedWarranty: boolean("extended_warranty"),
	fulfillmentStatus: text("fulfillment_status"),
	product: jsonb().array(),
});

export const preorders = pgTable("preorders", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: uuid().defaultRandom().primaryKey().notNull(),

	fullName: text("full_name"),
	email: text(),
	phoneNumber: text("phone_number"),
	itemType: text("item_type"),
	specifications: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
	fulfillmentStatus: text("fulfillment_status").default("pending").notNull(),
});

export const productImages = pgTable("product_images", {
	id: uuid().defaultRandom().primaryKey().notNull(),

	productId: text("product_id"),
	imageUrl: text("image_url"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	displayOrder: bigint("display_order", { mode: "number" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),

	name: text(),
	description: text(),
	price: doublePrecision(),
	condition: text(),
	imageUrl: text("image_url"),
	originalPrice: text("original_price"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	category: text(),
	detailedSpecs: text("detailed_specs"),
	status: text().default("available"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	stock: bigint({ mode: "number" }).default(sql`'300'`),
});

export const saleItems = pgTable(
	"sale_items",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		saleId: uuid("sale_id").notNull(),
		productId: text("product_id"),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		quantity: bigint({ mode: "number" }),
		priceAtTime: doublePrecision("price_at_time"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	},
	(table) => [
		foreignKey({
			columns: [table.saleId],
			foreignColumns: [sales.id],
			name: "sale_items_sale_id_fkey",
		}),
	],
);

export const sales = pgTable("sales", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id"),
	name: text("name"),
	totalAmount: doublePrecision("total_amount"),
	status: text(),
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "string",
	}).default(sql`(now() AT TIME ZONE 'utc'::text)`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	phoneNumber: text("phone_number"),
	alternativePhone: text("alternative_phone"),
	deliveryAddress: text("delivery_address"),
	gpsLocation: text("gps_location"),
	email: text(),
	extendedWarranty: boolean("extended_warranty"),
	fulfillmentStatus: text("fulfillment_status").default("pending"),
	product: jsonb().array(),
});
