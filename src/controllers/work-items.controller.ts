import { Request, Response } from 'express';
import { workItemsRepo } from '../repository/work-items.repo';

export const workItemsController = {
  /**
   * Fetch combined work items (tickets + tasks) for an agent
   * Query params:
   *  - agent_id: string (required)
   *  - status: string (optional) - filter by status
   *  - priority: string (optional) - filter by priority
   *  - dueFilter: 'today' | 'week' | 'month' | 'all' (optional)
   *  - type: 'ticket' | 'task' | 'all' (optional) - default 'all'
   */
  fetchWorkItems: async (req: Request, res: Response) => {
    try {
      const { agent_id, status, priority, dueFilter, type } = req.query;

      if (!agent_id || typeof agent_id !== 'string') {
        return res.status(400).json({ message: 'agent_id is required' });
      }

      const filters = {
        agent_id,
        status: status as string | undefined,
        priority: priority as string | undefined,
        dueFilter: dueFilter as 'today' | 'week' | 'month' | 'all' | undefined,
        type: (type as 'ticket' | 'task' | 'all' | undefined) || 'all',
      };

      const workItems = await workItemsRepo.fetchWorkItems(filters);

      return res.status(200).json(workItems);
    } catch (error) {
      console.error('Error fetching work items:', error);
      return res.status(500).json({ message: 'Failed to fetch work items' });
    }
  },

  /**
   * Get count statistics for work items
   */
  fetchWorkItemsStats: async (req: Request, res: Response) => {
    try {
      const { agent_id } = req.query;

      if (!agent_id || typeof agent_id !== 'string') {
        return res.status(400).json({ message: 'agent_id is required' });
      }

      const stats = await workItemsRepo.fetchWorkItemsStats(agent_id);

      return res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching work items stats:', error);
      return res.status(500).json({ message: 'Failed to fetch work items stats' });
    }
  },
};
