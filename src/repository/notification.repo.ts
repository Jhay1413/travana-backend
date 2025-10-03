import { db } from '../db/db';
import { notification, notification_token } from '../schema/notification-schema';
import { and, eq } from 'drizzle-orm';

export type NotificationRepo = {
  insertNotification: (
    user_id: string,
    message: string,
    type: string,
    reference_id: string,
    client_id?: string,
    due_date?: string | null
  ) => Promise<void>;

  fetchUserTokenService: (user_id: string) => Promise<string[]>;
  countUnreadNotifications: (user_id: string) => Promise<number>;
};

export const notificationRepo: NotificationRepo = {
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
};
