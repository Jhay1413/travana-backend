ALTER TABLE "agent_target_table" ALTER COLUMN "year" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_target_table" ALTER COLUMN "month" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_target_table" ALTER COLUMN "target_amount" DROP NOT NULL;