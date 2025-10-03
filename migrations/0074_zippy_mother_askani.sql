CREATE TYPE "public"."enquiry_status" AS ENUM('ACTIVE', 'LOST');--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "status" "enquiry_status" DEFAULT 'ACTIVE';--> statement-breakpoint
ALTER TABLE "public"."booking_table" ALTER COLUMN "booking_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."booking_status";--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('BOOKED', 'LOST');--> statement-breakpoint
ALTER TABLE "public"."booking_table" ALTER COLUMN "booking_status" SET DATA TYPE "public"."booking_status" USING "booking_status"::"public"."booking_status";