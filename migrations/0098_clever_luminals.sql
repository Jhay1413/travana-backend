ALTER TABLE "notification_v2" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "notification_v2" CASCADE;--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "message" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "date_created" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "is_read" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "reference_id" varchar;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "due_date" timestamp;