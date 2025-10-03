CREATE TABLE "quote_cruise_item_extra" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cruise_extra_id" uuid,
	"quote_id" uuid
);
--> statement-breakpoint
CREATE TABLE "cruise_extra_item_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar
);
--> statement-breakpoint
ALTER TABLE "quote_cruise_item_extra" ADD CONSTRAINT "quote_cruise_item_extra_cruise_extra_id_cruise_extra_item_table_id_fk" FOREIGN KEY ("cruise_extra_id") REFERENCES "public"."cruise_extra_item_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_cruise_item_extra" ADD CONSTRAINT "quote_cruise_item_extra_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE cascade ON UPDATE no action;