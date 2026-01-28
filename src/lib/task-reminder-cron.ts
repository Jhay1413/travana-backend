import cron from 'node-cron';
import { db } from '../db/db';
import { task } from '../schema/task-schema';
import { and, gte, lte, ne, sql, notInArray, eq } from 'drizzle-orm';
import { emitToUser } from './socket-handler';
import { taskSnoozeRepo } from '../repository/task-snooze.repo';
import { notification } from '../schema/notification-schema';

/**
 * Task Reminder Cron Job
 * Runs every minute to check for tasks due in 5 minutes
 * and sends socket notifications to assigned users
 */

interface TaskReminder {
  id: string;
  title: string;
  task: string;
  due_date: Date;
  priority: string;
  agent_id: string | null;
  user_id: string | null;
  client_id: string | null;
  transaction_id: string | null;
  deal_id: string | null;
  transaction_type: string | null;
  status: string;
}

export const initializeTaskReminderCron = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {

      const now = new Date();
      const sixMinutesAgo = new Date(now.getTime() - 6 * 60 * 1000);
      const sixMinutesFromNow = new Date(now.getTime() + 6 * 60 * 1000);

      // Check for snoozed tasks that need to be reminded
      // const snoozedTasksDue = await taskSnoozeRepo.getSnoozedTasksDue();

      // if (snoozedTasksDue.length > 0) {
      //   console.log(`Found ${snoozedTasksDue.length} snoozed task(s) to remind`);

      //   for (const snoozedTask of snoozedTasksDue) {
      //     // Fetch the task details using the task_id
      //     const taskItem = await db.query.task.findFirst({
      //       where: (t, { eq }) => eq(t.id, snoozedTask.task_id),
      //       with: {
      //         client: true,
      //         assigned_by_user: true,
      //         transaction: true,
      //         user: true,
      //       },
      //     });


      //     if (taskItem && snoozedTask.user_id) {
      //       const reminderData = {
      //         taskId: taskItem.id,
      //         title: taskItem.title || 'Task Reminder',
      //         task: taskItem.task || '',
      //         dueDate: taskItem.due_date?.toISOString() || '',
      //         priority: taskItem.priority || 'normal',
      //         status: taskItem.status || 'pending',
      //         transactionId: taskItem.transaction_id,
      //         clientId: taskItem.client_id,
      //         dealId: taskItem.deal_id,
      //         transactionType: taskItem.transaction_type,
      //         clientName: taskItem.client
      //           ? `${taskItem.client.firstName || ''} ${taskItem.client.surename || ''}`.trim()
      //           : null,
      //         assignedBy: taskItem.assigned_by_user
      //           ? `${taskItem.assigned_by_user.firstName || ''} ${taskItem.assigned_by_user.lastName || ''}`.trim()
      //           : null,
      //         message: taskItem.due_date && new Date(taskItem.due_date) < now
      //           ? `Task "${taskItem.title || 'Untitled'}" is still overdue!`
      //           : `Reminder: Task "${taskItem.title || 'Untitled'}" is due soon!`,
      //       };

      //       emitToUser(snoozedTask.user_id, 'task_reminder', reminderData);
      //       console.log(`Sent snoozed task reminder for task ${taskItem.id} to user ${snoozedTask.user_id}`);

      //       // Remove the snooze after sending reminder
      //       await taskSnoozeRepo.removeSnoozedTask(taskItem.id, snoozedTask.user_id);
      //     }
      //   }
      // }

      // Get list of currently snoozed task IDs to exclude
      // const allSnoozedTasks = await taskSnoozeRepo.getAllSnoozedTasks();
      // const snoozedTaskIds = allSnoozedTasks.map(s => s.task_id);

      // Get ALL tasks that are either upcoming or overdue (no time limit on overdue)
      // This includes:
      // 1. Upcoming: Due within the next 5-6 minutes
      // 2. All overdue tasks (regardless of how long they've been overdue)
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
      const dueAndOverdueTasks = await db.query.task.findMany({
        where: and(
          lte(task.due_date, now),
          ne(task.status, 'Completed'),
          ne(task.status, 'Cancelled')
        ),
        with: {
          user: true,
          client: true,
          assigned_by_user: true,
          transaction: true,
        },
      });


      // Process all due and overdue tasks
      if (dueAndOverdueTasks.length > 0) {
        const unSnoozedTasks = dueAndOverdueTasks;

        // Group tasks by user to get counts per user
        const tasksByUser = new Map<string, { overdue: number; due: number }>();

        for (const taskItem of unSnoozedTasks) {
          const recipientId = taskItem.user_id || taskItem.agent_id;

          if (recipientId && taskItem.due_date) {
            const isOverdue = new Date(taskItem.due_date) < now;
            const hoursOverdue = isOverdue
              ? Math.floor((now.getTime() - new Date(taskItem.due_date).getTime()) / (60 * 60 * 1000))
              : 0;

            // Track counts per user
            if (!tasksByUser.has(recipientId)) {
              tasksByUser.set(recipientId, { overdue: 0, due: 0 });
            }
            const userCounts = tasksByUser.get(recipientId)!;
            if (isOverdue) {
              userCounts.overdue++;
            } else {
              userCounts.due++;
            }

            const notificationData = {
              type: "task_deadline",
              user_id_v2: recipientId,
              hoursDue: hoursOverdue,
              client_id: taskItem.client_id,
              message: isOverdue
                ? hoursOverdue > 0
                  ? `Task "${taskItem.title || 'Untitled'}" is ${hoursOverdue} hour(s) overdue!`
                  : `Task "${taskItem.title || 'Untitled'}" is overdue!`
                : `Task "${taskItem.title || 'Untitled'}" is due soon!`,
              reference_id: taskItem.id,
              due_date: taskItem.due_date.toISOString(),
            }

            const response = await db.query.notification.findFirst({
              where: and(
                eq(notification.reference_id, taskItem.id),
              )
            });

            if (response) {
              await db.update(notification).set({
                hoursDue: notificationData.hoursDue,
                message: notificationData.message,
                due_date: new Date(notificationData.due_date),
                is_read: false,
              }).where(eq(notification.id, response.id));
            } else {
              await db.insert(notification).values({
                ...notificationData,
                due_date: new Date(notificationData.due_date),
              });
            }

          }
        }

        // Emit counts to each user after processing all their tasks
        for (const [userId, counts] of tasksByUser.entries()) {
          emitToUser(userId, 'task_reminder', {
            overdueCount: counts.overdue,
            dueCount: counts.due,
            totalCount: counts.overdue + counts.due,
          });
        }
      }
    } catch (error) {
      console.error('Error in task reminder cron job:', error);
    }
  });

};

/**
 * Manually trigger task reminder check (useful for testing)
 */
export const triggerTaskReminderCheck = async () => {
  try {
    const now = new Date();
    const sixMinutesAgo = new Date(now.getTime() - 6 * 60 * 1000);
    const sixMinutesFromNow = new Date(now.getTime() + 6 * 60 * 1000);

    const dueTasks = await db.query.task.findMany({
      where: and(
        gte(task.due_date, sixMinutesAgo),
        lte(task.due_date, sixMinutesFromNow),
        ne(task.status, 'completed'),
        ne(task.status, 'cancelled')
      ),
      with: {
        user: true,
        client: true,
        assigned_by_user: true,
        transaction: true,
      },
    });

    return dueTasks;
  } catch (error) {
    console.error('Error checking for due tasks:', error);
    return [];
  }
};
