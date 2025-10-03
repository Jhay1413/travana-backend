import { z } from "zod";

export const registrationMutationSchema = z.object({
    role: z.enum(['agent', 'manager', 'home_worker', 'affiliate']),
    firstName:z.string(),
    lastName:z.string(),
    phoneNumber:z.string(),
    email:z.string(),
    password:z.string(),
   
})
export const loginMutationSchema = z.object({
    email : z.string(),
    password: z.string(),
})