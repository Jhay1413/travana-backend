CREATE TABLE "ticket" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"status" varchar NOT NULL,
	"priority" varchar NOT NULL,
	"description" varchar NOT NULL,
	"client_id" uuid,
	"agent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_reply" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid,
	"reply" varchar NOT NULL,
	"agent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_client_id_client_table_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_agent_id_user_table_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."user_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_reply" ADD CONSTRAINT "ticket_reply_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_reply" ADD CONSTRAINT "ticket_reply_agent_id_user_table_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."user_table"("id") ON DELETE no action ON UPDATE no action;