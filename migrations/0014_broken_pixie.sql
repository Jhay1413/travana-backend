ALTER TABLE "passengers" DROP CONSTRAINT "passengers_quote_id_quote_table_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_accomodation" DROP CONSTRAINT "quote_accomodation_quote_id_quote_table_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_airport_parking" DROP CONSTRAINT "quote_airport_parking_quote_id_quote_table_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_attraction_ticket" DROP CONSTRAINT "quote_attraction_ticket_quote_id_quote_table_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_car_hire" DROP CONSTRAINT "quote_car_hire_quote_id_quote_table_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_flights" DROP CONSTRAINT "quote_flights_quote_id_quote_table_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_lounge_pass" DROP CONSTRAINT "quote_lounge_pass_quote_id_quote_table_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_transfers" DROP CONSTRAINT "quote_transfers_quote_id_quote_table_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "sales_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "package_commission" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_accomodation" ADD CONSTRAINT "quote_accomodation_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_airport_parking" ADD CONSTRAINT "quote_airport_parking_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_attraction_ticket" ADD CONSTRAINT "quote_attraction_ticket_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_car_hire" ADD CONSTRAINT "quote_car_hire_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_flights" ADD CONSTRAINT "quote_flights_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_lounge_pass" ADD CONSTRAINT "quote_lounge_pass_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_transfers" ADD CONSTRAINT "quote_transfers_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE cascade ON UPDATE no action;