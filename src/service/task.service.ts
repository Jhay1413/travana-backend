import { UserRepo } from "../repository/user.repo";
import { emitToUser } from "../lib/socket-handler";
import { NotificationRepo } from "../repository/notification.repo";
import { TaskRepo } from "../repository/task.repo";
import { taskMutationSchema } from "../types/modules/agent/mutation";
import z from "zod";

export const taskService = (taskRepo: TaskRepo, notificationRepo: NotificationRepo, userRepo: UserRepo) => {
    return {
        insertTask: async (data: z.infer<typeof taskMutationSchema>) => {
            const now = new Date();

            const user = await userRepo.fetchUserById(data.assigned_by_id || '');
            const response = await taskRepo.insertTask(data);
            const isOverdue = new Date(data.due_date) < now;
            const hoursOverdue = isOverdue
                ? Math.floor((now.getTime() - new Date(data.due_date).getTime()) / (60 * 60 * 1000))
                : 0;



            const notificationData = {
                type: "task_deadline",
                user_id_v2: data.agent_id,
                hoursDue: hoursOverdue,
                message: `${user?.firstName || 'A user'} has created a new task assigned to you`,
                reference_id: response.id,
                due_date: data.due_date,
                client_id: data.client_id,
            }
            await notificationRepo.insertNotification(
                notificationData.user_id_v2,
                notificationData.message,
                notificationData.type,
                notificationData.reference_id,
                notificationData.client_id,
                notificationData.due_date,
                notificationData.hoursDue,
            );

            emitToUser(notificationData.user_id_v2, 'task_reminder', undefined);
            return response;


        },
        updateTask: async (id: string, data: z.infer<typeof taskMutationSchema>) => {
            return await taskRepo.updateTask(id, data);
        },
        fetchTaskByAgent: async (agent_id: string) => {
            return await taskRepo.fetchTaskByAgent(agent_id);
        },
        fetchTaskByClient: async (client_id: string) => {
            return await taskRepo.fetchTaskByClient(client_id);
        },
        fetchCreatedTasks: async (filters: {
            agent_id?: string,
            status?: string,
            dueFilter?: string,
            type?: string,
        }) => {
            return await taskRepo.fetchCreatedTasks(filters);
        },
        fetchCreatedTasksPaginated: async (filters: {
            agent_id?: string,
            status?: string,
            dueFilter?: string,
            type?: string,
        }, pagination?: {
            page?: string,
            limit?: string,
        }) => {
            return await taskRepo.fetchCreatedTasksPaginated(filters, {
                page: pagination?.page ? parseInt(pagination.page) : undefined,
                limit: pagination?.limit ? parseInt(pagination.limit) : undefined,
            });
        },
        fetchCreatedTaskInfinite: async (filters: {
            agent_id?: string,
            status?: string,
            dueFilter?: string,
            type?: string,
            cursor?: string,
            limit?: string,
        }) => {
            return await taskRepo.fetchCreatedTaskInfinite({
                ...filters,
                limit: filters.limit ? parseInt(filters.limit) : undefined,
            });
        },
        updateTaskStatus: async (id: string, status: string) => {
            return await taskRepo.updateTaskStatus(id, status);
        },
        fetchScheduledTasks: async (id: string) => {
            return await taskRepo.fetchScheduledTasks(id);
        },
        fetchTaskById: async (id: string) => {
            return await taskRepo.fetchTaskById(id);
        },
        fetchTaskByTransaction: async (transaction_id: string) => {
            return await taskRepo.fetchTaskByTransaction(transaction_id);
        },
        fetchNumberOfPendingTasks: async (agent_id: string) => {
            return await taskRepo.fetchNumberOfPendingTasks(agent_id);
        },
        deleteTaskById: async (id: string) => {
            return await taskRepo.deleteTaskById(id);
        },
    };
};