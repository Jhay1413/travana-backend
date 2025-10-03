import { z } from 'zod';

export const clientFileMutationSchema = z.object({
  id: z.string().optional(),
  fileTitle: z.string().min(1, 'File title is required'),
  filename: z.string().min(1, 'Filename is required'),
  fileUrl: z.string().min(1, 'File URL is required'),
  fileType: z.string().min(1, 'File type is required'),
  clientId: z.string().min(1, 'Client ID is required'),
});

export const clientFileUploadSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  clientName: z.string().min(1, 'Client name is required'),
  file: z.instanceof(File).optional(),
}); 