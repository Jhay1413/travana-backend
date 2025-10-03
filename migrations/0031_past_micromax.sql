CREATE TABLE "cruise_date_voyage_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date_id" uuid,
	"day_number" numeric,
	"description" varchar
);
--> statement-breakpoint
CREATE TABLE "cruise_itenary_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ship_id" uuid,
	"itenary" varchar,
	"departure_port" varchar
);
--> statement-breakpoint
CREATE TABLE "cruise_itenary_dates_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"itenary_id" uuid,
	"date" varchar
);
--> statement-breakpoint
ALTER TABLE "cruise_date_voyage_table" ADD CONSTRAINT "cruise_date_voyage_table_date_id_cruise_itenary_dates_table_id_fk" FOREIGN KEY ("date_id") REFERENCES "public"."cruise_itenary_dates_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cruise_itenary_table" ADD CONSTRAINT "cruise_itenary_table_ship_id_ship_table_id_fk" FOREIGN KEY ("ship_id") REFERENCES "public"."ship_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cruise_itenary_dates_table" ADD CONSTRAINT "cruise_itenary_dates_table_itenary_id_cruise_itenary_table_id_fk" FOREIGN KEY ("itenary_id") REFERENCES "public"."cruise_itenary_table"("id") ON DELETE no action ON UPDATE no action;