import { db } from '../db/db';
import { ticket } from '../schema/ticket-schema';
import { task } from '../schema/task-schema';
import { clientTable } from '../schema/client-schema';
import { sql, and, eq, gte, lte, or, desc } from 'drizzle-orm';
import { z } from 'zod';
import { user } from '../schema/auth-schema';

// Unified work item schema
export const workItemQuerySchema = z.object({
  id: z.string(),
  item_type: z.enum(['ticket', 'task']),
  title: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  priority: z.string().nullable(),
  due_date: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
  agent: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
    })
    .nullable(),
  client: z
    .object({
      id: z.string(),
      firstName: z.string(),
      surename: z.string(),
      email: z.string(),
    })
    .nullable(),
  deal_id: z.string().nullable(),
  transaction_type: z.string().nullable(),
  category: z.string().nullable(),
  ticket_id: z.string().nullable(),
  ticket_type: z.string().nullable(),
});

export type WorkItem = z.infer<typeof workItemQuerySchema>;

interface WorkItemsFilters {
  agent_id: string;
  status?: string;
  priority?: string;
  dueFilter?: 'today' | 'week' | 'month' | 'all';
  type?: 'ticket' | 'task' | 'all';
}

export const workItemsRepo = {
  /**
   * Fetch combined work items (tickets + tasks)
   */
  fetchWorkItems: async (filters: WorkItemsFilters): Promise<WorkItem[]> => {
    const { agent_id, status, priority, dueFilter, type = 'all' } = filters;

    // Date range calculations
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (dueFilter === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (dueFilter === 'week') {
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
      endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
      endDate.setHours(23, 59, 59);
    } else if (dueFilter === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const fetchTickets = type === 'all' || type === 'ticket';
    const fetchTasks = type === 'all' || type === 'task';

    const results: WorkItem[] = [];

    // Fetch tickets
    if (fetchTickets) {
      const ticketConditions = [eq(ticket.user_id, agent_id)];

      if (status) {
        ticketConditions.push(eq(ticket.status, status));
      }
      if (priority) {
        ticketConditions.push(eq(ticket.priority, priority));
      }
      if (startDate && endDate && ticket.due_date) {
        ticketConditions.push(
          and(gte(ticket.due_date, startDate), lte(ticket.due_date, endDate)) as any
        );
      }

      const tickets = await db
        .select({
          id: ticket.id,
          title: ticket.subject,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          due_date: ticket.due_date,
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          deal_id: ticket.deal_id,
          transaction_type: ticket.transaction_type,
          category: ticket.category,
          ticket_id: ticket.ticket_id,
          ticket_type: ticket.ticket_type,
          agent_id: user.id,
          agent_firstName: user.firstName,
          agent_lastName: user.lastName,
          agent_email: user.email,
          client_id: clientTable.id,
          client_firstName: clientTable.firstName,
          client_surename: clientTable.surename,
          client_email: clientTable.email,
        })
        .from(ticket)
        .leftJoin(user, eq(ticket.user_id, user.id))
        .leftJoin(clientTable, eq(ticket.client_id, clientTable.id))
        .where(and(...ticketConditions))
        .orderBy(desc(ticket.due_date));

      tickets.forEach((t) => {
        results.push({
          id: t.id,
          item_type: 'ticket',
          title: t.title || '',
          description: t.description || null,
          status: t.status || '',
          priority: t.priority || null,
          due_date: t.due_date?.toISOString() || null,
          created_at: t.created_at?.toISOString() || new Date().toISOString(),
          updated_at: t.updated_at?.toISOString() || null,
          agent: t.agent_id
            ? {
                id: t.agent_id,
                firstName: t.agent_firstName || '',
                lastName: t.agent_lastName || '',
                email: t.agent_email || '',
              }
            : null,
          client: t.client_id
            ? {
                id: t.client_id,
                firstName: t.client_firstName || '',
                surename: t.client_surename || '',
                email: t.client_email || '',
              }
            : null,
          deal_id: t.deal_id || null,
          transaction_type: t.transaction_type || null,
          category: t.category || null,
          ticket_id: t.ticket_id || null,
          ticket_type: t.ticket_type || null,
        });
      });
    }

    // Fetch tasks
    if (fetchTasks) {
      const taskConditions = [eq(task.user_id, agent_id)];

      if (status) {
        taskConditions.push(eq(task.status, status));
      }
      if (priority) {
        taskConditions.push(eq(task.priority, priority));
      }
      if (startDate && endDate && task.due_date) {
        taskConditions.push(
          and(gte(task.due_date, startDate), lte(task.due_date, endDate)) as any
        );
      }

      const tasks = await db
        .select({
          id: task.id,
          title: task.title,
          description: task.task,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
          created_at: task.created_at,
          deal_id: task.deal_id,
          transaction_type: task.transaction_type,
          agent_id: user.id,
          agent_firstName: user.firstName,
          agent_lastName: user.lastName,
          agent_email: user.email,
          client_id: clientTable.id,
          client_firstName: clientTable.firstName,
          client_surename: clientTable.surename,
          client_email: clientTable.email,
        })
        .from(task)
        .leftJoin(user, eq(task.user_id, user.id))
        .leftJoin(clientTable, eq(task.client_id, clientTable.id))
        .where(and(...taskConditions))
        .orderBy(desc(task.due_date));

      tasks.forEach((t) => {
        results.push({
          id: t.id,
          item_type: 'task',
          title: t.title || '',
          description: t.description || null,
          status: t.status || '',
          priority: t.priority || null,
          due_date: t.due_date?.toISOString() || null,
          created_at: t.created_at || new Date().toISOString(),
          updated_at: null,
          agent: t.agent_id
            ? {
                id: t.agent_id,
                firstName: t.agent_firstName || '',
                lastName: t.agent_lastName || '',
                email: t.agent_email || '',
              }
            : null,
          client: t.client_id
            ? {
                id: t.client_id,
                firstName: t.client_firstName || '',
                surename: t.client_surename || '',
                email: t.client_email || '',
              }
            : null,
          deal_id: t.deal_id || null,
          transaction_type: t.transaction_type || null,
          category: null,
          ticket_id: null,
          ticket_type: null,
        });
      });
    }

    // Sort by due_date descending (most recent first)
    results.sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
    });

    return results;
  },

  /**
   * Get statistics for work items
   */
  fetchWorkItemsStats: async (agent_id: string) => {
    const now = new Date();

    // Get counts for tickets
    const ticketStats = await db
      .select({
        total: sql<number>`count(*)`,
        pending: sql<number>`count(*) filter (where ${ticket.status} = 'open')`,
        completed: sql<number>`count(*) filter (where ${ticket.status} = 'closed')`,
        overdue: sql<number>`count(*) filter (where ${ticket.due_date} < ${now} and ${ticket.status} != 'closed')`,
      })
      .from(ticket)
      .where(eq(ticket.user_id, agent_id));

    // Get counts for tasks
    const taskStats = await db
      .select({
        total: sql<number>`count(*)`,
        pending: sql<number>`count(*) filter (where ${task.status} != 'COMPLETED')`,
        completed: sql<number>`count(*) filter (where ${task.status} = 'COMPLETED')`,
        overdue: sql<number>`count(*) filter (where ${task.due_date} < ${now} and ${task.status} != 'COMPLETED')`,
      })
      .from(task)
      .where(eq(task.user_id, agent_id));

    return {
      tickets: ticketStats[0] || { total: 0, pending: 0, completed: 0, overdue: 0 },
      tasks: taskStats[0] || { total: 0, pending: 0, completed: 0, overdue: 0 },
      combined: {
        total: (ticketStats[0]?.total || 0) + (taskStats[0]?.total || 0),
        pending: (ticketStats[0]?.pending || 0) + (taskStats[0]?.pending || 0),
        completed: (ticketStats[0]?.completed || 0) + (taskStats[0]?.completed || 0),
        overdue: (ticketStats[0]?.overdue || 0) + (taskStats[0]?.overdue || 0),
      },
    };
  },
};
