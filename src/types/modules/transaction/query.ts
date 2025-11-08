import { z } from 'zod';
import { clientQuerySchema } from '../client';
import { userMutationSchema } from '../user';
import { userQuerySchema } from '../user/query';
import { boardBasisQuerySchema } from '../accomodations';
import { cruiseLineQuerySchema, portQuerySchema } from '../cruise';
import { destinationQuerySchema } from '../destination';
import { airportQuerySchema } from '../airports';

export const resortQuerySchema = z.object({
  id: z.string(),
  name: z.string(),
  destination_id: z.nullable(z.string()),
  destination: z.nullable(destinationQuerySchema.optional()),
});

export const accomodationQuerySchema = z.object({
  id: z.string(),
  name: z.string(),
  resorts_id: z.string().nullable(),
  resorts: z.nullable(resortQuerySchema.optional()),
  type: z.nullable(z.object({
    id: z.string(),
    type: z.string(),
  }).optional()),
  description: z.nullable(z.string()).optional(),
});
export const bookingTypeQuerySchema = z.object({
  id: z.string(),
  type: z.string(),
});
export const notesQuerySchema = z.object({
  id: z.string(),
  description: z.string(),
  agent: z.string(),
  agent_id: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
  ago: z.string(),
  transaction_id: z.string(),
  replies: z.array(z.object({
    id: z.string(),
    description: z.string(),
    agent: z.string(),
    agent_id: z.string(),
    content: z.string(),
    createdAt: z.string().datetime(),
    ago: z.string(),
    transaction_id: z.string(),
  })).optional(),
});
export const enquiryQuerySchema = z.object({
  id: z.string(),
  status: z.enum(['on_quote', 'on_enquiry', 'on_booking']),
  enquiry_status: z.string(),
  holiday_type: z.string(),
  clientName: z.string(),
  agentName: z.string(),
  email: z.nullable(z.string()).optional(),
  clientId: z.string(),
  agentId: z.string().optional(),
  transactionId: z.string(),
  agent: userQuerySchema.optional(),
  travel_date: z.string().datetime(),
  adults: z.string(),
  children: z.string(),
  infants: z.string(),
  cabin_type: z.string(),
  flexible_date: z.string(),
  weekend_lodge: z.string(),
  flexibility_date: z.string(),
  no_of_nights: z.string(),
  accom_min_star_rating: z.string().optional(),
  budget: z.string(),
  no_of_guests: z.string(),
  no_of_pets: z.string(),
  pre_cruise_stay: z.string().nullable(),
  post_cruise_stay: z.string().nullable(),
  cruise_line: z.array(cruiseLineQuerySchema).nullable(),
  notes: z.array(notesQuerySchema).nullable(),
  board_basis: z.array(boardBasisQuerySchema).nullable(),
  departure_port: z.array(portQuerySchema).nullable(),
  enquiry_cruise_destination: z.array(destinationQuerySchema).nullable(),
  destination: z.array(destinationQuerySchema).nullable(),
  resorts: z.array(resortQuerySchema).nullable(),
  accomodation: z.array(accomodationQuerySchema).nullable(),
  departure_airport: z.array(airportQuerySchema).nullable(),
  accomodation_type_id: z.string().optional(),
  date_created: z.nullable(z.string().datetime()),
  date_expiry: z.nullable(z.string().datetime()),
  is_future_deal: z.nullable(z.boolean()).optional(),
  future_deal_date: z.nullable(z.date()).optional(),
  title: z.nullable(z.string()).optional(),
  lead_source: z.nullable(z.string()).optional(),
});

export const tourOperatorQuerySchema = z.object({
  id: z.string(),
  name: z.string(),
  tour_package_commission: z.array(
    z.object({
      percentage_commission: z.number(),
      package_type: z.string(),
      package_type_id: z.string(),
    })
  ),
});

export const enquiryPipelineSchema = z.object({
  id: z.string(),
  clientName: z.string(),
  no_of_nights: z.string(),
  agent_id: z.string(),
  client_id: z.string(),
  travel_date: z.string().datetime(),
  transactionId: z.string(),
  enquiry_status: z.string(),
  agentName: z.string(),
  is_expired: z.boolean().optional(),
  holiday_type: z.string(),
  status: z.string(),
  budget: z.string(),
  enquiry_cruise_destination: z.array(destinationQuerySchema).nullable(),
  destination: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      country: z.string(),
    })
  ),
  title: z.nullable(z.string()).optional(),
});
export const quoteChild = z.object({
  id: z.string(),
  title: z.nullable(z.string()).optional(),
  status: z.nullable(z.string()).optional(),
  travel_date: z.nullable(z.string().datetime()).optional(),
  sales_price: z.nullable(z.number()).optional()
});
export const quotePipelineSchema = z.object({
  id: z.string(),
  no_of_nights: z.string(),
  travel_date: z.string().datetime(),
  status: z.enum(['on_quote', 'on_enquiry', 'on_booking']),
  clientName: z.string(),
  agent_id: z.string(),
  agentName: z.string(),
  client_id: z.string(),

  quote_type: z.string(),
  title: z.nullable(z.string()).optional(),
  holiday_type: z.string(),
  transaction_id: z.string(),
  lodge_destination: z.string().nullable(),
  cottage_destination: z.string().nullable(),
  cruise_destination: z.string().nullable(),
  holiday_destination: z.string().nullable(),
  overall_commission: z.string(),
  overall_cost: z.string().optional(),
  quote_status: z.string().optional(),
  children: z.array(quoteChild).optional(),
  is_expired: z.boolean().optional(),
});


