import { z } from "zod";


export const taskMutationSchema = z.object({
  agent_id : z.string(),
  client_id : z.string().optional(),
  assigned_by_id : z.string(),
  title:z.string(),
  task : z.string(),
  due_date :z.string().datetime(),
  number: z.string().optional(),
  type: z.string(),
  deal_id: z.nullable(z.string().optional()),
  priority: z.string(),
  status: z.string(),
  transaction_id: z.nullable(z.string()).optional(),
  transaction_type: z.nullable(z.string()).optional(),
  
}).refine((data) => {
  if (data.type === "call") {
    return data.number;
  }
  return true;
}, {
  message: "Phone number is required and must be 10 digits for call tasks",
  path: ["number"]
})

export const agentTargetMutationSchema = z.object({
  agent_id: z.string(),
  year: z.number().min(2020).max(2030),
  month: z.number().min(1).max(12),
  target_amount: z.number().positive(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});