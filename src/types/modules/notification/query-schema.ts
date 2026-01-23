import { z } from 'zod';

export const notificationQuerySchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.nullable(z.string().uuid()).optional(),
  message: z.nullable(z.string()).optional(),
  due_date: z.nullable(z.string()).optional(),
  date: z.nullable(z.string()).optional(),
  time: z.nullable(z.string()).optional(),
  is_read: z.nullable(z.boolean()).optional(),
  date_read: z.nullable(z.string()).optional(),
  agent_name: z.nullable(z.string()).optional(),
  agent_initials: z.nullable(z.string()).optional(),
  type:z.nullable(z.string()).optional(),
  reference_id:z.nullable(z.string()).optional(),
  client_id:z.nullable(z.string()).optional(),
});
