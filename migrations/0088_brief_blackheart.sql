CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message" varchar NOT NULL,
	"date_created" timestamp DEFAULT now() NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"date_read" timestamp
);
--> statement-breakpoint
CREATE TABLE "notification_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_token" ADD CONSTRAINT "notification_token_user_id_user_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_table"("id") ON DELETE cascade ON UPDATE no action;