ALTER TABLE "ticket" ADD COLUMN "due_date" timestamp;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "completed_by" uuid;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_completed_by_user_table_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."user_table"("id") ON DELETE no action ON UPDATE no action;