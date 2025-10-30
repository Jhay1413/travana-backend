import { z } from 'zod';
export const addressQuerySchema = z.object({
  id: z.string().optional(),
  houseNumber: z.string(),
  city: z.string(),
  street: z.string(),
  country: z.string(),
  post_code: z.string(),
  client_id: z.string().optional(),
});
export const clientQuerySchema = z.object({
  id: z.string(),
  title: z.nullable(z.string()).optional(),
  firstName: z.string(),
  badge:z.string().nullable(),
  averagePPb: z.number().optional(),
  avatarUrl: z.nullable(z.string()).optional(),
  signedUrl: z.nullable(z.string()).optional(),
  lastBookingDate: z.string().optional(),
  totalBookings: z.number().optional(),
  surename: z.string(),
  DOB: z.nullable(z.string().date().optional()),
  houseNumber: z.nullable(z.string().optional()),
  city: z.nullable(z.string().optional()),
  street: z.nullable(z.string().optional()),
  country: z.nullable(z.string().optional()),
  post_code: z.nullable(z.string().optional()),
  phoneNumber: z.string(),
  email: z.nullable(z.string()).optional(),
  VMB: z.nullable(z.string()).optional(),
  VMBfirstAccess: z.nullable(z.string()).optional(),
  whatsAppVerified: z.boolean().nullable(),
  mailAllowed: z.nullable(z.boolean()).optional(),
  address: z.array(addressQuerySchema).optional(),
  referrerId: z.nullable(z.string()).optional(),
  referrerName: z.nullable(z.string()).optional(),
});

export const clientInfoSchema = clientQuerySchema.omit({
  averagePPb: true,
  totalBookings: true,
  lastBookingDate: true,
});
export const clientTransactionSchema = z.object({
  id: z.string(),
  title: z.nullable(z.string()).optional(),
  holiday_type: z.string(),
  date_created: z.date(),
  travel_date: z.date(),
  destination: z.string(),
  deal_id: z.string().optional().nullable(),
});
