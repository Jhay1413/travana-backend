import { z } from "zod";


export const boardBasisQuerySchema = z.object({
    id:z.string(),
    type : z.string()
})