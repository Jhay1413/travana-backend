ALTER TABLE "cruise_itenary_table" DROP CONSTRAINT "cruise_itenary_table_ship_id_ship_table_id_fk";
--> statement-breakpoint
ALTER TABLE "ship_table" DROP CONSTRAINT "ship_table_cruise_line_id_cruise_line_table_id_fk";
--> statement-breakpoint
ALTER TABLE "cruise_voyage_table" DROP CONSTRAINT "cruise_voyage_table_itinerary_id_cruise_itenary_table_id_fk";
--> statement-breakpoint
ALTER TABLE "cruise_itenary_table" ADD CONSTRAINT "cruise_itenary_table_ship_id_ship_table_id_fk" FOREIGN KEY ("ship_id") REFERENCES "public"."ship_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ship_table" ADD CONSTRAINT "ship_table_cruise_line_id_cruise_line_table_id_fk" FOREIGN KEY ("cruise_line_id") REFERENCES "public"."cruise_line_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cruise_voyage_table" ADD CONSTRAINT "cruise_voyage_table_itinerary_id_cruise_itenary_table_id_fk" FOREIGN KEY ("itinerary_id") REFERENCES "public"."cruise_itenary_table"("id") ON DELETE cascade ON UPDATE no action;