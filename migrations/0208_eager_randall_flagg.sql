ALTER TABLE "ticket" DROP CONSTRAINT "ticket_completed_by_user_table_id_fk";
--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "completed_by" SET DATA TYPE text;
--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_completed_by_user_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;