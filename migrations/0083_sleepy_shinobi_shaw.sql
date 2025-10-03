ALTER TABLE "enquiry_table" ADD COLUMN "is_future_deal" boolean;--> statement-breakpoint
ALTER TABLE "enquiry_table" ADD COLUMN "future_deal_date" date;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "is_future_deal" boolean;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "future_deal_date" date;