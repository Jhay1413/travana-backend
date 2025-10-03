CREATE TYPE "public"."lead_source" AS ENUM('SHOP', 'FACEBOOK', 'WHATSAPP', 'INSTAGRAM');--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "lead_source" "lead_source" DEFAULT 'SHOP';