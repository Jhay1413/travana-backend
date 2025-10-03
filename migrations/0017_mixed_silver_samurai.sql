ALTER TABLE "enquiry_location" RENAME TO "enquiry_resorts";--> statement-breakpoint
ALTER TABLE "location_table" RENAME TO "resorts_table";--> statement-breakpoint
ALTER TABLE "enquiry_resorts" RENAME COLUMN "location_id" TO "resorts_id";--> statement-breakpoint
ALTER TABLE "accomodation_list_table" RENAME COLUMN "location_id" TO "resorts_id";--> statement-breakpoint
ALTER TABLE "enquiry_resorts" DROP CONSTRAINT "enquiry_location_location_id_location_table_id_fk";
--> statement-breakpoint
ALTER TABLE "enquiry_resorts" DROP CONSTRAINT "enquiry_location_enquiry_id_enquiry_table_id_fk";
--> statement-breakpoint
ALTER TABLE "accomodation_list_table" DROP CONSTRAINT "accomodation_list_table_location_id_location_table_id_fk";
--> statement-breakpoint
ALTER TABLE "resorts_table" DROP CONSTRAINT "location_table_destination_id_destination_table_id_fk";
--> statement-breakpoint
ALTER TABLE "transaction" 
ALTER COLUMN "holiday_type" SET DATA TYPE uuid 
USING holiday_type::uuid;
ALTER TABLE "enquiry_resorts" ADD CONSTRAINT "enquiry_resorts_resorts_id_resorts_table_id_fk" FOREIGN KEY ("resorts_id") REFERENCES "public"."resorts_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_resorts" ADD CONSTRAINT "enquiry_resorts_enquiry_id_enquiry_table_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiry_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accomodation_list_table" ADD CONSTRAINT "accomodation_list_table_resorts_id_resorts_table_id_fk" FOREIGN KEY ("resorts_id") REFERENCES "public"."resorts_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resorts_table" ADD CONSTRAINT "resorts_table_destination_id_destination_table_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destination_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_holiday_type_package_type_table_id_fk" FOREIGN KEY ("holiday_type") REFERENCES "public"."package_type_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_table" DROP COLUMN "holiday_type";