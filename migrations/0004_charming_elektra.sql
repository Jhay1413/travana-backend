ALTER TABLE "airport_table" RENAME COLUMN "destination_id" TO "country_id";--> statement-breakpoint
ALTER TABLE "airport_table" DROP CONSTRAINT "airport_table_destination_id_destination_table_id_fk";
--> statement-breakpoint
ALTER TABLE "airport_table" ADD CONSTRAINT "airport_table_country_id_country_table_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."country_table"("id") ON DELETE no action ON UPDATE no action;