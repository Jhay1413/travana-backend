CREATE TABLE "enquiry_accomodation" (
	"accomodation_id" uuid,
	"enquiry_id" uuid
);
--> statement-breakpoint
CREATE TABLE "enquiry_resort" (
	"resort_id" uuid,
	"enquiry_id" uuid
);
--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "accomodation_type_id" uuid;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "caben_type" varchar;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "flexible_date" boolean;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "weekend_lodge" boolean;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "no_of_guests" numeric;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "no_of_pets" numeric;--> statement-breakpoint
ALTER TABLE "enquiry_accomodation" ADD CONSTRAINT "enquiry_accomodation_accomodation_id_accomodation_list_table_id_fk" FOREIGN KEY ("accomodation_id") REFERENCES "public"."accomodation_list_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_accomodation" ADD CONSTRAINT "enquiry_accomodation_enquiry_id_enquiry_table_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiry_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_resort" ADD CONSTRAINT "enquiry_resort_resort_id_resort_table_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resort_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_resort" ADD CONSTRAINT "enquiry_resort_enquiry_id_enquiry_table_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiry_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD CONSTRAINT "enquiry_table_accomodation_type_id_accomodation_type_id_fk" FOREIGN KEY ("accomodation_type_id") REFERENCES "public"."accomodation_type"("id") ON DELETE no action ON UPDATE no action;