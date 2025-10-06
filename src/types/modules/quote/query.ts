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
  clientName: z.string(),
  clientId: z.string(),
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
        type: z.string(),
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
  title: z.nullable(z.string()).optional(),
  quote_ref: z.nullable(z.string()).optional(),
  holiday_type: z.string().nullable(),
  destination: z.string(),
  resort_name: z.string().nullable(),
  country: z.string().nullable(),
  num_of_nights: z.string(),
  lodge_name: z.string().nullable(),

  quote_status: z.string().nullable(),
  date_created: z.string(),
  sales_price: z.number(),
});
export const quoteQueryResultSchema = z.object({});
export const quoteCruiseQuerySchema = quoteBasedSchema.merge(cruiseFields);

export const quoteHotTubQuerySchema = quoteBasedSchema.merge(hotTubFields);
export const quotePackageHolidayQuerySchema = quoteBasedSchema;

export const mergeAllType = quoteBasedSchema.merge(cruiseFields).merge(hotTubFields);

export const unionAllType = z.union([quotePackageHolidayQuerySchema, quoteHotTubQuerySchema, quoteCruiseQuerySchema]);

const quoteSchemasWithChildren = [
  quotePackageHolidayQuerySchema.extend({
    child_quotes: unionAllType.array().optional(), // use non-recursive base
  }),
  quoteHotTubQuerySchema.extend({
    child_quotes: unionAllType.array().optional(),
  }),
  quoteCruiseQuerySchema.extend({
    child_quotes: unionAllType.array().optional(),
  }),
] as const;

export const unionAllTypeWithChildren = z.union(quoteSchemasWithChildren);
