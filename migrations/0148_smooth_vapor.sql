ALTER TABLE "ticket" ALTER COLUMN "category" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "subject" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "priority" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_reply" ALTER COLUMN "reply" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_reply" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_reply" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "ticket_type" varchar(20);