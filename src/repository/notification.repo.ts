import { notificationQuerySchema } from '../types/modules/notification';
import { db } from '../db/db';
import { notification, notification_token } from '../schema/notification-schema';
import { task } from '../schema/task-schema';
import { and, eq, inArray } from 'drizzle-orm';
import z from 'zod';
import { format } from 'date-fns';

export type NotificationRepo = {
  insertNotification: (
    user_id: string,
    message: string,
    type: string,
    reference_id: string,
    client_id?: string,
    due_date?: string | null,
    hoursDue?: number
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
  insertNotification: async (user_id, message, type, reference_id, client_id, due_date, hoursDue) => {

    console.log(user_id)
    await db.insert(notification).values({
      user_id_v2: user_id,
      message: message,
      type: type,
      hoursDue: hoursDue,
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
      orderBy: (notification, { desc }) => [desc(notification.date_updated)],
    });
    // batch-fetch related tasks for any `task_reminder` notifications
    const taskReminderIds = Array.from(new Set(notifications
      .filter((n) => n.type === 'task_deadline' && n.reference_id)
      .map((n) => n.reference_id as string)));

    const tasks = taskReminderIds.length > 0
      ? await db.query.task.findMany({
        where: inArray(task.id, taskReminderIds),
        columns: {
          id: true,
          title: true,
          task: true,
          deal_id: true,
          transaction_type: true,
          due_date: true,
          status: true,
          priority: true,
          client_id: true,
          transaction_id: true,
        },
      })
      : [];

    const taskMap = new Map(tasks.map((t) => [t.id, t]));

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
      date: data.due_date ? format(data.due_date, 'yyyy-MM-dd') : null,
      time: data.due_date ? format(data.due_date, 'h:mmaaa') : null, // "4:30pm" or "4:30am"
      // attach task when this notification references a task
      deal_id: data.type === 'task_deadline' && data.reference_id ? taskMap.get(data.reference_id)?.deal_id || null : null,
      transaction_type: data.type === 'task_deadline' && data.reference_id ? taskMap.get(data.reference_id)?.transaction_type || null : null,

    }));
  },
};