import { z } from 'zod';

export const tour_operator_query_schema = z.object({
  tour_operator_id: z.string(),
  tour_operator_name: z.string(),
  package_type_id: z.string(),
  package_type_name: z.string(),
  percentage_commission: z.number(),
});

export const headlinesSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  message: z.string(),
  link: z.string().optional(),
  post_type: z.enum(['Flash Sale', 'Hot Deal', 'Admin', 'Urgent']),
  expiry_date: z.string(), // ISO string
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const parkQuerySchema = z.object({
  id: z.string(),
  name: z.string(),
  image_1: z.string().optional(),
  image_2: z.string().optional(),
  location: z.string(),
  city: z.string(),
  county: z.string(),
  code: z.string(),
  description: z.string(),
});

export const lodgeQuerySchema = z.object({
  id: z.string(),
  lodge_name: z.string(),
  lodge_code: z.string(),
  image: z.string().optional(),
  adults: z.number(),
  children: z.number(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  pets: z.number(),
  sleeps: z.number(),
  infants: z.number(),
  park: z.nullable(parkQuerySchema.optional()),
  park_name: z.string().optional(),
  park_id: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
});

// Cruise query schemas
export const cruise_line_query_schema = z.object({
  id: z.string(),
  name: z.string(),
});

export const cruise_ship_query_schema = z.object({
  id: z.string(),
  name: z.string(),
  cruise_line_id: z.string(),
  cruise_line_name: z.string().optional(),
});

export const cruise_destination_query_schema = z.object({
  id: z.string(),
  name: z.string(),
});

export const port_query_schema = z.object({
  id: z.string(),
  name: z.string(),
  cruise_destination_id: z.string(),
  cruise_destination_name: z.string().optional(),
});

export const cruise_itinerary_query_schema = z.object({
  id: z.string(),
  ship_id: z.string(),
  ship_name: z.string().optional(),
  itinerary: z.string(),
  departure_port: z.string(),
  date: z.string(),
});

export const cruise_voyage_query_schema = z.object({
  id: z.string(),
  itinerary_id: z.string(),
  day_number: z.number(),
  description: z.string(),
  itinerary_description: z.string().optional(),
  departure_port: z.string().optional(),
  date: z.string().optional(),
  ship_name: z.string().optional(),
});
