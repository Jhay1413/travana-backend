import { z } from "zod";


export const airportMutationSchema = z.object({
    id:z.string().optional(),
    airport_name : z.string(),
    airport_code :z.string(),
    country_id : z.string(),
})