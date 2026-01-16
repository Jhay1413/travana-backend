import { taskService } from "../service/task.service";
import { taskRepo } from "../repository/task.repo";
import { Request, Response } from "express";
const service = taskService(taskRepo);

export const taskController = {
    insertTask: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const task = await service.insertTask(data);
            res.status(201).json({
                message: 'Task created successfully',
            });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    updateTask: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const data = req.body;
            await service.updateTask(id, data);
            res.status(200).json({ message: 'Task updated successfully' });
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchTaskByAgent: async (req: Request, res: Response) => {
        try {
            const { agent_id } = req.params;

            if (!agent_id) {
                return res.status(400).json({ error: 'Agent ID is required' });
            }
            const task = await service.fetchTaskByAgent(agent_id as string);
            return res.status(200).json(task);
        } catch (error) {
            return res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchTaskByClient: async (req: Request, res: Response) => {
        try {
            const { client_id } = req.params;

            if (!client_id) {
                return res.status(400).json({ error: 'Client ID is required' });
            }
            const task = await service.fetchTaskByClient(client_id as string);
            return res.status(200).json(task);
        } catch (error) {
            return res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchCreatedTasks: async (req: Request, res: Response) => {
        try {
            const { agent_id, status, dueFilter, type } = req.query;
            const task = await service.fetchCreatedTasks({ agent_id: agent_id as string, status: status as string, dueFilter: dueFilter as string, type: type as string });
            res.status(200).json(
                task);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchCreatedTasksPaginated: async (req: Request, res: Response) => {
        try {
            const { agent_id, status, dueFilter, type, page, limit } = req.query;
            const task = await service.fetchCreatedTasksPaginated(
                { 
                    agent_id: agent_id as string, 
                    status: status as string, 
                    dueFilter: dueFilter as string, 
                    type: type as string,
                },
                {
                    page: page as string,
                    limit: limit as string,
                }
            );
            res.status(200).json(task);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchCreatedTaskInfinite: async (req: Request, res: Response) => {
        try {
            const { agent_id, status, dueFilter, type, cursor, limit } = req.query;
            const task = await service.fetchCreatedTaskInfinite({ 
                agent_id: agent_id as string, 
                status: status as string, 
                dueFilter: dueFilter as string, 
                type: type as string,
                cursor: cursor as string,
                limit: limit as string,
            });
            res.status(200).json(task);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    updateTaskStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            await service.updateTaskStatus(id as string, status as string);
            res.status(200).json({ message: 'Task status updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchScheduledTasks: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID is required' });
            }
            const task = await service.fetchScheduledTasks(id as string);
            return res.status(200).json(task);
        } catch (error) {
            return res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchTaskById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID is required' });
            }
            const task = await service.fetchTaskById(id as string);
            return res.status(200).json(task);
        } catch (error) {
            return res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchTaskByTransaction: async (req: Request, res: Response) => {
        try {
            const { transaction_id } = req.params;
            if (!transaction_id) {
                return res.status(400).json({ error: 'Transaction ID is required' });
            }
            const task = await service.fetchTaskByTransaction(transaction_id as string);
            return res.status(200).json(task);
        } catch (error) {
            return res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchNumberOfPendingTasks: async (req: Request, res: Response) => {
        try {
            const { agent_id } = req.params;
            if (!agent_id) {
                return res.status(400).json({ error: 'Agent ID is required' });
            }
            const task = await service.fetchNumberOfPendingTasks(agent_id as string);
            return res.status(200).json(task);
        } catch (error) {
            return res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    deleteTaskById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await service.deleteTaskById(id as string);
            res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
};