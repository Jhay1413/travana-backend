CREATE TYPE "public"."account_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "account_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"phoneNumber" varchar,
	"firstName" varchar NOT NULL,
	"lastName" varchar NOT NULL,
	"role" varchar NOT NULL,
	"orgName" varchar,
	"status" "account_status" DEFAULT 'pending',
	"createdAt" timestamp (0) with time zone DEFAULT now(),
	"updatedAt" timestamp (0) with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "quote_cruise" DROP CONSTRAINT "quote_cruise_quote_id_unique";--> statement-breakpoint
ALTER TABLE "cruise_itenary_table" ALTER COLUMN "departure_port" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cruise_itenary_table" ALTER COLUMN "date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "pre_cruise_stay" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "pre_cruise_stay" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "pre_cruise_stay" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "post_cruise_stay" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "post_cruise_stay" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "post_cruise_stay" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_token" ALTER COLUMN "token" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_token" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_token" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_token" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_cruise" ALTER COLUMN "pre_cruise_stay" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "quote_cruise" ALTER COLUMN "pre_cruise_stay" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_cruise" ALTER COLUMN "post_cruise_stay" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "quote_cruise" ALTER COLUMN "post_cruise_stay" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_target_table" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_organization_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "org_name" text;--> statement-breakpoint
ALTER TABLE "booking_table" ADD COLUMN "deleted_by_user" text;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "sender_id" text;--> statement-breakpoint
ALTER TABLE "chat_message_reads" ADD COLUMN "user_id_v2" text;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD COLUMN "participant_id" text;--> statement-breakpoint
ALTER TABLE "notes_table" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "todo_table" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "user_id_v2" text;--> statement-breakpoint
ALTER TABLE "notification_token" ADD COLUMN "user_id_v2" text;--> statement-breakpoint
ALTER TABLE "task_table" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "task_table" ADD COLUMN "assigned_by_id_v2" text;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "created_by_user" text;--> statement-breakpoint
ALTER TABLE "ticket_reply" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_target_table" ADD CONSTRAINT "agent_target_table_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_table" ADD CONSTRAINT "booking_table_deleted_by_user_user_id_fk" FOREIGN KEY ("deleted_by_user") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_reads" ADD CONSTRAINT "chat_message_reads_user_id_v2_user_id_fk" FOREIGN KEY ("user_id_v2") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_participant_id_user_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_table" ADD CONSTRAINT "notes_table_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo_table" ADD CONSTRAINT "todo_table_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_v2_user_id_fk" FOREIGN KEY ("user_id_v2") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_token" ADD CONSTRAINT "notification_token_user_id_v2_user_id_fk" FOREIGN KEY ("user_id_v2") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_table" ADD CONSTRAINT "task_table_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_table" ADD CONSTRAINT "task_table_assigned_by_id_v2_user_id_fk" FOREIGN KEY ("assigned_by_id_v2") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_created_by_user_user_id_fk" FOREIGN KEY ("created_by_user") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_reply" ADD CONSTRAINT "ticket_reply_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;