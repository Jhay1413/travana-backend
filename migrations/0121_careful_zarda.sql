CREATE TABLE "client_file_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar NOT NULL,
	"fileUrl" varchar NOT NULL,
	"clientId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
