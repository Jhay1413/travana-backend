ALTER TABLE "client_table" ALTER COLUMN "whatsAppVerified" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "holiday_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "transaction_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "percentage_commission" integer;