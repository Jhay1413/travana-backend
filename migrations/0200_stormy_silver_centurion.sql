CREATE TABLE "enquiry_passenger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enquiry_id" uuid,
	"type" varchar,
	"age" integer
);
--> statement-breakpoint
ALTER TABLE "enquiry_passenger" ADD CONSTRAINT "enquiry_passenger_enquiry_id_enquiry_table_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiry_table"("id") ON DELETE cascade ON UPDATE no action;