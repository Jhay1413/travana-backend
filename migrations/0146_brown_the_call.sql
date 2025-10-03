DROP TABLE IF EXISTS chat_message_reads CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_participants CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TYPE IF EXISTS message_type CASCADE;
DROP TYPE IF EXISTS chat_role CASCADE;
DROP TYPE IF EXISTS chat_room_type CASCADE;

CREATE TYPE "public"."chat_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."chat_room_type" AS ENUM('direct', 'group');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'file', 'system');--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roomId" uuid,
	"senderId" uuid,
	"content" varchar,
	"message_type" varchar DEFAULT 'text',
	"is_read" boolean DEFAULT false,
	"timestamp" timestamp DEFAULT now(),
	"attachments" jsonb
);
--> statement-breakpoint
CREATE TABLE "chat_message_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid,
	"user_id" uuid,
	"read_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid,
	"user_id" uuid,
	"role" varchar DEFAULT 'member',
	"joined_at" timestamp DEFAULT now(),
	"is_online" boolean DEFAULT false,
	"last_seen" timestamp
);
--> statement-breakpoint
CREATE TABLE "chat_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"type" varchar DEFAULT 'direct',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_roomId_chat_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."chat_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_senderId_user_table_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."user_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_reads" ADD CONSTRAINT "chat_message_reads_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_reads" ADD CONSTRAINT "chat_message_reads_user_id_user_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_room_id_chat_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_user_id_user_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_table"("id") ON DELETE cascade ON UPDATE no action;