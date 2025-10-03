import { z } from 'zod';

export const cruiseDestinationQuerySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const cruiseLineQuerySchema = z.object({
  id: z.string(),
  name: z.string(),
});
export const portQuerySchema = z.object({
  id: z.string(),
  name: z.string(),
  cruise_destination: z.nullable(cruiseDestinationQuerySchema.optional()),
});
