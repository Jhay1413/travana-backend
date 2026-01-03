import { z } from 'zod';

export const ticketMutationSchema = z
  .object({
    ticket_type: z.enum(['admin', 'sales', 'travana']).optional(),
    ticket_id: z.string().optional(),
    transaction_type: z.enum(['on_enquiry', 'on_quote', 'on_booking']).optional(),
    deal_id: z.string().optional(),
    category: z.string().optional(),
    subject: z.string().trim().min(1, 'Subject is required'),
    status: z.string().trim().min(1, 'Status is required'),
    priority: z.string().trim().min(1, 'Priority is required'),
    description: z.string().trim().min(1, 'Description is required'),
    due_date: z.nullable(z.string().datetime()).optional(),
    completed_by: z.nullable(z.string()).optional(),
    client_id: z.string().optional(),
    agent_id: z.string().optional(),
    created_by: z.string().optional(),
    files: z.array(z.instanceof(File)).optional(),
    filesData: z
      .array(
        z.object({
          file_name: z.string(),
          file_path: z.string(),
          file_size: z.string(),
          file_type: z.string(),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      // If ticket_type is 'admin', category is required
      if (data.ticket_type === 'admin' && !data.category) {
        return false;
      }
      return true;
    },
    {
      message: 'Category is required for admin tickets',
      path: ['category'],
    }
  )
  .refine(
    (data) => {
      // If ticket_type is 'admin', transaction_type is required
      if (data.ticket_type === 'admin' && !data.transaction_type) {
        return false;
      }
      return true;
    },
    {
      message: 'Transaction type is required for admin tickets',
      path: ['transaction_type'],
    }
  );

export const ticketReplyMutationSchema = z.object({
  ticket_id: z.string().trim().min(1, 'Ticket ID is required'),
  reply: z.string().trim().min(1, 'Reply is required'),
  agent_id: z.string().optional(),
  files: z.array(z.instanceof(File)).optional(),
  filesData: z
    .array(
      z.object({
        file_name: z.string(),
        file_path: z.string(),
        file_size: z.string(),
        file_type: z.string(),
      })
    )
    .optional(),
});
