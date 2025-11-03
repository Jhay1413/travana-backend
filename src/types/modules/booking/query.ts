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
export const bookingFinancials = z.object({
  tour_name: z.string(),
  total_commission: z.number(),
});
export const bookingForReportQuerySchema = z.object({
  id: z.string(),
  hays_ref: z.string(),
  supplier_ref: z.string(),
  travel_date: z.date(),
  transaction_id: z.string(),
  status: z.enum(['on_quote', 'on_enquiry', 'on_booking']),
  sales_price: z.number(),
  package_commission: z.number(),
  discount: z.number(),
  service_charge: z.number(),
  holiday_type: z.string(),
  client_name: z.string(),
  clientId: z.string(),
  destination: z.nullable(z.string()).optional(),
  accomodation: z.nullable(z.string()).optional(),
  agent_id: z.string(),
  agent_name: z.string(),
  date_created: z.string(),
  overall_commission: z.number().optional(),
});

export const bookingReportQuerySchema = z.object({
  bookings: z.array(bookingForReportQuerySchema),

  total_overall_commission: z.number().optional(),
  total_bookings: z.number().optional(),
  booking_percentage: z.number().optional(),
});
export const bookingQuerySummarySchema = z.object({
  id: z.string(),
  travel_date: z.string(),
  transaction_id: z.string(),
  status: z.enum(['on_quote', 'on_enquiry', 'on_booking']),
  clientName: z.string(),
  agent_id: z.string(),
  title: z.nullable(z.string()).optional(),
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
  booking_status: z.string(),
});

export const bookingQuerySchema = z.object({
  id: z.string(),
  hays_ref: z.string(),
  supplier_ref: z.string(),
  overall_cost: z.number(),
  overall_commission: z.number(),
  holiday_type: z.string(),
  clientName: z.string(),
  clientId: z.string(),
  title: z.nullable(z.string()).optional(),
  main_tour_operator: z.string(),
  agentName: z.string(),
  agentId: z.string(),
  status: z.enum(['on_quote', 'on_enquiry', 'on_booking']),
  transaction_id: z.string(),
  sales_price: z.number(),
  package_commission: z.number(),
  travel_date: z.date(),
  discount: z.number(),
  service_charge: z.number(),
  num_of_nights: z.number(),
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
  date_expiry: z.nullable(z.date()).optional(),
  date_created: z.nullable(z.date()).optional(),
  is_future_deal: z.nullable(z.boolean()).optional(),
  future_deal_date: z.nullable(z.date()).optional(),
  booking_status: z.string(),
  booking_ref_info: z
    .array(
      z.object({
        tour_name: z.string(),
        booking_ref: z.string(),
      })
    )
    .optional(),
  referrals: z.array(z.object({
    id: z.string(),
    name: z.string(),
    commission: z.number(),
  })).optional(),
  referrerName: z.nullable(z.string()).optional(),
  referrerId: z.nullable(z.string()).optional(),
  potentialCommission: z.nullable(z.number()).optional(),
  referrerCommission: z.nullable(z.number()).optional(),
  finalCommission: z.nullable(z.number()).optional(),
  lead_source: z.nullable(z.string()).optional(),
});
export const bookingCruiseQuerySchema = bookingQuerySchema.merge(cruiseFields);

export const bookingHotTubQuerySchema = bookingQuerySchema.merge(hotTubFields);

export const unifiedBookingSchema = z.union([bookingCruiseQuerySchema, bookingHotTubQuerySchema, bookingQuerySchema]);

export const historicalBookingQuerySchema = z.object({
  id: z.string(),
  client_id: z.string(),
  booking_ref: z.string().nullable(),
  booking_date: z.string().nullable(),
  departure_date: z.string().nullable(),
  return_date: z.string().nullable(),
  gross_price: z.number().nullable(),
  net_price: z.number().nullable(),
  gross_before_discount: z.number().nullable(),
  profit: z.number().nullable(),
  total_payment: z.number().nullable(),
  destination_country: z.string().nullable(),
  product_type: z.string().nullable(),
  duration: z.number().nullable(),
  passegners: z.number().nullable(),
  adults: z.number().nullable(),
  children: z.number().nullable(),
  infants: z.number().nullable(),
  seniors: z.number().nullable(),
  cancelled: z.boolean().nullable(),
  cancelled_date: z.string().nullable(),
  main_supplier: z.string().nullable(),
});

export const forwardsSchema = z.object({
  id: z.string(),
  year: z.string().optional(),
  adjustment: z.string(),
  month: z.string(),
  travanaCommission: z.number(),
  referralCommission: z.number(),
  target: z.number(),
  target_remaining: z.number(),
  total_commission: z.number(),
});

export const forwardsBookingList = z.object({
  agentName: z.string(),
  agentId: z.string(),
  clientId: z.string(),
  clientName:z.string(),
  quote_name: z.string(),
  holiday_type: z.string(),
  resorts: z.string().nullable(),
  lead_source: z.string().nullable(),
  profit: z.number(),
  date_booked: z.string(),
  travel_date: z.string(),
})