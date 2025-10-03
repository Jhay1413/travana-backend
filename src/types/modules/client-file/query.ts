import { z } from 'zod';

export const clientFileQuerySchema = z.object({
  id: z.string(),
  fileTitle: z.string(),
  filename: z.string(),
  fileUrl: z.string(),
  fileType: z.string(),
  clientId: z.string(),
  createdAt: z.string().datetime(),
  signedUrl: z.string().optional(),
}); 