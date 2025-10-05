import { z } from "zod";
import { ticketMutationSchema, ticketReplyMutationSchema } from "../types/modules/ticket/mutation";
import { and, count, eq, ilike, ne, or } from "drizzle-orm";
import { db } from "../db/db";
import { ticket, ticket_file, ticket_reply, ticket_reply_file } from "../schema/ticket-schema";
import { ticketQuerySchema, ticketReplyQuerySchema, TicketsFilters } from "../types/modules/ticket/query";
import { AppError } from "../middleware/errorHandler";
import { user } from "../schema/auth-schema";



export type TicketsRepo = {
    insertTicket: (data: z.infer<typeof ticketMutationSchema>) => Promise<string>,
    fetchTickets: (data: TicketsFilters) => Promise<z.infer<typeof ticketQuerySchema>[]>,
    fetchTickeyById: (id: string) => Promise<z.infer<typeof ticketQuerySchema>>,
    updateTicket: (id: string, data: z.infer<typeof ticketMutationSchema>) => Promise<void>,
    deleteTicket: (id: string) => Promise<void>,
    updateTicketStatus: (id: string, status: string) => Promise<void>,
    assignTicket: (id: string, agent_id: string) => Promise<void>,
    insertTicketReply: (id: string, data: z.infer<typeof ticketReplyMutationSchema>) => Promise<string>,
    insertTicketReplyFile: (data: {
        agent_id: string;
        ticket_id: string;
        reply: string;
        filesData?: Array<{
            file_name: string;
            file_path: string;
            file_size: string;
            file_type: string;
        }>;
    },) => Promise<string>,
    fetchTicketReplies: (id: string) => Promise<z.infer<typeof ticketReplyQuerySchema>[]>,
    updateTicketReply: (id: string, reply: string) => Promise<void>,
    deleteTicketReply: (id: string) => Promise<void>,
    fetchTicketStats: (agent_id?: string) => Promise<{
        total: number;
        open: number;
        closed: number;
        inProgress: number;
    }>,
    fetchAgentStats: () => Promise<Array<{ id: string; name: string; pending: number; closed: number }>>
    fetchCategoryStats: () => Promise<Array<{ category: string; count: number }>>
    countAssignedTickets: (agent_id: string) => Promise<number>
}
const generateTicketId = async (): Promise<string> => {
    let ticketId: string;
    let isUnique = false;

    while (!isUnique) {
        // Generate a random 7-digit number
        ticketId = Math.floor(1000000 + Math.random() * 9000000).toString();

        // Check if this ticket ID already exists
        const existingTicket = await db.query.ticket.findFirst({
            where: eq(ticket.ticket_id, ticketId),
        });

        if (!existingTicket) {
            isUnique = true;
        }
    }

    return ticketId!;
};


