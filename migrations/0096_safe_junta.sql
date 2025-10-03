CREATE TABLE "notification_v2" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar,
	"user_id" uuid NOT NULL,
	"message" varchar NOT NULL,
	"date_created" timestamp DEFAULT now() NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"date_read" timestamp,
	"reference_id" varchar,
	"due_date" timestamp
);
--> statement-breakpoint
ALTER TABLE "notification_v2" ADD CONSTRAINT "notification_v2_user_id_user_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_table"("id") ON DELETE cascade ON UPDATE no action;