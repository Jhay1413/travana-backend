import { z } from 'zod';
import { userQuerySchema } from '../user';
import { clientQuerySchema } from '../client';
import { enquiryQuerySchema } from '../transaction';
import { destinationQuerySchema } from '../destination';

export const taskQuerySchema = z.object({
  id: z.string(),
  agent: userQuerySchema.nullable(),
  client: clientQuerySchema.optional(),
  assignedBy: userQuerySchema.nullable(),
  task: z.string(),
  title: z.string(),
  number: z.nullable(z.string() ).optional(),
  type: z.nullable(z.string()).optional(),
  due_date: z.string().datetime(),
  priority: z.string(),
  deal_id: z.string().optional(),
  status: z.string(),
  created_at: z.string().datetime(),
  assigned_by_id: z.string(),
  transaction_id: z.string().optional(),
  transaction_type: z.string().optional(),
});

export const agentTargetQuerySchema = z.object({
  id: z.string(),
  agent_id: z.string(),
  agent: userQuerySchema,
  year: z.number(),
  month: z.number(),
  target_amount: z.number(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const enquirySummaryQuerySchema = z.object({
  id: z.string(),
  holiday_type_name: z.string().optional(),
  holiday_type: z.string(),
  status: z.enum(['on_quote', 'on_enquiry', 'on_booking']),
  enquiry_status: z.enum(['ACTIVE', 'LOST', 'INACTIVE', 'EXPIRED', 'NEW_LEAD']),
  transaction_id: z.string(),
  clientName: z.string(),
  agent_id: z.string(),
  agentName: z.string(),
  clientId: z.string(),
  no_of_nights: z.string(),
  budget: z.string(),
  title: z.nullable(z.string()).optional(),
  travel_date: z.string().datetime(),
  enquiry_cruise_destination: z.array(destinationQuerySchema),
  is_future_deal: z.boolean(),
  future_deal_date: z.nullable(z.string().date()).optional(),
  date_expiry: z.nullable(z.date()).optional(),
  date_created: z.nullable(z.date()).optional(),
  destination: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      country: z.string(),
    })
  ),
});

export const enquiryListQuerySchema = enquirySummaryQuerySchema
  .omit({
    enquiry_cruise_destination: true,
    destination: true,
  })
  .extend({
    cruise_line: z.array(z.string()),
    board_basis: z.array(z.string()),
    departure_port: z.array(z.string()),
    enquiry_cruise_destination: z.array(z.string()),
    destination: z.array(z.string()),
    resortss: z.array(z.string()),
    accomodation: z.array(z.string()),
    departure_airport: z.array(z.string()),
  });

export const enquiryListPaginatedResponseSchema = z.object({
  data: z.array(enquiryListQuerySchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
