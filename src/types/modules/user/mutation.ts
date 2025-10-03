import { z } from 'zod';

export const userMutationSchema = z.object({
  role: z.enum(['agent', 'manager', 'home_worker', 'affiliate']),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  accountId: z.string(),
  password: z.string().optional(),
});

export const accountRequestSchema = z
  .object({
    email: z.string(),
    phoneNumber: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.enum(['owner', 'member', 'admin']),
    orgName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'owner') {
        return data.orgName && data.orgName.length > 0;
      }
      return true;
    },
    {
      message: 'Organization name is required for owner role',
      path: ['orgName'],
    }
  );
