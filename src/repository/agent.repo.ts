import { db } from '../db/db';

import { eq, sql, and, desc, ne } from 'drizzle-orm';
import { enquiry_cruise_destination, enquiry_destination, enquiry_table } from '../schema/enquiry-schema';
import { country, destination, package_type, transaction } from '../schema/transactions-schema';
import { user } from '../schema/auth-schema';
import { clientTable } from '../schema/client-schema';
import { cruise_destination } from '../schema/cruise-schema';
import z from 'zod';
import { enquirySummaryQuerySchema } from '../types/modules/agent';

export type AgentRepo = {
    fetchEnquirySummaryByAgent: (agentId: string, isFetchAll: boolean, agentToFetch: string) => Promise<z.infer<typeof enquirySummaryQuerySchema>[]>;

}

export const agentRepo: AgentRepo = {
    fetchEnquirySummaryByAgent: async (agentId, isFetchAll, agentToFetch) => {
        const agent = await db.query.user.findFirst({
            where: eq(user.id, agentId),
        });
        const query = db
            .select({
                id: enquiry_table.id,
                holiday_type: package_type.name,
                status: transaction.status,
                transaction_id: transaction.id,                                                                                      
                agent_id: transaction.user_id,
                enquiry_status: enquiry_table.status,
                agentName: sql<string>`${user.firstName} || ' ' || ${user.lastName}`,
                clientName: sql<string>`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
                clientId: transaction.client_id,
                no_of_nights: enquiry_table.no_of_nights,
                budget: enquiry_table.budget,
                travel_date: enquiry_table.travel_date,
                is_future_deal: enquiry_table.is_future_deal,
                future_deal_date: enquiry_table.future_deal_date,
                date_expiry: enquiry_table.date_expiry,
                date_created: enquiry_table.date_created,
                enquiry_cruise_destination: {
                    id: enquiry_cruise_destination.enquiry_id,
                    name: cruise_destination.name,
                },

                destination: {
                    id: enquiry_destination.enquiry_id,
                    name: destination.name,
                    country: country.country_name,
                },
            })
            .from(enquiry_table)
            .leftJoin(transaction, eq(transaction.id, enquiry_table.transaction_id))
            .leftJoin(package_type, eq(package_type.id, transaction.holiday_type_id))
            .leftJoin(user, eq(user.id, transaction.user_id))
            .leftJoin(clientTable, eq(clientTable.id, transaction.client_id))
            .leftJoin(enquiry_cruise_destination, eq(enquiry_cruise_destination.enquiry_id, enquiry_table.id))
            .leftJoin(cruise_destination, eq(cruise_destination.id, enquiry_cruise_destination.cruise_destination_id))
            .leftJoin(enquiry_destination, eq(enquiry_destination.enquiry_id, enquiry_table.id))
            .leftJoin(destination, eq(destination.id, enquiry_destination.destination_id))
            .leftJoin(country, eq(country.id, destination.country_id))
            .orderBy(desc(enquiry_table.date_created));

        if (isFetchAll && agent?.role === 'manager') {
            query.where(and(eq(transaction.status, 'on_enquiry'), ne(enquiry_table.status, 'LOST')));
        } else if (!isFetchAll && agent?.role === 'manager') {
            query.where(and(eq(transaction.status, 'on_enquiry'), and(eq(transaction.user_id, agentToFetch), ne(enquiry_table.status, 'LOST'))));
        } else {
            query.where(and(eq(transaction.status, 'on_enquiry'), and(eq(transaction.user_id, agentId), ne(enquiry_table.status, 'LOST'))));
        }

        const response = await query;

        if (response.length === 0) return [];
        const groupedResults = response.reduce((acc, curr) => {
            const { id, ...rest } = curr; // Destructure to separate id from the rest of the object
            if (!acc[id] && rest.agent_id) {
                acc[id] = { id, ...rest, is_future_deal: rest.is_future_deal || false, travel_date: rest.travel_date || '', budget: rest.budget || '0', no_of_nights: rest.no_of_nights?.toString() || '0', agent_id: rest.agent_id || '', clientId: rest.clientId || '', transaction_id: rest.transaction_id || '', holiday_type: rest.holiday_type || '', status: rest.status || 'on_enquiry', enquiry_status: rest.enquiry_status || 'ACTIVE', enquiry_cruise_destination: [], destination: [] };
            }
            if (curr.enquiry_cruise_destination && curr.enquiry_cruise_destination.id) {
                acc[id].enquiry_cruise_destination.push({ id: curr.enquiry_cruise_destination.id || '', name: curr.enquiry_cruise_destination.name || ''});
            }
            if (curr.destination) {
                acc[id].destination.push({ id: curr.destination.id || '', name: curr.destination.name || '', country: curr.destination.country || ''});
            }
            return acc;
        }, {} as Record<string, z.infer<typeof enquirySummaryQuerySchema>>);
        const structuredResults = Object.values(groupedResults);
        return structuredResults;
    }
}