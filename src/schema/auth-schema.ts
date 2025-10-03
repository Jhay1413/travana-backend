import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { referral, referralRequest } from './referral-schema';
import { relations } from 'drizzle-orm';
import { clientTable } from './client-schema';
import { transaction } from './transactions-schema';
import { notes, todos } from './note-schema';
import { task } from './task-schema';
import { notification_token } from './notification-schema';
import { notification } from './notification-schema';
import { agentTargetTable } from './agent-target-schema';
import { booking } from './booking-schema';
import { ticket } from './ticket-schema';
import { ticket_reply } from './ticket-schema';
import { chatMessage, chatMessageRead } from './chat-schema';
import { chatParticipant } from './chat-schema';


export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull(),
  phoneNumber: text("phone_number").notNull(),
  orgName: text("org_name"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});



export const userRelation = relations(user, ({ many }) => ({
  referrals: many(referralRequest),
  referralsMade: many(referral),
  clients: many(clientTable),


  transaction: many(transaction),
  notes: many(notes),
  assigned_task: many(task, { relationName: 'user_assigned' }),
  assigned_by_task: many(task, { relationName: 'assigned_by_user' }),
  notification_token: many(notification_token),
  notification: many(notification),
  agentTargets: many(agentTargetTable),
  deleted_bookings: many(booking),
  assigned_tickets: many(ticket, { relationName: 'assigned_user' }),

  created_tickets: many(ticket, { relationName: 'created_by_user' }),
  reply_tickets: many(ticket_reply, { relationName: 'reply_user' }),
  todos: many(todos),
  chatParticipant: many(chatParticipant),
  chatMessage: many(chatMessage),
  chatMessageRead: many(chatMessageRead),
}));