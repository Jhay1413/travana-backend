ALTER TABLE "booking_table" DROP CONSTRAINT "booking_table_transaction_id_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "booking_table" ADD CONSTRAINT "booking_table_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;