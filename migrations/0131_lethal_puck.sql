ALTER TABLE "client_file_table" ALTER COLUMN "createdAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "client_file_table" ADD COLUMN "fileName" varchar;--> statement-breakpoint
ALTER TABLE "client_file_table" DROP COLUMN "filename";