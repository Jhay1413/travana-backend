import { count, eq, desc, and, sql, gte, lte, lt, isNotNull, sum, ne, inArray } from 'drizzle-orm';
import { db } from '../db/db';
import { startOfMonth, subMonths, addDays, startOfDay, endOfMonth } from 'date-fns';
import {
    quote,
    quote_accomodation,
    quote_airport_parking,
    quote_attraction_ticket,
    quote_car_hire,
    quote_flights,
    quote_lounge_pass,
    quote_transfers,
} from '../schema/quote-schema';
import {
    accomodation_list,
    cottages,
    country,
    destination,
    lodges,
    package_type,
    park,
    resorts,
    transaction,
} from '../schema/transactions-schema';
import {
    booking,
    booking_accomodation,
    booking_airport_parking,
    booking_attraction_ticket,
    booking_car_hire,
    booking_cruise_itinerary,
    booking_flights,
    booking_lounge_pass,
    booking_transfers,
} from '../schema/booking-schema';
import { clientTable } from '../schema/client-schema';
import { task } from '../schema/task-schema';
import { enquiry_table } from '../schema/enquiry-schema';
import { agentTargetTable } from '../schema/agent-target-schema';
import { agentTargetMutationSchema } from '../types/modules/agent';
import { todos } from '../schema/note-schema';
import { historicalBooking } from '../schema/historical-schema';
import { user } from '../schema/auth-schema';
import { AdminAnalyticsResponseSchema, adminDashboardStatsQuerySchema, clientStatsQuerySchema, todoQuerySchema } from '../types/modules/dashboard/query';
import { agentStatsQuerySchema } from '../types/modules/dashboard/query';
import { z } from 'zod';

export type DashboardRepo = {
    fetchClientStats: (clientId: string) => Promise<z.infer<typeof clientStatsQuerySchema> | null>,
    fetchAgentStats: (agentId: string) => Promise<z.infer<typeof agentStatsQuerySchema> | null>
    insertTodo: (agentId: string, note: string) => Promise<void>
    fetchTodos: (agentId: string) => Promise<z.infer<typeof todoQuerySchema>[]>
    updateTodo: (id: string, note: string) => Promise<void>
    deleteTodo: (id: string) => Promise<void>
    fetchAdminDashboardStats: (agent_id?: string) => Promise<z.infer<typeof adminDashboardStatsQuerySchema>>
    fetchAdminAnalytics: (agent_id?: string) => Promise<z.infer<typeof AdminAnalyticsResponseSchema>>


}



async function getCommissionAndCount({ from, agent_id }: { from: Date; agent_id?: string }) {
    // Commission query
    const commissionQuery = db
        .select({
            overall_commission: sql`
          SUM(
            COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
            + booking_table.package_commission
          )
        `,
        })
        .from(booking)
        .innerJoin(transaction, eq(booking.transaction_id, transaction.id));

    // Count query
    const countQuery = db.select({ count: count() }).from(booking).innerJoin(transaction, eq(booking.transaction_id, transaction.id));

    // Add filters
    if (agent_id) {
        commissionQuery.where(and(eq(transaction.user_id, agent_id), gte(booking.date_created, from)));
        countQuery.where(and(eq(transaction.user_id, agent_id), gte(booking.date_created, from)));
    } else {
        commissionQuery.where(gte(booking.date_created, from));
        countQuery.where(gte(booking.date_created, from));
    }

    // Run queries
    const [commissionResult, countResult] = await Promise.all([commissionQuery, countQuery]);

    const overall_commission = parseFloat(commissionResult[0]?.overall_commission as string) ?? 0;
    const countValue = countResult[0]?.count ?? 0;
    const ppb = countValue > 0 ? overall_commission / countValue : 0;

    return { overall_commission, count: countValue, ppb };
}

// Helper function to conditionally filter by agent_id
const createAgentFilter = (agent_id?: string) => {
    const agentFilter = (condition: any) => (agent_id ? and(eq(transaction.user_id, agent_id), condition) : condition);
    const agentFilterOnly = () => (agent_id ? eq(transaction.user_id, agent_id) : sql`1=1`);
    return { agentFilter, agentFilterOnly };
};

// Helper function to calculate percentage change
const calculatePercentageChange = (current: number, previous: number) => {
    if (previous > 0) {
        return Math.round(((current - previous) / previous) * 100);
    }
    return current > 0 ? 100 : 0;
};

// Helper function to get booking commission SQL
const getBookingCommissionSQL = () => sql`
    COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
    + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
    + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
    + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
    + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
    + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
    + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
    + booking_table.package_commission
  `;

// Helper function to get quote cost SQL
const getQuoteCostSQL = () => sql`
    COALESCE((SELECT SUM(cost) FROM quote_flights WHERE quote_flights.quote_id = quote_table.id), 0)
    + COALESCE((SELECT SUM(cost) FROM quote_airport_parking WHERE quote_airport_parking.quote_id = quote_table.id), 0)
    + COALESCE((SELECT SUM(cost) FROM quote_lounge_pass WHERE quote_lounge_pass.quote_id = quote_table.id), 0)
    + COALESCE((SELECT SUM(cost) FROM quote_attraction_ticket WHERE quote_attraction_ticket.quote_id = quote_table.id), 0)
    + COALESCE((SELECT SUM(cost) FROM quote_car_hire WHERE quote_car_hire.quote_id = quote_table.id), 0)
    + COALESCE((SELECT SUM(cost) FROM quote_transfers WHERE quote_transfers.quote_id = quote_table.id), 0)
    + COALESCE((SELECT SUM(cost) FROM quote_accomodation WHERE quote_accomodation.quote_id = quote_table.id), 0)
    - quote_table.discounts
    + quote_table.service_charge
    + quote_table.sales_price
  `;

// Sector 1: Quick Review
const getQuickReview = async (agent_id?: string) => {
    const { agentFilterOnly } = createAgentFilter(agent_id);

    const [total_enquiries, total_quotes, total_bookings, total_revenue] = await Promise.all([
        db
            .select({ count: count() })
            .from(enquiry_table)
            .innerJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
            .where(agentFilterOnly()),
        db.select({ count: count() }).from(quote).innerJoin(transaction, eq(quote.transaction_id, transaction.id)).where(agentFilterOnly()),
        db.select({ count: count() }).from(booking).innerJoin(transaction, eq(booking.transaction_id, transaction.id)).where(agentFilterOnly()),
        db
            .select({ overall_commission: getBookingCommissionSQL().as('overall_commission') })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(agentFilterOnly()),
    ]);

    const total_booking_value = total_revenue.reduce((sum, booking) => sum + Number(booking.overall_commission || 0), 0);

    return {
        total_enquiries: total_enquiries[0]?.count || 0,
        total_quotes: total_quotes[0]?.count || 0,
        total_bookings: total_bookings[0]?.count || 0,
        total_revenue: total_booking_value,
    };
};

