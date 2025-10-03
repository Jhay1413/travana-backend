CREATE TABLE "client_file_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fileName" varchar,
	"fileUrl" varchar,
	"fileType" varchar,
	"clientId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_file_table" ADD CONSTRAINT "client_file_table_clientId_client_table_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."client_table"("id") ON DELETE cascade ON UPDATE no action;