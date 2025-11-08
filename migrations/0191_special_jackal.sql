CREATE TABLE "travel_deal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"subtitle" varchar,
	"resortSummary" varchar,
	"hashtags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"travelDate" date,
	"nights" integer NOT NULL,
	"boardBasis" varchar,
	"departureAirport" varchar,
	"luggageTransfers" varchar,
	"price" numeric(10, 2),
	"quote_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "travel_deal" ADD CONSTRAINT "travel_deal_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE cascade ON UPDATE no action;