// Sector 2: Revenue Overview
const getRevenueOverview = async (agent_id?: string) => {
    const { agentFilter, agentFilterOnly } = createAgentFilter(agent_id);
    const now = new Date();
    const current_month_start = startOfMonth(now);
    const previous_month_start = startOfMonth(subMonths(now, 1));

    const [booking_values, current_month_bookings, previous_month_bookings, previous_month_revenue, previous_month_booking_count] = await Promise.all([
        db
            .select({ overall_commission: getBookingCommissionSQL().as('overall_commission') })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(and(agentFilterOnly(), ne(booking.is_active, false))),
        db
            .select({
                count: count(),
                sum: sum(getBookingCommissionSQL()),
            })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(and(agentFilter(gte(booking.date_created, current_month_start)), ne(booking.is_active, false))),
        db
            .select({
                count: count(),
                sum: sum(getBookingCommissionSQL()),
            })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(
                and(
                    agentFilter(and(gte(booking.date_created, previous_month_start), lt(booking.date_created, current_month_start))),
                    ne(booking.is_active, false)
                )
            ),
        db
            .select({ overall_commission: getBookingCommissionSQL().as('overall_commission') })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(
                and(
                    agentFilter(and(gte(booking.date_created, previous_month_start), lt(booking.date_created, current_month_start))),
                    ne(booking.is_active, false)
                )
            ),
        db
            .select({ count: count() })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(
                and(
                    agentFilter(and(gte(booking.date_created, previous_month_start), lt(booking.date_created, current_month_start))),
                    ne(booking.is_active, false)
                )
            ),
    ]);

    const total_booking_value = booking_values.reduce((sum, booking) => sum + Number(booking.overall_commission || 0), 0);
    const booking_count = booking_values.length;
    const average_booking_value = booking_count > 0 ? total_booking_value / booking_count : 0;

    const current_month_count = current_month_bookings[0]?.count || 0;
    const previous_month_count = previous_month_bookings[0]?.count || 0;
    const current_month_sum = current_month_bookings[0]?.sum || 0;
    const previous_month_sum = previous_month_bookings[0]?.sum || 0;
    const monthly_growth = calculatePercentageChange(Number(current_month_sum), Number(previous_month_sum));

    const prev_revenue = previous_month_revenue.reduce((sum, booking) => sum + Number(booking.overall_commission || 0), 0);
    const prev_booking_count_revenue = previous_month_booking_count[0]?.count || 0;
    const prev_avg_booking_value = prev_booking_count_revenue > 0 ? prev_revenue / prev_booking_count_revenue : 0;

    const revenue_change = calculatePercentageChange(total_booking_value, prev_revenue);
    const avg_booking_change = calculatePercentageChange(average_booking_value, prev_avg_booking_value);
    const booking_count_change = calculatePercentageChange(booking_count, prev_booking_count_revenue);
    const monthly_growth_change = calculatePercentageChange(monthly_growth, calculatePercentageChange(current_month_count, prev_booking_count_revenue));

    return {
        total_revenue: { value: total_booking_value, change: revenue_change, description: ' ' },
        average_booking: { value: average_booking_value, change: avg_booking_change },
        total_bookings: { value: booking_count, change: booking_count_change },
        monthly_growth: { value: monthly_growth, change: monthly_growth_change },
    };
};

// Sector 3: KPIs
const getKPIs = async (agent_id?: string) => {
    const { agentFilter, agentFilterOnly } = createAgentFilter(agent_id);
    const now = new Date();
    const current_month_start = startOfMonth(now);
    const previous_month_start = startOfMonth(subMonths(now, 1));

    const [
        total_enquiries,
        total_quotes,
        total_bookings,
        converted_enquiries,
        converted_quotes,
        converted_enquiries_to_bookings,
        previous_month_enquiries,
        previous_month_quotes,
        previous_month_bookings,
    ] = await Promise.all([
        db
            .select({ count: count() })
            .from(enquiry_table)
            .innerJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
            .where(agentFilterOnly()),
        db.select({ count: count() }).from(quote).innerJoin(transaction, eq(quote.transaction_id, transaction.id)).where(agentFilterOnly()),
        db.select({ count: count() }).from(booking).innerJoin(transaction, eq(booking.transaction_id, transaction.id)).where(agentFilterOnly()),
        db
            .select({ count: count() })
            .from(enquiry_table)
            .innerJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
            .where(
                and(
                    agentFilterOnly(),
                    sql`EXISTS (SELECT 1 FROM quote_table WHERE quote_table.transaction_id = ${enquiry_table.transaction_id} AND quote_table.quote_type = 'primary')`
                )
            ),
        db
            .select({ count: count() })
            .from(quote)
            .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
            .where(
                and(
                    eq(quote.quote_type, 'primary'),
                    agentFilter(sql`EXISTS (SELECT 1 FROM booking_table WHERE booking_table.transaction_id = ${quote.transaction_id})`)
                )
            ),
        db
            .select({ count: count() })
            .from(enquiry_table)
            .innerJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
            .where(agentFilter(sql`EXISTS (SELECT 1 FROM booking_table WHERE booking_table.transaction_id = ${enquiry_table.transaction_id})`)),
        db
            .select({ count: count() })
            .from(enquiry_table)
            .innerJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
            .where(agentFilter(and(gte(enquiry_table.date_created, previous_month_start), lt(enquiry_table.date_created, current_month_start)))),
        db
            .select({ count: count() })
            .from(quote)
            .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
            .where(agentFilter(and(gte(quote.date_created, previous_month_start), lt(quote.date_created, current_month_start)))),
        db
            .select({ count: count() })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(
                agentFilter(and(gte(booking.date_created, previous_month_start), lt(booking.date_created, current_month_start), ne(booking.is_active, false)))
            ),
    ]);

    const enquiry_count = total_enquiries[0]?.count || 0;
    const quote_count = total_quotes[0]?.count || 0;
    const booking_count = total_bookings[0]?.count || 0;
    const converted_count = converted_enquiries[0]?.count || 0;
    const converted_quotes_count = converted_quotes[0]?.count || 0;
    const converted_enquiries_to_bookings_count = converted_enquiries_to_bookings[0]?.count || 0;

    const enquiry_to_quote_conversion = enquiry_count > 0 ? Math.round((converted_count / enquiry_count) * 100) : 0;
    const quote_to_booking_conversion = quote_count > 0 ? Math.round((converted_quotes_count / quote_count) * 100) : 0;
    const overall_conversion = enquiry_count > 0 ? Math.round((converted_enquiries_to_bookings_count / enquiry_count) * 100) : 0;
    const lost_enquiries = enquiry_count - converted_enquiries_to_bookings_count;
    const loss_rate = enquiry_count > 0 ? Math.round((lost_enquiries / enquiry_count) * 100) : 0;

    const prev_enquiry_count = previous_month_enquiries[0]?.count || 0;
    const prev_quote_count_existing = previous_month_quotes[0]?.count || 0;
    const prev_booking_count = previous_month_bookings[0]?.count || 0;

    const prev_enquiry_to_quote = prev_enquiry_count > 0 ? Math.round((prev_quote_count_existing / prev_enquiry_count) * 100) : 0;
    const prev_quote_to_booking = prev_quote_count_existing > 0 ? Math.round((prev_booking_count / prev_quote_count_existing) * 100) : 0;
    const prev_overall_conversion = prev_enquiry_count > 0 ? Math.round((prev_booking_count / prev_enquiry_count) * 100) : 0;
    const prev_loss_rate = prev_enquiry_count > 0 ? Math.round(((prev_enquiry_count - prev_booking_count) / prev_enquiry_count) * 100) : 0;

    return {
        enquiry_to_quote: {
            rate: enquiry_to_quote_conversion,
            current: quote_count,
            total: enquiry_count,
            change: calculatePercentageChange(enquiry_to_quote_conversion, prev_enquiry_to_quote),
        },
        quote_to_booking: {
            rate: quote_to_booking_conversion,
            current: booking_count,
            total: quote_count,
            change: calculatePercentageChange(quote_to_booking_conversion, prev_quote_to_booking),
        },
        overall_conversion: {
            rate: overall_conversion,
            current: booking_count,
            total: enquiry_count,
            change: calculatePercentageChange(overall_conversion, prev_overall_conversion),
        },
        loss_rate: {
            rate: loss_rate,
            current: lost_enquiries,
            total: enquiry_count,
            change: calculatePercentageChange(loss_rate, prev_loss_rate),
        },
    };
};

