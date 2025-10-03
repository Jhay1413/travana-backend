ALTER TABLE "notification" ADD COLUMN "due_date" timestamp;--> statement-breakpoint
ALTER TABLE "notification_token" DROP COLUMN "due_date";