export const quoteTitleSchema = z.object({
  id: z.string(),
  quote_type: z.string(),
  title: z.nullable(z.string()).optional(),
  quote_ref: z.nullable(z.string()).optional(),
  holiday_type: z.string(),
  transaction_id: z.string(),
  lodge_destination: z.string().nullable(),
  cottage_destination: z.string().nullable(),
  cruise_destination: z.string().nullable(),
  holiday_destination: z.string().nullable(),
  quote_status: z.string().optional(),
  children: z.array(quoteChild).optional(),
});


export const bookingPipelineSchema = z.object({
  id: z.string(),
  travel_date: z.string().datetime(),
  no_of_nights: z.string(),
  status: z.enum(['on_quote', 'on_enquiry', 'on_booking']),
  clientName: z.string(),
  agent_id: z.string(),
  agentName: z.string(),
  client_id: z.string(),
  holiday_type: z.string(),
  lodge_destination: z.string().nullable(),
  cottage_destination: z.string().nullable(),
  cruise_destination: z.string().nullable(),
  holiday_destination: z.string().nullable(),
  overall_commission: z.string(),
  overall_cost: z.string(),
  booking_status: z.string(),
});

export const lostPipelineSchema = z.union([enquiryPipelineSchema, quotePipelineSchema]);
export const transactionPipelineSchema = z.object({
  enquiry: z.array(enquiryPipelineSchema),
  quote: z.array(quotePipelineSchema),
  booking: z.array(bookingPipelineSchema),
  lost: z.array(lostPipelineSchema),
  profit_quote_in_progress: z.number(),
  profit_quote_ready: z.number(),
  profit_awaiting_decision: z.number(),
  profit_booking: z.number(),
  profit_lost: z.number(),
  percentage_budget: z.number(),
});

export const salesSummarySchema = z.object({
  id: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  phoneNumber: z.string(),
  destination: z.string(),
  no_of_nights: z.string(),
  board_basis: z.string(),
  amount: z.string(),
  travel_date: z.string(),
  title: z.nullable(z.string()).optional()
});

export const unionTransactionTypes = z.union([bookingPipelineSchema, enquiryPipelineSchema, quotePipelineSchema]);
export const cruiseDateQuerySchema = z.object({
  date: z.string(),

  itenary: z.string(),
  voyages: z.array(
    z.object({
      day_number: z.number(),
      description: z.string(),
    })
  ),
});
//Qoute types

// ✅ Reusable sub-schemas
export const FlightSchema = z.object({
  flight_number: z.string(),
  flight_ref: z.string(),
  departing_airport: z.string(),
  flight_type: z.string(),
  departure_date_time: z.string(), // You can add .datetime() if ISO is guaranteed
  arrival_airport: z.string(),
  arrival_date_time: z.string()
});

export const HotelSchema = z.object({
  country: z.string(),
  destination: z.string(),
  resort: z.string(),
  accommodation: z.string(),
  no_of_nights: z.string(),
  check_in_date_time: z.string(),
  room_type: z.string(),
  board_basis: z.string(),
  stay_type: z.string(),
  tour_operator: z.string(),
  cost: z.string(),
  hotel_description: z.string(),
  hotel_images: z.array(z.string()),
  room_description: z.string(),
  room_images: z.array(z.string())
});

// ✅ Generic Record<string, string> array schema
export const StringRecordArray = z.array(z.record(z.string(), z.string()));

// ✅ Main structured schema
export const StructuredScrapeDataSchema = z.object({
  travel_date: z.string(),
  tour_operator: z.string(),
  sales_price: z.string(),
  adults: z.number(),
  children: z.number(),
  infants: z.number(),
  no_of_nights: z.string(),
  transfer_type: z.string(),
  check_in_date_time: z.string(),
  departure_airport: z.string(),
  arrival_airport: z.string(),
  country: z.string(),
  destination: z.string(),
  resort: z.string(),
  accommodation: z.string(),
  board_basis: z.string(),
  room_type: z.string(),
  room_description: z.string(),
  hotel_description: z.string(),
  hotel_images: z.array(z.string()),
  room_images: z.array(z.string()),
  flights: z.array(FlightSchema),
  hotels: z.array(HotelSchema),
  transfers: StringRecordArray,
  attraction_tickets: StringRecordArray,
  car_hire: StringRecordArray,
  airport_parking: StringRecordArray,
  lounge_pass: StringRecordArray,
});




// Travel Deal Schema - matches the JSON file format
export const travelDealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional().default(""),
  travelDate: z.string().min(1, "Travel date is required"),
  nights: z.string().min(1, "Number of nights is required"),
  boardBasis: z.string().min(1, "Board basis is required"),
  departureAirport: z.string().min(1, "Departure airport is required"),
  luggageTransfers: z.string().min(1, "Luggage & transfers info is required"),
  price: z.string().optional().default(""),
});

export type TravelDeal = z.infer<typeof travelDealSchema>;

// Response from the API after generating the post
export interface GeneratedPostResponse {
  id?:string;
  post: string;
  subtitle: string;
  resortSummary: string;
  hashtags: string;
  deal: TravelDeal;
  deal_images?: string[];
}
