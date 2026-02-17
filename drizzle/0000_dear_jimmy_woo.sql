CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "archived_preorders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text,
	"email" text,
	"phone_number" bigint,
	"item_type" text,
	"specifications" text,
	"created_at" timestamp with time zone,
	"fulfillment_status" text
);
--> statement-breakpoint
CREATE TABLE "archived_sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"name" text,
	"total_amount" bigint,
	"status" text,
	"created_at" text,
	"updated_at" text,
	"phone_number" bigint,
	"alternative_phone" text,
	"delivery_address" text,
	"gps_location" text,
	"email" text,
	"extended_warranty" boolean,
	"fulfillment_status" text,
	"product" jsonb[]
);
--> statement-breakpoint
CREATE TABLE "preorders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text,
	"email" text,
	"phone_number" text,
	"item_type" text,
	"specifications" jsonb,
	"created_at" timestamp with time zone,
	"fulfillment_status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text,
	"image_url" text,
	"display_order" bigint,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"description" text,
	"price" double precision,
	"condition" text,
	"image_url" text,
	"original_price" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"category" text,
	"detailed_specs" text,
	"status" text DEFAULT 'available',
	"stock" bigint DEFAULT '300'
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_id" uuid NOT NULL,
	"product_id" text,
	"quantity" bigint,
	"price_at_time" double precision,
	"created_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"name" text,
	"total_amount" double precision,
	"status" text,
	"created_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
	"updated_at" timestamp with time zone,
	"phone_number" text,
	"alternative_phone" text,
	"delivery_address" text,
	"gps_location" text,
	"email" text,
	"extended_warranty" boolean,
	"fulfillment_status" text DEFAULT 'pending',
	"product" jsonb[]
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"impersonatedBy" text,
	"OCId" text,
	"ethAddress" text,
	"role" text,
	CONSTRAINT "session_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"role" text,
	"banned" boolean,
	"banReason" text,
	"banExpires" timestamp,
	"ocid" text,
	"ethAddress" text,
	"OCId" text,
	CONSTRAINT "user_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "temp_idx_user_role" ON "user" USING btree ("role" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "user_ocid_key" ON "user" USING btree ("ocid");--> statement-breakpoint
CREATE POLICY "anon can select all" ON "user" AS PERMISSIVE FOR SELECT TO "anon" USING (true);