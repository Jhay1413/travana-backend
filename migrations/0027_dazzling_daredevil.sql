ALTER TABLE "transaction" DROP CONSTRAINT "transaction_enquiry_id_enquiry_table_id_fk";
--> statement-breakpoint
ALTER TABLE "transaction" DROP COLUMN "enquiry_id";