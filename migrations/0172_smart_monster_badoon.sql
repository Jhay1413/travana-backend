CREATE TYPE "public"."budget_type" AS ENUM('PER_PERSON', 'PACKAGE');--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "budget_type" "budget_type" DEFAULT 'PACKAGE';