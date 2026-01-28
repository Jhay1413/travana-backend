import { AppError } from "../middleware/errorHandler";
import { S3Service } from "../lib/s3";
import { TicketsRepo } from "../repository/tickets.repo";
import { ticketMutationSchema, ticketReplyMutationSchema, TicketsFilters } from "../types/modules/ticket";
import z from "zod";
import { emitTicketCreated, emitTicketAssigned, emitTicketStatusUpdated, emitTicketReplyAdded, emitToUser } from "../lib/socket-handler";
import { response } from "express";
import { NotificationRepo } from "../repository/notification.repo";
import { UserRepo } from "../repository/user.repo";


export const TicketService = (repo: TicketsRepo, s3Service: S3Service, notificationRepo: NotificationRepo, userRepo: UserRepo) => {
    return {
        insertTicket: async (data: z.infer<typeof ticketMutationSchema>, file?: Express.Multer.File[]) => {
            let filesData: Array<{
                file_name: string;
                file_path: string;
                file_size: number;
                file_type: string;
            }> = [];
            if (file && file.length > 0) {
                filesData = await s3Service.uploadTicketFile(file);

            }
            const user = await userRepo.fetchUserById(data.created_by || '');
            if (!user) {
                throw new AppError('User not found', true, 404);
            }


            const ticket_data = {
                ticket_type: data.ticket_type,
                category: data.category,
                subject: data.subject,
                status: data.status,
                priority: data.priority,
                transaction_type: data.transaction_type,
                deal_id: data.deal_id,
                description: data.description,
                client_id: data.client_id,
                agent_id: data.agent_id,
                created_by: data.created_by,
                filesData: filesData.length > 0 ? filesData.map((file) => ({
                    ...file,
                    file_size: file.file_size.toString(),
                })) : [],
            };

            const ticketId = await repo.insertTicket({ ...ticket_data });

            const notificationData = {
                type: "ticket_deadline",
                user_id_v2: data.agent_id,
                message: `${user.firstName || 'A user'} has created a new ticket assigned to you`,
                reference_id: ticketId,
                due_date: data.due_date,
                client_id: data.client_id,
            }

            if (!notificationData.user_id_v2) {
                throw new AppError('Agent ID is required for notification', true, 400);
            }
            await notificationRepo.insertNotification(
                notificationData.user_id_v2,
                notificationData.message,
                notificationData.type,
                notificationData.reference_id,
                notificationData.client_id,
                notificationData.due_date,
            );

            // Emit WebSocket notification
            emitToUser(notificationData.user_id_v2, 'ticket_reminder', undefined);
            return ticketId;
        },
        fetchTickets: async (filters: TicketsFilters) => {
            return await repo.fetchTickets(filters);
        },
        fetchTicketById: async (id: string) => {
            if (!id) throw new AppError('Ticket ID is required', true, 400);
            const response = await repo.fetchTickeyById(id);

            if (!response) throw new AppError('Ticket not found', true, 404);

            if (response.files && response.files.length > 0) {
                const signed_urls = await Promise.all(
                    response.files.map(async (file) => {
                        return {
                            ...file,
                            signed_url: await s3Service.getSignedUrl(file.file_path),
                        };
                    })
                );
                return { ...response, files: signed_urls };
            }
            return response;
        },
        fetchTicketForUpdate: async (id: string) => {
            if (!id) throw new AppError('Ticket ID is required', true, 400);
            const response = await repo.fetchTicketForUpdate(id);

            if (!response) throw new AppError('Ticket not found', true, 404);

            return response;
        },
        updateTicket: async (id: string, data: z.infer<typeof ticketMutationSchema>) => {
            return await repo.updateTicket(id, data);
        },
        deleteTicket: async (id: string) => {
            return await repo.deleteTicket(id);
        },
        updateTicketStatus: async (id: string, status: string, updatedBy?: string) => {
            // Get ticket details first to get agent and creator info
            const ticketDetails = await repo.fetchTickeyById(id);

            await repo.updateTicketStatus(id, status);

            // Emit WebSocket notification
            emitTicketStatusUpdated({
                ticketId: id,
                status: status,
                updatedBy: updatedBy || 'system',
                agentId: ticketDetails.agent_id || undefined,
                createdBy: ticketDetails.created_by || undefined,
            });
        },
        assignTicket: async (id: string, agent_id: string, assignedBy?: string) => {
            await repo.assignTicket(id, agent_id);

            // Emit WebSocket notification
            emitTicketAssigned({
                ticketId: id,
                agentId: agent_id,
                assignedBy: assignedBy || 'system',
            });
        },
        insertTicketReply: async (id: string, data: z.infer<typeof ticketReplyMutationSchema>) => {
            const replyId = await repo.insertTicketReply(id, data);

            // Get ticket details to notify relevant parties
            const ticketDetails = await repo.fetchTickeyById(id);

            // Emit WebSocket notification
            emitTicketReplyAdded({
                ticketId: id,
                replyId: replyId,
                agentId: ticketDetails.agent_id || '',
                content: data.reply,
                createdBy: ticketDetails.created_by || undefined,
                repliedBy: data.agent_id || '',
            });

            return replyId;
        },
        insertTicketReplyFile: async (data: {
            agent_id: string;
            ticket_id: string;
            reply: string;
            filesData?: Array<{
                file_name: string;
                file_path: string;
                file_size: string;
                file_type: string;
            }>
        }, files?: Express.Multer.File[]) => {


            let filesData: Array<{
                file_name: string;
                file_path: string;
                file_size: number;
                file_type: string;
            }> = [];
            if (files && files.length > 0) {
                filesData = await s3Service.uploadTicketReplyFile(files);
            }

            const reply_data = {
                ...data,
                filesData: filesData.length > 0 ? filesData.map((file) => ({
                    ...file,
                    file_size: file.file_size.toString(),
                })) : [],
            };

            const replyId = await repo.insertTicketReplyFile(reply_data);

            // Get ticket details to notify relevant parties
            const ticketDetails = await repo.fetchTickeyById(data.ticket_id);

            // Emit WebSocket notification
            emitTicketReplyAdded({
                ticketId: data.ticket_id,
                replyId: replyId,
                agentId: ticketDetails.agent_id || '',
                content: data.reply,
                createdBy: ticketDetails.created_by || undefined,
                repliedBy: data.agent_id,
            });

            return replyId;
        },
        fetchTicketReplies: async (id: string) => {
            const response = await repo.fetchTicketReplies(id);

            if (!response) throw new AppError('Ticket replies not found', true, 404);

            const payload = await Promise.all(
                response.map(async (reply) => {
                    if (reply.files && reply.files.length > 0) {
                        const signed_urls = await Promise.all(
                            reply.files.map(async (file) => {
                                return {
                                    ...file,
                                    signed_url: await s3Service.getSignedUrl(file.file_path),
                                };
                            })
                        );
                        return {
                            ...reply,
                            files: signed_urls,
                        };
                    }
                    return reply;
                })
            );
            return payload;
        },

        updateTicketReply: async (id: string, reply: string) => {
            return await repo.updateTicketReply(id, reply);
        },
        deleteTicketReply: async (id: string) => {
            return await repo.deleteTicketReply(id);
        },
        fetchTicketStats: async (agent_id?: string) => {
            return await repo.fetchTicketStats(agent_id);
        },
        fetchAgentStats: async () => {
            return await repo.fetchAgentStats();
        },
        fetchCategoryStats: async () => {
            return await repo.fetchCategoryStats();
        },
        countAssignedTickets: async (agent_id: string) => {
            return await repo.countAssignedTickets(agent_id);
        },
    }
}