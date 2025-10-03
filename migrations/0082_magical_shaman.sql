ALTER TABLE "enquiry_table" ADD COLUMN "date_expiry" timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "date_expiry" timestamp (0) with time zone;