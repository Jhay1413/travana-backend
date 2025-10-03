ALTER TABLE "enquiry_table" DROP CONSTRAINT "enquiry_table_transaction_id_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "enquiry_id" uuid;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_enquiry_id_enquiry_table_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiry_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_table" DROP COLUMN "transaction_id";