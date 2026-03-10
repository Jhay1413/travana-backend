ALTER TABLE "quote_table" DROP CONSTRAINT "quote_table_deleted_by_user_table_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_table" DROP CONSTRAINT "quote_table_deleted_by_v2_user_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_table" DROP COLUMN "deleted_by";--> statement-breakpoint
ALTER TABLE "quote_table" DROP COLUMN "deleted_by_v2";