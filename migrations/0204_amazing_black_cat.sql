ALTER TABLE "quote_table" ADD COLUMN "deal_type" varchar;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "pre_booked_seats" varchar;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "flight_meals" boolean DEFAULT false;