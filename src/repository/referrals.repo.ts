import { FetchReferral, FetchReferralRequest, FetchReferrerStats } from "../types/modules/referrals";
import { ReferralRequest } from "../types/modules/referrals/mutation";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { clientTable } from "../schema/client-schema";
import { db } from "../db/db";
import { referral, referralRequest } from "../schema/referral-schema";
import { transaction } from "../schema/transactions-schema";
import { user } from "../schema/auth-schema";



export type ReferralRepo = {
    createReferralRequest: (data: ReferralRequest) => Promise<void>,
    fetchReferralRequestById: (id: string) => Promise<FetchReferralRequest[]>,
    fetchReferralRequests: () => Promise<FetchReferralRequest[]>,
    changeReferralRequestStatus: (id: string, status: string) => Promise<void>,
    fetchReferralByUserId: (id: string) => Promise<FetchReferral[]>,
    fetchReferrerStatsByUserId: (id: string) => Promise<FetchReferrerStats>,
    fetchReferralCommissionByUserId: (id: string) => Promise<FetchReferral[]>,
    insertReferral: (transaction_id: string, referrerId: string, commission: string) => Promise<void>,
    fetchReferrerByClientId: (clientId: string) => Promise<{ referrerId: string | null, percentageCommission: number | null }>,
    userMonthlyStats: (userId: string) => Promise<{
        successRate: number,
        conversionRate: number,
    }>
}

