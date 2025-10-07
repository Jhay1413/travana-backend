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
import { clientStatsQuerySchema, todoQuerySchema } from '../types/modules/dashboard/query';
import { agentStatsQuerySchema } from '../types/modules/dashboard/query';
import { z } from 'zod';

export type DashboardRepo = {
    fetchClientStats: (clientId: string) => Promise<z.infer<typeof clientStatsQuerySchema> | null>,
    fetchAgentStats: (agentId: string) => Promise<z.infer<typeof agentStatsQuerySchema> | null>
    insertTodo: (agentId: string, note: string) => Promise<void>
    fetchTodos: (agentId: string) => Promise<z.infer<typeof todoQuerySchema>[]>
    updateTodo: (id: string, note: string) => Promise<void>
    deleteTodo: (id: string) => Promise<void>

}

export const dashboardRepo: DashboardRepo = {
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
                    date_booked:booking.date_booked!,

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
