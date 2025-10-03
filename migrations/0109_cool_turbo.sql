CREATE TABLE "agent_target_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"target_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'GBP',
	"description" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "agent_target_table" ADD CONSTRAINT "agent_target_table_agent_id_user_table_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."user_table"("id") ON DELETE cascade ON UPDATE no action;