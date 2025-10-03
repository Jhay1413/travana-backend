ALTER TABLE "enquiry_table" RENAME COLUMN "transcation_id" TO "transaction_id";--> statement-breakpoint
ALTER TABLE "enquiry_table" DROP CONSTRAINT "enquiry_table_transcation_id_unique";--> statement-breakpoint
ALTER TABLE "enquiry_table" DROP CONSTRAINT "enquiry_table_transcation_id_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD CONSTRAINT "enquiry_table_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD CONSTRAINT "enquiry_table_transaction_id_unique" UNIQUE("transaction_id");