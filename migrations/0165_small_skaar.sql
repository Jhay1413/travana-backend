ALTER TABLE "quote_table" ALTER COLUMN "pets" SET DATA TYPE integer USING pets::integer;--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "pets" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "pets" SET NOT NULL;