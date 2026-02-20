DROP INDEX "user_ocid_key";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "OCId";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "ethAddress";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "ocid";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "ethAddress";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "OCId";