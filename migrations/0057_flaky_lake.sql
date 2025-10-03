ALTER TABLE "quote_table" DROP CONSTRAINT "quote_table_quote_cruise_id_quote_cruise_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_cruise" ADD COLUMN "quote_id" uuid;--> statement-breakpoint
ALTER TABLE "quote_cruise" ADD CONSTRAINT "quote_cruise_quote_id_quote_table_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_table" DROP COLUMN "quote_cruise_id";--> statement-breakpoint
ALTER TABLE "quote_cruise" ADD CONSTRAINT "quote_cruise_quote_id_unique" UNIQUE("quote_id");