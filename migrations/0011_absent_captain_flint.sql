ALTER TABLE "enquiry_resort" RENAME TO "enquiry_location";--> statement-breakpoint
ALTER TABLE "resort_table" RENAME TO "location_table";--> statement-breakpoint
ALTER TABLE "enquiry_location" RENAME COLUMN "resort_id" TO "location_id";--> statement-breakpoint
ALTER TABLE "accomodation_list_table" RENAME COLUMN "resort_id" TO "location_id";--> statement-breakpoint
ALTER TABLE "enquiry_location" DROP CONSTRAINT "enquiry_resort_resort_id_resort_table_id_fk";
--> statement-breakpoint
ALTER TABLE "enquiry_location" DROP CONSTRAINT "enquiry_resort_enquiry_id_enquiry_table_id_fk";
--> statement-breakpoint
ALTER TABLE "accomodation_list_table" DROP CONSTRAINT "accomodation_list_table_resort_id_resort_table_id_fk";
--> statement-breakpoint
ALTER TABLE "location_table" DROP CONSTRAINT "resort_table_destination_id_destination_table_id_fk";
--> statement-breakpoint
ALTER TABLE "enquiry_location" ADD CONSTRAINT "enquiry_location_location_id_location_table_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_location" ADD CONSTRAINT "enquiry_location_enquiry_id_enquiry_table_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiry_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accomodation_list_table" ADD CONSTRAINT "accomodation_list_table_location_id_location_table_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_table" ADD CONSTRAINT "location_table_destination_id_destination_table_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destination_table"("id") ON DELETE no action ON UPDATE no action;