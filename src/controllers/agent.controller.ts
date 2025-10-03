import { agentService } from "../service/agent.service";
import { agentRepo } from "../repository/agent.repo";
import { Request, Response } from "express";

const service = agentService(agentRepo);

export const agentController = {
    fetchEnquirySummaryByAgent: async (req: Request, res: Response) => {
        try {
            const { agentId } = req.params;
            const {  isFetchAll, agentToFetch } = req.query;
            
            const isFetchAllBool = isFetchAll === "true" ? true : false;
            const enquirySummary = await service.fetchEnquirySummaryByAgent(agentId as string, isFetchAllBool, agentToFetch as string);
            res.status(200).json(enquirySummary);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    }
}