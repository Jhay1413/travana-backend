import { z } from 'zod';
import { clientMutationSchema } from '../client';
import { travelDealSchema } from './query';

export const enquiry_mutate_schema = z.object({
  id: z.nullable(z.string()).optional(),
  email: z.nullable(z.string()).optional(),
  lead_source: z.enum(['SHOP', 'FACEBOOK', 'WHATSAPP', 'INSTAGRAM', 'PHONE_ENQUIRY']).optional(),
  holiday_type_id: z.string(),
  title: z.nullable(z.string()).optional(),
  holiday_type_name: z.string().optional(),
  transaction_id: z.string().optional(),
  accomodation_type_id: z.nullable(z.string()).optional(),
  client_id: z.string(),
  agent_id: z.string(),
  travel_date: z.string(),
  flexibility_date: z.nullable(z.string()).optional(),
  adults: z.number().optional(),
  children: z.number().optional(),
  infants: z.number().optional(),
  cabin_type: z.nullable(z.string()).optional(),
  flexible_date: z.nullable(z.string()).optional(),
  weekend_lodge: z.nullable(z.string()).optional(),
  no_of_nights: z.nullable(z.string()),
  budget: z.number(),
  budget_type: z.nullable(z.enum(['PER_PERSON', 'PACKAGE'])).optional(),
  no_of_guests: z.number().optional(),
  no_of_pets: z.number().optional(),
  pre_cruise_stay: z.nullable(z.number()).optional(),
  post_cruise_stay: z.nullable(z.number()).optional(),
  accom_min_star_rating: z.nullable(z.string()).optional(),
  cruise_line: z.array(z.string()).optional(),
  notes: z.string().optional(),
  board_basis: z.array(z.string()).optional(),
  departure_port: z.array(z.string()).optional(),
  cruise_destination: z.array(z.string()).nullable().optional(),
  destination: z.array(z.string()).nullable().optional(),
  resorts: z.array(z.string()).nullable().optional(),
  accomodation: z.array(z.string()).nullable().optional(),
  departure_airport: z.array(z.string()).optional(),
  country_id: z.array(z.string()).optional(),
  client_name: z.string().optional(),
  is_future_deal: z.boolean(),
  future_deal_date: z.nullable(z.string().date()).optional(),
  date_expiry: z.nullable(z.string().date()).optional(),

  referralId: z.nullable(z.string()).optional(),
  referrerId: z.nullable(z.string()).optional(),
  potentialCommission: z.nullable(z.number()).optional(),
});
export const noteMutateSchema = z.object({
  description: z.string(),
  agent_id: z.string(),
  transaction_id: z.string(),
  parent_id: z.string().optional(),
});
export const resortMutateSchema = z.object({
  country_id: z.string(),
  name: z.string(),
  destination_id: z.string(),
});
export const destinationMutateSchema = z.object({
  name: z.string(),
  country_id: z.string(),
  resorts: z.array(resortMutateSchema).optional(),
});

export const accomodationMutateSchema = z.object({
  country: z.string(),
  destination: z.string(),
  name: z.string(),
  resort_id: z.string(),
  type_id: z.string(),
});

//Qoute types

export const owner_type_enum = z.enum(['package_holiday', 'hot_tub_break', 'cruise']);

