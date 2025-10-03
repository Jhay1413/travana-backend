CREATE TABLE "quote_cruise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cruise_line" varchar,
	"ship" varchar,
	"cruise_date" date,
	"cabin_type" varchar,
	"cruise_name" varchar,
	"pre_cruise_stay" numeric,
	"post_cruise_stay" numeric
);
--> statement-breakpoint
CREATE TABLE "quote_cruise_itinerary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_cruise_id" uuid,
	"day_number" numeric,
	"description" varchar
);
--> statement-breakpoint
ALTER TABLE "quote_table" DROP CONSTRAINT "quote_table_cruise_date_id_cruise_itenary_dates_table_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_cruise_item_extra" DROP CONSTRAINT "quote_cruise_item_extra_quote_id_quote_table_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "transfer_type" varchar;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "quote_cruise_id" uuid;--> statement-breakpoint
ALTER TABLE "quote_cruise_item_extra" ADD COLUMN "quote_cruise_id" uuid;--> statement-breakpoint
ALTER TABLE "quote_cruise_itinerary" ADD CONSTRAINT "quote_cruise_itinerary_quote_cruise_id_quote_cruise_id_fk" FOREIGN KEY ("quote_cruise_id") REFERENCES "public"."quote_cruise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_table" ADD CONSTRAINT "quote_table_quote_cruise_id_quote_cruise_id_fk" FOREIGN KEY ("quote_cruise_id") REFERENCES "public"."quote_cruise"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_cruise_item_extra" ADD CONSTRAINT "quote_cruise_item_extra_quote_cruise_id_quote_cruise_id_fk" FOREIGN KEY ("quote_cruise_id") REFERENCES "public"."quote_cruise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_table" DROP COLUMN "cruise_date_id";--> statement-breakpoint
ALTER TABLE "quote_cruise_item_extra" DROP COLUMN "quote_id";