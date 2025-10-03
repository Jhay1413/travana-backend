CREATE TABLE "quote_lodge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid,
	"no_of_nights" varchar,
	"pets" numeric,
	"cottages_id" uuid,
	"cost" numeric(10, 2),
	"commission" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "cottages_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cottage_name" varchar,
	"location" varchar,
	"cottage_code" varchar,
	"bedroom" numeric,
	"bathrooms" numeric,
	"sleeps" numeric,
	"pets" numeric,
	"image1" varchar,
	"image2" varchar,
	"detail_url" varchar
);
--> statement-breakpoint