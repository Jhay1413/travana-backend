ALTER TYPE "public"."enquiry_status" ADD VALUE 'NEW_LEAD';--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';