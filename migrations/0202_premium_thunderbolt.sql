CREATE TABLE "task_snooze_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"snooze_until" timestamp NOT NULL,
	"snooze_duration_minutes" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task_snooze_table" ADD CONSTRAINT "task_snooze_table_task_id_task_table_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_snooze_table" ADD CONSTRAINT "task_snooze_table_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;