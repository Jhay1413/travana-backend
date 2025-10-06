import { db } from "../db/db";
import { AppError } from "../middleware/errorHandler";
import { task } from "../schema/task-schema";
import { taskMutationSchema } from "../types/modules/agent/mutation";
import { taskQuerySchema } from "../types/modules/agent/query";
import { addMonths, addWeeks, endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { and, eq, ilike, lte, ne, notIlike } from "drizzle-orm";
import { z } from "zod";



export type TaskRepo = {
    insertTask: (data: z.infer<typeof taskMutationSchema>) => Promise<void>,
    updateTask: (id: string, data: z.infer<typeof taskMutationSchema>) => Promise<void>,
    fetchTaskByAgent: (agent_id: string) => Promise<z.infer<typeof taskQuerySchema>[]>,
    fetchTaskByClient: (client_id: string) => Promise<z.infer<typeof taskQuerySchema>[]>,
    fetchCreatedTasks: (filters: {
        agent_id?: string,
        status?: string,
        dueFilter?: string,
        type?: string,
    }) => Promise<z.infer<typeof taskQuerySchema>[]>,
    fetchCreatedTaskInfinite: (filters: {
        agent_id?: string,
        status?: string,
        dueFilter?: string,
        type?: string,
        curosr?: string,
        limit?: number,
    }) => Promise<{
        data: z.infer<typeof taskQuerySchema>[],
        nextCursor: string,
        hasMore: boolean,
    }>,
    updateTaskStatus: (id: string, status: string) => Promise<void>,
    fetchScheduledTasks: (id: string) => Promise<z.infer<typeof taskQuerySchema>[]>,
    fetchTaskById: (id: string) => Promise<z.infer<typeof taskMutationSchema>>,
    fetchTaskByTransaction: (transaction_id: string) => Promise<z.infer<typeof taskQuerySchema>[]>,
    fetchNumberOfPendingTasks: (agent_id: string) => Promise<{
        count: number,
    }>,
    deleteTaskById: (id: string) => Promise<void>,
}



export const taskRepo: TaskRepo = {
    insertTask: async (data) => {
        await db
            .insert(task)
            .values({
                user_id: data.agent_id,
                client_id: data.client_id,
                assigned_by_id_v2: data.assigned_by_id,
                transaction_id: data.transaction_id,
                deal_id: data.deal_id,
                transaction_type: data.transaction_type,
                title: data.title,
                type: data.type,
                task: data.task,
                due_date: new Date(data.due_date),
                number: data.number,
                priority: data.priority,
                status: data.status,
            })
            .returning({ id: task.id });

    },
    updateTask: async (id, data) => {
        await db
            .update(task)
            .set({
                title: data.title,
                task: data.task,
                due_date: new Date(data.due_date),
                priority: data.priority,
                status: data.status,
                transaction_id: data.transaction_id,
                transaction_type: data.transaction_type,
                user_id: data.agent_id,
                deal_id: data.deal_id,
                client_id: data.client_id,
            })
            .where(eq(task.id, id));
    },
    fetchTaskByAgent: async (agent_id) => {
        const response = await db.query.task.findMany({
            where: and(eq(task.user_id, agent_id), notIlike(task.status, 'completed')),
            with: {
                assigned_by_user: true,
                client: true,
                user: true,
            },
            orderBy: (task, { desc }) => [desc(task.created_at)],
        });
        return response.map((data) => ({
            id: data.id,
            agent: data.user,
            assignedBy: data.assigned_by_user,
            due_date: data.due_date?.toString() ?? '',
            created_at: data.created_at?.toString(),
            task: data.task ?? 'No Task',
            title: data.title ?? 'No Title',
            priority: data.priority ?? 'No Priority',
            status: data.status ?? 'No Status',
            transaction_id: data.transaction_id ?? '',
            transaction_type: data.transaction_type ?? '',
            client_id: data.client_id ?? '',
            deal_id: data.deal_id ?? '',
            assigned_by_id: data.assigned_by_id_v2 ?? '',
            number: data.number ?? '',
            type: data.type ?? '',
        }));
    },
    fetchCreatedTasks: async (filters) => {

        const now = new Date();
        const response = await db.query.task.findMany({
            where: (task, { and, eq, lt, gte, lte }) => {
                const conditions = [];

                if (filters.agent_id) {
                    conditions.push(eq(task.user_id, filters.agent_id));
                }

                if (filters.type) {
                    conditions.push(eq(task.type, filters.type));
                }

                if (filters.status !== 'Completed') {
                    conditions.push(notIlike(task.status, 'Completed'));
                } else if (!filters.status) {
                    conditions.push(notIlike(task.status, 'Completed'));
                } else {
                    conditions.push(ilike(task.status, filters.status));
                }

                if (filters.dueFilter === 'overdue') {
                    conditions.push(lt(task.due_date, startOfDay(now)));
                } else if (filters.dueFilter === 'today') {
                    conditions.push(gte(task.due_date, startOfDay(now)), lte(task.due_date, endOfDay(now)));
                } else if (filters.dueFilter === 'week') {
                    const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
                    const end = endOfWeek(now, { weekStartsOn: 1 });
                    conditions.push(gte(task.due_date, start), lte(task.due_date, end));
                } else if (filters.dueFilter === 'this_week') {
                    const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
                    const end = endOfWeek(now, { weekStartsOn: 1 });
                    conditions.push(gte(task.due_date, start), lte(task.due_date, end));
                } else if (filters.dueFilter === 'month') {
                    const start = startOfMonth(now);
                    const end = endOfMonth(now);
                    conditions.push(gte(task.due_date, start), lte(task.due_date, end));
                } else if (filters.dueFilter === 'next_week') {
                    const nextWeekStart = addWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1);
                    const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });
                    conditions.push(gte(task.due_date, nextWeekStart), lte(task.due_date, nextWeekEnd));
                } else if (filters.dueFilter === 'next_month') {
                    const nextMonthStart = addMonths(startOfMonth(now), 1);
                    const nextMonthEnd = endOfMonth(nextMonthStart);
                    conditions.push(gte(task.due_date, nextMonthStart), lte(task.due_date, nextMonthEnd));
                } else if (filters.dueFilter === 'next_week') {
                    const nextWeekStart = addWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1);
                    const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });
                    conditions.push(gte(task.due_date, nextWeekStart), lte(task.due_date, nextWeekEnd));
                } else if (filters.dueFilter === 'next_month') {
                    const nextMonthStart = addMonths(startOfMonth(now), 1);
                    const nextMonthEnd = endOfMonth(nextMonthStart);
                    conditions.push(gte(task.due_date, nextMonthStart), lte(task.due_date, nextMonthEnd));
                }

                return conditions.length > 0 ? and(...conditions) : undefined;
            },
            with: {
                user: true,
                client: true,
                assigned_by_user: true,
            },
        });

        return response.map((data) => ({
            id: data.id,
            agent: data.user,
            assignedBy: data.assigned_by_user,
            due_date: data.due_date?.toString() ?? '',
            created_at: data.created_at?.toString(),
            task: data.task ?? 'No Task',
            title: data.title ?? 'No Title',
            priority: data.priority ?? 'No Priority',
            status: data.status ?? 'No Status',
            transaction_id: data.transaction_id ?? '',
            transaction_type: data.transaction_type ?? '',
            client_id: data.client_id ?? '',
            deal_id: data.deal_id ?? '',
            assigned_by_id: data.assigned_by_id_v2 ?? '',
            number: data.number ?? '',
            type: data.type ?? '',
        }));
    },
    fetchCreatedTaskInfinite: async (filters) => {
        const now = new Date();
        const limitNum = filters.limit ? filters.limit : 12;

        const whereConditions = (task: any, { and, eq, lt, gte, lte }: any) => {
            const conditions = [];

            if (filters.agent_id) {
                conditions.push(eq(task.user_id, filters.agent_id));
            }

            if (filters.type) {
                conditions.push(eq(task.type, filters.type));
            }

            if (filters.status !== 'Completed') {
                conditions.push(notIlike(task.status, 'Completed'));
            } else if (!filters.status) {
                conditions.push(notIlike(task.status, 'Completed'));
            } else {
                conditions.push(ilike(task.status, filters.status));
            }

            if (filters.dueFilter === 'overdue') {
                conditions.push(lt(task.due_date, startOfDay(now)));
            } else if (filters.dueFilter === 'today') {
                conditions.push(gte(task.due_date, startOfDay(now)), lte(task.due_date, endOfDay(now)));
            } else if (filters.dueFilter === 'week') {
                const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
                const end = endOfWeek(now, { weekStartsOn: 1 });
                conditions.push(gte(task.due_date, start), lte(task.due_date, end));
            } else if (filters.dueFilter === 'this_week') {
                const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
                const end = endOfWeek(now, { weekStartsOn: 1 });
                conditions.push(gte(task.due_date, start), lte(task.due_date, end));
            } else if (filters.dueFilter === 'month') {
                const start = startOfMonth(now);
                const end = endOfMonth(now);
                conditions.push(gte(task.due_date, start), lte(task.due_date, end));
            } else if (filters.dueFilter === 'next_week') {
                const nextWeekStart = addWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1);
                const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });
                conditions.push(gte(task.due_date, nextWeekStart), lte(task.due_date, nextWeekEnd));
            } else if (filters.dueFilter === 'next_month') {
                const nextMonthStart = addMonths(startOfMonth(now), 1);
                const nextMonthEnd = endOfMonth(nextMonthStart);
                conditions.push(gte(task.due_date, nextMonthStart), lte(task.due_date, nextMonthEnd));
            }

            // Add cursor condition for pagination
            if (filters.curosr) {
                conditions.push(lt(task.created_at, new Date(filters.curosr)));
            }

            return conditions.length > 0 ? and(...conditions) : undefined;
        };

        const response = await db.query.task.findMany({
            where: whereConditions,
            with: {
                user: true,
                client: true,
                assigned_by_user: true,
            },
            orderBy: (task, { desc }) => [desc(task.created_at)],
            limit: limitNum + 1, // Get one extra to check if there are more
        });

        const hasMore = response.length > limitNum;
        const data = response.slice(0, limitNum);
        const nextCursor = hasMore ? new Date(data[data.length - 1]?.created_at).toISOString() : undefined;

        return {
            data: data.map((item) => ({
                id: item.id,
                agent: item.user,
                assignedBy: item.assigned_by_user,
                due_date: item.due_date?.toString() ?? '',
                created_at: item.created_at?.toString(),
                task: item.task ?? 'No Task',
                title: item.title ?? 'No Title',
                priority: item.priority ?? 'No Priority',
                status: item.status ?? 'No Status',
                transaction_id: item.transaction_id ?? '',
                transaction_type: item.transaction_type ?? '',
                client_id: item.client_id ?? '',
                deal_id: item.deal_id ?? '',
                assigned_by_id: item.assigned_by_id_v2 ?? '',
                number: item.number ?? '',
                type: item.type ?? '',
            })),
            hasMore,
            nextCursor: nextCursor ?? '',
        };
    },
    fetchTaskByClient: async (client_id) => {
        const response = await db.query.task.findMany({
            where: and(eq(task.client_id, client_id), notIlike(task.status, 'Completed')),
            with: {
                user: true,
                client: true,
                assigned_by_user: true,
            },
            orderBy: (task, { desc }) => [desc(task.created_at)],
        });
        return response.map((data) => ({
            id: data.id,
            agent: data.user,
            assignedBy: data.assigned_by_user,
            due_date: data.due_date?.toString() ?? '',
            created_at: data.created_at?.toString(),
            task: data.task ?? 'No Task',
            title: data.title ?? 'No Title',
            priority: data.priority ?? 'No Priority',
            status: data.status ?? 'No Status',
            transaction_id: data.transaction_id ?? '',
            transaction_type: data.transaction_type ?? '',
            client_id: data.client_id ?? '',
            deal_id: data.deal_id ?? '',
            assigned_by_id: data.assigned_by_id_v2 ?? '',
            number: data.number ?? '',
            type: data.type ?? '',
        }));
    },
    updateTaskStatus: async (id, status) => {
        await db
            .update(task)
            .set({
                status: status,
            })
            .where(eq(task.id, id));
    },
    fetchScheduledTasks: async (id) => {
        const now = new Date();
        const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000); // Current time + 5 minute

        const scheduleTasks = await db.query.task.findMany({
            where: and(eq(task.user_id, id), ne(task.status, 'Completed'), lte(task.due_date, fiveMinutesLater)),
            with: {
                assigned_by_user: true,
                client: true,
                user: true,
            },
        });
        return scheduleTasks.map((data) => ({
            id: data.id,
            agent: data.user,
            assignedBy: data.assigned_by_user,
            due_date: data.due_date?.toString() ?? '',
            created_at: data.created_at?.toString(),
            task: data.task ?? 'No Task',
            title: data.title ?? 'No Title',
            priority: data.priority ?? 'No Priority',
            status: data.status ?? 'No Status',
            transaction_id: data.transaction_id ?? '',
            transaction_type: data.transaction_type ?? '',
            client_id: data.client_id ?? '',
            deal_id: data.deal_id ?? '',
            assigned_by_id: data.assigned_by_id_v2 ?? '',
            number: data.number ?? '',
            type: data.type ?? '',
        }));
    },
    fetchTaskById: async (id) => {
        const response = await db.query.task.findFirst({
            where: eq(task.id, id),
        });
        if (!response) {
            throw new AppError('Task not found', true, 404);
        }
        return {
            id: response.id,
            agent_id: response.user_id ?? '',
            due_date: response.due_date?.toString() ?? '',
            created_at: response.created_at?.toString(),
            task: response.task ?? 'No Task',
            title: response.title ?? 'No Title',
            priority: response.priority ?? 'No Priority',
            status: response.status ?? 'No Status',
            transaction_id: response.transaction_id ?? '',
            transaction_type: response.transaction_type ?? '',
            client_id: response.client_id ?? '',
            deal_id: response.deal_id ?? '',
            assigned_by_id: response.assigned_by_id_v2 ?? '',
            number: response.number ?? '',
            type: response.type ?? '',
        };
    },
    fetchTaskByTransaction: async (transaction_id) => {
        const response = await db.query.task.findMany({
            where: eq(task.transaction_id, transaction_id),
            with: {
                user: true,
                client: true,
                assigned_by_user: true,
            }
        });
        return response.map((data) => ({
            id: data.id,
            agent: data.user,
            assignedBy: data.assigned_by_user,
            due_date: data.due_date?.toString() ?? '',
            created_at: data.created_at?.toString(),
            task: data.task ?? 'No Task',
            title: data.title ?? 'No Title',
            priority: data.priority ?? 'No Priority',
            status: data.status ?? 'No Status',
            transaction_id: data.transaction_id ?? '',
            transaction_type: data.transaction_type ?? '',
            client_id: data.client_id ?? '',
            deal_id: data.deal_id ?? '',
            assigned_by_id: data.assigned_by_id_v2 ?? '',
            number: data.number ?? '',
            type: data.type ?? '',
        }));
    },
    fetchNumberOfPendingTasks: async (agent_id) => {
        const response = await db.query.task.findMany({
            where: and(eq(task.user_id, agent_id), notIlike(task.status, 'Completed')),
        });
        return {
            count: response.length,
        };
    },
    deleteTaskById: async (id) => {
        await db.delete(task).where(eq(task.id, id));
    },

}