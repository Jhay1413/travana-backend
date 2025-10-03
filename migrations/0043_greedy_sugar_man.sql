ALTER TABLE "quote_table" ALTER COLUMN "travel_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "quote_accomodation" ALTER COLUMN "check_in_date_time" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "quote_car_hire" ALTER COLUMN "pick_up_time" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "quote_car_hire" ALTER COLUMN "drop_off_time" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "quote_cruise" ALTER COLUMN "cruise_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "quote_flights" ALTER COLUMN "departure_date_time" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "quote_flights" ALTER COLUMN "arrival_date_time" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "quote_transfers" ALTER COLUMN "pick_up_time" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "quote_transfers" ALTER COLUMN "drop_off_time" SET DATA TYPE timestamp;