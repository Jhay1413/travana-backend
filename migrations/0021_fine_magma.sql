CREATE TABLE "lodges_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"park_id" uuid,
	"lodge_code" varchar,
	"lodge_name" varchar,
	"adults" integer,
	"children" integer,
	"bedrooms" integer,
	"bathrooms" integer,
	"pets" integer,
	"sleeps" integer,
	"infants" integer
);
--> statement-breakpoint
CREATE TABLE "park_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"city" varchar,
	"country" varchar,
	"address" varchar,
	"park_code" varchar
);
--> statement-breakpoint
CREATE TABLE "park_images_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"park_id" uuid,
	"url" varchar
);
--> statement-breakpoint
ALTER TABLE "quote_lodge" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "quote_lodge" CASCADE;--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "cottages_table" RENAME COLUMN "bedroom" TO "bedrooms";--> statement-breakpoint
ALTER TABLE "cottages_table" RENAME COLUMN "image1" TO "image_1";--> statement-breakpoint
ALTER TABLE "cottages_table" RENAME COLUMN "image2" TO "image_2";--> statement-breakpoint
ALTER TABLE "cottages_table" RENAME COLUMN "detail_url" TO "details_url";--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "cottages_table" ALTER COLUMN "bathrooms" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "cottages_table" ALTER COLUMN "sleeps" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "cottages_table" ALTER COLUMN "pets" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "num_of_nights" varchar;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "pets" varchar;--> statement-breakpoint
ALTER TABLE "quote_table" ADD COLUMN "cottage_id" uuid;
ALTER TABLE "quote_table" ADD COLUMN "lodge_id" uuid;--> statement-breakpoint
ALTER TABLE "lodges_table" ADD CONSTRAINT "lodges_table_park_id_park_table_id_fk" FOREIGN KEY ("park_id") REFERENCES "public"."park_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "park_images_table" ADD CONSTRAINT "park_images_table_park_id_park_table_id_fk" FOREIGN KEY ("park_id") REFERENCES "public"."park_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_table" ADD CONSTRAINT "quote_table_cottage_id_cottages_table_id_fk" FOREIGN KEY ("cottage_id") REFERENCES "public"."cottages_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_table" ADD CONSTRAINT "quote_table_lodge_id_lodges_table_id_fk" FOREIGN KEY ("lodge_id") REFERENCES "public"."lodges_table"("id") ON DELETE no action ON UPDATE no action;