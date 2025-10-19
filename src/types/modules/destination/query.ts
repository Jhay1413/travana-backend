import { z } from "zod";


export const destinationQuerySchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.nullable(z.string().optional()),
    country_id: z.nullable(z.string().optional()),
    country_name: z.string().optional(),
    country: z.nullable(z.object({
        id: z.string(),
        country_name: z.string(),
    }).optional()),
})