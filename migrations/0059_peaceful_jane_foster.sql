ALTER TABLE "booking_table" DROP CONSTRAINT "booking_table_booking_cruise_id_booking_cruise_id_fk";
--> statement-breakpoint
ALTER TABLE "booking_cruise" ADD COLUMN "booking_id" uuid;--> statement-breakpoint
ALTER TABLE "booking_cruise" ADD CONSTRAINT "booking_cruise_booking_id_booking_table_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_table" DROP COLUMN "booking_cruise_id";