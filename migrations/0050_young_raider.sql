CREATE TABLE "cruise_voyage_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"itinerary_id" uuid,
	"day_number" numeric,
	"description" varchar
);
--> statement-breakpoint
DROP TABLE "cruise_date_voyage_table" CASCADE;--> statement-breakpoint
DROP TABLE "cruise_itenary_dates_table" CASCADE;--> statement-breakpoint
ALTER TABLE "cruise_itenary_table" ADD COLUMN "date" date;--> statement-breakpoint
ALTER TABLE "cruise_voyage_table" ADD CONSTRAINT "cruise_voyage_table_itinerary_id_cruise_itenary_table_id_fk" FOREIGN KEY ("itinerary_id") REFERENCES "public"."cruise_itenary_table"("id") ON DELETE no action ON UPDATE no action;