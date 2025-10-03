ALTER TABLE "quote_airport_parking" ADD COLUMN "car_model" varchar;--> statement-breakpoint
ALTER TABLE "quote_cruise" ADD COLUMN "tour_operator_id" uuid;--> statement-breakpoint
ALTER TABLE "quote_lounge_pass" ADD COLUMN "airport_id" uuid;--> statement-breakpoint
ALTER TABLE "quote_cruise" ADD CONSTRAINT "quote_cruise_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_lounge_pass" ADD CONSTRAINT "quote_lounge_pass_airport_id_airport_table_id_fk" FOREIGN KEY ("airport_id") REFERENCES "public"."airport_table"("id") ON DELETE no action ON UPDATE no action;