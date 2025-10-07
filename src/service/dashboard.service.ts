import { DashboardRepo } from "../repository/dashboard.repo";


export const dashboardService = (repo: DashboardRepo) => {
    return {
        fetchClientStats: async (clientId: string) => {
            return await repo.fetchClientStats(clientId);
        },
        fetchAgentStats: async (agentId: string) => {
            return await repo.fetchAgentStats(agentId);
        },
        insertTodo: async (agentId: string, note: string) => {
            return await repo.insertTodo(agentId, note);
        },
        fetchTodos: async (agentId: string) => {
            return await repo.fetchTodos(agentId);
        },
        updateTodo: async (id: string, status: "PENDING" | "DONE") => {
            return await repo.updateTodo(id, status);
        },
        deleteTodo: async (id: string) => {
            return await repo.deleteTodo(id);
        },
    }
}