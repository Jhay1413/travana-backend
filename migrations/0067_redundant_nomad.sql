ALTER TABLE "booking_table" ADD COLUMN "date_created" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "date_created" timestamp DEFAULT now();