import { z } from 'zod';

export const ticketQuerySchema = z.object({
  id: z.string(),
  ticket_id: z.string().nullable().optional(),
  ticket_type: z.enum(['admin', 'sales', 'travana']).optional(),
  description: z.string(),
  transaction_type: z.string().optional().nullable(),
  deal_id: z.string().optional().nullable(),
  title: z.string(),
  author: z.object({
    name: z.string(),
    avatar: z.string(),
  }),
  client: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string(),
    email: z.string(),
    title: z.string().nullable().optional(),
  }),
  category: z.string(),
  updatedAt: z.string(),
  assignedTo: z.string(),
  status: z.string(),
  likes: z.number(),
  lastComment: z
    .object({
      author: z.string(),
      content: z.string(),
    })
    .nullable(),
  isLocked: z.boolean(),
  createdAt: z.string(),
  created_by_name: z.string(),
  files: z
    .array(
      z.object({
        file_name: z.string(),
        file_path: z.string(),
        file_size: z.string(),
        file_type: z.string(),
        signed_url: z.string(),
      })
    )
    .optional(),
});

export const ticketReplyQuerySchema = z.object({
  id: z.string(),
  ticket_id: z.string(),
  reply: z.string(),
  agent_id: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  agent: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      phone: z.string(),
      role: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
    })
    .optional(),
  files: z
    .array(
      z.object({
        file_name: z.string(),
        file_path: z.string(),
        file_size: z.string(),
        file_type: z.string(),
        signed_url: z.string(),
      })
    )
    .optional(),
});
