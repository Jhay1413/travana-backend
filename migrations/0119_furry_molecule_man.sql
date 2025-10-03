ALTER TABLE "deletion_codes" DROP CONSTRAINT "deletion_codes_created_by_user_table_id_fk";
--> statement-breakpoint
ALTER TABLE "deletion_codes" ADD COLUMN "code" varchar;--> statement-breakpoint
ALTER TABLE "deletion_codes" DROP COLUMN "created_by";