// Sector 4: Activity Status
const getActivityStatus = async (agent_id?: string) => {
    const { agentFilter } = createAgentFilter(agent_id);
    const now = new Date();
    const current_month_start = startOfMonth(now);
    const previous_month_start = startOfMonth(subMonths(now, 1));

    const [
        active_enquiries,
        pending_quotes,
        upcoming_bookings,
        overdue_tasks,
        previous_month_active_enquiries,
        previous_month_pending_quotes,
        previous_month_upcoming_bookings,
        previous_month_overdue_tasks,
    ] = await Promise.all([
        db
            .select({ count: count() })
            .from(enquiry_table)
            .innerJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
            .where(agentFilter(eq(transaction.status, 'on_enquiry'))),
        db
            .select({ count: count() })
            .from(quote)
            .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
            .where(
                agentFilter(
                    and(eq(transaction.status, 'on_quote'), sql`quote_table.quote_status IN ('QUOTE_IN_PROGRESS', 'QUOTE_READY', 'AWAITING_DECISION')`)
                )
            ),
        db
            .select({ count: count() })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(
                and(
                    agentFilter(sql`booking_table.travel_date >= CURRENT_DATE AND booking_table.travel_date <= CURRENT_DATE + INTERVAL '30 days'::interval`),
                    ne(booking.is_active, false)
                )
            ),
        db
            .select({ count: count() })
            .from(task)
            .where(
                agent_id
                    ? and(eq(task.user_id, agent_id), eq(task.status, 'PENDING'), lt(task.due_date, new Date()))
                    : and(eq(task.status, 'PENDING'), lt(task.due_date, new Date()))
            ),
        db
            .select({ count: count() })
            .from(enquiry_table)
            .innerJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
            .where(agentFilter(and(gte(enquiry_table.date_created, previous_month_start), lt(enquiry_table.date_created, current_month_start)))),
        db
            .select({ count: count() })
            .from(quote)
            .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
            .where(
                agentFilter(
                    and(
                        eq(transaction.status, 'on_quote'),
                        inArray(quote.quote_status, ['QUOTE_IN_PROGRESS', 'QUOTE_READY', 'AWAITING_DECISION']),
                        and(gte(quote.date_created, previous_month_start), lt(quote.date_created, current_month_start))
                    )
                )
            ),
        db
            .select({ count: count() })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(
                agentFilter(
                    and(
                        gte(booking.travel_date, previous_month_start.toISOString()),
                        lte(booking.travel_date, addDays(previous_month_start, 30).toISOString()),
                        ne(booking.is_active, false)
                    )
                )
            ),
        db
            .select({ count: count() })
            .from(task)
            .where(
                agent_id
                    ? and(
                        eq(task.user_id, agent_id),
                        eq(task.status, 'PENDING'),
                        lt(task.due_date, new Date()),
                        and(gte(task.due_date, previous_month_start), lt(task.due_date, current_month_start))
                    )
                    : and(
                        eq(task.status, 'PENDING'),
                        lt(task.due_date, new Date()),
                        and(gte(task.due_date, previous_month_start), lt(task.due_date, current_month_start))
                    )
            ),
    ]);

    const active_enquiries_count = active_enquiries[0]?.count || 0;
    const pending_quotes_count = pending_quotes[0]?.count || 0;
    const upcoming_bookings_count = upcoming_bookings[0]?.count || 0;
    const overdue_tasks_count = overdue_tasks[0]?.count || 0;

    const prev_active_enquiries = previous_month_active_enquiries[0]?.count || 0;
    const prev_pending_quotes = previous_month_pending_quotes[0]?.count || 0;
    const prev_upcoming_bookings = previous_month_upcoming_bookings[0]?.count || 0;
    const prev_overdue_tasks = previous_month_overdue_tasks[0]?.count || 0;

    return {
        active_enquiries: { value: active_enquiries_count, change: calculatePercentageChange(active_enquiries_count, prev_active_enquiries) },
        pending_quotes: { value: pending_quotes_count, change: calculatePercentageChange(pending_quotes_count, prev_pending_quotes) },
        upcoming_bookings: { value: upcoming_bookings_count, change: calculatePercentageChange(upcoming_bookings_count, prev_upcoming_bookings) },
        overdue_tasks: { value: overdue_tasks_count, change: calculatePercentageChange(overdue_tasks_count, prev_overdue_tasks) },
    };
};

