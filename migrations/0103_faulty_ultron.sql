CREATE TYPE "public"."todo_status" AS ENUM('PENDING', 'DONE');--> statement-breakpoint
CREATE TABLE "todo_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note" varchar,
	"status" "todo_status" DEFAULT 'PENDING',
	"createdAt" timestamp DEFAULT now() NOT NULL
);
