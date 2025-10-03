ALTER TABLE "client_file_table" ALTER COLUMN "filename" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "client_file_table" ALTER COLUMN "fileUrl" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "client_file_table" ALTER COLUMN "createdAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "client_file_table" ADD COLUMN "clientId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "client_file_table" ADD CONSTRAINT "client_file_table_clientId_client_table_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."client_table"("id") ON DELETE cascade ON UPDATE no action;