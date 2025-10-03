CREATE TYPE "public"."transaction_status" AS ENUM('on_quote', 'on_enquiry', 'on_booking');--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "transaction_status",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "transction_id" uuid;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD CONSTRAINT "enquiry_table_transction_id_transaction_id_fk" FOREIGN KEY ("transction_id") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE no action;