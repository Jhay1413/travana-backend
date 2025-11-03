import { z } from "zod";

export const airportQuerySchema = z.object({
    id: z.string().optional(),
    airport_name: z.string(),
    airport_code: z.string(),
    country_id: z.nullable(z.string().optional()),
    destination_id: z.string().optional(),
    countryName: z.string().optional(),

})