import cron from 'node-cron';
import { db } from '../db/db';
import { task } from '../schema/task-schema';
import { and, gte, lte, ne, sql, notInArray } from 'drizzle-orm';
import { emitToUser } from './socket-handler';
import { taskSnoozeRepo } from '../repository/task-snooze.repo';

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
    status: string;
}

export const initializeTaskReminderCron = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            console.log('Running task reminder check...');

            const now = new Date();
            const sixMinutesAgo = new Date(now.getTime() - 6 * 60 * 1000);
            const sixMinutesFromNow = new Date(now.getTime() + 6 * 60 * 1000);

            // Check for snoozed tasks that need to be reminded
            const snoozedTasksDue = await taskSnoozeRepo.getSnoozedTasksDue();

            if (snoozedTasksDue.length > 0) {
                console.log(`Found ${snoozedTasksDue.length} snoozed task(s) to remind`);

                for (const snoozedTask of snoozedTasksDue) {
                    // Fetch the task details using the task_id
                    const taskItem = await db.query.task.findFirst({
                        where: (t, { eq }) => eq(t.id, snoozedTask.task_id),
                        with: {
                            client: true,
                            assigned_by_user: true,
                            transaction: true,
                            user: true,
                        },
                    });

                    if (taskItem && snoozedTask.user_id) {
                        const reminderData = {
                            taskId: taskItem.id,
                            title: taskItem.title || 'Task Reminder',
                            task: taskItem.task || '',
                            dueDate: taskItem.due_date?.toISOString() || '',
                            priority: taskItem.priority || 'normal',
                            status: taskItem.status || 'pending',
                            transactionId: taskItem.transaction_id,
                            clientName: taskItem.client
                                ? `${taskItem.client.firstName || ''} ${taskItem.client.surename || ''}`.trim()
                                : null,
                            assignedBy: taskItem.assigned_by_user
                                ? `${taskItem.assigned_by_user.firstName || ''} ${taskItem.assigned_by_user.lastName || ''}`.trim()
                                : null,
                            message: taskItem.due_date && new Date(taskItem.due_date) < now
                                ? `Task "${taskItem.title || 'Untitled'}" is still overdue!`
                                : `Reminder: Task "${taskItem.title || 'Untitled'}" is due soon!`,
                        };

                        emitToUser(snoozedTask.user_id, 'task_reminder', reminderData);
                        console.log(`Sent snoozed task reminder for task ${taskItem.id} to user ${snoozedTask.user_id}`);

                        // Remove the snooze after sending reminder
                        await taskSnoozeRepo.removeSnoozedTask(taskItem.id, snoozedTask.user_id);
                    }
                }
            }

            // Get list of currently snoozed task IDs to exclude
            const allSnoozedTasks = await taskSnoozeRepo.getAllSnoozedTasks();
            const snoozedTaskIds = allSnoozedTasks.map(s => s.task_id);

            // Find tasks that are:
            // 1. Overdue (but not more than 6 minutes overdue)
            // 2. Due within the next 6 minutes
            // 3. Not currently snoozed
            // This captures recently overdue and upcoming due tasks
            const dueTasks = await db.query.task.findMany({
                where: and(
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
            console.log(`Found ${dueTasks.length} tasks due soon.`);

            if (dueTasks.length > 0) {
                console.log(`Found ${dueTasks.length} task(s) that are overdue or due soon`);

                // Filter out snoozed tasks
                const unSnoozedTasks = snoozedTaskIds.length > 0
                    ? dueTasks.filter(t => !snoozedTaskIds.includes(t.id))
                    : dueTasks;

                for (const taskItem of unSnoozedTasks) {
                    // Determine who should receive the notification
                    const recipientId = taskItem.user_id || taskItem.agent_id;

                    if (recipientId) {
                        const reminderData = {
                            taskId: taskItem.id,
                            title: taskItem.title || 'Task Reminder',
                            task: taskItem.task || '',
                            dueDate: taskItem.due_date?.toISOString() || '',
                            priority: taskItem.priority || 'normal',
                            status: taskItem.status || 'pending',
                            transactionId: taskItem.transaction_id,
                            clientName: taskItem.client
                                ? `${taskItem.client.firstName || ''} ${taskItem.client.surename || ''}`.trim()
                                : null,
                            assignedBy: taskItem.assigned_by_user
                                ? `${taskItem.assigned_by_user.firstName || ''} ${taskItem.assigned_by_user.lastName || ''}`.trim()
                                : null,
                            message: taskItem.due_date && new Date(taskItem.due_date) < now
                                ? `Task "${taskItem.title || 'Untitled'}" is overdue!`
                                : `Task "${taskItem.title || 'Untitled'}" is due soon!`,
                        };

                        // Emit socket event to the assigned user
                        emitToUser(recipientId, 'task_reminder', reminderData);

                        console.log(`Sent task reminder for task ${taskItem.id} to user ${recipientId}`);
                    }
                }
            }
        } catch (error) {
            console.error('Error in task reminder cron job:', error);
        }
    });

    console.log('✓ Task reminder cron job initialized - running every minute');
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
