ALTER TABLE "quote_table" ALTER COLUMN "transfer_type" SET DEFAULT 'none';--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "transfer_type" SET NOT NULL;