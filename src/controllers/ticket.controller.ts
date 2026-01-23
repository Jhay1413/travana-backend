import { TicketService } from "../service/ticket.service";
import { ticketsRepo } from "../repository/tickets.repo";
import { s3Service } from "../lib/s3";
import { Request, Response } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { notificationRepo } from "../repository/notification.repo";
import { userRepo } from "../repository/user.repo";

const service = TicketService(ticketsRepo, s3Service,notificationRepo,userRepo);

export const ticketController = {
    insertTicketWitFiles: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const files = req.files as Express.Multer.File[];
            const ticket = await service.insertTicket(data, files && files.length > 0 ? files : []);
            res.status(201).json(ticket);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    insertTicket: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const ticket = await service.insertTicket(data);
            res.status(201).json(ticket);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchTickets: async (req: Request, res: Response) => {
        try {

            const tickets = await service.fetchTickets(req.query);
            res.status(200).json(tickets);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchTicketById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const ticket = await service.fetchTicketById(id);
            res.status(200).json(ticket);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchTicketForUpdate: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const ticket = await service.fetchTicketForUpdate(id);
            res.status(200).json(ticket);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    updateTicket: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const data = req.body;
            const ticket = await service.updateTicket(id, data);
            res.status(200).json(ticket);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    deleteTicket: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const ticket = await service.deleteTicket(id);
            res.status(200).json(ticket);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    updateTicketStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const session = await auth.api.getSession({
                headers: fromNodeHeaders(req.headers)
            });
            
            const updatedBy = session?.user?.id || 'system';
            const ticket = await service.updateTicketStatus(id, status, updatedBy);
            res.status(200).json(ticket);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    assignTicket: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { agent_id } = req.body;
            
            const session = await auth.api.getSession({
                headers: fromNodeHeaders(req.headers)
            });
            
            const assignedBy = session?.user?.id || 'system';
            const ticket = await service.assignTicket(id, agent_id, assignedBy);
            res.status(200).json(ticket);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchTicketStats: async (req: Request, res: Response) => {
        try {
            const { agent_id } = req.query;
            const ticket = await service.fetchTicketStats(agent_id as string);
            res.status(200).json(ticket);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchAgentStats: async (req: Request, res: Response) => {
        try {
            const ticket = await service.fetchAgentStats();
            res.status(200).json(ticket);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchCategoryStats: async (req: Request, res: Response) => {
        try {
            const ticket = await service.fetchCategoryStats();
            res.status(200).json(ticket);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    countAssignedTickets: async (req: Request, res: Response) => {
        try {
            const { agent_id } = req.params;
            const ticket = await service.countAssignedTickets(agent_id as string);
            res.status(200).json({ count: ticket });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    insertTicketReply: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { reply, agent_id, ticket_id } = req.body;
            console.log(reply);
            const ticket = await service.insertTicketReply(id, { reply: reply as string, agent_id: agent_id as string, ticket_id: ticket_id as string });
            res.status(200).json({
                message: 'Ticket reply added successfully',
                ticket_reply_id: ticket,
            });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    insertTicketReplyFile: async (req: Request, res: Response) => {
        try {
            const { reply, agent_id, ticket_id } = req.body;
            const files = req.files as Express.Multer.File[];
            const ticket = await service.insertTicketReplyFile({ reply: reply as string, agent_id: agent_id as string, ticket_id: ticket_id as string }, files && files.length > 0 ? files : []);
            res.status(200).json({
                message: 'Ticket reply file added successfully',
                ticket_reply_file_id: ticket,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchTicketReplies: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const ticket = await service.fetchTicketReplies(id);
            res.status(200).json(ticket);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    updateTicketReply: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { reply } = req.body;
            const ticket = await service.updateTicketReply(id, reply);
            res.status(200).json({
                message: 'Ticket reply updated successfully',
            });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    deleteTicketReply: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const ticket = await service.deleteTicketReply(id);
            res.status(200).json({
                message: 'Ticket reply deleted successfully',
            });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },



}