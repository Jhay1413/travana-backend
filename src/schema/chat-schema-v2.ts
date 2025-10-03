// import { pgEnum, uuid, timestamp, pgTable, text, boolean } from "drizzle-orm/pg-core";

// export const chatRoleEnum = pgEnum('chat_role', ['admin', 'member']);

// // export const messageTypeEnum = pgEnum("message_type", ["text", "image", "file", "system"]);

// export const chatRoom = pgTable('chat_rooms', {
//     id: uuid().defaultRandom().primaryKey(),
//     name: text().notNull(),
//     type: text().notNull().default('direct'),
//     isActive: boolean().notNull().default(true),
//     createdAt: timestamp().notNull().defaultNow(),
//     updatedAt: timestamp().notNull().defaultNow(),
// })  

