ALTER TABLE "client_file_table" DROP CONSTRAINT "client_file_table_clientId_client_table_id_fk";
--> statement-breakpoint
ALTER TABLE "client_file_table" ADD COLUMN "filename" varchar;--> statement-breakpoint
ALTER TABLE "client_file_table" DROP COLUMN "fileName";--> statement-breakpoint
ALTER TABLE "client_file_table" DROP COLUMN "fileUrl";--> statement-breakpoint
ALTER TABLE "client_file_table" DROP COLUMN "fileType";--> statement-breakpoint
ALTER TABLE "client_file_table" DROP COLUMN "clientId";--> statement-breakpoint
ALTER TABLE "client_file_table" DROP COLUMN "createdAt";