import { Router } from 'express';
import { ticketController } from '../controllers/ticket.controller';
import { uploadTicketFiles } from '../middleware/upload';

const router = Router();

// Ticket CRUD operations
router.get('/', ticketController.fetchTickets);
router.get('/:id', ticketController.fetchTicketById);
router.post('/', ticketController.insertTicket);
router.post('/with-files', uploadTicketFiles, ticketController.insertTicketWitFiles);
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

// Ticket status and assignment
router.patch('/:id/status', ticketController.updateTicketStatus);
router.patch('/:id/assign', ticketController.assignTicket);

// Ticket statistics
router.get('/stats/overview', ticketController.fetchTicketStats);
router.get('/stats/agents', ticketController.fetchAgentStats);
router.get('/stats/categories', ticketController.fetchCategoryStats);
router.get('/stats/assigned/:agent_id', ticketController.countAssignedTickets);

// Ticket replies
router.get('/:id/replies', ticketController.fetchTicketReplies);
router.post('/:id/replies', ticketController.insertTicketReply);
router.post('/:id/replies/with-files', uploadTicketFiles, ticketController.insertTicketReplyFile);
router.put('/replies/:id', ticketController.updateTicketReply);
router.delete('/replies/:id', ticketController.deleteTicketReply);

export default router;
