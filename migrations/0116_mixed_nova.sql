DROP TABLE "deletion_id_table" CASCADE;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
DROP TYPE "public"."deletion_type";