ALTER TABLE "notes_table" DROP CONSTRAINT "notes_table_parent_id_notes_table_id_fk";
--> statement-breakpoint
ALTER TABLE "notes_table" ALTER COLUMN "parent_id" SET DATA TYPE varchar;