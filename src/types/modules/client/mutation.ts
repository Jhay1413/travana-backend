import { z } from 'zod';
export const addressMutationSchema = z.object({
  id: z.string().optional(),
  houseNumber: z.string(),
  city: z.string(),
  street: z.string(),
  country: z.string(),
  post_code: z.string(),
  client_id: z.string().optional(),
});
export const clientMutationSchema = z.object({
  id: z.string().optional(),
  title: z.nullable(z.string()).optional(),
  firstName: z.string().min(1, 'First name is required'),
  surename: z.string().min(1, 'Last name is required'),
  badge: z.nullable(z.string()).optional(),
  profilePicture: z.string().optional(),
  DOB: z.nullable(z.string().datetime()).optional(),
  avatarUrl: z.nullable(z.string()).optional(),
  signedUrl: z.string().optional(),
  file: z.instanceof(File).optional(),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .refine((val) => val.replace(/\D/g, '').length === 11, { message: 'Phone number must contain exactly 11 digits' }),
  email: z.nullable(z.string().email()).optional(),
  VMB: z.nullable(z.string()).optional(),
  VMBfirstAccess: z.nullable(z.string()).optional(),
  whatsAppVerified: z.boolean(),
  mailAllowed: z.nullable(z.boolean()).optional(),
  houseNumber: z.nullable(z.string()).optional(),
  city: z.nullable(z.string()).optional(),
  street: z.nullable(z.string()).optional(),
  country: z.nullable(z.string()).optional(),
  post_code: z.nullable(z.string()).optional(),
});
