CREATE TABLE "deletion_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
ALTER TABLE "deletion_codes" ADD CONSTRAINT "deletion_codes_created_by_user_table_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user_table"("id") ON DELETE no action ON UPDATE no action;