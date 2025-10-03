ALTER TABLE "enquiry_table" DROP CONSTRAINT "enquiry_table_agent_id_user_table_id_fk";
--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "agent_id" uuid;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_agent_id_user_table_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."user_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_table" DROP COLUMN "agent_id";