export const referralRepo: ReferralRepo = {

    userMonthlyStats: async (userId: string) => {
        const totalReferrals = await db.select({ count: count() }).from(referral).where(and(eq(referral.referrerId, userId)));

        const bookedReferrals = await db.select({ count: count() }).from(referral).innerJoin(transaction, eq(referral.transactionId, transaction.id)).where(and(eq(referral.referrerId, userId), eq(transaction.status, 'on_booking')));
        const numOfReferrals = totalReferrals[0]?.count || 0;
        const numOfBookedReferrals = bookedReferrals[0]?.count || 0;

        const successRate = numOfReferrals === 0 ? 0 : (numOfBookedReferrals / numOfReferrals) * 100;
        const conversionRate = numOfReferrals === 0 ? 0 : (numOfBookedReferrals / numOfReferrals) * 100;

        return {
            successRate: parseFloat(successRate.toFixed(2)),
            conversionRate: parseFloat(conversionRate.toFixed(2)),
        };

    },
    insertReferral: async (transaction_id: string, referrerId: string, commission: string) => {
        await db.insert(referral).values({
            transactionId: transaction_id,
            referrerId: referrerId,
            potentialCommission: commission,
            commission: '0',
        });
    },
    createReferralRequest: async (data: ReferralRequest) => {
        let clientId = '';
        const client = await db.query.clientTable.findFirst({
            where: and(
                eq(clientTable.firstName, data.referredFirstName),
                eq(clientTable.surename, data.referredLastName),
                eq(clientTable.phoneNumber, data.referredPhoneNumber!)
            ),
        });
        if (!client) {
            const newClient = await db
                .insert(clientTable)
                .values({
                    firstName: data.referredFirstName,
                    surename: data.referredLastName,
                    phoneNumber: data.referredPhoneNumber!,
                    email: data.referredEmail,
                    referrerId: data.referrerId,
                })
                .returning({ id: clientTable.id });
            clientId = newClient[0].id;
        } else {
            clientId = client.id;
        }

        await db.insert(referralRequest).values({
            referrerId: data.referrerId,
            clientId: clientId,
            notes: data.notes,
        });

    },
    fetchReferralRequestById: async (id: string) => {
        const response = await db.query.referralRequest.findMany({
            where: eq(referralRequest.referrerId, id),
            orderBy: [desc(referralRequest.createdAt)],
            with: {
                client: {
                    columns: {
                        id: true,
                        firstName: true,
                        surename: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
                referrer: {
                    columns: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return response.map((data) => {
            return {
                ...data,
                referredStatus: data.referredStatus ?? 'PENDING',
                referrerName: `${data.referrer?.firstName} ${data.referrer?.lastName}`,
                referredName: `${data.client?.firstName} ${data.client?.surename}`,
                referredEmail: data.client?.email ?? null,
                referredPhoneNumber: data.client?.phoneNumber ?? null,
                notes: data.notes ?? '',
            };
        });
    },
    fetchReferralRequests: async () => {
        const response = await db.query.referralRequest.findMany({
            orderBy: [desc(referralRequest.createdAt)],
            with: {
                referrer: {
                    columns: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                client: {
                    columns: {
                        id: true,
                        firstName: true,
                        surename: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
            },
        });
        return response.map((data) => {
            return {
                ...data,
                referrerName: `${data.referrer?.firstName} ${data.referrer?.lastName}`,
                referredName: `${data.client?.firstName} ${data.client?.surename}`,
                referredEmail: data.client?.email ?? null,
                clientId: data.client?.id,
                referrerId: data.referrerId,
                referredPhoneNumber: data.client?.phoneNumber ?? null,
                notes: data.notes ?? '',
                referredStatus: data.referredStatus ?? 'PENDING',
            };
        });
    },
    changeReferralRequestStatus: async (id: string, status: string) => {
        await db
            .update(referralRequest)
            .set({
                referredStatus: status as 'PENDING' | 'APPROVED' | 'REJECTED',
            })
            .where(eq(referralRequest.id, id));
    },
    fetchReferralByUserId: async (id: string) => {

        const respo = await db
            .select({
                id: referral.id,
                transaction_id: referral.transactionId,
                referralStatus: referral.referralStatus,
                clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
                transaction_status: transaction.status,
                referredBy: sql`${user.firstName} || ' ' || ${user.lastName}`,
                potentialCommission: referral.potentialCommission,
                createdAt: referral.createdAt,
                updatedAt: referral.updatedAt,

                commission: sql`
        CASE 
          WHEN ${transaction.status} = 'on_booking' THEN 
            (SELECT package_commission FROM booking_table WHERE transaction_id = ${transaction.id}) * (${referral.potentialCommission} / 100)
          WHEN ${transaction.status} = 'on_quote' THEN 
            (SELECT package_commission FROM quote_table WHERE transaction_id = ${transaction.id} AND quote_type = 'primary') * (${referral.potentialCommission} / 100 )
          ELSE 0
        END
      `,
            })
            .from(referral)
            .innerJoin(transaction, eq(referral.transactionId, transaction.id))
            .innerJoin(clientTable, eq(transaction.client_id, clientTable.id))
            .innerJoin(user, eq(referral.referrerId, user.id))
            .where(eq(referral.referrerId, id));

        return respo.map((data) => ({
            id: data.id,
            transactionId: data.transaction_id ?? '',
            referralStatus: data.referralStatus ?? 'PENDING',
            status: data.transaction_status === 'on_enquiry' ? 'In Enquiry' : data.transaction_status === 'on_booking' ? 'In Booking' : 'In Quote',
            referredBy: data.referredBy as string,
            clientName: data.clientName as string,
            potentialCommission: parseInt(data.potentialCommission as string),
            commission: parseFloat(data.commission as string),
            createdAt: data.createdAt ?? new Date(),
            updatedAt: data.updatedAt ?? new Date(),
        }));
    },
    fetchReferrerStatsByUserId: async (id: string) => {


        const activeReferralsCount = await db.select({ count: count() }).from(referral).where(eq(referral.referrerId, id));

        const totalEarnings = await db
            .select({
                total_commission: sql`SUM((SELECT package_commission FROM booking_table WHERE transaction_id = ${transaction.id}) * (${referral.potentialCommission} / 100))`,
            })
            .from(referral)
            .innerJoin(transaction, eq(referral.transactionId, transaction.id))
            .where(and(eq(referral.referrerId, id), eq(transaction.status, 'on_booking'), eq(referral.referralStatus, 'RELEASED')));

        const pendingReferrals = await db
            .select({
                total_pending_commission: sql`SUM((SELECT package_commission FROM booking_table WHERE transaction_id = ${transaction.id}) * (${referral.potentialCommission} / 100))`,
            })
            .from(referral)
            .innerJoin(transaction, eq(referral.transactionId, transaction.id))
            .where(and(eq(referral.referrerId, id), eq(transaction.status, 'on_booking'), eq(referral.referralStatus, 'PENDING')));

        const potentialComission = await db
            .select({
                sum: sql`SUM((SELECT package_commission FROM quote_table WHERE transaction_id = ${transaction.id}) * (${referral.potentialCommission}/100))`,
            })
            .from(referral)
            .innerJoin(transaction, eq(referral.transactionId, transaction.id))
            .where(and(eq(referral.referrerId, id), eq(transaction.status, 'on_quote'), eq(referral.referralStatus, 'PENDING')));
        return {
            activeReferralsCount: activeReferralsCount[0].count,
            totalEarnings: parseFloat(totalEarnings[0].total_commission as string) || 0,
            pendingReferrals: parseFloat(pendingReferrals[0].total_pending_commission as string) || 0,
            potentialComission: parseFloat(potentialComission[0].sum as string) || 0,
        };
    },
    fetchReferralCommissionByUserId: async (id: string) => {
        const respo = await db
            .select({
                id: referral.id,
                transaction_id: referral.transactionId,
                referralStatus: referral.referralStatus,
                clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
                transaction_status: transaction.status,
                referredBy: sql`${user.firstName} || ' ' || ${user.lastName}`,
                potentialCommission: referral.potentialCommission,
                createdAt: referral.createdAt,
                updatedAt: referral.updatedAt,

                commission: sql` (SELECT package_commission FROM booking_table WHERE transaction_id = ${transaction.id}) * (${referral.potentialCommission} / 100)`,
            })
            .from(referral)
            .innerJoin(transaction, eq(referral.transactionId, transaction.id))
            .innerJoin(clientTable, eq(transaction.client_id, clientTable.id))
            .innerJoin(user, eq(referral.referrerId, user.id))
            .where(and(eq(referral.referrerId, id), eq(transaction.status, 'on_booking')));

        return respo.map((data) => ({
            id: data.id,
            transactionId: data.transaction_id ?? '',
            referralStatus: data.referralStatus ?? 'PENDING',
            status: data.transaction_status === 'on_enquiry' ? 'In Enquiry' : data.transaction_status === 'on_booking' ? 'In Booking' : 'In Quote',
            referredBy: data.referredBy as string,
            clientName: data.clientName as string,
            potentialCommission: parseInt(data.potentialCommission as string),
            commission: parseFloat(data.commission as string),
            createdAt: data.createdAt ?? new Date(),
            updatedAt: data.updatedAt ?? new Date(),
        }));
    },
    fetchReferrerByClientId: async (clientId: string) => {
        const respo = await db.select({
            referrerId: clientTable.referrerId,
            percentageCommission: user.percentageCommission,
        }).from(clientTable).innerJoin(user, eq(clientTable.referrerId, user.id)).where(eq(clientTable.id, clientId));


        return {
            referrerId: respo[0].referrerId,
            percentageCommission: respo[0].percentageCommission,
        };
    },

}