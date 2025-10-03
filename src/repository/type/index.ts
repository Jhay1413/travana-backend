import { car_hire, lounge_pass, attraction_ticket, airport_parking, hotels, transfers, flight } from '../../types/modules/shared/shared-types';
import z from 'zod';

export const inquiryResultType = z.object({
  id: z.string(),
  lead_source: z.enum(['SHOP', 'FACEBOOK', 'WHATSAPP', 'INSTAGRAM', 'PHONE_ENQUIRY']).nullable(),
  status: z.enum(['on_quote', 'on_enquiry', 'on_booking']).nullable(),
  title: z.string().nullable(),
  travel_date: z.string(),
  email: z.string().nullable(),
  holiday_type: z.string().nullable(),
  agentName: z.string().nullable(),
  clientName: z.string().nullable(),
  clientId: z.string().nullable(),
  agentId: z.string().nullable(),
  transactionId: z.string().nullable(),
  transaction: z.string().nullable(),
  adults: z.number().nullable(),
  children: z.number().nullable(),
  infants: z.number().nullable(),
  cabin_type: z.string().nullable(),
  flexible_date: z.string().nullable(),
  weekend_lodge: z.string().nullable(),
  flexibility_date: z.string().nullable(),
  no_of_nights: z.number().nullable(),
  accom_min_star_rating: z.string().nullable(),
  budget: z.string().nullable(),
  no_of_guests: z.number().nullable(),
  no_of_pets: z.number().nullable(),
  pre_cruise_stay: z.number().nullable(),
  post_cruise_stay: z.number().nullable(),
  date_created: z.date().nullable(),
  date_expiry: z.date().nullable(),
  enquiry_status: z.enum(['ACTIVE', 'LOST', 'INACTIVE', 'EXPIRED', 'NEW_LEAD']).nullable(),
  cruise_line: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
      })
    )
    .nullable()
    .optional(),
  board_basis: z
    .array(
      z.object({
        id: z.string(),
        type: z.string().nullable(),
      })
    )
    .nullable()
    .optional(),
  departure_port: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
      })
    )
    .nullable()
    .optional(),
  enquiry_cruise_destination: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
      })
    )
    .nullable()
    .optional(),
  destination: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
        country_name: z.string().nullable(),
      })
    )
    .nullable()
    .optional(),
  resorts: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
      })
    )
    .nullable()
    .optional(),
  accomodation: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
      })
    )
    .nullable()
    .optional(),
  departure_airport: z
    .array(
      z.object({
        id: z.string(),
        airport_name: z.string().nullable(),
      })
    )
    .nullable()
    .optional(),
});

export const inquiryResultForUpdateType = inquiryResultType
  .omit({
    cruise_line: true,
    board_basis: true,
    departure_port: true,
    enquiry_cruise_destination: true,
    destination: true,
    resorts: true,
    accomodation: true,
    departure_airport: true,
  })
  .extend({
    country_id: z.array(z.string()),
    cruise_line: z.array(z.string()),
    board_basis: z.array(z.string()),
    departure_port: z.array(z.string()),
    enquiry_cruise_destination: z.array(z.string()),
    destination: z.array(z.string()),
    resorts: z.array(z.string()),
    accomodation: z.array(z.string()),
    departure_airport: z.array(z.string()),
  });

export const allDealsQueryResult = z.object({
  id: z.string(),
  holiday_type: z.string(),
  clientName: z.string(),
  clientId: z.string(),
  agentId: z.string(),
  title: z.nullable(z.string()).optional(),
  agentName: z.string(),
  status: z.enum(['on_quote', 'on_enquiry', 'on_booking']),
  transaction_id: z.string(),
  sales_price: z.string(),
  package_commission: z.string(),
  travel_date: z.string(),
  discount: z.string(),
  service_charge: z.string(),
  num_of_nights: z.number(),
  quote_type: z.string(),
  transfer_type: z.string(),
  quote_status: z.string(),
  main_tour_operator: z.string(),
  infants: z.number(),
  children: z.number(),
  adults: z.number(),
  date_created: z.date(),
  date_expiry: z.date(),
  is_future_deal: z.boolean(),
  future_deal_date: z.nullable(z.date()).optional(),
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

  cruise_operator: z.nullable(z.string()).optional(),
  cruise_line: z.nullable(z.string()).optional(),
  cruise_ship: z.nullable(z.string()).optional(),
  cruise_date: z.nullable(z.date()).optional(),
  cabin_type: z.nullable(z.string()).optional(),
  cruise_name: z.nullable(z.string()).optional(),
  pre_cruise_stay: z.nullable(z.number()).optional(),
  post_cruise_stay: z.nullable(z.number()).optional(),
  voyages: z.nullable(z.array(z.object({
    id: z.string(),
    day_number: z.number(),
    description: z.string(),
  }))).optional(),
  cruise_extra: z.nullable(z.array(z.object({
    id: z.string(),
    name: z.string(),
  }))).optional(),
  overall_commission: z.nullable(z.string()).optional(),
  overall_cost: z.nullable(z.string()).optional(),
 passengers: z.nullable(z.array(z.object({
  id: z.string(),
  age: z.number(),
  type: z.string(),
 }))).optional(),
  hotels:z.array(hotels),
  transfers:z.array(transfers),
  car_hire:z.array(car_hire),
  attraction_tickets:z.array(attraction_ticket),
  lounge_pass:z.array(lounge_pass),
  airport_parking:z.array(airport_parking),
 flights:z.array(flight),



});
export type InquiryResult = z.infer<typeof inquiryResultType>;
export type InquiryResultForUpdate = z.infer<typeof inquiryResultForUpdateType>;
