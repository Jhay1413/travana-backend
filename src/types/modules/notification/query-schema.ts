import { z } from 'zod';

export const notificationQuerySchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  message: z.string().optional(),
  due_date: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  is_read: z.boolean().optional(),
  date_read: z.string().optional(),
  agent_name: z.string(),
  agent_initials: z.string(),
  type:z.string(),
  reference_id:z.string(),
  client_id:z.string(),
});
