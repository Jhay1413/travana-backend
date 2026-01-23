ALTER TABLE "notification" ADD COLUMN "hoursDue" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "date_updated" timestamp DEFAULT now();