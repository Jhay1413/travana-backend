ALTER TABLE "notification_v2" ALTER COLUMN "message" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_v2" ALTER COLUMN "date_created" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_v2" ALTER COLUMN "is_read" DROP NOT NULL;