export const deal_images = z.object({
  id: z.string().optional(),
  image_url: z.string().nullable(),
  s3Key: z.string().nullable(),
  owner_type: owner_type_enum,
  owner_id: z.string(),
  isPrimary: z.boolean()
})
export const quote_mutate_schema = z.object({
  quote_id: z.string().optional(),
  isQuoteCopy: z.boolean().optional(),
  isFreeQuote: z.boolean().optional(),
  lead_source: z.enum(['SHOP', 'FACEBOOK', 'WHATSAPP', 'INSTAGRAM', 'PHONE_ENQUIRY']).optional(),
  title: z.nullable(z.string()).optional(),
  quote_ref: z.nullable(z.string()).optional(),
  holiday_type_name: z.string().optional(),
  transaction_id: z.string().optional(),
  travel_date: z.string(),
  main_tour_operator_id: z.nullable(z.string()).optional(),
  sales_price: z
    .number()
    .or(z.string())
    .pipe(z.coerce.number())
    .optional()
    .refine((val) => val === undefined || val !== 0, {
      message: 'Sales price cannot be 0',
    }),
  price_per_person: z
    .number()
    .or(z.string())
    .pipe(z.coerce.number())
    .optional(),
  commission: z.number().optional(),
  discount: z.number().or(z.string()).pipe(z.coerce.number()).optional(),
  service_charge: z.number().or(z.string()).pipe(z.coerce.number()).optional(),
  quote_type: z.string().optional(),
  holiday_type: z.string(),
  agent_id: z.string().trim().min(1, 'Required'),
  client_id: z.nullable(z.string()).optional(),
  adults: z.number().optional(),
  children: z.number().optional(),
  infants: z.number().optional(),
  no_of_nights: z.nullable(z.string()).optional(),
  transfer_type: z.string().optional(),
  check_in_date_time: z.string().optional(),
  is_future_deal: z.boolean(),
  future_deal_date: z.nullable(z.string().date()).optional(),
  date_expiry: z.nullable(z.string().date()).optional(),
  clientInfo: clientMutationSchema.optional(),

  //package holiday
  country: z.string().optional(),
  destination: z.string().optional(),
  resort: z.string().optional(),
  accomodation_id: z.string().optional(),
  accomodation_type: z.string().optional(),
  main_board_basis_id: z.string().optional(),
  room_type: z.nullable(z.string()).optional(),
  is_primary: z.optional(z.boolean()),

  //hot tub
  lodge_id: z.nullable(z.string()).optional(),
  pets: z.number().optional(),
  lodge_park_name: z.string().optional(),
  lodge_type: z.nullable(z.string()).optional(),
  cottage_id: z.nullable(z.string()).optional(),
  lodge_code: z.string().optional(),

  //cruise
  quote_cruise_id: z.string().optional(),
  cruise_date: z.string().datetime().optional(),
  cabin_type: z.string().optional(),
  cruise_line: z.string().optional(),
  cruise_ship: z.string().optional(),
  cruise_name: z.string().optional(),
  pre_cruise_stay: z.string().optional(),
  post_cruise_stay: z.string().optional(),
  quote_cruise_extra: z.array(z.string()).optional(),

  deal_images: z.array(z.string()).optional(),

  passengers: z
    .array(
      z.object({
        id: z.string().optional(),
        type: z.string().optional(),
        age: z.number().optional(),
      })
    )
    .optional(),
  voyages: z
    .array(
      z.object({
        day_number: z.number(),
        description: z.string(),
      })
    )
    .optional(),
  flights: z
    .array(
      z.object({
        id: z.string().optional(),
        flight_number: z.nullable(z.string()).optional(),
        flight_ref: z.nullable(z.string()).optional(),
        departing_airport_id: z.string().trim().min(1, 'Required'),
        flight_type: z.string().trim().min(1, 'Required'),
        departure_date_time: z.string(),
        arrival_airport_id: z.string().trim().min(1, 'Required'),
        arrival_date_time: z.string(),
        is_included_in_package: z.boolean(),
        cost: z.number().optional(),
        commission: z.number().optional(),
      })
    )
    .optional(),
  hotels: z
    .array(
      z.object({
        id: z.string().optional(),
        booking_ref: z.nullable(z.string()).optional(),
        country: z.string().trim().min(1, 'Required'),
        destination: z.string().trim().min(1, 'Required'),
        resort: z.string().trim().min(1, 'Required'),
        accomodation_id: z.string().trim().min(1, 'Required'),
        no_of_nights: z.string().trim().min(1, 'Required'),
        check_in_date_time: z.string(),
        room_type: z.string().trim().min(1, 'Required'),
        board_basis_id: z.string().trim().min(1, 'Required'),
        stay_type: z.nullable(z.string()).optional(),
        tour_operator_id: z.string().optional(),
        cost: z.number(),
        is_primary: z.optional(z.boolean()),
        commission: z.number(),
        is_included_in_package: z.boolean(),
      })
    )
    .optional(),
  transfers: z
    .array(
      z.object({
        id: z.string().optional(),
        booking_ref: z.nullable(z.string()).optional(),
        pick_up_location: z.string().trim().min(1, 'Required'),
        pick_up_location_type: z.string().optional(),
        pick_up_time: z.string().datetime(),
        tour_operator_id: z.string().optional(),
        cost: z.number(),
        commission: z.number(),
        note: z.string().optional(),
        drop_off_location: z.string().trim().min(1, 'Required'),
        drop_off_time: z.string().datetime(),
        is_included_in_package: z.boolean(),
      })
    )
    .optional(),
  attraction_tickets: z
    .array(
      z.object({
        id: z.string().optional(),
        booking_ref: z.nullable(z.string()).optional(),
        ticket_type: z.string().trim().min(1, 'Required'),
        date_of_visit: z.string().datetime(),
        tour_operator_id: z.string().optional(),
        cost: z.number(),
        commission: z.number(),
        number_of_tickets: z.number(),
        is_included_in_package: z.boolean(),
      })
    )
    .optional(),
  car_hire: z
    .array(
      z.object({
        id: z.string().optional(),
        booking_ref: z.nullable(z.string()).optional(),
        pick_up_location: z.string().trim().min(1, 'Required'),
        pick_up_location_type: z.string().optional(),
        pick_up_time: z.string().datetime(),
        no_of_days: z.number(),
        tour_operator_id: z.string().optional(),
        cost: z.number(),
        commission: z.number(),
        driver_age: z.number(),
        drop_off_location: z.string().trim().min(1, 'Required'),
        drop_off_time: z.string().datetime(),
        drop_off_type: z.string().optional(),
        is_included_in_package: z.boolean(),
      })
    )
    .optional(),
  airport_parking: z
    .array(
      z.object({
        id: z.string().optional(),
        booking_ref: z.nullable(z.string()).optional(),
        airport_id: z.string().trim().min(1, 'Required'),
        tour_operator_id: z.string().optional(),
        parking_type: z.string().trim().min(1, 'Required'),
        duration: z.string().trim().min(1, 'Required'),
        cost: z.number(),
        parking_date: z.string().datetime(),
        commission: z.number(),
        make: z.string().optional(),
        model: z.string().optional(),
        colour: z.string().trim().min(1, 'Required'),
        car_reg_number: z.string().trim().min(1, 'Required'),
        is_included_in_package: z.boolean(),
      })
    )
    .optional(),
  lounge_pass: z
    .array(
      z.object({
        id: z.string().optional(),
        booking_ref: z.nullable(z.string()).optional(),
        airport_id: z.string().trim().min(1, 'Required'),
        terminal: z.string().trim().min(1, 'Required'),
        tour_operator_id: z.string().optional(),
        date_of_usage: z.string().datetime(),
        cost: z.number(),
        commission: z.number(),
        note: z.string().optional(),
        adults: z.number().optional(),
        children: z.number().optional(),
        infants: z.number().optional(),
        is_included_in_package: z.boolean(),
      })
    )
    .optional(),
  referralId: z.nullable(z.string()).optional(),
  referrerId: z.nullable(z.string()).optional(),
  potentialCommission: z.nullable(z.number()).optional(),
  travelDeal: z.nullable(z.object({
    post: z.string(),
    subtitle: z.string(),
    resortSummary: z.string(),
    hashtags: z.string(),
    deal: travelDealSchema,
  })).optional(),
});

export const requiredHolidayFields = quote_mutate_schema.merge(
  z.object({
    main_tour_operator_id: z.string(),
    holiday_type: z.string(),
    no_of_nights: z.string(),
    transfer_type: z.string(),
    check_in_date_time: z.string().datetime(),
    accomodation_id: z.string(),
    main_board_basis_id: z.string(),
    room_type: z.string(),
  })
);

export const requiredHotTubFields = quote_mutate_schema.merge(
  z.object({
    lodge_id: z.string().min(1, 'Required'),
    pets: z.number().min(0, 'Required'),
    lodge_park_name: z.string().min(1, 'Required'),
  })
);
export const requiredCruiseFields = quote_mutate_schema.merge(
  z.object({
    cruise_date: z.string().datetime(),
    cabin_type: z.string(),
    cruise_line: z.string(),
    cruise_ship: z.string(),
    cruise_name: z.string(),
    pre_cruise_stay: z.string(),
    post_cruise_stay: z.string(),
  })
);


export type InquiryMutate = z.infer<typeof enquiry_mutate_schema>;