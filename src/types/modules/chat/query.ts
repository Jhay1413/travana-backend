import { z } from 'zod';

export const chatMessageQuerySchema = z.object({
  id: z.string(),
  content: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderAvatar: z.string().optional(),
  timestamp: z.string(),
  isRead: z.boolean(),
  messageType: z.enum(['text', 'image', 'file', 'system']),
  roomId: z.string(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.enum(['image', 'document', 'video', 'audio']),
    size: z.number().optional(),
  })).optional(),
});

export const chatParticipantQuerySchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  isOnline: z.boolean(),
  lastSeen: z.string().optional(),
  role: z.enum(['admin', 'member']).optional(),
});

export const chatRoomQuerySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['direct', 'group']),
  participants: z.array(chatParticipantQuerySchema),
  lastMessage: chatMessageQuerySchema.optional(),
  unreadCount: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const chatFiltersQuerySchema = z.object({
  search: z.string().optional(),
  type: z.enum(['direct', 'group', 'all']).optional(),
  unreadOnly: z.boolean().optional(),
  userId: z.string().optional(),
  limit: z.string().optional(),
  cursor: z.string().optional(),
});

export const chatMessagesQuerySchema = z.object({
  limit: z.string().optional(),
  cursor: z.string().optional(),
  userId: z.string().optional(), // Will be set by frontend
});

export const chatRoomQueryParamsSchema = z.object({
  userId: z.string().optional(), // Will be set by frontend
}); 