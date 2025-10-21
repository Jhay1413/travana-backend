CREATE TYPE "public"."owner_type_enum" AS ENUM('package_holiday', 'hot_tub_break', 'cruise');--> statement-breakpoint
CREATE TABLE "deal_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_url" varchar,
	"s3Key" varchar,
	"owner_type" "owner_type_enum",
	"owner_id" text,
	"isPrimary" boolean DEFAULT false
);
