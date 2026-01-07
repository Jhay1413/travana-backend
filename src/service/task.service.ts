import { TaskRepo } from "../repository/task.repo";
import { taskMutationSchema } from "../types/modules/agent/mutation";
import z from "zod";

export const taskService = (taskRepo: TaskRepo) => {
    return {
        insertTask: async (data: z.infer<typeof taskMutationSchema>) => {
            return await taskRepo.insertTask(data);
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