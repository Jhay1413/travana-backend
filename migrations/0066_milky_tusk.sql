ALTER TABLE "passengers" DROP CONSTRAINT "passengers_lounge_pass_id_quote_lounge_pass_id_fk";
--> statement-breakpoint
ALTER TABLE "passengers" DROP CONSTRAINT "passengers_booking_id_booking_table_id_fk";
--> statement-breakpoint
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_lounge_pass_id_quote_lounge_pass_id_fk" FOREIGN KEY ("lounge_pass_id") REFERENCES "public"."quote_lounge_pass"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_booking_id_booking_table_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking_table"("id") ON DELETE cascade ON UPDATE no action;