import { z } from 'zod';

export const postTypeEnum = z.enum(['Flash Sale', 'Hot Deal', 'Admin', 'Urgent']);

export const headlinesMutationSchema = z.object({
  title: z.string(),
  message: z.string(),
  link: z.string().optional(),
  post_type: postTypeEnum,  
  expiry_date: z.string(),
});

export const tour_operator_percentage_commission_mutate_schema = z.object({
  package_id: z.string(),
  percentage: z.number(),
});

export const tour_operator_mutate_schema = z.object({
  name: z.string(),
  percentage_commission: z.array(tour_operator_percentage_commission_mutate_schema),
});

export const accomodation_mutate_schema = z.object({
  country: z.string(),
  destination: z.string(),
  name: z.string(),
  resort_id: z.string(),
  type_id: z.string(),
});

export const lodgeMutateSchema = z.object({
  park_id: z.string().min(1, 'Required'),
  lodge_name: z.string().min(1, 'Required'),
  lodge_code: z.string().min(1, 'Required'),
  image: z.string().optional(),
  adults: z.number().min(0, 'Required'),
  children: z.number().min(0, 'Required'),
  bedrooms: z.number().min(0, 'Required'),
  bathrooms: z.number().min(0, 'Required'),
  pets: z.number().min(0, 'Required'),
  sleeps: z.number().min(0, 'Required'),
  infants: z.number().min(0, 'Required'),
});

// Cruise schemas
export const cruise_line_mutate_schema = z.object({
  name: z.string().min(1, 'Cruise line name is required'),
});

export const cruise_ship_mutate_schema = z.object({
  name: z.string().min(1, 'Ship name is required'),
  cruise_line_id: z.string().min(1, 'Cruise line is required'),
});

export const cruise_destination_mutate_schema = z.object({
  name: z.string().min(1, 'Destination name is required'),
});

export const port_mutate_schema = z.object({
  name: z.string().min(1, 'Port name is required'),
  cruise_destination_id: z.string().min(1, 'Cruise destination is required'),
});

export const cruise_itinerary_mutate_schema = z.object({
  ship_id: z.string().min(1, 'Ship is required'),
  itinerary: z.string().min(1, 'Itinerary description is required'),
  departure_port: z.string().min(1, 'Departure port is required'),
  date: z.string().min(1, 'Date is required'),
});

export const cruise_voyage_mutate_schema = z.object({
  itinerary_id: z.string().min(1, 'Itinerary is required'),
  day_number: z.number().min(1, 'Day number must be at least 1'),
  description: z.string().min(1, 'Description is required'),
});

// Bulk cruise data schema for multiple itineraries and voyages
export const bulk_cruise_data_mutate_schema = z.object({
  ship_id: z.string().min(1, 'Ship is required'),
  itineraries: z.array(z.object({
    itinerary: z.string().min(1, 'Itinerary description is required'),
    departure_port: z.string().min(1, 'Departure port is required'),
    date: z.string().min(1, 'Date is required'),
    voyages: z.array(z.object({
      day_number: z.number().min(1, 'Day number must be at least 1'),
      description: z.string().min(1, 'Description is required'),
    })).min(1, 'At least one voyage is required'),
  })).min(1, 'At least one itinerary is required'),
});