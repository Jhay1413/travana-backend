ALTER TABLE "deal_images" ALTER COLUMN "owner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "deal_images" ADD CONSTRAINT "deal_images_owner_id_image_url_unique" UNIQUE("owner_id","image_url");