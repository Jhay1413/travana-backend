CREATE TABLE "passengers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar,
	"age" numeric,
	"quote_id" uuid,
	"lounge_pass_id" uuid
);
--> statement-breakpoint
CREATE TABLE "quote_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid,
	"travel_date" date,
	"discounts" numeric(10, 2),
	"service_charge" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "quote_accomodation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_operator_id" uuid,
	"no_of_nights" varchar,
	"room_type" varchar,
	"board_basis" varchar,
	"is_primary" boolean,
	"is_included_in_package" boolean,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2),
	"accomodation_id" uuid,
	"quote_id" uuid
);
--> statement-breakpoint
CREATE TABLE "quote_airport_parking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid,
	"airport_id" uuid,
	"parking_type" varchar,
	"car_make" varchar,
	"colour" varchar,
	"car_reg_number" varchar,
	"duration" varchar,
	"tour_operator_id" uuid,
	"is_included_in_package" boolean,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "quote_attraction_ticket" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid,
	"tour_operator_id" uuid,
	"ticket_type" varchar,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2),
	"number_of_tickets" numeric,
	"is_included_in_package" boolean
);
--> statement-breakpoint
CREATE TABLE "quote_car_hire" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid,
	"tour_operator_id" uuid,
	"pick_up_location" varchar,
	"drop_off_location" varchar,
	"pick_up_time" date,
	"drop_off_time" date,
	"no_of_days" numeric,
	"driver_age" numeric,
	"is_included_in_package" boolean,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "quote_flights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid,
	"departing_airport_id" uuid,
	"arrival_airport_id" uuid,
	"tour_operator_id" uuid,
	"flight_type" varchar,
	"departure_date" date,
	"arrival_date" date,
	"is_included_in_package" boolean,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "quote_lounge_pass" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid,
	"terminal" varchar,
	"tour_operator_id" uuid,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2),
	"is_included_in_package" boolean,
	"note" varchar
);
--> statement-breakpoint
CREATE TABLE "quote_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_operator_id" uuid,
	"pick_up_location" varchar,
	"drop_off_location" varchar,
	"pick_up_time" date,
	"drop_off_time" date,
	"is_included_in_package" boolean,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2),
	"quote_id" uuid,
	"note" varchar
);
--> statement-breakpoint
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_lounge_pass_id_quote_lounge_pass_id_fk" FOREIGN KEY ("lounge_pass_id") REFERENCES "public"."quote_lounge_pass"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_table" ADD CONSTRAINT "quote_table_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_accomodation" ADD CONSTRAINT "quote_accomodation_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_accomodation" ADD CONSTRAINT "quote_accomodation_accomodation_id_accomodation_list_table_id_fk" FOREIGN KEY ("accomodation_id") REFERENCES "public"."accomodation_list_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_accomodation" ADD CONSTRAINT "quote_accomodation_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_airport_parking" ADD CONSTRAINT "quote_airport_parking_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_airport_parking" ADD CONSTRAINT "quote_airport_parking_airport_id_airport_table_id_fk" FOREIGN KEY ("airport_id") REFERENCES "public"."airport_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_airport_parking" ADD CONSTRAINT "quote_airport_parking_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_attraction_ticket" ADD CONSTRAINT "quote_attraction_ticket_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_attraction_ticket" ADD CONSTRAINT "quote_attraction_ticket_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_car_hire" ADD CONSTRAINT "quote_car_hire_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_car_hire" ADD CONSTRAINT "quote_car_hire_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_flights" ADD CONSTRAINT "quote_flights_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_flights" ADD CONSTRAINT "quote_flights_departing_airport_id_airport_table_id_fk" FOREIGN KEY ("departing_airport_id") REFERENCES "public"."airport_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_flights" ADD CONSTRAINT "quote_flights_arrival_airport_id_airport_table_id_fk" FOREIGN KEY ("arrival_airport_id") REFERENCES "public"."airport_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_flights" ADD CONSTRAINT "quote_flights_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_lounge_pass" ADD CONSTRAINT "quote_lounge_pass_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_lounge_pass" ADD CONSTRAINT "quote_lounge_pass_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_transfers" ADD CONSTRAINT "quote_transfers_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_transfers" ADD CONSTRAINT "quote_transfers_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE no action ON UPDATE no action;