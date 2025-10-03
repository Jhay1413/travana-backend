CREATE TABLE "ticket_file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid,
	"file_name" varchar,
	"file_path" varchar,
	"file_size" varchar,
	"file_type" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ticket_reply" DROP CONSTRAINT "ticket_reply_ticket_id_ticket_id_fk";
--> statement-breakpoint
ALTER TABLE "ticket_file" ADD CONSTRAINT "ticket_file_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_reply" ADD CONSTRAINT "ticket_reply_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE no action;