import { z } from 'zod';
import {
  airport_parking,
  attraction_ticket,
  car_hire,
  cruise_data,
  cruiseFields,
  financials,
  flight,
  hotels,
  hotTubFields,
  lounge_pass,
  transfers,
} from '../shared';
import { deal_images } from '../transaction';
import { quote } from '@/schema/quote-schema';
import { tour_operator } from '@/schema/transactions-schema';

export const quoteQuerySummarySchema = z.object({
  id: z.string(),
  travel_date: z.string(),
  title: z.nullable(z.string()).optional(),
  transaction_id: z.string(),
  status: z.enum(['on_quote', 'on_enquiry', 'on_booking']),
  clientName: z.string(),
  agent_id: z.string(),
  agentName: z.string(),
  clientId: z.string(),
  no_of_nights: z.string(),
  holiday_type: z.string(),
  lodge_destination: z.string().nullable(),
  cottage_destination: z.string().nullable(),
  cruise_destination: z.string().nullable(),
  holiday_destination: z.string().nullable(),
  overall_commission: z.string(),
  overall_cost: z.string(),
  quote_status: z.string().optional(),
  date_expiry: z.nullable(z.date()).optional(),
  date_created: z.nullable(z.date()).optional(),
  is_future_deal: z.boolean(),
  future_deal_date: z.nullable(z.string().date()).optional(),
  quote_ref: z.nullable(z.string()).optional(),
});

export const quoteBasedSchema = z.object({
  id: z.string(),
  title: z.nullable(z.string()).optional(),
  holiday_type: z.string(),
  clientName: z.nullable(z.string()).optional(),
  clientId: z.nullable(z.string()).optional(),
  agentId: z.string().optional(),
  lead_source: z.nullable(z.string()).optional(),
  main_tour_operator: z.nullable(z.string()).optional(),
  agentName: z.string(),
  status: z.enum(['on_quote', 'on_enquiry', 'on_booking']),
  transaction_id: z.string(),
  sales_price: z.number(),
  package_commission: z.number(),
  travel_date: z.date(),
  discount: z.number(),
  service_charge: z.number(),
  num_of_nights: z.number(),
  quote_type: z.string().optional(),
  has_multiple_quotes: z.boolean().optional(),
  quote_status: z.string().optional(),
  flights: z.array(flight).optional(),
  hotels: z.array(hotels).optional(),
  transfers: z.array(transfers).optional(),
  attraction_tickets: z.array(attraction_ticket).optional(),
  car_hire: z.array(car_hire).optional(),
  airport_parking: z.array(airport_parking).optional(),
  lounge_pass: z.array(lounge_pass).optional(),
  transfer_type: z.string(),
  adults: z.number().optional(),
  children: z.number().optional(),
  infants: z.number().optional(),
  financials: z.array(financials).optional(),
  overall_cost: z.number(),
  overall_commission: z.number(),
  date_expiry: z.nullable(z.date()).optional(),
  date_created: z.nullable(z.date()).optional(),
  is_future_deal: z.nullable(z.boolean()).optional(),
  future_deal_date: z.nullable(z.date()).optional(),
  quote_ref: z.nullable(z.string()).optional(),

  deal_images: z.array(deal_images).optional(),

  referrals: z.array(z.object({
    id: z.string(),
    name: z.string(),
    commission: z.number(),
  })).optional(),
  passengers: z
    .array(
      z.object({
        id: z.string(),
        age: z.number(),
        type: z.string().nullable().transform((v) => v ?? 'adult'),
      })
    )
    .optional(),

  referrerName: z.nullable(z.string()).optional(),
  referrerId: z.nullable(z.string()).optional(),
  potentialCommission: z.nullable(z.number()).optional(),
  finalCommission: z.nullable(z.number()).optional(),
  referrerCommission: z.nullable(z.number()).optional(),
  hays_ref: z.nullable(z.string()).optional(),
  supplier_ref: z.nullable(z.string()).optional(),
});

export const quoteListQuerySchema = z.object({
  id: z.string(),
  quote_status: z.string(),
  travel_date: z.date(),
  transaction_id: z.string(),
  status: z.enum(['on_quote', 'on_enquiry', 'on_booking']),
  sales_price: z.number(),
  package_commission: z.number(),
  discount: z.number(),
  service_charge: z.number(),
  holiday_type: z.string().nullable(),
  client_name: z.string(),
  title: z.string().nullable(),
  clientId: z.string(),
  agent_id: z.string(),
  agent_name: z.string(),
  destination: z.nullable(z.string()).optional(),
  is_future_deal: z.boolean(),
  date_created: z.string(),
  overall_commission: z.number().optional(),
  quote_ref: z.nullable(z.string()).optional(),
});
export const freeQuoteListQuerySchema = z.object({
  id: z.string(),
  tour_operator: z.string(),
  hotel: z.string().nullable(),
  title: z.nullable(z.string()).optional(),
  quote_ref: z.nullable(z.string()).optional(),
  holiday_type: z.string().nullable(),
  travel_date: z.nullable(z.string()).optional(),
  destination: z.string().nullable(),
  resort_name: z.string().nullable(),
  country: z.string().nullable(),
  num_of_nights: z.string(),
  lodge_name: z.string().nullable(),
  board_basis: z.string().nullable(),
  deal_images: z.array(z.string()).optional(),
  quote_status: z.string().nullable(),
  date_created: z.string(),
  price_per_person: z.number(),
  departureAirport: z.string(),
  luggageTransfers: z.string(),
  hasPost: z.boolean().optional(),
  scheduledPostDate: z.string().nullable().optional(),
  onlySocialId: z.string().nullable().optional(),
});

export const todaySocialDealQuerySchema = z.object({
  title: z.string().nullable().optional(),
  destination: z.string().nullable().optional(),
  scheduledPostDate: z.string().nullable().optional(),
  scheduledPostTime: z.string().nullable().optional(),
  price_per_person: z.number(),
});
export const quoteQueryResultSchema = z.object({});

export const mergeAllType = quoteBasedSchema.merge(cruiseFields).merge(hotTubFields);


export const quotePackageHolidayQuerySchema = quoteBasedSchema.extend({
  holiday_type: z.literal('Package Holiday'),
});

export const quoteHotTubQuerySchema = quoteBasedSchema.merge(hotTubFields).extend({
  holiday_type: z.literal('Hot Tub Break'),
});

export const quoteCruiseQuerySchema = quoteBasedSchema.merge(cruiseFields).extend({
  holiday_type: z.literal('Cruise Package'),
});
export const quoteOthersSchema = quoteBasedSchema.extend({
  holiday_type: z.literal('Others'),
});
export const unionAllType = z.discriminatedUnion('holiday_type', [
  quotePackageHolidayQuerySchema,
  quoteHotTubQuerySchema,
  quoteCruiseQuerySchema,
  quoteOthersSchema,
]);
const quoteSchemasWithChildren = [
  quotePackageHolidayQuerySchema.extend({
    child_quotes: unionAllType.array().optional(),
  }),
  quoteHotTubQuerySchema.extend({
    child_quotes: unionAllType.array().optional(),
  }),
  quoteCruiseQuerySchema.extend({
    child_quotes: unionAllType.array().optional(),
  }),
  quoteOthersSchema.extend({
    child_quotes: unionAllType.array().optional(),
  }),
] as const;

export const unionAllTypeWithChildren = z.union(quoteSchemasWithChildren);
