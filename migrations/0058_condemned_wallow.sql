ALTER TABLE "transaction" DROP CONSTRAINT "transaction_booking_id_booking_table_id_fk";
--> statement-breakpoint
ALTER TABLE "booking_table" ADD COLUMN "transaction_id" uuid;--> statement-breakpoint
ALTER TABLE "booking_table" ADD CONSTRAINT "booking_table_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" DROP COLUMN "booking_id";--> statement-breakpoint
ALTER TABLE "booking_table" ADD CONSTRAINT "booking_table_transaction_id_unique" UNIQUE("transaction_id");