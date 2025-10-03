ALTER TABLE "room_type" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "room_type" CASCADE;--> statement-breakpoint
ALTER TABLE "booking_table" ADD COLUMN "holiday_type_id" uuid;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "holiday_type_id" uuid;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "holiday_type_id" uuid;--> statement-breakpoint
ALTER TABLE "booking_table" ADD CONSTRAINT "booking_table_holiday_type_id_package_type_table_id_fk" FOREIGN KEY ("holiday_type_id") REFERENCES "public"."package_type_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD CONSTRAINT "enquiry_table_holiday_type_id_package_type_table_id_fk" FOREIGN KEY ("holiday_type_id") REFERENCES "public"."package_type_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_table" ADD CONSTRAINT "quote_table_holiday_type_id_package_type_table_id_fk" FOREIGN KEY ("holiday_type_id") REFERENCES "public"."package_type_table"("id") ON DELETE no action ON UPDATE no action;