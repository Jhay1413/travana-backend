import { dashboardRepo } from "../repository/dashboard.repo";
import { dashboardService } from "../service/dashboard.service";
import { Request, Response } from "express";

const service = dashboardService(dashboardRepo);

export const dashboardController = {
    fetchClientStats: async (req: Request, res: Response) => {
        try {
            const { clientId } = req.params;
            const clientStats = await service.fetchClientStats(clientId);
            res.status(200).json(clientStats);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchAgentStats: async (req: Request, res: Response) => {
        try {
            const { agentId } = req.params;
            const agentStats = await service.fetchAgentStats(agentId);
            res.status(200).json(agentStats);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    insertTodo: async (req: Request, res: Response) => {
        try {
            const { agentId } = req.params;
            const { note } = req.body;
            await service.insertTodo(agentId, note);
            res.status(200).json({ message: 'Todo inserted successfully' });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchTodos: async (req: Request, res: Response) => {
        try {
            const { agentId } = req.params;
            const todos = await service.fetchTodos(agentId);
            res.status(200).json(todos);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    updateTodo: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            await service.updateTodo(id, status);
            res.status(200).json({ message: 'Todo updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    deleteTodo: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await service.deleteTodo(id);
            res.status(200).json({ message: 'Todo deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchAdminDashboardStats: async (req: Request, res: Response) => {
        try {
            const { agentId } = req.query;
            const dashboardStats = await service.fetchAdminDashboardStats(agentId as string);
            res.status(200).json(dashboardStats);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchAdminAnalytics: async (req: Request, res: Response) => {
        try {
            const { agentId } = req.query;
            const analytics = await service.fetchAdminAnalytics(agentId as string);
            res.status(200).json(analytics);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
}