// Sector 5: Performance Highlights
const getPerformanceHighlights = async (agent_id?: string) => {
    const { agentFilterOnly, agentFilter } = createAgentFilter(agent_id);
    const now = new Date();
    const current_month_start = startOfMonth(now);
    const previous_month_start = startOfMonth(subMonths(now, 1));

    const [booking_values, quote_values, current_month_bookings, previous_month_bookings] = await Promise.all([
        db
            .select({ overall_commission: getBookingCommissionSQL().as('overall_commission') })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(and(agentFilterOnly(), ne(booking.is_active, false))),
        db
            .select({ overall_commission: getQuoteCostSQL().as('overall_commission') })
            .from(quote)
            .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
            .where(agentFilterOnly()),
        db
            .select({
                count: count(),
                sum: sum(getBookingCommissionSQL()),
            })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(and(agentFilter(gte(booking.date_created, current_month_start)), ne(booking.is_active, false))),
        db
            .select({
                count: count(),
                sum: sum(getBookingCommissionSQL()),
            })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(
                and(
                    agentFilter(and(gte(booking.date_created, previous_month_start), lt(booking.date_created, current_month_start))),
                    ne(booking.is_active, false)
                )
            ),
    ]);

    const total_booking_value = booking_values.reduce((sum, booking) => sum + Number(booking.overall_commission || 0), 0);
    const booking_count = booking_values.length;
    const average_booking_value = booking_count > 0 ? total_booking_value / booking_count : 0;

    const total_quote_value = quote_values.reduce((sum, quote) => sum + Number(quote.overall_commission || 0), 0);
    const quote_count = quote_values.length;
    const average_quote_value = quote_count > 0 ? total_quote_value / quote_count : 0;

    const current_month_sum = current_month_bookings[0]?.sum || 0;
    const previous_month_sum = previous_month_bookings[0]?.sum || 0;
    const monthly_growth = calculatePercentageChange(Number(current_month_sum), Number(previous_month_sum));

    return {
        monthly_growth,
        average_response_time: 24, // Mock value
        average_booking_value,
        average_quote_value,
    };
};

// Sector 6: Sales Trends
const getSalesTrends = async (agent_id?: string) => {
    const { agentFilter } = createAgentFilter(agent_id);
    const sales_trends_data = [];
    const current_date = new Date();

    for (let i = 5; i >= 0; i--) {
        const month_date = startOfMonth(subMonths(current_date, i));
        const next_month_date = startOfMonth(subMonths(current_date, i - 1));

        const [monthly_enquiries, monthly_quotes, monthly_bookings, monthly_revenue] = await Promise.all([
            db
                .select({ count: count() })
                .from(enquiry_table)
                .innerJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
                .where(agentFilter(and(gte(enquiry_table.date_created, month_date), lt(enquiry_table.date_created, next_month_date)))),
            db
                .select({ count: count() })
                .from(quote)
                .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
                .where(agentFilter(and(gte(quote.date_created, month_date), lt(quote.date_created, next_month_date)))),
            db
                .select({ count: count() })
                .from(booking)
                .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
                .where(agentFilter(and(gte(booking.date_created, month_date), lt(booking.date_created, next_month_date)))),
            db
                .select({ overall_commission: getBookingCommissionSQL().as('overall_commission') })
                .from(booking)
                .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
                .where(agentFilter(and(gte(booking.date_created, month_date), lt(booking.date_created, next_month_date), ne(booking.is_active, false)))),
        ]);

        const month_name = month_date.toLocaleDateString('en-US', { month: 'short' });
        const enquiries_count = monthly_enquiries[0]?.count || 0;
        const quotes_count = monthly_quotes[0]?.count || 0;
        const bookings_count = monthly_bookings[0]?.count || 0;
        const revenue_total = monthly_revenue.reduce((sum, booking) => sum + Number(booking.overall_commission || 0), 0);

        sales_trends_data.push({
            name: month_name,
            enquiries: enquiries_count,
            quotes: quotes_count,
            bookings: bookings_count,
            revenue: revenue_total,
        });
    }

    return sales_trends_data;
};

