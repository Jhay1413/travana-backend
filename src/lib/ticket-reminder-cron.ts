import cron from 'node-cron';
import { db } from '../db/db';
import { ticket } from '../schema/ticket-schema';
import { and, gte, lte, ne, sql, notInArray } from 'drizzle-orm';
import { emitToUser } from './socket-handler';
import { ticketSnoozeRepo } from '../repository/ticket-snooze.repo';

/**
 * Ticket Reminder Cron Job
 * Runs every minute to check for tickets due in 5 minutes
 * and sends socket notifications to assigned users
 */

interface TicketReminder {
    id: string;
    ticket_id: string;
    subject: string;
    description: string;
    due_date: Date;
    priority: string;
    agent_id: string | null;
    user_id: string | null;
    client_id: string | null;
    status: string;
}

export const initializeTicketReminderCron = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            console.log('Running ticket reminder check...');

            const now = new Date();
            const sixMinutesAgo = new Date(now.getTime() - 6 * 60 * 1000);
            const sixMinutesFromNow = new Date(now.getTime() + 6 * 60 * 1000);

            // Check for snoozed tickets that need to be reminded
            const snoozedTicketsDue = await ticketSnoozeRepo.getSnoozedTicketsDue();

            if (snoozedTicketsDue.length > 0) {
                console.log(`Found ${snoozedTicketsDue.length} snoozed ticket(s) to remind`);

                for (const snoozedTicket of snoozedTicketsDue) {
                    // Fetch the ticket details using the ticket_id
                    const ticketItem = await db.query.ticket.findFirst({
                        where: (t, { eq }) => eq(t.id, snoozedTicket.ticket_id),
                        with: {
                            client: true,
                            created_by_user: true,
                            user: true,
                            agent: true,
                        },
                    });

                    if (ticketItem && snoozedTicket.user_id) {
                        const reminderData = {
                            ticketId: ticketItem.id,
                            ticketNumber: ticketItem.ticket_id || 'N/A',
                            subject: ticketItem.subject || 'Ticket Reminder',
                            description: ticketItem.description || '',
                            dueDate: ticketItem.due_date?.toISOString() || '',
                            priority: ticketItem.priority || 'normal',
                            status: ticketItem.status || 'open',
                            clientName: ticketItem.client
                                ? `${ticketItem.client.firstName || ''} ${ticketItem.client.surename || ''}`.trim()
                                : null,
                            createdBy: ticketItem.created_by_user
                                ? `${ticketItem.created_by_user.firstName || ''} ${ticketItem.created_by_user.lastName || ''}`.trim()
                                : null,
                            message: ticketItem.due_date && new Date(ticketItem.due_date) < now
                                ? `Ticket #${ticketItem.ticket_id || 'N/A'} "${ticketItem.subject || 'Untitled'}" is still overdue!`
                                : `Reminder: Ticket #${ticketItem.ticket_id || 'N/A'} "${ticketItem.subject || 'Untitled'}" is due soon!`,
                        };

                        emitToUser(snoozedTicket.user_id, 'ticket_reminder', reminderData);
                        console.log(`Sent snoozed ticket reminder for ticket ${ticketItem.id} to user ${snoozedTicket.user_id}`);

                        // Remove the snooze after sending reminder
                        await ticketSnoozeRepo.removeSnoozedTicket(ticketItem.id, snoozedTicket.user_id);
                    }
                }
            }

            // Get list of currently snoozed ticket IDs to exclude
            const allSnoozedTickets = await ticketSnoozeRepo.getAllSnoozedTickets();
            const snoozedTicketIds = allSnoozedTickets.map(s => s.ticket_id);

            // Get ALL tickets that are either upcoming or overdue (no time limit on overdue)
            // This includes:
            // 1. Upcoming: Due within the next 5-6 minutes
            // 2. All overdue tickets (regardless of how long they've been overdue)
            const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

            const dueAndOverdueTickets = await db.query.ticket.findMany({
                where: and(
                    lte(ticket.due_date, sixMinutesFromNow),
                    ne(ticket.status, 'completed'),
                    ne(ticket.status, 'closed'),
                    ne(ticket.status, 'cancelled')
                ),
                with: {
                    user: true,
                    client: true,
                    created_by_user: true,
                    agent: true,
                },
            });

            console.log(`Found ${dueAndOverdueTickets.length} tickets that are due or overdue.`);

            // Process all due and overdue tickets
            if (dueAndOverdueTickets.length > 0) {
                const unSnoozedTickets = snoozedTicketIds.length > 0
                    ? dueAndOverdueTickets.filter(t => !snoozedTicketIds.includes(t.id))
                    : dueAndOverdueTickets;

                for (const ticketItem of unSnoozedTickets) {
                    const recipientId = ticketItem.user_id || ticketItem.agent_id;

                    if (recipientId && ticketItem.due_date) {
                        const isOverdue = new Date(ticketItem.due_date) < now;
                        const hoursOverdue = isOverdue 
                            ? Math.floor((now.getTime() - new Date(ticketItem.due_date).getTime()) / (60 * 60 * 1000))
                            : 0;

                        const reminderData = {
                            ticketId: ticketItem.id,
                            ticketNumber: ticketItem.ticket_id || 'N/A',
                            subject: ticketItem.subject || 'Ticket Reminder',
                            description: ticketItem.description || '',
                            dueDate: ticketItem.due_date.toISOString(),
                            priority: ticketItem.priority || 'normal',
                            status: ticketItem.status || 'open',
                            clientName: ticketItem.client
                                ? `${ticketItem.client.firstName || ''} ${ticketItem.client.surename || ''}`.trim()
                                : null,
                            createdBy: ticketItem.created_by_user
                                ? `${ticketItem.created_by_user.firstName || ''} ${ticketItem.created_by_user.lastName || ''}`.trim()
                                : null,
                            message: isOverdue
                                ? hoursOverdue > 0
                                    ? `Ticket #${ticketItem.ticket_id || 'N/A'} "${ticketItem.subject || 'Untitled'}" is ${hoursOverdue} hour(s) overdue!`
                                    : `Ticket #${ticketItem.ticket_id || 'N/A'} "${ticketItem.subject || 'Untitled'}" is overdue!`
                                : `Ticket #${ticketItem.ticket_id || 'N/A'} "${ticketItem.subject || 'Untitled'}" is due soon!`,
                        };

                        emitToUser(recipientId, 'ticket_reminder', reminderData);
                        console.log(`Sent ticket reminder for ticket ${ticketItem.id} to user ${recipientId}${isOverdue ? ' (overdue)' : ''}`);
                    }
                }
            }
        } catch (error) {
            console.error('Error in ticket reminder cron job:', error);
        }
    });

    console.log('✓ Ticket reminder cron job initialized - running every minute');
};

/**
 * Manually trigger ticket reminder check (useful for testing)
 */
export const triggerTicketReminderCheck = async () => {
    try {
        const now = new Date();
        const sixMinutesAgo = new Date(now.getTime() - 6 * 60 * 1000);
        const sixMinutesFromNow = new Date(now.getTime() + 6 * 60 * 1000);

        const dueTickets = await db.query.ticket.findMany({
            where: and(
                gte(ticket.due_date, sixMinutesAgo),
                lte(ticket.due_date, sixMinutesFromNow),
                ne(ticket.status, 'completed'),
                ne(ticket.status, 'closed'),
                ne(ticket.status, 'cancelled')
            ),
            with: {
                user: true,
                client: true,
                created_by_user: true,
                agent: true,
            },
        });

        return dueTickets;
    } catch (error) {
        console.error('Error checking for due tickets:', error);
        return [];
    }
};
