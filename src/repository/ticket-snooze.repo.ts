import { db } from "../db/db";
import { ticketSnooze } from "../schema/ticket-snooze-schema";
import { and, eq, lte } from "drizzle-orm";

export type TicketSnoozeRepo = {
    snoozeTicket: (ticketId: string, userId: string, snoozeMinutes: number) => Promise<void>;
    removeSnoozedTicket: (ticketId: string, userId: string) => Promise<void>;
    getSnoozedTicketsDue: () => Promise<Array<{
        id: string;
        ticket_id: string;
        user_id: string;
        snooze_until: Date;
    }>>;
    getAllSnoozedTickets: () => Promise<Array<{
        id: string;
        ticket_id: string;
        user_id: string;
    }>>;
    isTicketSnoozed: (ticketId: string, userId: string) => Promise<boolean>;
    clearExpiredSnoozes: () => Promise<void>;
}

export const ticketSnoozeRepo: TicketSnoozeRepo = {
    snoozeTicket: async (ticketId, userId, snoozeMinutes) => {
        const snoozeUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000);
        
        // Remove any existing snooze for this ticket and user
        await db
            .delete(ticketSnooze)
            .where(
                and(
                    eq(ticketSnooze.ticket_id, ticketId),
                    eq(ticketSnooze.user_id, userId)
                )
            );

        // Insert new snooze
        await db
            .insert(ticketSnooze)
            .values({
                ticket_id: ticketId,
                user_id: userId,
                snooze_until: snoozeUntil,
                snooze_duration_minutes: snoozeMinutes.toString(),
            });
    },

    removeSnoozedTicket: async (ticketId, userId) => {
        await db
            .delete(ticketSnooze)
            .where(
                and(
                    eq(ticketSnooze.ticket_id, ticketId),
                    eq(ticketSnooze.user_id, userId)
                )
            );
    },

    getSnoozedTicketsDue: async () => {
        const now = new Date();
        const snoozedTickets = await db.query.ticketSnooze.findMany({
            where: lte(ticketSnooze.snooze_until, now),
            with: {
                ticket: {
                    with: {
                        user: true,
                        client: true,
                        created_by_user: true,
                        agent: true,
                    },
                },
            },
        });

        return snoozedTickets.map(snooze => ({
            id: snooze.id,
            ticket_id: snooze.ticket_id,
            user_id: snooze.user_id,
            snooze_until: snooze.snooze_until,
            ticket: snooze.ticket,
        }));
    },

    getAllSnoozedTickets: async () => {
        const snoozedTickets = await db.query.ticketSnooze.findMany({
            columns: {
                id: true,
                ticket_id: true,
                user_id: true,
            },
        });

        return snoozedTickets;
    },

    isTicketSnoozed: async (ticketId, userId) => {
        const snooze = await db.query.ticketSnooze.findFirst({
            where: and(
                eq(ticketSnooze.ticket_id, ticketId),
                eq(ticketSnooze.user_id, userId)
            ),
        });

        return !!snooze;
    },

    clearExpiredSnoozes: async () => {
        const now = new Date();
        await db
            .delete(ticketSnooze)
            .where(lte(ticketSnooze.snooze_until, now));
    },
};
