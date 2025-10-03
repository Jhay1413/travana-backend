ALTER TABLE "quote_table" ALTER COLUMN "discounts" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "discounts" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "discounts" DROP NOT NULL;