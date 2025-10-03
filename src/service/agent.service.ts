import { AgentRepo } from "../repository/agent.repo";
import { AppError } from "../middleware/errorHandler";


export const agentService = (repo: AgentRepo) => {
    return {
        fetchEnquirySummaryByAgent: async (agentId: string, isFetchAll: boolean, agentToFetch: string) => {

            if (!agentId) {
                throw new AppError('Agent ID is required', true, 400);
            }
            return await repo.fetchEnquirySummaryByAgent(agentId, isFetchAll, agentToFetch);
        }
    }
}