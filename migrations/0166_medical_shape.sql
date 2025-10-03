ALTER TABLE "booking_table" ALTER COLUMN "transaction_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_table" ALTER COLUMN "holiday_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_table" ALTER COLUMN "hays_ref" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_table" ALTER COLUMN "supplier_ref" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_table" ALTER COLUMN "travel_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_table" ALTER COLUMN "num_of_nights" SET DATA TYPE integer USING num_of_nights::integer;;--> statement-breakpoint
ALTER TABLE "booking_table" ALTER COLUMN "num_of_nights" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_table" ALTER COLUMN "pets" SET DATA TYPE integer USING pets::integer;;--> statement-breakpoint
ALTER TABLE "booking_table" ALTER COLUMN "pets" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_table" ALTER COLUMN "infant" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "booking_table" ALTER COLUMN "infant" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_table" ALTER COLUMN "child" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "booking_table" ALTER COLUMN "child" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_table" ALTER COLUMN "adult" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "booking_table" ALTER COLUMN "adult" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_accomodation" ALTER COLUMN "no_of_nights" SET DATA TYPE integer USING no_of_nights::integer;;--> statement-breakpoint
ALTER TABLE "booking_accomodation" ALTER COLUMN "no_of_nights" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_attraction_ticket" ALTER COLUMN "number_of_tickets" SET DATA TYPE integer USING number_of_tickets::integer;;--> statement-breakpoint
ALTER TABLE "booking_car_hire" ALTER COLUMN "no_of_days" SET DATA TYPE integer USING no_of_days::integer;;--> statement-breakpoint
ALTER TABLE "booking_car_hire" ALTER COLUMN "driver_age" SET DATA TYPE integer USING driver_age::integer;;--> statement-breakpoint
ALTER TABLE "booking_cruise" ALTER COLUMN "pre_cruise_stay" SET DATA TYPE integer USING pre_cruise_stay::integer;;--> statement-breakpoint
ALTER TABLE "booking_cruise" ALTER COLUMN "post_cruise_stay" SET DATA TYPE integer USING post_cruise_stay::integer;;--> statement-breakpoint
ALTER TABLE "booking_cruise_itinerary" ALTER COLUMN "day_number" SET DATA TYPE integer USING day_number::integer;;--> statement-breakpoint
ALTER TABLE "client_table" ALTER COLUMN "firstName" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "client_table" ALTER COLUMN "surename" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "client_table" ALTER COLUMN "phoneNumber" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "adults" SET DATA TYPE integer USING adults::integer;;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "children" SET DATA TYPE integer USING children::integer;;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "infants" SET DATA TYPE integer USING infants::integer;;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "no_of_nights" SET DATA TYPE integer USING no_of_nights::integer;;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "no_of_guests" SET DATA TYPE integer USING no_of_guests::integer;;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "no_of_pets" SET DATA TYPE integer USING no_of_pets::integer;;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "pre_cruise_stay" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "pre_cruise_stay" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "post_cruise_stay" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "enquiry_table" ALTER COLUMN "post_cruise_stay" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "passengers" ALTER COLUMN "age" SET DATA TYPE integer USING age::integer;;--> statement-breakpoint
ALTER TABLE "passengers" ALTER COLUMN "age" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "transaction_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "holiday_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "travel_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_table" ALTER COLUMN "quote_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_accomodation" ALTER COLUMN "no_of_nights" SET DATA TYPE integer USING no_of_nights::integer;;--> statement-breakpoint
ALTER TABLE "quote_accomodation" ALTER COLUMN "no_of_nights" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_attraction_ticket" ALTER COLUMN "number_of_tickets" SET DATA TYPE integer USING number_of_tickets::integer;;--> statement-breakpoint
ALTER TABLE "quote_attraction_ticket" ALTER COLUMN "number_of_tickets" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_car_hire" ALTER COLUMN "no_of_days" SET DATA TYPE integer USING no_of_days::integer;;--> statement-breakpoint
ALTER TABLE "quote_car_hire" ALTER COLUMN "no_of_days" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_car_hire" ALTER COLUMN "driver_age" SET DATA TYPE integer USING driver_age::integer;;--> statement-breakpoint
ALTER TABLE "quote_car_hire" ALTER COLUMN "driver_age" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_cruise_itinerary" ALTER COLUMN "day_number" SET DATA TYPE integer USING day_number::integer;;--> statement-breakpoint
ALTER TABLE "package_type_table" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "client_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "user_id" SET NOT NULL;