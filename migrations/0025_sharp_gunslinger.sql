ALTER TABLE "enquiry_table" DROP CONSTRAINT "enquiry_table_client_id_client_table_id_fk";
--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "client_id" uuid;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_client_id_client_table_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_table" DROP COLUMN "client_id";