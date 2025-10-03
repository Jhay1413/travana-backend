DROP TABLE "park_images_table" CASCADE;--> statement-breakpoint
ALTER TABLE "park_table" ADD COLUMN "image_1" varchar;--> statement-breakpoint
ALTER TABLE "park_table" ADD COLUMN "image_2" varchar;--> statement-breakpoint
ALTER TABLE "park_table" ADD COLUMN "location" varchar;--> statement-breakpoint
ALTER TABLE "park_table" ADD COLUMN "county" varchar;--> statement-breakpoint
ALTER TABLE "park_table" ADD COLUMN "code" varchar;--> statement-breakpoint
ALTER TABLE "park_table" ADD COLUMN "description" varchar;--> statement-breakpoint
ALTER TABLE "park_table" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "park_table" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "park_table" DROP COLUMN "park_code";