// Sector 7: Revenue Distribution
const getRevenueDistribution = async (agent_id?: string) => {
    const { agentFilterOnly } = createAgentFilter(agent_id);

    const revenue_distribution = await db
        .select({
            package_type: package_type.name,
            revenue: getBookingCommissionSQL().as('revenue'),
        })
        .from(booking)
        .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
        .leftJoin(package_type, eq(package_type.id, booking.holiday_type_id))
        .where(and(agentFilterOnly(), ne(booking.is_active, false)));

    const distribution_data = revenue_distribution.reduce((acc, item) => {
        const packageType = item.package_type as string;
        const revenue = Number(item.revenue || 0);

        if (acc[packageType]) {
            acc[packageType] += revenue;
        } else {
            acc[packageType] = revenue;
        }

        return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution_data).map(([name, value]) => ({
        name,
        value,
    }));
};

// Sector 8: Monthly Comparison
const getMonthlyComparison = async (agent_id?: string) => {
    const { agentFilter, agentFilterOnly } = createAgentFilter(agent_id);
    const now = new Date();
    const current_month_start = startOfMonth(now);
    const previous_month_start = startOfMonth(subMonths(now, 1));

    const [
        current_enquiries,
        current_quotes,
        current_bookings,
        current_revenue,
        previous_month_enquiries,
        previous_month_quotes,
        previous_month_bookings,
        previous_month_revenue,
    ] = await Promise.all([
        db
            .select({ count: count() })
            .from(enquiry_table)
            .innerJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
            .where(agentFilterOnly()),
        db.select({ count: count() }).from(quote).innerJoin(transaction, eq(quote.transaction_id, transaction.id)).where(agentFilterOnly()),
        db.select({ count: count() }).from(booking).innerJoin(transaction, eq(booking.transaction_id, transaction.id)).where(agentFilterOnly()),
        db
            .select({ overall_commission: getBookingCommissionSQL().as('overall_commission') })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(and(agentFilterOnly(), ne(booking.is_active, false))),
        db
            .select({ count: count() })
            .from(enquiry_table)
            .innerJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
            .where(agentFilter(and(gte(enquiry_table.date_created, previous_month_start), lt(enquiry_table.date_created, current_month_start)))),
        db
            .select({ count: count() })
            .from(quote)
            .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
            .where(agentFilter(and(gte(quote.date_created, previous_month_start), lt(quote.date_created, current_month_start)))),
        db
            .select({ count: count() })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(
                and(
                    agentFilter(and(gte(booking.date_created, previous_month_start), lt(booking.date_created, current_month_start))),
                    ne(booking.is_active, false)
                )
            ),
        db
            .select({ overall_commission: getBookingCommissionSQL().as('overall_commission') })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(
                and(
                    agentFilter(and(gte(booking.date_created, previous_month_start), lt(booking.date_created, current_month_start))),
                    ne(booking.is_active, false)
                )
            ),
    ]);

    const enquiry_count = current_enquiries[0]?.count || 0;
    const quote_count = current_quotes[0]?.count || 0;
    const booking_count = current_bookings[0]?.count || 0;
    const total_booking_value = current_revenue.reduce((sum, booking) => sum + Number(booking.overall_commission || 0), 0);

    const prev_enquiry_count = previous_month_enquiries[0]?.count || 0;
    const prev_quote_count = previous_month_quotes[0]?.count || 0;
    const prev_booking_count = previous_month_bookings[0]?.count || 0;
    const prev_revenue = previous_month_revenue.reduce((sum, booking) => sum + Number(booking.overall_commission || 0), 0);

    return [
        { name: 'Enquiries', current: enquiry_count, previous: prev_enquiry_count },
        { name: 'Quotes', current: quote_count, previous: prev_quote_count },
        { name: 'Bookings', current: booking_count, previous: prev_booking_count },
        { name: 'Revenue', current: Math.round(total_booking_value / 1000), previous: Math.round(prev_revenue / 1000) },
    ];
};

// Sector 9: Booking Analytics
const getBookingAnalytics = async (agent_id?: string) => {
    const { agentFilter, agentFilterOnly } = createAgentFilter(agent_id);
    const now = new Date();
    const current_month_start = startOfMonth(now);
    const previous_month_start = startOfMonth(subMonths(now, 1));

    const [booking_values, completed_bookings, lost_bookings, previous_period_bookings, previous_period_revenue] = await Promise.all([
        db
            .select({ overall_commission: getBookingCommissionSQL().as('overall_commission') })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(and(agentFilterOnly(), ne(booking.is_active, false))),
        db
            .select({ count: count() })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(agentFilter(eq(booking.booking_status, 'BOOKED'))),
        db
            .select({ count: count() })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(agentFilter(eq(booking.booking_status, 'LOST'))),
        db
            .select({ count: count() })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(
                and(
                    agentFilter(and(gte(booking.date_created, previous_month_start), lt(booking.date_created, current_month_start))),
                    ne(booking.is_active, false)
                )
            ),
        db
            .select({ overall_commission: getBookingCommissionSQL().as('overall_commission') })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(agentFilter(and(gte(booking.date_created, previous_month_start), lt(booking.date_created, current_month_start)))),
    ]);

    const total_booking_value = booking_values.reduce((sum, booking) => sum + Number(booking.overall_commission || 0), 0);
    const booking_count = booking_values.length;
    const average_booking_value = booking_count > 0 ? total_booking_value / booking_count : 0;

    const completed_bookings_count = completed_bookings[0]?.count || 0;
    const lost_count = lost_bookings[0]?.count || 0;
    const prev_bookings_count = previous_period_bookings[0]?.count || 0;
    const prev_period_revenue_total = previous_period_revenue.reduce((sum, booking) => sum + Number(booking.overall_commission || 0), 0);
    const prev_avg_booking_value_period = prev_bookings_count > 0 ? prev_period_revenue_total / prev_bookings_count : 0;

    const total_bookings_change = calculatePercentageChange(booking_count, prev_bookings_count);
    const total_revenue_change = calculatePercentageChange(total_booking_value, prev_period_revenue_total);
    const avg_booking_value_change = calculatePercentageChange(average_booking_value, prev_avg_booking_value_period);
    const completion_rate = booking_count > 0 ? Math.round((completed_bookings_count / booking_count) * 100) : 0;
    const prev_completion_rate = prev_bookings_count > 0 ? Math.round((completed_bookings_count / prev_bookings_count) * 100) : 0;
    const completion_rate_change = calculatePercentageChange(completion_rate, prev_completion_rate);
    const cancellation_rate = completed_bookings_count + lost_count > 0 ? Math.round((lost_count / (completed_bookings_count + lost_count)) * 100) : 0;

    return {
        total_bookings: { value: booking_count, change: total_bookings_change, description: 'All time bookings' },
        total_revenue: { value: total_booking_value, change: total_revenue_change, description: 'All time revenue' },
        avg_booking_value: { value: average_booking_value, change: avg_booking_value_change, description: 'Per booking average' },
        completion_rate: { value: completion_rate, change: completion_rate_change, description: `${completed_bookings_count} completed` },
        booking_status: { booked: completed_bookings_count, lost: lost_count },
        performance_metrics: {
            completion_rate,
            cancellation_rate,
            monthly_growth: total_bookings_change,
        },
        revenue_summary: {
            total_revenue: total_booking_value,
            avg_value: average_booking_value,
            growth: total_revenue_change,
        },
    };
};

// Sector 10: Quote Analytics
const getQuoteAnalytics = async (agent_id?: string) => {
    const { agentFilter, agentFilterOnly } = createAgentFilter(agent_id);
    const now = new Date();
    const current_month_start = startOfMonth(now);
    const previous_month_start = startOfMonth(subMonths(now, 1));

    const [quote_values, accepted_quotes, pending_quotes, previous_month_quotes] = await Promise.all([
        db
            .select({ overall_commission: getQuoteCostSQL().as('overall_commission') })
            .from(quote)
            .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
            .where(agentFilterOnly()),
        db
            .select({ count: count() })
            .from(quote)
            .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
            .where(agentFilter(sql`EXISTS (SELECT 1 FROM booking_table WHERE booking_table.transaction_id = ${quote.transaction_id})`)),
        db
            .select({ count: count() })
            .from(quote)
            .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
            .where(
                agentFilter(and(eq(transaction.status, 'on_quote'), inArray(quote.quote_status, ['QUOTE_IN_PROGRESS', 'QUOTE_READY', 'AWAITING_DECISION'])))
            ),
        db
            .select({ count: count() })
            .from(quote)
            .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
            .where(agentFilter(and(gte(quote.date_created, previous_month_start), lt(quote.date_created, current_month_start)))),
    ]);

    const total_quote_value = quote_values.reduce((sum, quote) => sum + Number(quote.overall_commission || 0), 0);
    const quote_count = quote_values.length;
    const avg_quote_value = quote_count > 0 ? total_quote_value / quote_count : 0;

    const accepted_count = accepted_quotes[0]?.count || 0;
    const pending_count_quotes = pending_quotes[0]?.count || 0;
    const prev_quote_count = previous_month_quotes[0]?.count || 0;

    const acceptance_rate = quote_count > 0 ? Math.round((accepted_count / quote_count) * 100) : 0;
    const pending_rate = quote_count > 0 ? Math.round((pending_count_quotes / quote_count) * 100) : 0;
    const prev_acceptance_rate = prev_quote_count > 0 ? Math.round((accepted_count / prev_quote_count) * 100) : 0;
    const acceptance_rate_change = calculatePercentageChange(acceptance_rate, prev_acceptance_rate);

    const total_quotes_change = calculatePercentageChange(quote_count, prev_quote_count);
    const total_quote_value_change = 0; // No previous quote values available
    const avg_quote_value_change = 0; // No previous quote values available

    return {
        total_quotes: { value: quote_count, change: total_quotes_change, description: 'All time quotes' },
        total_quote_value: { value: total_quote_value, change: total_quote_value_change, description: 'Combined value' },
        avg_quote_value: { value: avg_quote_value, change: avg_quote_value_change, description: 'Per quote average' },
        acceptance_rate: { value: acceptance_rate, change: acceptance_rate_change, description: `${accepted_count} accepted` },
        quote_status: { accepted: accepted_count, pending: pending_count_quotes, rejected: 0 },
        performance_metrics: {
            acceptance_rate,
            rejection_rate: 0,
            pending_rate,
        },
        value_summary: {
            total_value: total_quote_value,
            avg_value: avg_quote_value,
            accepted_value: 0,
        },
    };
};

// Sector 11: Enquiry Analytics
const getEnquiryAnalytics = async (agent_id?: string) => {
    const { agentFilter, agentFilterOnly } = createAgentFilter(agent_id);
    const now = new Date();
    const current_month_start = startOfMonth(now);
    const previous_month_start = startOfMonth(subMonths(now, 1));

    const [total_enquiries, converted_enquiries_to_bookings, previous_month_enquiries] = await Promise.all([
        db
            .select({ count: count() })
            .from(enquiry_table)
            .leftJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
            .where(agentFilterOnly()),
        db
            .select({ count: count() })
            .from(enquiry_table)
            .leftJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
            .where(agentFilter(sql`EXISTS (SELECT 1 FROM booking_table WHERE booking_table.transaction_id = ${enquiry_table.transaction_id})`)),
        db
            .select({ count: count() })
            .from(enquiry_table)
            .leftJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
            .where(agentFilter(and(gte(enquiry_table.date_created, previous_month_start), lt(enquiry_table.date_created, current_month_start)))),
    ]);

    const enquiry_count = total_enquiries[0]?.count || 0;
    const converted_enquiries_analytics = Number(converted_enquiries_to_bookings[0]?.count || 0);
    const conversion_rate = enquiry_count > 0 ? Math.round((converted_enquiries_analytics / enquiry_count) * 100) : 0;

    const prev_enquiry_count = previous_month_enquiries[0]?.count || 0;
    const total_enquiries_change = calculatePercentageChange(enquiry_count, prev_enquiry_count);
    const conversion_rate_change = 0; // No previous conversion rate data available

    const new_enquiries = enquiry_count;
    const in_progress_enquiries = 0;
    const converted_enquiries_count = converted_enquiries_analytics;
    const enquiry_conversion_rate = enquiry_count > 0 ? Math.round((converted_enquiries_count / enquiry_count) * 100) : 0;
    const pending_enquiries = enquiry_count - Number(converted_enquiries_count);

    return {
        total_enquiries: { value: enquiry_count, change: total_enquiries_change, description: 'All time enquiries' },
        conversion_rate: { value: conversion_rate, change: conversion_rate_change, description: `${converted_enquiries_analytics} converted` },
        enquiry_status: { new: new_enquiries, in_progress: in_progress_enquiries, converted: converted_enquiries_count },
        performance_metrics: { conversion_rate: enquiry_conversion_rate },
        efficiency_summary: {
            total_enquiries: enquiry_count,
            converted: converted_enquiries_count,
            pending: pending_enquiries,
        },
    };
};
export const dashboardRepo: DashboardRepo = {

    fetchAdminAnalytics: async (agent_id) => {
        const [
            quick_review,
            revenue_overview,
            kpis,
            activity_status,
            performance_highlights,
            sales_trends,
            revenue_distribution,
            monthly_comparison,
            booking_analytics,
            quote_analytics,
            enquiry_analytics,
        ] = await Promise.all([
            getQuickReview(agent_id),
            getRevenueOverview(agent_id),
            getKPIs(agent_id),
            getActivityStatus(agent_id),
            getPerformanceHighlights(agent_id),
            getSalesTrends(agent_id),
            getRevenueDistribution(agent_id),
            getMonthlyComparison(agent_id),
            getBookingAnalytics(agent_id),
            getQuoteAnalytics(agent_id),
            getEnquiryAnalytics(agent_id),
        ]);

        return {
            quick_review,
            revenue_overview,
            kpis,
            activity_status,
            performance_highlights,
            sales_trends,
            revenue_distribution,
            monthly_comparison,
            booking_analytics,
            quote_analytics,
            enquiry_analytics,
        };
    },
    fetchAdminDashboardStats: async (agent_id) => {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Run all in parallel
        const [today_data, weekly_data, monthly_data] = await Promise.all([
            getCommissionAndCount({ from: todayStart, agent_id }),
            getCommissionAndCount({ from: weekStart, agent_id }),
            getCommissionAndCount({ from: monthStart, agent_id }),
        ]);

        return { today_data, weekly_data, monthly_data };
    },
    fetchClientStats: async (clientId) => {
        const total_quotes = await db
            .select({
                holiday_destination: country.country_name,
                lodge_destination: park.county,

                last_quoted: quote.date_created ?? null,
            })
            .from(quote)
            .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
            .leftJoin(quote_accomodation, eq(quote_accomodation.quote_id, quote.id))
            .leftJoin(accomodation_list, eq(quote_accomodation.accomodation_id, accomodation_list.id))
            .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
            .leftJoin(destination, eq(resorts.destination_id, destination.id))
            .leftJoin(country, eq(destination.country_id, country.id))
            .leftJoin(lodges, eq(quote.lodge_id, lodges.id))
            .leftJoin(park, eq(lodges.park_id, park.id))
            .orderBy(desc(quote.date_created))
            .where(eq(transaction.client_id, clientId));

        const total_quote_payload = {
            total_quotes: total_quotes.length,
            destination: [
                ...new Set(
                    total_quotes
                        .map((q) => [q.holiday_destination, q.lodge_destination]) // Extract destinations
                        .flat() // Flatten array
                        .filter((dest): dest is string => dest !== null && dest !== undefined) // Remove null/undefined and type guard
                ),
            ],
            last_quoted: total_quotes && total_quotes.length > 0 ? total_quotes[0].last_quoted : null,
        };

        const total_historical_booking = await db
            .select({ count: count() })
            .from(historicalBooking)
            .where(and(eq(historicalBooking.client_id, clientId), eq(historicalBooking.cancelled, false)));
        const total_booking = await db
            .select({ count: count() })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(and(eq(transaction.client_id, clientId), eq(transaction.status, 'on_booking')));

        const total_booking_payload = {
            total_booking: (total_booking[0]?.count || 0) + (total_historical_booking[0]?.count || 0),
            destination: [], // Add empty array for now - you may need to populate this based on your requirements
            last_booked: null, // Add null for now - you may need to populate this based on your requirements
        };




        const live_quote = await db
            .select({
                holiday_destination: resorts.name,
                lodge_destination: park.county,
                num_of_nights: quote.num_of_nights,
                overall_cost: sql`
          COALESCE(SUM(quote_flights.cost), 0)
          + COALESCE(SUM(quote_airport_parking.cost), 0)
          + COALESCE(SUM(quote_lounge_pass.cost), 0)
          + COALESCE(SUM(quote_attraction_ticket.cost), 0)
          + COALESCE(SUM(quote_car_hire.cost), 0)
          + COALESCE(SUM(quote_transfers.cost), 0)
          + COALESCE(SUM(quote_accomodation.cost), 0)
          - quote_table.discounts
          + quote_table.service_charge
          + quote_table.sales_price
        `.as('overall_cost'),
                date_quoted: quote.date_created,
            })
            .from(quote)
            .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
            .leftJoin(quote_accomodation, eq(quote_accomodation.quote_id, quote.id))
            .leftJoin(accomodation_list, eq(quote_accomodation.accomodation_id, accomodation_list.id))
            .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
            .leftJoin(lodges, eq(quote.lodge_id, lodges.id))
            .leftJoin(park, eq(lodges.park_id, park.id))
            .leftJoin(quote_flights, eq(quote_flights.quote_id, quote.id))
            .leftJoin(quote_airport_parking, eq(quote_airport_parking.quote_id, quote.id))
            .leftJoin(quote_lounge_pass, eq(quote_lounge_pass.quote_id, quote.id))
            .leftJoin(quote_attraction_ticket, eq(quote_attraction_ticket.quote_id, quote.id))
            .leftJoin(quote_car_hire, eq(quote_car_hire.quote_id, quote.id))
            .leftJoin(quote_transfers, eq(quote_transfers.quote_id, quote.id))
            .orderBy(desc(quote.date_created))
            .where(and(eq(transaction.client_id, clientId), eq(transaction.status, 'on_quote')))
            .groupBy(quote.id, resorts.name, park.county) // Grouping by quote.id is necessary to avoid aggregation issues
            .limit(1);

        const live_quote_payload = {
            destination: [
                ...new Set(
                    live_quote
                        .map((q) => [q.holiday_destination, q.lodge_destination]) // Extract destinations
                        .flat() // Flatten array
                        .filter((dest): dest is string => dest !== null && dest !== undefined) // Remove null/undefined and type guard
                ),
            ],
            num_of_nights: live_quote[0]?.num_of_nights ? live_quote[0]?.num_of_nights : 0,
            overall_cost: parseInt(live_quote[0]?.overall_cost as string) ?? 0,
            date_quoted: live_quote && live_quote.length > 0 ? live_quote[0]?.date_quoted : null,
        };

        const life_time_profit = await db
            .select({
                overall_commission: sql`
        SUM( COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
          + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
          + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
          + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
          + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
          + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
          + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
          + booking_table.package_commission
        )
         
        `.as('overall_commission'),
            })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(eq(transaction.client_id, clientId));

        const life_time_profit_payload = parseInt(life_time_profit[0]?.overall_commission as string) || 0;



        const booking_percentage =
            total_quote_payload.total_quotes > 0 && total_booking_payload.total_booking > 0
                ? (total_booking_payload.total_booking / total_quote_payload.total_quotes) * 100
                : 0;

        const booking_percentage_payload = `${booking_percentage.toFixed(2)}%`;

        const bookings = await db
            .select({
                agentName: sql`${user.firstName} || ' ' || ${user.lastName}`,
                clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
                date_booked: booking.date_created,
                booking_id: booking.id,
                holiday_destination: sql`${resorts.name} || ' ' || ${destination.name}`,
                lodge_destination: sql`${park.name} || ' ' || ${park.city}`,
                travel_date: booking.travel_date,
                overall_commission: sql`
          COALESCE(SUM(booking_flights.commission), 0)
          + COALESCE(SUM(booking_airport_parking.commission), 0)
          + COALESCE(SUM(booking_lounge_pass.commission), 0)
          + COALESCE(SUM(booking_attraction_ticket.commission), 0)
          + COALESCE(SUM(booking_car_hire.commission), 0)
          + COALESCE(SUM(booking_transfers.commission), 0)
          + COALESCE(SUM(booking_accomodation.commission), 0)
          + booking_table.package_commission
          
        `.as('overall_commission'),
                overall_cost: sql`
          COALESCE(SUM(booking_flights.cost), 0)
          + COALESCE(SUM(booking_airport_parking.cost), 0)
          + COALESCE(SUM(booking_lounge_pass.cost), 0)
          + COALESCE(SUM(booking_attraction_ticket.cost), 0)
          + COALESCE(SUM(booking_car_hire.cost), 0)
          + COALESCE(SUM(booking_transfers.cost), 0)
          + COALESCE(SUM(booking_accomodation.cost), 0)
          - booking_table.discounts
          + booking_table.service_charge
          + booking_table.sales_price
        `.as('overall_cost'),
            })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .leftJoin(user, eq(transaction.user_id, user.id))
            .leftJoin(clientTable, eq(transaction.client_id, clientTable.id))
            .leftJoin(booking_accomodation, eq(booking_accomodation.booking_id, booking.id))
            .leftJoin(accomodation_list, eq(booking_accomodation.accomodation_id, accomodation_list.id))
            .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
            .leftJoin(destination, eq(resorts.destination_id, destination.id))
            .leftJoin(lodges, eq(booking.lodge_id, lodges.id))
            .leftJoin(park, eq(lodges.park_id, park.id))
            .leftJoin(booking_flights, eq(booking_flights.booking_id, booking.id))
            .leftJoin(booking_airport_parking, eq(booking_airport_parking.booking_id, booking.id))
            .leftJoin(booking_lounge_pass, eq(booking_lounge_pass.booking_id, booking.id))
            .leftJoin(booking_attraction_ticket, eq(booking_attraction_ticket.booking_id, booking.id))
            .leftJoin(booking_car_hire, eq(booking_car_hire.booking_id, booking.id))
            .leftJoin(booking_transfers, eq(booking_transfers.booking_id, booking.id))
            .groupBy(
                booking.id,
                user.firstName,
                user.lastName,
                clientTable.firstName,
                clientTable.surename,
                booking.travel_date,
                resorts.name,
                destination.name,
                park.name,
                park.city
            )
            .orderBy(desc(booking.date_created))
            .where(and(eq(transaction.client_id, clientId), eq(transaction.status, 'on_booking')));

        const count_enquiry = await db
            .select({ count: count() })
            .from(enquiry_table)
            .innerJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
            .where(and(eq(transaction.client_id, clientId), eq(transaction.status, 'on_enquiry')));


        const total_historical_profit = await db
            .select({
                overall_commission: sql`
          SUM(historical_booking.profit)
        `.as('overall_commission'),
            })
            .from(historicalBooking).where(and(eq(historicalBooking.client_id, clientId), eq(historicalBooking.cancelled, false)));


        const ppb = total_booking_payload.total_booking > 0
            ? (life_time_profit_payload + (parseFloat(total_historical_profit[0]?.overall_commission as string) || 0)) / total_booking_payload.total_booking
            : 0;

        const payloads = {
            total_enquiries: count_enquiry[0]?.count || 0,
            total_quotes: total_quote_payload,
            total_booking: total_booking_payload,
            live_quote: live_quote_payload,
            life_time_profit: life_time_profit_payload + (parseFloat(total_historical_profit[0]?.overall_commission as string) || 0),
            booking_percentage: booking_percentage_payload,
            ppb: parseFloat(ppb.toFixed(2)),
            bookings:
                bookings?.map((booking) => ({
                    ...booking,
                    date_booked: booking.date_booked!,

                    agentName: booking.agentName ? booking.agentName.toString() : '',
                    clientName: booking.clientName ? booking.clientName.toString() : '',
                    overall_commission: parseInt(booking.overall_commission as string) ?? 0,
                    overall_cost: parseInt(booking.overall_cost as string) ?? 0,
                    destination: booking.holiday_destination
                        ? booking.holiday_destination.toString()
                        : booking.lodge_destination
                            ? booking.lodge_destination.toString()
                            : null,
                })) ?? [],
        };

        return payloads;
    },
    fetchAgentStats: async (agentId) => {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday start

        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(weekStart.getDate() - 7);

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const lastMonthStart = new Date(monthStart);
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

        // Get current month and year
        const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
        const currentYear = now.getFullYear();

        // Fetch monthly target from agent target table
        const monthlyTargetQuery = await db
            .select({
                target_amount: agentTargetTable.target_amount,
            })
            .from(agentTargetTable)
            .where(
                and(
                    eq(agentTargetTable.user_id, agentId),
                    eq(agentTargetTable.month, currentMonth),
                    eq(agentTargetTable.year, currentYear),
                    eq(agentTargetTable.is_active, true)
                )
            );

        // Use the target from database or default to 6000 if not found
        const monthlyTarget = parseFloat(monthlyTargetQuery[0]?.target_amount as string) || 6000;

        const last_day_profit = await db
            .select({
                overall_commission: sql`
          SUM(
            COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
            + booking_table.package_commission
          )
        `,
            })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(
                and(
                    eq(transaction.user_id, agentId),
                    gte(booking.date_created, yesterday), // >= yesterday midnight
                    lt(booking.date_created, todayStart) // < today midnight (start of today)
                )
            );

        const today_profit = await db
            .select({
                overall_commission: sql`
          SUM(
            COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
            + booking_table.package_commission
          )
        `,
            })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(and(eq(transaction.user_id, agentId), gte(booking.date_created, todayStart)));

        const weekly_profit = await db
            .select({
                overall_commission: sql`
          SUM(
            COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
            + booking_table.package_commission
          )
        `,
            })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(and(eq(transaction.user_id, agentId), gte(booking.date_created, weekStart)));

        const last_week_profit = await db
            .select({
                overall_commission: sql`
          SUM(
            COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
            + booking_table.package_commission
          )
        `,
            })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(and(eq(transaction.user_id, agentId), gte(booking.date_created, lastWeekStart), lt(booking.date_created, weekStart)));

        const total_profit = await db
            .select({
                overall_commission: sql`
          SUM(
            COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
            + booking_table.package_commission
          )
        `,
            })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(and(eq(transaction.user_id, agentId)));

        const monthly_profit = await db
            .select({
                overall_commission: sql`
          SUM(
            COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
            + booking_table.package_commission
          )
        `,
            })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(and(eq(transaction.user_id, agentId), gte(booking.date_created, monthStart)));
        const last_month_profit = await db
            .select({
                overall_commission: sql`
          SUM(
            COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
            + booking_table.package_commission
          )
        `,
            })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(and(eq(transaction.user_id, agentId), gte(booking.date_created, lastMonthStart), lt(booking.date_created, monthStart)));

        const daily_percentage = safePercentageChange(
            Number(today_profit[0]?.overall_commission ?? 0),
            Number(last_day_profit[0]?.overall_commission ?? 0)
        );

        const weekly_percentage = safePercentageChange(
            Number(weekly_profit[0]?.overall_commission ?? 0),
            Number(last_week_profit[0]?.overall_commission ?? 0)
        );

        const monthly_percentage = safePercentageChange(
            Number(monthly_profit[0]?.overall_commission ?? 0),
            Number(last_month_profit[0]?.overall_commission ?? 0)
        );

        const countBooking = await db
            .select({ count: count() })
            .from(booking)
            .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
            .where(and(eq(transaction.user_id, agentId), gte(booking.date_created, monthStart)));

        const totalDeals = countBooking[0]?.count || 1;
        const commission = parseFloat(monthly_profit[0]?.overall_commission as string) || 0;
        const averagePPU = commission / totalDeals;

        const lost_deal = await db
            .select({ count: count() })
            .from(quote)
            .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
            .where(and(eq(transaction.user_id, agentId), eq(quote.quote_status, 'LOST')));
        const lost_inquiries = await db
            .select({ count: count() })
            .from(enquiry_table)
            .innerJoin(transaction, eq(enquiry_table.transaction_id, transaction.id))
            .where(and(eq(transaction.user_id, agentId), eq(enquiry_table.status, 'LOST')));

        const total_lost = (lost_deal[0].count ?? 0) + (lost_inquiries[0].count ?? 0);
        const total_activity = total_lost + totalDeals;
        const closureRate = (totalDeals / (totalDeals + total_lost)) * 100;

        const target_deals = Math.ceil((monthlyTarget - commission) / averagePPU);
        const ppb = countBooking[0].count > 0
            ? (parseFloat(total_profit[0].overall_commission as string) ?? 0) / countBooking[0].count
            : 0;
        return {
            today_profit: parseFloat(today_profit[0]?.overall_commission as string) || 0,
            weekly_profit: parseFloat(weekly_profit[0]?.overall_commission as string) || 0,
            monthly_profit: parseFloat(monthly_profit[0]?.overall_commission as string) || 0,
            ppb: parseFloat(ppb.toFixed(2)),
            target_remaining: monthlyTarget - (parseFloat(monthly_profit[0]?.overall_commission as string) || 0),
            daily_percentage: daily_percentage,
            weekly_percentage: weekly_percentage,
            monthly_percentage: monthly_percentage,
            averagePPU: averagePPU,
            target_deals: target_deals,
            closure_rate: closureRate,
            monthly_target: monthlyTarget,
        };
    },
    insertTodo: async (agentId, note) => {
        await db.insert(todos).values({
            user_id: agentId,
            note: note,
        });
    },
    fetchTodos: async (agentId) => {
        const response = await db.query.todos.findMany({
            where: eq(todos.user_id, agentId),
            columns: {
                id: true,
                note: true,
                createdAt: true,
                status: true,
                agent_id: true,
            },
        });
        return response.map((todo) => ({
            id: todo.id,
            note: todo.note as string,
            createdAt: todo.createdAt,
            status: todo.status as "PENDING" | "DONE",
            agent_id: todo.agent_id as string,
        }));
    },
    updateTodo: async (id, status) => {
        await db
            .update(todos)
            .set({
                status: status as "PENDING" | "DONE",
            })
            .where(eq(todos.id, id));

        return;
    },
    deleteTodo: async (id) => {
        await db.delete(todos).where(eq(todos.id, id));
    },


}

const safePercentageChange = (current: number, previous: number) => {
    if (previous === 0) {
        return current > 0 ? 100 : 0; // if previous 0 and current > 0 => 100%, else 0%
    }
    return ((current - previous) / previous) * 100;
};
