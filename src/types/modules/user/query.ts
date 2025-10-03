import { z } from 'zod';
import { accountRequestSchema } from './mutation';

export const userQuerySchema = z.object({
  id: z.string(),
  name: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  orgName: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  role: z.string(),
});



  
export const usersQuerySchemaV2 = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
});

export const accountRequestQuerySchema = z.object({
  email: z.string(),
  phoneNumber: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['owner', 'member', 'admin']),
  orgName: z.nullable(z.string()).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
})

export type UserQuerySchema = z.infer<typeof userQuerySchema>;
export type AccountRequestQuerySchema = z.infer<typeof accountRequestQuerySchema>;