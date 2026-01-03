import { db } from "../db/db";
import { taskSnooze } from "../schema/task-snooze-schema";
import { and, eq, lte } from "drizzle-orm";

export type TaskSnoozeRepo = {
    snoozeTask: (taskId: string, userId: string, snoozeMinutes: number) => Promise<void>;
    removeSnoozedTask: (taskId: string, userId: string) => Promise<void>;
    getSnoozedTasksDue: () => Promise<Array<{
        id: string;
        task_id: string;
        user_id: string;
        snooze_until: Date;
    }>>;
    getAllSnoozedTasks: () => Promise<Array<{
        id: string;
        task_id: string;
        user_id: string;
    }>>;
    isTaskSnoozed: (taskId: string, userId: string) => Promise<boolean>;
    clearExpiredSnoozes: () => Promise<void>;
}

export const taskSnoozeRepo: TaskSnoozeRepo = {
    snoozeTask: async (taskId, userId, snoozeMinutes) => {
        const snoozeUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000);
        
        // Remove any existing snooze for this task and user
        await db
            .delete(taskSnooze)
            .where(
                and(
                    eq(taskSnooze.task_id, taskId),
                    eq(taskSnooze.user_id, userId)
                )
            );

        // Insert new snooze
        await db
            .insert(taskSnooze)
            .values({
                task_id: taskId,
                user_id: userId,
                snooze_until: snoozeUntil,
                snooze_duration_minutes: snoozeMinutes.toString(),
            });
    },

    removeSnoozedTask: async (taskId, userId) => {
        await db
            .delete(taskSnooze)
            .where(
                and(
                    eq(taskSnooze.task_id, taskId),
                    eq(taskSnooze.user_id, userId)
                )
            );
    },

    getSnoozedTasksDue: async () => {
        const now = new Date();
        const snoozedTasks = await db.query.taskSnooze.findMany({
            where: lte(taskSnooze.snooze_until, now),
            with: {
                task: {
                    with: {
                        user: true,
                        client: true,
                        assigned_by_user: true,
                        transaction: true,
                    },
                },
            },
        });

        return snoozedTasks.map(snooze => ({
            id: snooze.id,
            task_id: snooze.task_id,
            user_id: snooze.user_id,
            snooze_until: snooze.snooze_until,
            task: snooze.task,
        }));
    },

    getAllSnoozedTasks: async () => {
        const snoozedTasks = await db.query.taskSnooze.findMany({
            columns: {
                id: true,
                task_id: true,
                user_id: true,
            },
        });

        return snoozedTasks;
    },

    isTaskSnoozed: async (taskId, userId) => {
        const snoozed = await db.query.taskSnooze.findFirst({
            where: and(
                eq(taskSnooze.task_id, taskId),
                eq(taskSnooze.user_id, userId)
            ),
        });

        return !!snoozed;
    },

    clearExpiredSnoozes: async () => {
        const now = new Date();
        await db
            .delete(taskSnooze)
            .where(lte(taskSnooze.snooze_until, now));
    },
};
