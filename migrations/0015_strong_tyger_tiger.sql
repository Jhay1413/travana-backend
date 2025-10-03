ALTER TABLE "quote_table" DROP CONSTRAINT "quote_table_transaction_id_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_table" ADD CONSTRAINT "quote_table_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;