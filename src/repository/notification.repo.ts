import { notificationQuerySchema } from '../types/modules/notification';
import { db } from '../db/db';
import { notification, notification_token } from '../schema/notification-schema';
import { and, eq } from 'drizzle-orm';
import z from 'zod';

export type NotificationRepo = {
  insertNotification: (
    user_id: string,
    message: string,
    type: string,
    reference_id: string,
    client_id?: string,
    due_date?: string | null
  ) => Promise<void>;
  readNotification: (notification_id: string) => Promise<void>;
  clearAllNotifications: (user_id: string) => Promise<void>;
  fetchUserTokenService: (user_id: string) => Promise<string[]>;
  countUnreadNotifications: (user_id: string) => Promise<number>;
  fetchNotifications: (user_id: string, isRead?: boolean) => Promise<z.infer<typeof notificationQuerySchema>[]>;
};

export const notificationRepo: NotificationRepo = {

  clearAllNotifications: async (user_id) => {
    await db.delete(notification).where(eq(notification.user_id_v2, user_id));
  },
  insertNotification: async (user_id, message, type, reference_id, client_id, due_date) => {
    await db.insert(notification).values({
      user_id_v2: user_id,
      message: message,
      type: type,
      reference_id: reference_id,
      due_date: due_date ? new Date(due_date) : null,
      client_id: client_id,
    });
  },
  fetchUserTokenService: async (user_id) => {
    const tokens = await db.query.notification_token.findMany({
      where: eq(notification_token.user_id_v2, user_id),
      columns: {
        token: true,
      },
    });
    return tokens.map((data) => data.token).filter((token) => token !== null);
  },
  countUnreadNotifications: async (user_id) => {
    const num_of_notification = await db.$count(notification, and(eq(notification.user_id_v2, user_id), eq(notification.is_read, false)));
    return num_of_notification;
  },

  readNotification: async (notification_id) => {
    await db.update(notification).set({
      is_read: true,
      date_read: new Date(),
    }).where(eq(notification.id, notification_id));
  },
  fetchNotifications: async (user_id, isRead) => {
    const notifications = await db.query.notification.findMany({
      where: and(
        eq(notification.user_id_v2, user_id),
        ...(isRead !== undefined ? [eq(notification.is_read, isRead)] : [])
      ),
      columns: {
        id: true,
        user_id_v2: true,
        message: true,
        type: true,
        reference_id: true,
        client_id: true,
        due_date: true,
        is_read: true,
        date_created: true,
        date_updated: true,
      },
    });
    return notifications.map((data) => ({
      id: data.id,
      user_id: data.user_id_v2,
      message: data.message,
      type: data.type,
      reference_id: data.reference_id,
      client_id: data.client_id,
      agent_name: null,
      agent_initials: null,
      due_date: data.due_date ? data.due_date.toISOString() : null,
      is_read: data.is_read,
      date: data.date_created ? data.date_created.toISOString().split('T')[0] : null,
      time: data.date_created ? data.date_created.toISOString().split('T')[1] : null,

    }));
  },
};