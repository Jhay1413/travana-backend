CREATE TABLE "ticket_reply_file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_reply_id" uuid,
	"file_name" varchar,
	"file_path" varchar,
	"file_size" varchar,
	"file_type" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ticket_reply_file" ADD CONSTRAINT "ticket_reply_file_ticket_reply_id_ticket_reply_id_fk" FOREIGN KEY ("ticket_reply_id") REFERENCES "public"."ticket_reply"("id") ON DELETE cascade ON UPDATE no action;