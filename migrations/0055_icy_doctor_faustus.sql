CREATE TYPE "public"."booking_status" AS ENUM('BOOKED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "booking_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hays_ref" varchar,
	"supplier_ref" varchar,
	"sales_price" numeric(10, 2),
	"package_commission" numeric(10, 2),
	"travel_date" date,
	"discounts" numeric(10, 2),
	"service_charge" numeric(10, 2),
	"num_of_nights" varchar,
	"pets" varchar,
	"cottage_id" uuid,
	"lodge_id" uuid,
	"lodge_type" varchar,
	"transfer_type" varchar,
	"booking_status" "booking_status",
	"booking_cruise_id" uuid,
	"main_tour_operator_id" uuid
);
--> statement-breakpoint
CREATE TABLE "booking_accomodation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_ref" varchar,
	"tour_operator_id" uuid,
	"no_of_nights" varchar,
	"room_type" varchar,
	"board_basis_id" uuid,
	"check_in_date_time" timestamp,
	"stay_type" varchar,
	"is_primary" boolean DEFAULT false,
	"is_included_in_package" boolean,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2),
	"accomodation_id" uuid,
	"booking_id" uuid
);
--> statement-breakpoint
CREATE TABLE "booking_airport_parking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_ref" varchar,
	"booking_id" uuid,
	"airport_id" uuid,
	"parking_type" varchar,
	"parking_date" timestamp,
	"car_make" varchar,
	"car_model" varchar,
	"colour" varchar,
	"car_reg_number" varchar,
	"duration" varchar,
	"tour_operator_id" uuid,
	"is_included_in_package" boolean,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "booking_attraction_ticket" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid,
	"booking_ref" varchar,
	"tour_operator_id" uuid,
	"ticket_type" varchar,
	"date_of_visit" timestamp,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2),
	"number_of_tickets" numeric,
	"is_included_in_package" boolean
);
--> statement-breakpoint
CREATE TABLE "booking_car_hire" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid,
	"booking_ref" varchar,
	"tour_operator_id" uuid,
	"pick_up_location" varchar,
	"drop_off_location" varchar,
	"pick_up_time" timestamp,
	"drop_off_time" timestamp,
	"no_of_days" numeric,
	"driver_age" numeric,
	"is_included_in_package" boolean,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "booking_cruise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_operator_id" uuid,
	"cruise_line" varchar,
	"ship" varchar,
	"cruise_date" date,
	"cabin_type" varchar,
	"cruise_name" varchar,
	"pre_cruise_stay" numeric,
	"post_cruise_stay" numeric
);
--> statement-breakpoint
CREATE TABLE "booking_cruise_item_extra" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cruise_extra_id" uuid,
	"booking_cruise_id" uuid
);
--> statement-breakpoint
CREATE TABLE "booking_cruise_itinerary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_cruise_id" uuid,
	"day_number" numeric,
	"description" varchar
);
--> statement-breakpoint
CREATE TABLE "booking_flights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid,
	"flight_number" varchar,
	"flight_ref" varchar,
	"departing_airport_id" uuid,
	"arrival_airport_id" uuid,
	"tour_operator_id" uuid,
	"flight_type" varchar,
	"departure_date_time" timestamp,
	"arrival_date_time" timestamp,
	"is_included_in_package" boolean,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "booking_lounge_pass" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid,
	"booking_ref" varchar,
	"terminal" varchar,
	"airport_id" uuid,
	"date_of_usage" timestamp,
	"tour_operator_id" uuid,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2),
	"is_included_in_package" boolean,
	"note" varchar
);
--> statement-breakpoint
CREATE TABLE "booking_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_ref" varchar,
	"tour_operator_id" uuid,
	"pick_up_location" varchar,
	"drop_off_location" varchar,
	"pick_up_time" timestamp,
	"drop_off_time" timestamp,
	"is_included_in_package" boolean,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2),
	"booking_id" uuid,
	"note" varchar
);
--> statement-breakpoint
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_enquiry_id_enquiry_table_id_fk";
--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "transcation_id" uuid;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "booking_id" uuid;--> statement-breakpoint
ALTER TABLE "booking_table" ADD CONSTRAINT "booking_table_cottage_id_cottages_table_id_fk" FOREIGN KEY ("cottage_id") REFERENCES "public"."cottages_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_table" ADD CONSTRAINT "booking_table_lodge_id_lodges_table_id_fk" FOREIGN KEY ("lodge_id") REFERENCES "public"."lodges_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_table" ADD CONSTRAINT "booking_table_booking_cruise_id_booking_cruise_id_fk" FOREIGN KEY ("booking_cruise_id") REFERENCES "public"."booking_cruise"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_table" ADD CONSTRAINT "booking_table_main_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("main_tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_accomodation" ADD CONSTRAINT "booking_accomodation_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_accomodation" ADD CONSTRAINT "booking_accomodation_board_basis_id_board_basis_id_fk" FOREIGN KEY ("board_basis_id") REFERENCES "public"."board_basis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_accomodation" ADD CONSTRAINT "booking_accomodation_accomodation_id_accomodation_list_table_id_fk" FOREIGN KEY ("accomodation_id") REFERENCES "public"."accomodation_list_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_accomodation" ADD CONSTRAINT "booking_accomodation_booking_id_booking_table_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_airport_parking" ADD CONSTRAINT "booking_airport_parking_booking_id_booking_table_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_airport_parking" ADD CONSTRAINT "booking_airport_parking_airport_id_airport_table_id_fk" FOREIGN KEY ("airport_id") REFERENCES "public"."airport_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_airport_parking" ADD CONSTRAINT "booking_airport_parking_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_attraction_ticket" ADD CONSTRAINT "booking_attraction_ticket_booking_id_booking_table_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_attraction_ticket" ADD CONSTRAINT "booking_attraction_ticket_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_car_hire" ADD CONSTRAINT "booking_car_hire_booking_id_booking_table_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_car_hire" ADD CONSTRAINT "booking_car_hire_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_cruise" ADD CONSTRAINT "booking_cruise_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_cruise_item_extra" ADD CONSTRAINT "booking_cruise_item_extra_cruise_extra_id_cruise_extra_item_table_id_fk" FOREIGN KEY ("cruise_extra_id") REFERENCES "public"."cruise_extra_item_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_cruise_item_extra" ADD CONSTRAINT "booking_cruise_item_extra_booking_cruise_id_booking_cruise_id_fk" FOREIGN KEY ("booking_cruise_id") REFERENCES "public"."booking_cruise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_cruise_itinerary" ADD CONSTRAINT "booking_cruise_itinerary_booking_cruise_id_booking_cruise_id_fk" FOREIGN KEY ("booking_cruise_id") REFERENCES "public"."booking_cruise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_flights" ADD CONSTRAINT "booking_flights_booking_id_booking_table_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_flights" ADD CONSTRAINT "booking_flights_departing_airport_id_airport_table_id_fk" FOREIGN KEY ("departing_airport_id") REFERENCES "public"."airport_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_flights" ADD CONSTRAINT "booking_flights_arrival_airport_id_airport_table_id_fk" FOREIGN KEY ("arrival_airport_id") REFERENCES "public"."airport_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_flights" ADD CONSTRAINT "booking_flights_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_lounge_pass" ADD CONSTRAINT "booking_lounge_pass_booking_id_booking_table_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_lounge_pass" ADD CONSTRAINT "booking_lounge_pass_airport_id_airport_table_id_fk" FOREIGN KEY ("airport_id") REFERENCES "public"."airport_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_lounge_pass" ADD CONSTRAINT "booking_lounge_pass_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_transfers" ADD CONSTRAINT "booking_transfers_tour_operator_id_tour_operator_table_id_fk" FOREIGN KEY ("tour_operator_id") REFERENCES "public"."tour_operator_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_transfers" ADD CONSTRAINT "booking_transfers_booking_id_booking_table_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD CONSTRAINT "enquiry_table_transcation_id_transaction_id_fk" FOREIGN KEY ("transcation_id") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_booking_id_booking_table_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" DROP COLUMN "enquiry_id";--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD CONSTRAINT "enquiry_table_transcation_id_unique" UNIQUE("transcation_id");