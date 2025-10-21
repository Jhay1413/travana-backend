import { z } from 'zod';
import { bookingCruiseQuerySchema, bookingHotTubQuerySchema, bookingQuerySchema } from '../booking';
import { quoteCruiseQuerySchema, quoteHotTubQuerySchema, quotePackageHolidayQuerySchema } from '../quote';

export const financials = z.object({
  tour_name: z.string(),
  total_commission: z.number(),
});

export const flight = z.object({
  id: z.string(),
  tour_operator: z.string(),
  flight_number: z.nullable(z.string()).optional(),
  flight_ref: z.nullable(z.string()).optional(),
  departing_airport: z.string(),
  flight_type: z.string(),
  departure_date_time: z.date(),
  arrival_airport: z.string(),
  arrival_date_time: z.date(),
  is_included_in_package: z.boolean(),
  cost: z.number(),
  commission: z.number(),
});
export const hotels = z.object({
  id: z.string(),
  booking_ref: z.nullable(z.string()).optional(),
  tour_operator: z.string(),
  board_basis: z.string(),
  no_of_nights: z.string(),
  room_type: z.string(),
  check_in_date_time: z.string(),
  cost: z.number(),
  commission: z.number(),
  accomodation: z.string(),
  resorts: z.string(),
  destination: z.string(),
  is_primary: z.boolean(),
  country: z.string(),
  stay_type: z.nullable(z.string()).optional(),
  is_included_in_package: z.boolean(),
  accomodation_id: z.string().optional(),
});

export const transfers = z.object({
  id: z.string(),
  booking_ref: z.nullable(z.string()).optional(),
  pick_up_location: z.string(),
  pick_up_location_type: z.string().optional(),
  pick_up_time: z.string(),
  tour_operator: z.string(),
  cost: z.number(),
  commission: z.number(),
  note: z.string(),
  drop_off_location: z.string(),
  drop_off_time: z.string(),
  is_included_in_package: z.boolean(),
});
export const attraction_ticket = z.object({
  id: z.string(),
  booking_ref: z.nullable(z.string()).optional(),
  ticket_type: z.string(),
  date_of_visit: z.date(),
  tour_operator: z.string(),
  cost: z.number(),
  commission: z.number(),
  number_of_tickets: z.number(),
  is_included_in_package: z.boolean(),
});
export const car_hire = z.object({
  id: z.string(),
  booking_ref: z.nullable(z.string()).optional(),
  tour_operator: z.string(),
  pick_up_location: z.string(),
  drop_off_location: z.string(),
  pick_up_time: z.date(),
  drop_off_time: z.date(),
  no_of_days: z.string(),
  driver_age: z.number(),
  is_included_in_package: z.boolean(),
  cost: z.number(),
  commission: z.number(),
});
export const airport_parking = z.object({
  id: z.string(),
  booking_ref: z.nullable(z.string()).optional(),
  airport: z.string(),
  parking_type: z.string(),
  car_make: z.string().optional(),
  car_model: z.string().optional(),
  colour: z.string(),
  parking_date: z.date(),
  car_reg_number: z.string(),
  duration: z.string(),
  tour_operator: z.string(),
  is_included_in_package: z.boolean(),
  cost: z.number(),
  commission: z.number(),
});
export const lounge_pass = z.object({
  id: z.string(),
  booking_ref: z.nullable(z.string()).optional(),
  terminal: z.string(),
  airport: z.string(),
  date_of_usage: z.date(),
  tour_operator: z.string(),
  cost: z.number(),
  commission: z.number(),
  is_included_in_package: z.boolean(),
  note: z.string(),
});
export const cruise_data = z.object({
  itenary: z.string().optional(), // Assuming the correct property is 'cruise_itinerary'
  cruise_line: z.string().optional(),
  cruise_ship: z.string().optional(),
  cruise_date: z.date().optional(),
  cruise_cabin_type: z.string().optional(), // Assuming 'cabin_type' is the correct property
  voyages: z
    .array(
      z.object({
        day_number: z.number(),
        description: z.string(),
      })
    )
    .optional(),
});

export const cruiseFields = z.object({
  cruise_line: z.string().optional(),
  cruise_ship: z.string().optional(),
  cruise_date: z.date().optional(),
  cabin_type: z.string().optional(),
  cruise_name: z.string().optional(),
  pre_cruise_stay: z.number().optional(),
  post_cruise_stay: z.number().optional(),
  overall_commission: z.number(),
  overall_cost: z.number(),
  cruise_extra: z.array(z.string()).optional(),
  financials: z.array(financials).optional(),
  voyages: z
    .array(
      z.object({
        day_number: z.number(),
        description: z.string(),
      })
    )
    .optional(),
});

export const hotTubFields = z.object({
  lodge_id: z.nullable(z.string()).optional(),
  lodge_name: z.nullable(z.string()).optional(),
  lodge_code: z.nullable(z.string()).optional(),
  park_name: z.nullable(z.string()).optional(),
  park_location: z.nullable(z.string()).optional(),
  park_code: z.nullable(z.string()).optional(),
  cottage_id: z.nullable(z.string()).optional(),
  cottage_name: z.nullable(z.string()).optional(),
  cottage_code: z.nullable(z.string()).optional(),
  cottage_location: z.nullable(z.string()).optional(),
});

export type cruise_data_type = z.infer<typeof cruise_data>;
export type lounge_pass_type = z.infer<typeof lounge_pass>;
export type airport_parking_type = z.infer<typeof airport_parking>;
export type car_hire_type = z.infer<typeof car_hire>;
export type attraction_ticket_type = z.infer<typeof attraction_ticket>;
export type transfers_type = z.infer<typeof transfers>;
export type hotels_type = z.infer<typeof hotels>;
export type flights = z.infer<typeof flight>;
