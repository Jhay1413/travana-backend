import { pgTable, text, timestamp, boolean, integer, uuid, jsonb, pgEnum, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usersTable } from './user-schema';
import { user } from './auth-schema';

export const chatRoleEnum = pgEnum('chat_role', ['admin', 'member']);
export const messageTypeEnum = pgEnum('message_type', ['text', 'image', 'file', 'system']);
export const chatRoomTypeEnum = pgEnum('chat_room_type', ['direct', 'group']);
export const chatRoom = pgTable('chat_rooms', {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar('name'),
  type: varchar('type').default('direct'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const chatParticipant = pgTable('chat_participants', {
  id: uuid().defaultRandom().primaryKey(),
  roomId: uuid('room_id').references(() => chatRoom.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade' }),
  participantId: text('participant_id').references(() => user.id, { onDelete: 'cascade' }),
  role: varchar('role').default('member'),
  joinedAt: timestamp('joined_at').defaultNow(),
  isOnline: boolean('is_online').default(false),
  lastSeen: timestamp('last_seen'),
});

export const chatMessage = pgTable('chat_messages', {
  id: uuid().defaultRandom().primaryKey(),
  roomId: uuid().references(() => chatRoom.id, { onDelete: 'cascade' }),
  senderId: uuid().references(() => usersTable.id, { onDelete: 'cascade' }),
  sender_id: text('sender_id').references(() => user.id, { onDelete: 'cascade' }),
  content: varchar(),
  messageType: varchar('message_type').default('text'),
  isRead: boolean('is_read').default(false),
  timestamp: timestamp('timestamp').defaultNow(),
  attachments: jsonb('attachments').$type<
    Array<{
      id: string;
      name: string;
      url: string;
      type: 'image' | 'document' | 'video' | 'audio';
      size?: number;
    }>
  >(),
});
//   export const chatMessage = pgTable('chat_messages', {
//     id: uuid('id').primaryKey().defaultRandom(),
//     roomId: uuid('room_id').references(() => chatRoom.id, { onDelete: 'cascade' }),
//     senderId: uuid('sender_id').references(() => usersTable.id, { onDelete: 'cascade' }),
//     content: text('content'),
//     messageType: text('message_type', { enum: ['text', 'image', 'file', 'system'] }).default('text'),
//     attachments: jsonb('attachments').$type<Array<{
//       id: string;
//       name: string;
//       url: string;
//       type: 'image' | 'document' | 'video' | 'audio';
//       size?: number;
//     }>>(),
//     isRead: boolean('is_read').default(false),
//     timestamp: timestamp('timestamp').defaultNow(),
//   });

export const chatMessageRead = pgTable('chat_message_reads', {
  id: uuid().defaultRandom().primaryKey(),
  messageId: uuid('message_id').references(() => chatMessage.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade' }),
  user_id_v2: text('user_id_v2').references(() => user.id, { onDelete: 'cascade' }),
  readAt: timestamp('read_at').defaultNow(),
});

export const chatRoomRelations = relations(chatRoom, ({ many }) => ({
  participants: many(chatParticipant),
  messages: many(chatMessage),
}));

export const chatParticipantRelations = relations(chatParticipant, ({ one }) => ({
  room: one(chatRoom, {
    fields: [chatParticipant.roomId],
    references: [chatRoom.id],
  }),
  user_v2: one(user, {
    fields: [chatParticipant.participantId],
    references: [user.id],
  }),
  user: one(usersTable, {
    fields: [chatParticipant.userId],
    references: [usersTable.id],
  }),
}));

export const chatMessageRelations = relations(chatMessage, ({ one, many }) => ({
  room: one(chatRoom, {
    fields: [chatMessage.roomId],
    references: [chatRoom.id],
  }),
  sender_v2: one(user, {
    fields: [chatMessage.sender_id],
    references: [user.id],
  }),
  sender: one(usersTable, {
    fields: [chatMessage.senderId],
    references: [usersTable.id],
  }),
  reads: many(chatMessageRead),
}));

export const chatMessageReadRelations = relations(chatMessageRead, ({ one }) => ({
  message: one(chatMessage, {
    fields: [chatMessageRead.messageId],
    references: [chatMessage.id],
  }),
  user: one(usersTable, {
    fields: [chatMessageRead.userId],
    references: [usersTable.id],
  }),
  user_v2: one(user, {
    fields: [chatMessageRead.user_id_v2],
    references: [user.id],
  }),
}));
