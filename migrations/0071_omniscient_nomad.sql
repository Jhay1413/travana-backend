ALTER TABLE "notes_table" DROP CONSTRAINT "notes_table_transaction_id_user_table_id_fk";
--> statement-breakpoint
ALTER TABLE "notes_table" ADD CONSTRAINT "notes_table_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;