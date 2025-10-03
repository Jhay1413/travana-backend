CREATE TABLE "historical_booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid,
	"booking_ref" varchar,
	"booking_date" date,
	"departure_date" date,
	"return_date" date,
	"gross_price" numeric,
	"net_price" numeric,
	"gross_before_discount" numeric,
	"profit" numeric,
	"total_payment" numeric,
	"destination_country" varchar,
	"product_type" varchar,
	"duration" numeric,
	"passegners" numeric,
	"adults" numeric,
	"children" numeric,
	"infants" numeric,
	"seniors" numeric,
	"cancelled" boolean,
	"cancelled_date" date,
	"main_supplier" varchar
);
--> statement-breakpoint
ALTER TABLE "historical_booking" ADD CONSTRAINT "historical_booking_client_id_client_table_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_table"("id") ON DELETE no action ON UPDATE no action;