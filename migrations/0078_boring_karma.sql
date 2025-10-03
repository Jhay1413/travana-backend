ALTER TABLE "booking_table" ALTER COLUMN "date_created" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "date_created" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "date_created" SET DATA TYPE timestamp (0) with time zone;