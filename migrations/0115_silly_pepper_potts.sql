CREATE TYPE "public"."deletion_type" AS ENUM('QUOTE', 'BOOKING');--> statement-breakpoint
CREATE TABLE "deletion_id_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deletion_code" varchar(10) NOT NULL,
	"entity_id" uuid NOT NULL,
	"entity_type" "deletion_type" NOT NULL,
	"is_used" boolean DEFAULT false,
	"created_at" timestamp (0) with time zone DEFAULT now(),
	"used_at" timestamp (0) with time zone,
	"created_by" uuid,
	"used_by" uuid,
	CONSTRAINT "deletion_id_table_deletion_code_unique" UNIQUE("deletion_code")
);
