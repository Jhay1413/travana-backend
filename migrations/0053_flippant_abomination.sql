ALTER TABLE "quote_accomodation" ALTER COLUMN "is_primary" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "quote_accomodation" ADD COLUMN "booking_ref" varchar;--> statement-breakpoint
ALTER TABLE "quote_airport_parking" ADD COLUMN "booking_ref" varchar;--> statement-breakpoint
ALTER TABLE "quote_attraction_ticket" ADD COLUMN "booking_ref" varchar;--> statement-breakpoint
ALTER TABLE "quote_car_hire" ADD COLUMN "booking_ref" varchar;--> statement-breakpoint
ALTER TABLE "quote_lounge_pass" ADD COLUMN "booking_ref" varchar;--> statement-breakpoint
ALTER TABLE "quote_transfers" ADD COLUMN "booking_ref" varchar;