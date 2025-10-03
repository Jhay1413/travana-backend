ALTER TABLE "notes_table" DROP CONSTRAINT "notes_table_enquiry_id_enquiry_table_id_fk";
--> statement-breakpoint
ALTER TABLE "notes_table" ADD COLUMN "transaction_id" uuid;--> statement-breakpoint
ALTER TABLE "notes_table" ADD CONSTRAINT "notes_table_transaction_id_user_table_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."user_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_table" DROP COLUMN "enquiry_id";