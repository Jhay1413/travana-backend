import { z } from 'zod';

export const countryMutateSchema = z.object({
  country_name: z.string().min(1, 'Country name is required'),
  country_code: z.string().optional(),
});

export type CountryMutateSchema = z.infer<typeof countryMutateSchema>;
