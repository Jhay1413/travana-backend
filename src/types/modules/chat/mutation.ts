import { z } from 'zod';

export const sendMessageMutationSchema = z.object({
  roomId: z.string(),
  content: z.string(),
  messageType: z.enum(['text', 'image', 'file']).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.enum(['image', 'document', 'video', 'audio']),
    size: z.number().optional(),
  })).optional(),
  senderId: z.string().optional(), // Will be set by frontend
});

export const createRoomMutationSchema = z.object({
  name: z.string(),
  type: z.enum(['direct', 'group']),
  participantIds: z.array(z.string()),
  creatorId: z.string().optional(), // Will be set by frontend
});

export const joinRoomMutationSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
});

export const leaveRoomMutationSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
});

export const markMessageAsReadMutationSchema = z.object({
  messageId: z.string(),
  userId: z.string(),
});

export const updateRoomMutationSchema = z.object({
  roomId: z.string(),
  name: z.string().optional(),
  isActive: z.boolean().optional(),
  userId: z.string().optional(), // Will be set by frontend
});

export const deleteRoomMutationSchema = z.object({
  userId: z.string().optional(), // Will be set by frontend
}); 