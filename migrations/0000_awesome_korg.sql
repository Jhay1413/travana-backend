CREATE TABLE "client_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"firstName" varchar,
	"surename" varchar,
	"DOB" date,
	"phoneNumber" varchar,
	"email" varchar,
	"emailIsAllowed" boolean,
	"VMB" varchar,
	"VMBfirstAccess" varchar,
	"whatsAppVerified" boolean DEFAULT false,
	"mailAllowed" boolean DEFAULT false,
	"houseNumber" varchar,
	"city" varchar,
	"street" varchar,
	"country" varchar,
	"post_code" varchar,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cruise_destination_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar
);
--> statement-breakpoint
CREATE TABLE "cruise_line_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar
);
--> statement-breakpoint
CREATE TABLE "ship_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"cruise_line_id" uuid
);
--> statement-breakpoint
CREATE TABLE "port_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cruise_destination_id" uuid,
	"name" varchar
);
--> statement-breakpoint
CREATE TABLE "enquiry_board_basis" (
	"enquiry_id" uuid,
	"board_basis_id" uuid
);
--> statement-breakpoint
CREATE TABLE "enquiry_cruise_destination" (
	"enquiry_id" uuid,
	"cruise_destination_id" uuid
);
--> statement-breakpoint
CREATE TABLE "enquiry_cruise_line" (
	"cruise_line_id" uuid,
	"enquiry_id" uuid
);
--> statement-breakpoint
CREATE TABLE "enquiry_departure_airport" (
	"airport_id" uuid,
	"enquiry_id" uuid
);
--> statement-breakpoint
CREATE TABLE "enquiry_departure_port" (
	"port_id" uuid,
	"enquiry_id" uuid
);
--> statement-breakpoint
CREATE TABLE "enquiry_destination" (
	"destination_id" uuid,
	"enquiry_id" uuid
);
--> statement-breakpoint
CREATE TABLE "enquiry_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"holiday_type" varchar,
	"client_id" uuid,
	"agent_id" uuid,
	"travel_date" date,
	"adults" numeric,
	"children" numeric,
	"infants" numeric,
	"no_of_nights" numeric,
	"budget" numeric,
	"pre_cruise_stay" numeric,
	"post_cruise_stay" numeric
);
--> statement-breakpoint
CREATE TABLE "airport_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"airport_code" varchar,
	"airport_name" varchar,
	"destination_id" uuid
);
--> statement-breakpoint
CREATE TABLE "flights_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flight_id" varchar,
	"flight_number" varchar,
	"flight_route" varchar,
	"departure_date" date,
	"departure_time" varchar,
	"arrival_date" date,
	"arrival_time" varchar,
	"departure_airport_id" uuid,
	"destination_airport_id" uuid
);
--> statement-breakpoint
CREATE TABLE "notes_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" varchar,
	"enquiry_id" uuid,
	"agent_id" uuid
);
--> statement-breakpoint
CREATE TABLE "task_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid,
	"client_id" uuid,
	"assigned_by_id" uuid,
	"title" varchar,
	"task" varchar,
	"due_date" date,
	"priority" varchar,
	"status" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accomodation_list_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type_id" uuid,
	"name" varchar,
	"resort_id" uuid
);
--> statement-breakpoint
CREATE TABLE "accomodation_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar
);
--> statement-breakpoint
CREATE TABLE "board_basis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar
);
--> statement-breakpoint
CREATE TABLE "country_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_name" varchar,
	"country_code" varchar
);
--> statement-breakpoint
CREATE TABLE "destination_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"type" varchar,
	"country_id" uuid
);
--> statement-breakpoint
CREATE TABLE "resort_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"destination_id" uuid
);
--> statement-breakpoint
CREATE TABLE "user_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" varchar,
	"firstName" varchar,
	"lastName" varchar,
	"email" varchar,
	"phoneNumber" varchar,
	"accountId" varchar,
	CONSTRAINT "user_table_accountId_unique" UNIQUE("accountId")
);
--> statement-breakpoint
ALTER TABLE "ship_table" ADD CONSTRAINT "ship_table_cruise_line_id_cruise_line_table_id_fk" FOREIGN KEY ("cruise_line_id") REFERENCES "public"."cruise_line_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "port_table" ADD CONSTRAINT "port_table_cruise_destination_id_cruise_destination_table_id_fk" FOREIGN KEY ("cruise_destination_id") REFERENCES "public"."cruise_destination_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_board_basis" ADD CONSTRAINT "enquiry_board_basis_enquiry_id_enquiry_table_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiry_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_board_basis" ADD CONSTRAINT "enquiry_board_basis_board_basis_id_board_basis_id_fk" FOREIGN KEY ("board_basis_id") REFERENCES "public"."board_basis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_cruise_destination" ADD CONSTRAINT "enquiry_cruise_destination_enquiry_id_enquiry_table_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiry_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_cruise_destination" ADD CONSTRAINT "enquiry_cruise_destination_cruise_destination_id_cruise_destination_table_id_fk" FOREIGN KEY ("cruise_destination_id") REFERENCES "public"."cruise_destination_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_cruise_line" ADD CONSTRAINT "enquiry_cruise_line_cruise_line_id_cruise_line_table_id_fk" FOREIGN KEY ("cruise_line_id") REFERENCES "public"."cruise_line_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_cruise_line" ADD CONSTRAINT "enquiry_cruise_line_enquiry_id_enquiry_table_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiry_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_departure_airport" ADD CONSTRAINT "enquiry_departure_airport_airport_id_airport_table_id_fk" FOREIGN KEY ("airport_id") REFERENCES "public"."airport_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_departure_airport" ADD CONSTRAINT "enquiry_departure_airport_enquiry_id_enquiry_table_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiry_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_departure_port" ADD CONSTRAINT "enquiry_departure_port_port_id_port_table_id_fk" FOREIGN KEY ("port_id") REFERENCES "public"."port_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_departure_port" ADD CONSTRAINT "enquiry_departure_port_enquiry_id_enquiry_table_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiry_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_destination" ADD CONSTRAINT "enquiry_destination_destination_id_destination_table_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destination_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_destination" ADD CONSTRAINT "enquiry_destination_enquiry_id_enquiry_table_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiry_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD CONSTRAINT "enquiry_table_client_id_client_table_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD CONSTRAINT "enquiry_table_agent_id_user_table_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."user_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airport_table" ADD CONSTRAINT "airport_table_destination_id_destination_table_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destination_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flights_table" ADD CONSTRAINT "flights_table_departure_airport_id_airport_table_id_fk" FOREIGN KEY ("departure_airport_id") REFERENCES "public"."airport_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flights_table" ADD CONSTRAINT "flights_table_destination_airport_id_airport_table_id_fk" FOREIGN KEY ("destination_airport_id") REFERENCES "public"."airport_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_table" ADD CONSTRAINT "notes_table_enquiry_id_enquiry_table_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiry_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_table" ADD CONSTRAINT "notes_table_agent_id_user_table_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."user_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_table" ADD CONSTRAINT "task_table_agent_id_user_table_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."user_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_table" ADD CONSTRAINT "task_table_client_id_client_table_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_table" ADD CONSTRAINT "task_table_assigned_by_id_user_table_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."user_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accomodation_list_table" ADD CONSTRAINT "accomodation_list_table_type_id_accomodation_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."accomodation_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accomodation_list_table" ADD CONSTRAINT "accomodation_list_table_resort_id_resort_table_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resort_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "destination_table" ADD CONSTRAINT "destination_table_country_id_country_table_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."country_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resort_table" ADD CONSTRAINT "resort_table_destination_id_destination_table_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destination_table"("id") ON DELETE no action ON UPDATE no action;