ALTER TABLE "enquiry_table" RENAME COLUMN "caben_type" TO "cabin_type";--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "flexible_date" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "weekend_lodge" SET DATA TYPE varchar;