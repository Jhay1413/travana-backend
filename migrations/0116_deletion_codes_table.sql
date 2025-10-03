CREATE TABLE IF NOT EXISTS "deletion_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deletion_code" text NOT NULL UNIQUE,
	"entity_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_by" text
); 