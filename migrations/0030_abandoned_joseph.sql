ALTER TABLE "transaction" RENAME COLUMN "holiday_type" TO "holiday_type_id";--> statement-breakpoint
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_holiday_type_package_type_table_id_fk";
--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_holiday_type_id_package_type_table_id_fk" FOREIGN KEY ("holiday_type_id") REFERENCES "public"."package_type_table"("id") ON DELETE no action ON UPDATE no action;