export const ticketsRepo: TicketsRepo = {
    insertTicket: async (data) => {
        const ticketId = await generateTicketId();

        const inserted_ticket = await db
            .insert(ticket)
            .values({
                ...data,
                agent_id: undefined,
                user_id: data.agent_id,
                ticket_id: ticketId,
                client_id: data.client_id == '' ? null : data.client_id,
                created_by: undefined,
                created_by_user: data.created_by || undefined,
            })
            .returning({ id: ticket.id, ticket_id: ticket.ticket_id });

        if (data.filesData && data.filesData.length > 0) {
            await db.insert(ticket_file).values(
                data.filesData.map((file) => {
                    return {
                        ticket_id: inserted_ticket[0].id,
                        file_name: file.file_name,
                        file_path: file.file_path,
                        file_size: file.file_size,
                        file_type: file.file_type,
                    };
                })
            );
        }

        return inserted_ticket[0].id;
    },
    fetchTickets: async (filters) => {

        const conditions = [];

        if (filters.status) {
            conditions.push(eq(ticket.status, filters.status));
        }
        if (filters.priority) {
            conditions.push(eq(ticket.priority, filters.priority));
        }
        if (filters.category) {
            conditions.push(eq(ticket.category, filters.category));
        }
        if (filters.agent_id) {
            conditions.push(eq(ticket.user_id, filters.agent_id));
        }
        if (filters.client_id) {
            conditions.push(eq(ticket.client_id, filters.client_id));
        }
        if (filters.ticket_type) {
            conditions.push(eq(ticket.ticket_type, filters.ticket_type));
        }
        if (filters.search) {
            conditions.push(
                or(
                    ilike(ticket.subject, `%${filters.search}%`),
                    ilike(ticket.description, `%${filters.search}%`),
                    ilike(ticket.category, `%${filters.search}%`)
                )
            );
        }

        const response = await db.query.ticket.findMany({
            where:
                conditions.length > 0
                    ? and(...conditions, filters.status === 'closed' ? eq(ticket.status, 'closed') : ne(ticket.status, 'closed'))
                    : filters.status === 'closed'
                        ? eq(ticket.status, 'closed')
                        : ne(ticket.status, 'closed'),
            with: {
                client: true,
                user: true,
                replies: {
                    orderBy: (ticket_reply, { desc }) => [desc(ticket_reply.created_at)],
                    limit: 1,
                    with: {
                        user: true,
                    },
                },
            },
            orderBy: (ticket, { desc, asc }) => [filters.sort === 'oldest' ? asc(ticket.created_at) : desc(ticket.created_at)],
        });

        return response.map((data) => ({
            id: data.id,
            ticket_type: data.ticket_type as 'admin' | 'sales' | 'travana',
            transaction_type: data.transaction_type,
            deal_id: data.deal_id,
            subject: data.subject,
            description: data.description ?? 'No Description',
            title: data.subject ?? 'No Subject', // Use subject as title for compatibility
            author: {
                id: data.user_id ?? '',
                name: data.user ? `${data.user.firstName} ${data.user.lastName}` : 'System',
                avatar: 'na',
            },
            client: {
                id: data.client_id ?? '',
                name: data.client ? `${data.client.firstName} ${data.client.surename}` : 'Unknown',
                avatar: 'na',
                email: data.client?.email || '',
                title: data.client?.title || null,
            },
            created_by_name: data.created_by_user ? data.created_by_user : 'Unknown',
            category: data.category ?? 'No Category',
            priority: data.priority ?? 'No Priority',
            status: data.status ?? 'No Status',
            client_id: data.client_id,
            agent_id: data.agent_id,
            createdAt: data.created_at?.toString() ?? '',
            updatedAt: data.updated_at?.toString() ?? '',
            created_at: data.created_at?.toString() ?? '',
            updated_at: data.updated_at?.toString() ?? '',
            assignedTo: data.user ? `${data.user.firstName} ${data.user.lastName}` : 'Unassigned',
            likes: 0,
            lastComment:
                data.replies.length > 0
                    ? {
                        author: data.replies[0].user ? `${data.replies[0].user.firstName} ${data.replies[0].user.lastName}` : 'Unknown',
                        content: data.replies[0].reply ?? 'No Comment',
                    }
                    : null,
            isLocked: false,
        }));
    },
    fetchTickeyById: async (id) => {
        const response = await db.query.ticket.findFirst({
            where: eq(ticket.id, id),
            with: {
                client: true,
                user: true,
                files: true,
                created_by: true,
                created_by_user: true,
                replies: {
                    orderBy: (ticket_reply, { desc }) => [desc(ticket_reply.created_at)],
                    with: {
                        user: true,
                    },
                },
            },
        });

        if (!response) {
            throw new AppError('Ticket not found', true, 404);
        }

        return {
            id: response.id,
            ticket_id: response.ticket_id,
            ticket_type: response.ticket_type as 'admin' | 'sales' | 'travana',
            transaction_type: response.transaction_type,
            deal_id: response.deal_id,
            subject: response.subject ?? 'No Subject',
            title: response.subject ?? 'No Subject', // Use subject as title for compatibility
            author: {
                id: response.user_id ?? '',
                name: response.user ? `${response.user.firstName} ${response.user.lastName}` : 'System',
                avatar: 'na',
            },
            client: {
                id: response.client_id ?? '',
                name: response.client ? `${response.client.firstName} ${response.client.surename}` : 'Unknown',
                avatar: 'na',
                email: response.client?.email || '',
            },
            description: response.description ?? 'No Description',
            category: response.category ?? 'No Category',
            priority: response.priority ?? 'No Priority',
            status: response.status ?? 'No Status',
            client_id: response.client_id,
            agent_id: response.agent_id,
            created_by: response.created_by,
            created_by_name: response.created_by_user ? `${response.created_by_user.firstName} ${response.created_by_user.lastName}` : 'Unknown',
            updatedAt: response.updated_at?.toString() ?? '',
            createdAt: response.created_at?.toString() ?? '',
            created_at: response.created_at?.toString() ?? '',
            updated_at: response.updated_at?.toString() ?? '',
            assignedTo: response.user ? `${response.user.firstName} ${response.user.lastName}` : 'Unassigned',
            likes: 0,
            lastComment:
                response.replies.length > 0
                    ? {
                        author: response.replies[0].user ? `${response.replies[0].user.firstName} ${response.replies[0].user.lastName}` : 'Unknown',
                        content: response.replies[0].reply ?? 'No Comment',
                    }
                    : null,
            isLocked: false,
            files: response.files.map((file) => ({
                file_name: file.file_name ?? '',
                file_path: file.file_path ?? '',
                file_size: file.file_size ?? '',
                file_type: file.file_type ?? '',
                signed_url: file.file_path ?? '',
            })),
        };
    },
    updateTicket: async (id, data) => {
        const existing_ticket = await db.query.ticket.findFirst({
            where: eq(ticket.id, id),
        });

        if (!existing_ticket) {
            throw new AppError('Ticket not found', true, 404);
        }

        await db
            .update(ticket)
            .set({
                ...data,
                agent_id: undefined,
                created_by: undefined,
                user_id: data.agent_id,
                created_by_user: data.created_by || '',
            })
            .where(eq(ticket.id, id));
    },
    updateTicketStatus: async (id, status) => {
        const existing_ticket = await db.query.ticket.findFirst({
            where: eq(ticket.id, id),
        });

        if (!existing_ticket) {
            throw new AppError('Ticket not found', true, 404);
        }

        await db
            .update(ticket)
            .set({
                status: status,
            })
            .where(eq(ticket.id, id));

        // Emit socket event for ticket status update
        //   emitTicketStatusUpdated({
        //     ticketId: ticket_id,
        //     status: status,
        //     updatedBy: existing_ticket.user_id || 'system',
        //   });
    },
    assignTicket: async (id, agent_id) => {
        const existing_ticket = await db.query.ticket.findFirst({
            where: eq(ticket.id, id),
        });

        if (!existing_ticket) {
            throw new AppError('Ticket not found', true, 404);
        }

        await db
            .update(ticket)
            .set({
                user_id: agent_id,
            })
            .where(eq(ticket.id, id));

    },
    insertTicketReply: async (id, data) => {
        const inserted_reply = await db
            .insert(ticket_reply)
            .values({
                user_id: data.agent_id,
                ticket_id: id,
                reply: data.reply,
            })
            .returning({ id: ticket_reply.id });

        if (data.filesData && data.filesData.length > 0) {
            await db.insert(ticket_reply_file).values(
                data.filesData.map((file) => {
                    return {
                        ticket_reply_id: inserted_reply[0].id,
                        file_name: file.file_name,
                        file_path: file.file_path,
                        file_size: file.file_size,
                        file_type: file.file_type,
                    };
                })
            );
        }

        //   // Emit socket event for ticket reply
        //   emitTicketReplyAdded({
        //     ticketId: data.ticket_id,
        //     replyId: inserted_reply[0].id,
        //     agentId: data.agent_id,
        //     content: data.reply,
        //   });

        return inserted_reply[0].id;
    },
    insertTicketReplyFile: async (data) => {
        const inserted_reply = await db
            .insert(ticket_reply)
            .values({
                user_id: data.agent_id,
                ticket_id: data.ticket_id,
                reply: data.reply,
            })
            .returning({ id: ticket_reply.id });

        if (data.filesData && data.filesData.length > 0) {
            await db.insert(ticket_reply_file).values(
                data.filesData.map((file) => {
                    return {
                        ticket_reply_id: inserted_reply[0].id,
                        file_name: file.file_name,
                        file_path: file.file_path,
                        file_size: file.file_size,
                        file_type: file.file_type,
                    };
                })
            );
        }

        return inserted_reply[0].id;
    },
    fetchTicketReplies: async (id) => {
        const response = await db.query.ticket_reply.findMany({
            where: eq(ticket_reply.ticket_id, id),
            with: {
                agent: true,
                files: true,
            },
            orderBy: (reply, { asc }) => [asc(reply.created_at)],
        });

        return response.map((data) => ({
            id: data.id,
            ticket_id: data.ticket_id ?? '',
            reply: data.reply ?? '',
            agent_id: data.agent_id ?? undefined,
            created_at: data.created_at?.toString() ?? '',
            updated_at: data.updated_at?.toString() ?? '',
            agent: data.agent
                ? {
                    id: data.agent.id,
                    firstName: data.agent.firstName ?? '',
                    lastName: data.agent.lastName ?? '',
                    email: data.agent.email ?? '',
                    phone: data.agent.phoneNumber ?? '',
                    role: data.agent.role ?? '',
                    created_at: '',
                    updated_at: '',
                }
                : undefined,
            files: data.files.map((file) => ({
                file_name: file.file_name ?? '',
                file_path: file.file_path ?? '',
                file_size: file.file_size ?? '',
                file_type: file.file_type ?? '',
                signed_url: file.file_path ?? '',
            })),
        }));
    },
    updateTicketReply: async (id, reply) => {
        await db.update(ticket_reply).set({ reply: reply }).where(eq(ticket_reply.id, id));
    },
    deleteTicket: async (id) => {
        await db.delete(ticket).where(eq(ticket.id, id));
    },
    deleteTicketReply: async (id) => {
        await db.delete(ticket_reply).where(eq(ticket_reply.id, id));
    },
    fetchTicketStats: async (agent_id) => {
        const conditions = [];

        if (agent_id) {
            conditions.push(eq(ticket.user_id, agent_id));
        }

        const response = await db
            .select({
                status: ticket.status,
                count: count(),
            })
            .from(ticket)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .groupBy(ticket.status);

        const stats = {
            total: 0,
            open: 0,
            closed: 0,
            inProgress: 0,
        };

        response.forEach((item) => {
            stats.total += Number(item.count);
            if (item.status === 'open') {
                stats.open = Number(item.count);
            } else if (item.status === 'closed') {
                stats.closed = Number(item.count);
            } else if (item.status === 'in_progress') {
                stats.inProgress = Number(item.count);
            }
        });

        return stats;
    },
    fetchAgentStats: async () => {
        const response = await db
            .select({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                pending: db.$count(ticket, and(eq(ticket.user_id, user.id), ne(ticket.status, 'closed'))),
                closed: db.$count(ticket, and(eq(ticket.user_id, user.id), eq(ticket.status, 'closed'))),
            })
            .from(user)
            .leftJoin(ticket, eq(user.id, ticket.user_id))
            .groupBy(user.id);

        return response.map((data) => ({
            id: data.id,
            name: `${data.firstName} ${data.lastName}`,
            pending: data.pending,
            closed: data.closed,
        }));
    },
    fetchCategoryStats: async () => {
        const response = await db
            .select({
                category: ticket.category,
                count: count(),
            })
            .from(ticket)
            .groupBy(ticket.category);

        return response.map((data) => ({
            category: data.category ?? '',
            count: Number(data.count),
        }));
    },
    countAssignedTickets: async (agent_id) => {
        const assignedTicketsCount = await db
            .select({ count: count() })
            .from(ticket)
            .where(and(eq(ticket.user_id, agent_id), ne(ticket.status, 'closed')));

        return assignedTicketsCount[0].count;
    }
}