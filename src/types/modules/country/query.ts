import { z } from 'zod';

export const countryQuerySchema = z.object({
  id: z.string(),
  country_name: z.string(),
  country_code: z.string().optional(),
});
