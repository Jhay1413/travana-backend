ALTER TABLE "quote_table" ALTER COLUMN "discounts" SET DATA TYPE integer USING discounts::integer;--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "discounts" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "discounts" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "num_of_nights" SET DATA TYPE integer USING num_of_nights::integer;--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "num_of_nights" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "num_of_nights" SET NOT NULL;