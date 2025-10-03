ALTER TABLE "quote_table" ADD COLUMN "cruise_date_id" uuid;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "quote_type" varchar;--> statement-breakpoint
ALTER TABLE "quote_table" ADD CONSTRAINT "quote_table_cruise_date_id_cruise_itenary_dates_table_id_fk" FOREIGN KEY ("cruise_date_id") REFERENCES "public"."cruise_itenary_dates_table"("id") ON DELETE no action ON UPDATE no action;