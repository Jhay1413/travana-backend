import { db } from '../db/db';
import { preProcessUpdate } from '../helpers/pre_process';
import { AppError } from '../middleware/errorHandler';
import { user } from '../schema/auth-schema';
import { clientTable } from '../schema/client-schema';
import {
  passengers,
  quote,
  quote_accomodation,
  quote_airport_parking,
  quote_attraction_ticket,
  quote_car_hire,
  quote_cruise,
  quote_cruise_item_extra,
  quote_cruise_itinerary,
  quote_flights,
  quote_lounge_pass,
  quote_transfers,
  travelDeal,
} from '../schema/quote-schema';
import { referral } from '../schema/referral-schema';
import {
  destination,
  cottages,
  lodges,
  package_type,
  park,
  transaction,
  country,
  resorts,
  accomodation_list,
  deletion_codes,
  board_basis,
  cruise_extra_item,
  tour_operator,
  deal_images,
} from '../schema/transactions-schema';
import { format, parse, sub } from 'date-fns';
import {
  freeQuoteListQuerySchema,
  quoteBasedSchema,
  quoteCruiseQuerySchema,
  quoteHotTubQuerySchema,
  quoteListQuerySchema,
  quotePackageHolidayQuerySchema,
  quoteQuerySummarySchema,
  todaySocialDealQuerySchema,
  unionAllType,
} from '../types/modules/quote/query';
import { GeneratedPostResponse, quoteChild, quoteTitleSchema, travelDealResponseSchema } from '../types/modules/transaction';
import { quote_mutate_schema, travelDealType } from '../types/modules/transaction/mutation';
import { eq, sql, desc, or, and, asc, ilike, gte, lte, gt, lt, inArray, aliasedTable, ne, like, isNotNull } from 'drizzle-orm';
import z from 'zod';
import { dataValidator } from '../helpers/data-validator';
import { airport } from '../schema/flights-schema';
import { de } from 'zod/v4/locales';
import { schedule } from 'node-cron';
import { oneTap } from 'better-auth/plugins';

export type QuoteRepo = {
  fetchHolidayTypeById: (quote_id: string) => Promise<string>;
  convertQuoteCruise: (transaction_id: string, data: z.infer<typeof quote_mutate_schema>) => Promise<{ id: string }>;
  convertQuote: (transactionId: string, data: z.infer<typeof quote_mutate_schema>) => Promise<{ id: string }>;
  insertQuote: (data: z.infer<typeof quote_mutate_schema>) => Promise<{
    transaction_id: string;
    quote_id: string;
    quote_status: string;
    holiday_type: string;
  }>;
  duplicateQuote: (data: z.infer<typeof quote_mutate_schema>) => Promise<{
    transaction_id: string;
    quote_id: string;
    quote_status:
    | 'ARCHIVED'
    | 'LOST'
    | 'INACTIVE'
    | 'EXPIRED'
    | 'NEW_LEAD'
    | 'QUOTE_IN_PROGRESS'
    | 'QUOTE_CALL'
    | 'QUOTE_READY'
    | 'AWAITING_DECISION'
    | 'REQUOTE'
    | 'WON';
    holiday_type: string;
  }>;
  insertCruise: (data: z.infer<typeof quote_mutate_schema>) => Promise<{
    transaction_id: string;
    quote_id: string;
    quote_status: string;
    holiday_type: string;
  }>;
  duplicateCruise: (data: z.infer<typeof quote_mutate_schema>) => Promise<{
    transaction_id: string;
    quote_id: string;
    quote_status:
    | 'ARCHIVED'
    | 'LOST'
    | 'INACTIVE'
    | 'EXPIRED'
    | 'NEW_LEAD'
    | 'QUOTE_IN_PROGRESS'
    | 'QUOTE_CALL'
    | 'QUOTE_READY'
    | 'AWAITING_DECISION'
    | 'REQUOTE'
    | 'WON';
    holiday_type: string;
  }>;
  fetchQuoteSummaryByClient: (clientId: string) => Promise<z.infer<typeof quoteQuerySummarySchema>[]>;
  fetchQuoteSummaryByAgent: (
    agent_id: string,
    agentIdToFetch?: string,
    isFetchAll?: boolean | null
  ) => Promise<z.infer<typeof quoteQuerySummarySchema>[]>;
  fetchQuoteById: (quote_id: string) => Promise<z.infer<typeof unionAllType>>;
  fetchPackageToUpdate: (quote_id: string) => Promise<z.infer<typeof quote_mutate_schema>>;
  fetchCruiseToUpdate: (quote_id: string) => Promise<z.infer<typeof quote_mutate_schema>>;
  updateCruise: (data: z.infer<typeof quote_mutate_schema>, quote_id: string) => Promise<void>;
  updateQuote: (data: z.infer<typeof quote_mutate_schema>, quote_id: string) => Promise<void>;
  convertQuoteStatus: (id: string, status: string) => Promise<void>;
  fetchQuotes: (
    agentId?: string,
    clientId?: string,
    filters?: {
      search?: string;
      status?: string;
      quote_status?: string;
      holiday_type?: string;
      travel_date_from?: string;
      travel_date_to?: string;
      sales_price_min?: number;
      sales_price_max?: number;
      destination?: string;
      is_future_deal?: boolean;
      is_active?: boolean;
      client_name?: string;
      agent_name?: string;
    },
    page?: number,
    limit?: number
  ) => Promise<{
    data: z.infer<typeof quoteListQuerySchema>[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
  setPrimary: (primary_id: string, secondary_id: string, quote_status: string) => Promise<void>;
  fetchQuoteTitle: (client_id: string) => Promise<z.infer<typeof quoteTitleSchema>[]>;
  deleteQuote: (quote_id: string, deletionCode: string, deletedBy: string) => Promise<void>;
  getLastId: () => Promise<string | null>;

  fetchFreeQuotesInfinite: (
    search?: string,
    country_id?: string,
    package_type_id?: string,
    min_price?: string,
    scheduleFilter?: string,
    max_price?: string,
    start_date?: string,
    end_date?: string,
    cursor?: string,
    limit?: number
  ) => Promise<{
    data: z.infer<typeof freeQuoteListQuerySchema>[];
    nextCursor: string | null;
    hasMore: boolean;
  }>;
  updateQuoteExpiry: (id: string, date_expiry: string) => Promise<any>;
  getDeletedQuotes: (
    page: number,
    limit: number
  ) => Promise<{
    data: z.infer<typeof quoteListQuerySchema>[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
  deleteTravelDeal: (travel_deal_id: string) => Promise<void>;
  setFutureDealDate: (id: string, future_deal_date: string) => Promise<void>;
  unsetFutureDealDate: (id: string, status?: string) => Promise<void>;
  fetchHolidayTypeByQuoteId: (quote_id: string) => Promise<string | undefined>;
  insertTravelDeal: (data: GeneratedPostResponse, quote_id: string) => Promise<string>;
  fetchTravelDealByQuoteId: (quote_id: string) => Promise<z.infer<typeof travelDealResponseSchema> | null>;
  fetchTravelDeals: (
    search?: string,
    country_id?: string,
    package_type_id?: string,
    min_price?: string,
    max_price?: string,
    start_date?: string,
    end_date?: string,
    cursor?: string,
    limit?: number
  ) => Promise<GeneratedPostResponse[]>;
  scheduleTravelDeal: (travel_deal_id: string, postSchedule: Date | null, onlySocialsId: string, post?: string) => Promise<void>;
  fetchTravelDealById: (travel_deal_id: string) => Promise<z.infer<typeof travelDealResponseSchema> | null>;
  fetchTodaySocialDeals: () => Promise<z.infer<typeof todaySocialDealQuerySchema[]>>;
  updateFreeQuoteStatus: (quote_id: string) => Promise<void>;
  checkIfQuoteHasClient: (quote_id: string) => Promise<boolean>;
  deleteFreeQuote: (quote_id: string) => Promise<void>;
};

export const quoteRepo: QuoteRepo = {
  deleteFreeQuote: async (quote_id) => {

    await db.delete(quote).where(eq(quote.id, quote_id));
  },
  checkIfQuoteHasClient: async (quote_id) => {

    const response = await db.select({
      client_id: transaction.client_id,
    }).from(quote).leftJoin(transaction, eq(quote.transaction_id, transaction.id)).where(eq(quote.id, quote_id)).limit(1);
    return response.length > 0 && response[0].client_id ? true : false;
  },
  updateFreeQuoteStatus: async (quote_id) => {
    await db.update(quote).set({ isFreeQuote: false }).where(eq(quote.id, quote_id));
  },
  fetchTodaySocialDeals: async () => {
    const now = new Date();

    // Get start and end of today
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const response = await db.select({
      scheduledPostDate: travelDeal.postSchedule,
      title: travelDeal.title,
      holiday_type: package_type.name,
      lodge_destination: lodges.lodge_name,
      park_location: park.location,
      lodge_name: lodges.lodge_name,
      country: country.country_name,
      destination: destination.name,
      cottage_destination: cottages.location,
      cruise_destination: quote_cruise.cruise_name,
      holiday_destination: accomodation_list.name,
      price_per_person: quote.price_per_person,
      hotel: sql<string[]>`array_agg(DISTINCT ${accomodation_list.name})`.as('hotel'),
    })
      .from(quote)
      .innerJoin(travelDeal, eq(quote.id, travelDeal.quote_id))
      .leftJoin(package_type, eq(quote.holiday_type_id, package_type.id))
      .leftJoin(lodges, eq(quote.lodge_id, lodges.id))
      .leftJoin(park, eq(lodges.park_id, park.id))
      .leftJoin(cottages, eq(quote.cottage_id, cottages.id))
      .leftJoin(quote_cruise, eq(quote_cruise.quote_id, quote.id))
      .leftJoin(
        quote_accomodation,
        and(
          eq(quote_accomodation.quote_id, quote.id),
          eq(quote_accomodation.is_primary, true)
        )
      )
      .leftJoin(accomodation_list, eq(quote_accomodation.accomodation_id, accomodation_list.id))
      .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
      .leftJoin(destination, eq(resorts.destination_id, destination.id))
      .leftJoin(country, eq(destination.country_id, country.id))
      .where(
        and(
          isNotNull(travelDeal.postSchedule),
          gte(travelDeal.postSchedule, startOfDay),
          lte(travelDeal.postSchedule, endOfDay)
        )
      )
      .groupBy(
        travelDeal.id,
        travelDeal.postSchedule,
        travelDeal.title,
        park.city,
        lodges.lodge_name,
        country.country_name,
        destination.name,
        cottages.location,
        quote_cruise.cruise_name,
        accomodation_list.name,
        quote.price_per_person,
        package_type.name,
        park.location
      ).orderBy(asc(travelDeal.postSchedule));

    return response.map((item) => {
      const destination = item.holiday_type === "Hot Tub Break" ? item.park_location : item.holiday_type == "Cruise Package" ? item.cruise_destination : `${item.country} ${item.destination}`;

      return {
        title: item.title,
        destination: destination,
        scheduledPostDate: item.scheduledPostDate,
        scheduledPostTime: item.scheduledPostDate ? format(new Date(item.scheduledPostDate), 'HH:mm') : null,
        price_per_person: item.price_per_person,

      }
    })
  },
  deleteTravelDeal: async (travel_deal_id) => {
    console.log("Deleting travel deal with ID:", travel_deal_id);
    await db.delete(travelDeal).where(eq(travelDeal.id, travel_deal_id));
  },
  fetchTravelDealById: async (travel_deal_id) => {
    const response = await db.query.travelDeal.findFirst({
      where: eq(travelDeal.id, travel_deal_id),
    })
    return response ? {
      id: response.id,
      post: response.post || '',
      subtitle: response.subtitle || '',
      resortSummary: response.resortSummary || '',
      hashtags: response.hashtags || '',
      title: response.title || '',
      travelDate: response.travelDate || '',
      nights: response.nights || 0,
      boardBasis: response.boardBasis || '',
      departureAirport: response.departureAirport || '',
      luggageTransfers: response.luggageTransfers || '',
      price: response.price || '',
      quote_id: response.quote_id || '',
    } : null;
  },
  scheduleTravelDeal: async (travel_deal_id, postSchedule, onlySocialsId, post) => {
    await db.update(travelDeal).set({ postSchedule: postSchedule, onlySocialsId: onlySocialsId, post: post }).where(eq(travelDeal.id, travel_deal_id));
  },
  fetchTravelDealByQuoteId: async (quote_id) => {
    console.log("Fetching travel deal for quote ID:", quote_id);
    const response = await db.query.travelDeal.findFirst({
      where: eq(travelDeal.quote_id, quote_id),
    })
    return response ? {
      id: response.id,
      onlySocialId: response.onlySocialsId,
      scheduledPostDate: response.postSchedule ? new Date(response.postSchedule).toISOString() : null,
      scheduledPostTime: response.postSchedule ? format(new Date(response.postSchedule), 'HH:mm') : null,

      post: response.post || '',
      subtitle: response.subtitle || '',
      resortSummary: response.resortSummary || '',
      hashtags: response.hashtags || '',
      title: response.title || '',
      travelDate: response.travelDate || '',
      nights: response.nights || 0,
      boardBasis: response.boardBasis || '',
      departureAirport: response.departureAirport || '',
      luggageTransfers: response.luggageTransfers || '',
      price: response.price || '',
      quote_id: response.quote_id || '',
    } : null;
  },
  fetchHolidayTypeByQuoteId: async (quote_id) => {
    const response = await db.query.quote.findFirst({
      where: eq(quote.id, quote_id),
      with: {
        holiday_type: true,
      },
    });
    return response?.holiday_type?.name;
  },

  fetchHolidayTypeById: async (quote_id) => {
    try {
      const response = await db.query.quote.findFirst({
        where: eq(quote.id, quote_id),
        with: {
          holiday_type: true,
        },
      });
      if (!response) throw new AppError('Quote not found', true, 404);
      return response.holiday_type?.name;
    } catch (error) {
      console.error(error);
      throw new AppError('Something went wrong fetching holiday type ', true, 500);
    }
  },
  convertQuoteCruise: async (transaction_id, data) => {
    try {
      const now = new Date();
      const plus2 = new Date(now);
      plus2.setDate(now.getDate() + 2);

      const date_expiry = data.is_future_deal ? null : data.date_expiry ? new Date(data.date_expiry) : plus2;

      return await db.transaction(async (tx) => {
        await tx
          .update(transaction)
          .set({
            status: 'on_quote',
            user_id: data.agent_id,
            client_id: data.client_id,
          })
          .where(eq(transaction.id, transaction_id));

        // Calculate price_per_person based on sales_price and total travelers
        const adults = data.adults ?? 0;
        const children = data.children ?? 0;
        const totalTravelers = adults + children;
        const salesPrice = parseFloat(data.sales_price?.toString() ?? '0');
        const calculatedPricePerPerson = totalTravelers > 0
          ? (salesPrice / totalTravelers).toFixed(2)
          : "0.00";

        const [quote_id] = await tx
          .insert(quote)
          .values({
            holiday_type_id: data.holiday_type,
            pets: data.pets ?? 0,
            lodge_id: data.lodge_id,
            cottage_id: data.cottage_id,
            quote_type: 'primary',
            travel_date: data.travel_date,
            discounts: data.discount?.toString() ?? '0',
            title: data.title,
            quote_ref: data.quote_ref,
            service_charge: data.service_charge?.toString() ?? '0',
            sales_price: data.sales_price?.toString() ?? '0',
            package_commission: data.commission?.toString() ?? '0',
            num_of_nights: parseInt(data.no_of_nights ?? '0'),
            transfer_type: data.transfer_type ?? "N/A",
            quote_status: 'QUOTE_IN_PROGRESS',
            main_tour_operator_id: data.main_tour_operator_id,
            transaction_id: transaction_id,
            infant: data.infants ? data.infants : 0,
            child: data.children ? data.children : 0,
            adult: data.adults ? data.adults : 0,
            price_per_person: calculatedPricePerPerson,
            is_future_deal: data.is_future_deal,
            future_deal_date: data.future_deal_date,
            date_expiry: date_expiry,
            isFreeQuote: data.isFreeQuote ?? false,
            deal_id: data.deal_id,
          })
          .returning({ id: quote.id });

        const [quote_cruise_id] = await tx
          .insert(quote_cruise)
          .values({
            cruise_line: data.cruise_line,
            cruise_date: data.cruise_date ? new Date(data.cruise_date).toISOString() : null,
            cabin_type: data.cabin_type,
            cruise_name: data.cruise_name,
            tour_operator_id: data.main_tour_operator_id,
            pre_cruise_stay: data.pre_cruise_stay ? parseInt(data.pre_cruise_stay) : 0,
            post_cruise_stay: data.post_cruise_stay ? parseInt(data.post_cruise_stay) : 0,
            quote_id: quote_id.id,
          })
          .returning({ id: quote_cruise.id });

        const cruise_data = [
          { table: quote_cruise_itinerary, data: data.voyages?.map((data) => ({ ...data, quote_cruise_id: quote_cruise_id.id })) ?? [] },
          {
            table: quote_cruise_item_extra,
            data: data.quote_cruise_extra?.map((data) => ({ cruise_extra_id: data, quote_cruise_id: quote_cruise_id.id })) ?? [],
          },
        ].filter(Boolean);

        await Promise.all(
          cruise_data.filter(({ data }) => data.length > 0).map(({ table, data }) => tx.insert(table).values(data.map((item) => item)))
        );

        if (data.passengers && data.passengers.length > 0) {
          await tx.insert(passengers).values(
            data.passengers.map((data) => ({
              type: data.type,
              age: data.age ? data.age : 0,
              quote_id: quote_id.id,
            }))
          );
        }
        const sectorToAdd = [
          {
            table: quote_accomodation,
            data:
              data.hotels?.map((hotel) => ({
                ...hotel,
                tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
                cost: hotel.cost ?? 0,
                commission: hotel.commission ?? 0,
                check_in_date_time: new Date(hotel.check_in_date_time),
              })) ?? [],
          },
          {
            table: quote_flights,
            data:
              data.flights?.map((flight) => ({
                ...flight,
                cost: flight.cost ?? 0,
                commission: flight.commission ?? 0,
                tour_operator_id: data.main_tour_operator_id,
                departure_date_time: new Date(flight.departure_date_time),
                arrival_date_time: new Date(flight.arrival_date_time),
              })) ?? [],
          },
          {
            table: quote_airport_parking,
            data:
              data.airport_parking?.map((parking) => ({
                ...parking,
                parking_date: new Date(parking.parking_date),
                car_make: parking.make,
                car_model: parking.model,
                tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
                cost: parking.cost ?? 0,
                commission: parking.commission ?? 0,
              })) ?? [],
          },
          {
            table: quote_lounge_pass,
            data:
              data.lounge_pass?.map((lounge) => ({
                ...lounge,
                tour_operator_id: lounge.is_included_in_package ? data.main_tour_operator_id : lounge.tour_operator_id,
                cost: lounge.cost ?? 0,
                commission: lounge.commission ?? 0,
                date_of_usage: new Date(lounge.date_of_usage),
              })) ?? [],
          },
          {
            table: quote_attraction_ticket,
            data:
              data.attraction_tickets?.map((ticket) => ({
                ...ticket,
                tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
                cost: ticket.cost ?? 0,
                commission: ticket.commission ?? 0,
                date_of_visit: new Date(ticket.date_of_visit),
              })) ?? [],
          },
          {
            table: quote_car_hire,
            data:
              data.car_hire?.map((hire) => ({
                ...hire,
                tour_operator_id: hire.is_included_in_package ? data.main_tour_operator_id : hire.tour_operator_id,
                cost: hire.cost ?? 0,
                commission: hire.commission ?? 0,
                pick_up_time: new Date(hire.pick_up_time),
                drop_off_time: new Date(hire.drop_off_time),
              })) ?? [],
          },
          {
            table: quote_transfers,
            data:
              data.transfers?.map((transfer) => ({
                ...transfer,
                tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
                cost: transfer.cost ?? 0,
                commission: transfer.commission ?? 0,
                pick_up_time: new Date(transfer.pick_up_time),
                drop_off_time: new Date(transfer.drop_off_time),
              })) ?? [],
          },
        ].filter(Boolean);

        await Promise.all(
          sectorToAdd
            .filter(({ data }) => data.length > 0)
            .map(({ table, data }) =>
              tx.insert(table).values(
                data.map((item) => ({
                  ...item,
                  quote_id: quote_id.id,
                  cost: item.cost?.toString() ?? '0',
                  commission: item.commission?.toString() ?? '0',
                }))
              )
            )
        );
        return { id: quote_id.id };
      });
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong inserting quote ', true, 500);
    }
  },
  convertQuote: async (transaction_id, data) => {
    try {
      const holiday_type = await db.query.package_type.findFirst({
        where: eq(package_type.id, data.holiday_type),
      });
      const now = new Date();
      const plus2 = new Date(now);
      plus2.setDate(now.getDate() + 2);

      const date_expiry = data.is_future_deal ? null : data.date_expiry ? new Date(data.date_expiry) : plus2;
      return await db.transaction(async (tx) => {
        await tx
          .update(transaction)
          .set({ status: 'on_quote', user_id: data.agent_id, client_id: data.client_id })
          .where(eq(transaction.id, transaction_id));

        // Calculate price_per_person based on sales_price and total travelers
        const adults = data.adults ?? 0;
        const children = data.children ?? 0;
        const totalTravelers = adults + children;
        const salesPrice = parseFloat(data.sales_price?.toString() ?? '0');
        const calculatedPricePerPerson = totalTravelers > 0
          ? (salesPrice / totalTravelers).toFixed(2)
          : "0.00";

        const [quote_id] = await tx
          .insert(quote)
          .values({
            holiday_type_id: data.holiday_type,
            pets: data.pets ?? 0,
            lodge_id: data.lodge_id,
            cottage_id: data.cottage_id,
            quote_type: 'primary',
            quote_status: 'QUOTE_IN_PROGRESS',
            travel_date: data.travel_date,
            title: data.title,
            quote_ref: data.quote_ref,
            discounts: data.discount?.toString() ?? '0',
            service_charge: data.service_charge?.toString() ?? '0',
            sales_price: data.sales_price?.toString() ?? '0',
            package_commission: data.commission?.toString() ?? '0',
            num_of_nights: data.no_of_nights ? parseInt(data.no_of_nights) : 0,
            transfer_type: data.transfer_type ?? "N/A",
            main_tour_operator_id: data.main_tour_operator_id,
            transaction_id: transaction_id,
            infant: data.infants ? data.infants : 0,
            child: data.children ? data.children : 0,
            adult: data.adults ? data.adults : 0,
            price_per_person: calculatedPricePerPerson,
            is_future_deal: data.is_future_deal,
            future_deal_date: data.future_deal_date,
            date_expiry: date_expiry,
            deal_id: data.deal_id,
          })
          .returning({ id: quote.id });

        if (holiday_type?.name === 'Package Holiday') {
          await tx.insert(quote_accomodation).values({
            quote_id: quote_id.id,
            tour_operator_id: data.main_tour_operator_id,
            no_of_nights: data.no_of_nights ? parseInt(data.no_of_nights) : 0,
            room_type: data.room_type,
            check_in_date_time: data.check_in_date_time ? new Date(data.check_in_date_time) : null,
            board_basis_id: data.main_board_basis_id,
            is_primary: true,
            is_included_in_package: true,
            cost: '0',
            commission: '0',
            accomodation_id: data.accomodation_id,
          });
        }
        if (data.passengers && data.passengers.length > 0) {
          await tx.insert(passengers).values(
            data.passengers.map((data) => ({
              type: data.type,
              age: data.age ? data.age : 0,
              quote_id: quote_id.id,
            }))
          );
        }
        const sectorToAdd = [
          {
            table: quote_accomodation,
            data:
              data.hotels?.map((hotel) => ({
                ...hotel,
                tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
                cost: hotel.cost ?? 0,
                commission: hotel.commission ?? 0,
                check_in_date_time: new Date(hotel.check_in_date_time),
              })) ?? [],
          },
          {
            table: quote_flights,
            data:
              data.flights?.map((flight) => ({
                ...flight,
                cost: flight.cost ?? 0,
                commission: flight.commission ?? 0,
                tour_operator_id: data.main_tour_operator_id,
                departure_date_time: new Date(flight.departure_date_time),
                arrival_date_time: new Date(flight.arrival_date_time),
              })) ?? [],
          },
          {
            table: quote_airport_parking,
            data:
              data.airport_parking?.map((parking) => ({
                ...parking,
                parking_date: new Date(parking.parking_date),
                car_make: parking.make,
                car_model: parking.model,
                tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
                cost: parking.cost ?? 0,
                commission: parking.commission ?? 0,
              })) ?? [],
          },
          {
            table: quote_lounge_pass,
            data:
              data.lounge_pass?.map((lounge) => ({
                ...lounge,
                tour_operator_id: lounge.is_included_in_package ? data.main_tour_operator_id : lounge.tour_operator_id,
                cost: lounge.cost ?? 0,
                commission: lounge.commission ?? 0,
                date_of_usage: new Date(lounge.date_of_usage),
              })) ?? [],
          },
          {
            table: quote_attraction_ticket,
            data:
              data.attraction_tickets?.map((ticket) => ({
                ...ticket,
                tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
                cost: ticket.cost ?? 0,
                commission: ticket.commission ?? 0,
                date_of_visit: new Date(ticket.date_of_visit),
              })) ?? [],
          },
          {
            table: quote_car_hire,
            data:
              data.car_hire?.map((hire) => ({
                ...hire,
                pick_up_time: new Date(hire.pick_up_time),
                drop_off_time: new Date(hire.drop_off_time),
                tour_operator_id: hire.is_included_in_package ? data.main_tour_operator_id : hire.tour_operator_id,
                cost: hire.cost ?? 0,
                commission: hire.commission ?? 0,
              })) ?? [],
          },
          {
            table: quote_transfers,
            data:
              data.transfers?.map((transfer) => ({
                ...transfer,
                pick_up_time: new Date(transfer.pick_up_time),
                drop_off_time: new Date(transfer.drop_off_time),
                tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
                cost: transfer.cost ?? 0,
                commission: transfer.commission ?? 0,
              })) ?? [],
          },
        ].filter(Boolean);
        await Promise.all(
          sectorToAdd
            .filter(({ data }) => data.length > 0)
            .map(({ table, data }) =>
              tx.insert(table).values(
                data.map((item) => ({
                  ...item,
                  quote_id: quote_id.id,
                  cost: item.cost?.toString() ?? '0',
                  commission: item.commission?.toString() ?? '0',
                }))
              )
            )
        );
        return { id: quote_id.id };
      });
    } catch (error) {
      console.error(error);
      throw new AppError('Something went wrong inserting quote ', true, 500);
    }
  },
  insertQuote: async (data) => {
    try {
      const now = new Date();
      const plus2 = new Date(now);
      plus2.setDate(now.getDate() + 2);
      const date_expiry = data.is_future_deal ? null : data.date_expiry ? new Date(data.date_expiry) : plus2;
      const holiday_type = await db.query.package_type.findFirst({
        where: eq(package_type.id, data.holiday_type),
      });
      return await db.transaction(async (tx) => {
        const [transaction_id] = await tx
          .insert(transaction)
          .values({
            status: 'on_quote',
            user_id: data.agent_id,
            client_id: data.client_id,
            lead_source: data.lead_source,
          })
          .returning({ id: transaction.id });

        // Calculate price_per_person based on sales_price and total travelers
        const adults = data.adults ?? 0;
        const children = data.children ?? 0;
        const totalTravelers = adults + children;
        const salesPrice = parseFloat(data.sales_price?.toString() ?? '0');
        const calculatedPricePerPerson = totalTravelers > 0
          ? (salesPrice / totalTravelers).toFixed(2)
          : "0.00";

        const [quote_id] = await tx
          .insert(quote)
          .values({
            deal_type: data.deal_type,
            pre_booked_seats: data.pre_booked_seats,
            flight_meals: data.flight_meals,
            holiday_type_id: data.holiday_type,
            pets: data.pets,
            lodge_id: data.lodge_id,
            cottage_id: data.cottage_id,
            title: data.title,
            quote_ref: data.quote_ref,
            isQuoteCopy: data.isQuoteCopy ?? false,
            isFreeQuote: data.isFreeQuote ?? false,
            transaction_id: transaction_id.id,
            travel_date: data.travel_date,
            discounts: data.discount?.toString() ?? '0',
            service_charge: data.service_charge?.toString() ?? '0',
            quote_type: 'primary',
            sales_price: data.sales_price?.toString() ?? '0',
            deal_id: data.deal_id ?? null,
            package_commission: data.commission?.toString() ?? '0',
            num_of_nights: Number.isFinite(parseInt(data.no_of_nights ?? '0')) ? parseInt(data.no_of_nights ?? '0') : 0,
            transfer_type: data.transfer_type ?? "N/A",
            quote_status: 'QUOTE_IN_PROGRESS',
            main_tour_operator_id: data.main_tour_operator_id,
            infant: data.infants ? data.infants : 0,
            child: data.children ? data.children : 0,
            adult: data.adults ? data.adults : 0,
            price_per_person: calculatedPricePerPerson,
            lodge_type: data.lodge_type ? data.lodge_type : "N/A",
            date_expiry: date_expiry,
            is_future_deal: data.is_future_deal,
            future_deal_date: data.is_future_deal ? data.future_deal_date : null,
          })
          .returning({ id: quote.id, quote_status: quote.quote_status });

        if (holiday_type?.name === 'Package Holiday') {
          await tx.insert(quote_accomodation).values({
            quote_id: quote_id.id,
            tour_operator_id: data.main_tour_operator_id,
            no_of_nights: data.no_of_nights ? parseInt(data.no_of_nights) : 0,
            room_type: data.room_type,
            check_in_date_time: data.check_in_date_time ? new Date(data.check_in_date_time) : null,
            board_basis_id: data.main_board_basis_id,
            is_primary: true,
            is_included_in_package: true,
            cost: '0',
            commission: '0',
            accomodation_id: data.accomodation_id,
          });
        }

        if (data.passengers && data.passengers.length > 0) {
          await tx.insert(passengers).values(
            data.passengers.map((data) => ({
              type: data.type ?? "adult",
              age: data.age,
              quote_id: quote_id.id,
            }))
          );
        }
        if (data.hotels && data.hotels.length > 0) {
          await tx.insert(quote_accomodation).values(
            data.hotels.map((hotel) => ({
              quote_id: quote_id.id,
              booking_ref: hotel.booking_ref,
              tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
              no_of_nights: hotel.no_of_nights ? parseInt(hotel.no_of_nights) : 0,
              room_type: hotel.room_type,
              check_in_date_time: hotel.check_in_date_time ? new Date(hotel.check_in_date_time) : null,
              board_basis_id: hotel.board_basis_id,
              is_primary: false,
              is_included_in_package: hotel.is_included_in_package,
              cost: hotel.cost?.toString() ?? '0',
              commission: hotel.commission?.toString() ?? '0',
              accomodation_id: hotel.accomodation_id,
              stay_type: hotel.stay_type,
            }))
          );
        }

        if (data.flights && data.flights.length > 0) {
          await tx.insert(quote_flights).values(
            data.flights.map((flight) => ({
              quote_id: quote_id.id,
              flight_number: flight.flight_number,
              flight_ref: flight.flight_ref,
              departing_airport_id: flight.departing_airport_id,
              arrival_airport_id: flight.arrival_airport_id,
              tour_operator_id: data.main_tour_operator_id,
              flight_type: flight.flight_type,
              departure_date_time: flight.departure_date_time ? new Date(flight.departure_date_time) : null,
              arrival_date_time: flight.arrival_date_time ? new Date(flight.arrival_date_time) : null,
              is_included_in_package: flight.is_included_in_package,
              cost: flight.cost?.toString() ?? '0',
              commission: flight.commission?.toString() ?? '0',
            }))
          );
        }
        if (data.airport_parking && data.airport_parking.length > 0) {
          await tx.insert(quote_airport_parking).values(
            data.airport_parking.map((parking) => ({
              quote_id: quote_id.id,
              parking_date: parking.parking_date ? new Date(parking.parking_date) : null,
              booking_ref: parking.booking_ref,
              airport_id: parking.airport_id,
              parking_type: parking.parking_type,
              car_make: parking.make,
              car_model: parking.model,
              colour: parking.colour,
              car_reg_number: parking.car_reg_number,
              duration: parking.duration,
              tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
              is_included_in_package: parking.is_included_in_package,
              cost: parking.cost?.toString() ?? '0',
              commission: parking.commission?.toString() ?? '0',
            }))
          );
        }
        if (data.lounge_pass && data.lounge_pass.length > 0) {
          await tx.insert(quote_lounge_pass).values(
            data.lounge_pass.map((lounge) => ({
              airport_id: lounge.airport_id,
              booking_ref: lounge.booking_ref,
              quote_id: quote_id.id,
              terminal: lounge.terminal,
              tour_operator_id: lounge.is_included_in_package ? data.main_tour_operator_id : lounge.tour_operator_id,
              date_of_usage: lounge.date_of_usage ? new Date(lounge.date_of_usage) : null,
              cost: lounge.cost?.toString() ?? '0',
              commission: lounge.commission?.toString() ?? '0',
              is_included_in_package: lounge.is_included_in_package,
              note: lounge.note,
            }))
          );
        }
        if (data.attraction_tickets && data.attraction_tickets.length > 0) {
          await tx.insert(quote_attraction_ticket).values(
            data.attraction_tickets.map((ticket) => ({
              quote_id: quote_id.id,
              booking_ref: ticket.booking_ref,
              tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
              ticket_type: ticket.ticket_type,
              cost: ticket.cost?.toString() ?? '0',
              commission: ticket.commission?.toString() ?? '0',
              number_of_tickets: ticket.number_of_tickets,
              is_included_in_package: ticket.is_included_in_package,
              date_of_visit: ticket.date_of_visit ? new Date(ticket.date_of_visit) : null,
            }))
          );
        }
        if (data.car_hire && data.car_hire.length > 0) {
          await tx.insert(quote_car_hire).values(
            data.car_hire.map((car) => ({
              quote_id: quote_id.id,
              booking_ref: car.booking_ref,
              tour_operator_id: car.is_included_in_package ? data.main_tour_operator_id : car.tour_operator_id,
              pick_up_location: car.pick_up_location,
              drop_off_location: car.drop_off_location,
              pick_up_time: car.pick_up_time ? new Date(car.pick_up_time) : null,
              drop_off_time: car.drop_off_time ? new Date(car.drop_off_time) : null,

              no_of_days: car.no_of_days,
              driver_age: car.driver_age,
              is_included_in_package: car.is_included_in_package,
              cost: car.cost?.toString() ?? '0',
              commission: car.commission?.toString() ?? '0',
            }))
          );
        }
        if (data.transfers && data.transfers.length > 0) {
          await tx.insert(quote_transfers).values(
            data.transfers.map((transfer) => ({
              quote_id: quote_id.id,
              booking_ref: transfer.booking_ref,
              tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
              pick_up_location: transfer.pick_up_location,
              drop_off_location: transfer.drop_off_location,
              pick_up_time: transfer.pick_up_time ? new Date(transfer.pick_up_time) : null,
              drop_off_time: transfer.drop_off_time ? new Date(transfer.drop_off_time) : null,
              is_included_in_package: transfer.is_included_in_package,
              cost: transfer.cost?.toString() ?? '0',
              commission: transfer.commission?.toString() ?? '0',
              note: transfer.note,
            }))
          );
        }

        return {
          transaction_id: transaction_id.id,
          quote_id: quote_id.id,
          quote_status: quote_id.quote_status as string,
          holiday_type: holiday_type?.name as string,
        };
      });
    } catch (error) {
      console.error(error);
      throw new AppError('Something went wrong inserting quote ', true, 500);
    }
  },
  duplicateQuote: async (data) => {
    try {
      const now = new Date();
      const plus2 = new Date(now);
      plus2.setDate(now.getDate() + 2);
      if (!data.transaction_id) {
        throw new AppError('Transaction id is required', true, 400);
      }
      const date_expiry = data.is_future_deal ? null : data.date_expiry ? new Date(data.date_expiry) : plus2;
      const holiday_type = await db.query.package_type.findFirst({
        where: eq(package_type.id, data.holiday_type),
      });
      return await db.transaction(async (tx) => {
        const [quote_id] = await tx
          .insert(quote)
          .values({
            deal_type: data.deal_type,
            pre_booked_seats: data.pre_booked_seats,
            flight_meals: data.flight_meals,
            holiday_type_id: data.holiday_type,
            pets: data.pets,
            lodge_id: data.lodge_id,
            cottage_id: data.cottage_id,
            transaction_id: data.transaction_id!,
            title: data.title,
            quote_ref: data.quote_ref,
            travel_date: data.travel_date,
            discounts: data.discount?.toString() ?? '0',
            service_charge: data.service_charge?.toString() ?? '0',
            quote_type: 'secondary',
            sales_price: data.sales_price?.toString() ?? '0',
            price_per_person: data.price_per_person ? data.price_per_person.toString() : "0.00",
            package_commission: data.commission?.toString() ?? '0',
            num_of_nights: Number.isFinite(parseInt(data.no_of_nights ?? '0')) ? parseInt(data.no_of_nights ?? '0') : 0,
            transfer_type: data.transfer_type ?? "N/A",
            quote_status: 'QUOTE_IN_PROGRESS',
            main_tour_operator_id: data.main_tour_operator_id,
            infant: data.infants ? data.infants : 0,
            child: data.children ? data.children : 0,
            adult: data.adults ? data.adults : 0,
            date_expiry: date_expiry,
            is_future_deal: data.is_future_deal,
            future_deal_date: data.is_future_deal ? data.future_deal_date : null,
          })
          .returning({ id: quote.id, quote_status: quote.quote_status });

        if (holiday_type?.name === 'Package Holiday') {
          await tx.insert(quote_accomodation).values({
            quote_id: quote_id.id,
            tour_operator_id: data.main_tour_operator_id,
            no_of_nights: data.no_of_nights ? parseInt(data.no_of_nights) : 0,
            room_type: data.room_type,
            check_in_date_time: data.check_in_date_time ? new Date(data.check_in_date_time) : null,
            board_basis_id: data.main_board_basis_id,
            is_primary: true,
            is_included_in_package: true,
            cost: '0',
            commission: '0',
            accomodation_id: data.accomodation_id,
          });
        }

        if (data.passengers && data.passengers.length > 0) {
          await tx.insert(passengers).values(
            data.passengers.map((data) => ({
              type: data.type ?? "adult",
              age: data.age,
              quote_id: quote_id.id,
            }))
          );
        }
        if (data.hotels && data.hotels.length > 0) {
          await tx.insert(quote_accomodation).values(
            data.hotels.map((hotel) => ({
              quote_id: quote_id.id,
              booking_ref: hotel.booking_ref,
              tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
              no_of_nights: hotel.no_of_nights ? parseInt(hotel.no_of_nights) : 0,
              room_type: hotel.room_type,
              check_in_date_time: hotel.check_in_date_time ? new Date(hotel.check_in_date_time) : null,
              board_basis_id: hotel.board_basis_id,
              is_primary: false,
              is_included_in_package: hotel.is_included_in_package,
              cost: hotel.cost?.toString() ?? '0',
              commission: hotel.commission?.toString() ?? '0',
              accomodation_id: hotel.accomodation_id,
              stay_type: hotel.stay_type,
            }))
          );
        }

        if (data.flights && data.flights.length > 0) {
          await tx.insert(quote_flights).values(
            data.flights.map((flight) => ({
              quote_id: quote_id.id,
              flight_number: flight.flight_number,
              flight_ref: flight.flight_ref,
              departing_airport_id: flight.departing_airport_id,
              arrival_airport_id: flight.arrival_airport_id,
              tour_operator_id: data.main_tour_operator_id,
              flight_type: flight.flight_type,
              departure_date_time: flight.departure_date_time ? new Date(flight.departure_date_time) : null,
              arrival_date_time: flight.arrival_date_time ? new Date(flight.arrival_date_time) : null,
              is_included_in_package: flight.is_included_in_package,
              cost: flight.cost?.toString() ?? '0',
              commission: flight.commission?.toString() ?? '0',
            }))
          );
        }
        if (data.airport_parking && data.airport_parking.length > 0) {
          await tx.insert(quote_airport_parking).values(
            data.airport_parking.map((parking) => ({
              quote_id: quote_id.id,
              parking_date: parking.parking_date ? new Date(parking.parking_date) : null,
              booking_ref: parking.booking_ref,
              airport_id: parking.airport_id,
              parking_type: parking.parking_type,
              car_make: parking.make,
              car_model: parking.model,
              colour: parking.colour,
              car_reg_number: parking.car_reg_number,
              duration: parking.duration,
              tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
              is_included_in_package: parking.is_included_in_package,
              cost: parking.cost?.toString() ?? '0',
              commission: parking.commission?.toString() ?? '0',
            }))
          );
        }
        if (data.lounge_pass && data.lounge_pass.length > 0) {
          await tx.insert(quote_lounge_pass).values(
            data.lounge_pass.map((lounge) => ({
              airport_id: lounge.airport_id,
              booking_ref: lounge.booking_ref,
              quote_id: quote_id.id,
              terminal: lounge.terminal,
              tour_operator_id: lounge.is_included_in_package ? data.main_tour_operator_id : lounge.tour_operator_id,
              date_of_usage: lounge.date_of_usage ? new Date(lounge.date_of_usage) : null,
              cost: lounge.cost?.toString() ?? '0',
              commission: lounge.commission?.toString() ?? '0',
              is_included_in_package: lounge.is_included_in_package,
              note: lounge.note,
            }))
          );
        }
        if (data.attraction_tickets && data.attraction_tickets.length > 0) {
          await tx.insert(quote_attraction_ticket).values(
            data.attraction_tickets.map((ticket) => ({
              quote_id: quote_id.id,
              booking_ref: ticket.booking_ref,
              tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
              ticket_type: ticket.ticket_type,
              cost: ticket.cost?.toString() ?? '0',
              commission: ticket.commission?.toString() ?? '0',
              number_of_tickets: ticket.number_of_tickets,
              is_included_in_package: ticket.is_included_in_package,
              date_of_visit: ticket.date_of_visit ? new Date(ticket.date_of_visit) : null,
            }))
          );
        }
        if (data.car_hire && data.car_hire.length > 0) {
          await tx.insert(quote_car_hire).values(
            data.car_hire.map((car) => ({
              quote_id: quote_id.id,
              booking_ref: car.booking_ref,
              tour_operator_id: car.is_included_in_package ? data.main_tour_operator_id : car.tour_operator_id,
              pick_up_location: car.pick_up_location,
              drop_off_location: car.drop_off_location,
              pick_up_time: car.pick_up_time ? new Date(car.pick_up_time) : null,
              drop_off_time: car.drop_off_time ? new Date(car.drop_off_time) : null,

              no_of_days: car.no_of_days,
              driver_age: car.driver_age,
              is_included_in_package: car.is_included_in_package,
              cost: car.cost?.toString() ?? '0',
              commission: car.commission?.toString() ?? '0',
            }))
          );
        }
        if (data.transfers && data.transfers.length > 0) {
          await tx.insert(quote_transfers).values(
            data.transfers.map((transfer) => ({
              quote_id: quote_id.id,
              booking_ref: transfer.booking_ref,
              tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
              pick_up_location: transfer.pick_up_location,
              drop_off_location: transfer.drop_off_location,
              pick_up_time: transfer.pick_up_time ? new Date(transfer.pick_up_time) : null,
              drop_off_time: transfer.drop_off_time ? new Date(transfer.drop_off_time) : null,
              is_included_in_package: transfer.is_included_in_package,
              cost: transfer.cost?.toString() ?? '0',
              commission: transfer.commission?.toString() ?? '0',
              note: transfer.note,
            }))
          );
        }
        return {
          transaction_id: data.transaction_id!,
          quote_id: quote_id.id,
          quote_status: quote_id.quote_status!,
          holiday_type: holiday_type?.name!,
        };
      });
    } catch (error) {
      console.error(error);
      throw new AppError('Something went wrong inserting quote ', true, 500);
    }
  },
  insertCruise: async (data) => {
    try {
      const now = new Date();
      const plus2 = new Date(now);
      plus2.setDate(now.getDate() + 2);
      const date_expiry = data.is_future_deal ? null : data.date_expiry ? new Date(data.date_expiry) : plus2;
      return await db.transaction(async (tx) => {
        const [transaction_id] = await tx
          .insert(transaction)
          .values({
            status: 'on_quote',
            user_id: data.agent_id,
            client_id: data.client_id,
            lead_source: data.lead_source,
          })
          .returning({ id: transaction.id });

        // Calculate price_per_person based on sales_price and total travelers
        const adults = data.adults ?? 0;
        const children = data.children ?? 0;
        const totalTravelers = adults + children;
        const salesPrice = parseFloat(data.sales_price?.toString() ?? '0');
        const calculatedPricePerPerson = totalTravelers > 0
          ? (salesPrice / totalTravelers).toFixed(2)
          : "0.00";

        const [quote_id] = await tx
          .insert(quote)
          .values({
            transaction_id: transaction_id.id,
            holiday_type_id: data.holiday_type,
            travel_date: data.travel_date,
            discounts: data.discount?.toString() ?? '0',
            service_charge: data.service_charge?.toString() ?? '0',
            quote_type: 'primary',
            title: data.title,
            quote_ref: data.quote_ref,
            sales_price: data.sales_price?.toString() ?? '0',
            price_per_person: calculatedPricePerPerson,
            package_commission: data.commission?.toString() ?? '0',
            num_of_nights: data.no_of_nights ? parseInt(data.no_of_nights) : 0,
            transfer_type: data.transfer_type ?? "N/A",
            quote_status: 'QUOTE_IN_PROGRESS',
            main_tour_operator_id: data.main_tour_operator_id,
            infant: data.infants ? data.infants : 0,
            child: data.children ? data.children : 0,
            adult: data.adults ? data.adults : 0,
            date_expiry: date_expiry,
            deal_id: data.deal_id ?? null,
            is_future_deal: data.is_future_deal,
            future_deal_date: data.is_future_deal ? data.future_deal_date : null,
          })
          .returning({ id: quote.id, quote_status: quote.quote_status });
        const [quote_cruise_id] = await tx
          .insert(quote_cruise)
          .values({
            cruise_line: data.cruise_line,
            ship: data.cruise_ship,
            cruise_date: data.cruise_date ? data.cruise_date : null,
            cabin_type: data.cabin_type,
            cruise_name: data.cruise_name,
            tour_operator_id: data.main_tour_operator_id,
            pre_cruise_stay: data.pre_cruise_stay ? parseInt(data.pre_cruise_stay) : 0,
            post_cruise_stay: data.post_cruise_stay ? parseInt(data.post_cruise_stay) : 0,
            quote_id: quote_id.id,
          })
          .returning({ id: quote_cruise.id });

        if (data.voyages && data.voyages.length > 0) {
          await tx.insert(quote_cruise_itinerary).values(
            data.voyages.map((voyage) => ({
              quote_cruise_id: quote_cruise_id.id,
              day_number: voyage.day_number,
              description: voyage.description,
            }))
          );
        }
        if (data.quote_cruise_extra && data.quote_cruise_extra.length > 0) {
          await tx.insert(quote_cruise_item_extra).values(
            data.quote_cruise_extra.map((cruise_extra) => ({
              quote_cruise_id: quote_cruise_id.id,
              cruise_extra_id: cruise_extra,
            }))
          );
        }
        if (data.passengers && data.passengers.length > 0) {
          await tx.insert(passengers).values(
            data.passengers.map((data) => ({
              type: data.type ?? "adult",
              age: data.age,
              quote_id: quote_id.id,
            }))
          );
        }
        if (data.hotels && data.hotels.length > 0) {
          await tx.insert(quote_accomodation).values(
            data.hotels.map((hotel) => ({
              quote_id: quote_id.id,
              booking_ref: hotel.booking_ref,
              tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
              no_of_nights: hotel.no_of_nights ? parseInt(hotel.no_of_nights) : 0,
              room_type: hotel.room_type,
              check_in_date_time: hotel.check_in_date_time ? new Date(hotel.check_in_date_time) : null,
              board_basis_id: hotel.board_basis_id,
              is_primary: false,
              is_included_in_package: hotel.is_included_in_package,
              cost: hotel.cost?.toString() ?? '0',
              commission: hotel.commission?.toString() ?? '0',
              accomodation_id: hotel.accomodation_id,
              stay_type: hotel.stay_type,
            }))
          );
        }
        if (data.flights && data.flights.length > 0) {
          await tx.insert(quote_flights).values(
            data.flights.map((flight) => ({
              quote_id: quote_id.id,
              flight_number: flight.flight_number,
              flight_ref: flight.flight_ref,
              departing_airport_id: flight.departing_airport_id,
              arrival_airport_id: flight.arrival_airport_id,
              tour_operator_id: data.main_tour_operator_id,
              flight_type: flight.flight_type,
              departure_date_time: flight.departure_date_time ? new Date(flight.departure_date_time) : null,
              arrival_date_time: flight.arrival_date_time ? new Date(flight.arrival_date_time) : null,
              is_included_in_package: flight.is_included_in_package,
              cost: flight.cost?.toString() ?? '0',
              commission: flight.commission?.toString() ?? '0',
            }))
          );
        }
        if (data.airport_parking && data.airport_parking.length > 0) {
          await tx.insert(quote_airport_parking).values(
            data.airport_parking.map((parking) => ({
              quote_id: quote_id.id,
              booking_ref: parking.booking_ref,
              airport_id: parking.airport_id,
              parking_type: parking.parking_type,
              car_make: parking.make,
              car_model: parking.model,
              parking_date: parking.parking_date ? new Date(parking.parking_date) : null,
              colour: parking.colour,
              car_reg_number: parking.car_reg_number,
              duration: parking.duration,
              tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
              is_included_in_package: parking.is_included_in_package,
              cost: parking.cost?.toString() ?? '0',
              commission: parking.commission?.toString() ?? '0',
            }))
          );
        }
        if (data.lounge_pass && data.lounge_pass.length > 0) {
          await tx.insert(quote_lounge_pass).values(
            data.lounge_pass.map((lounge) => ({
              airport_id: lounge.airport_id,
              booking_ref: lounge.booking_ref,
              date_of_usage: lounge.date_of_usage ? new Date(lounge.date_of_usage) : null,
              quote_id: quote_id.id,
              terminal: lounge.terminal,
              tour_operator_id: lounge.is_included_in_package ? data.main_tour_operator_id : lounge.tour_operator_id,
              cost: lounge.cost?.toString() ?? '0',
              commission: lounge.commission?.toString() ?? '0',
              is_included_in_package: lounge.is_included_in_package,
              note: lounge.note,
            }))
          );
        }
        if (data.attraction_tickets && data.attraction_tickets.length > 0) {
          await tx.insert(quote_attraction_ticket).values(
            data.attraction_tickets.map((ticket) => ({
              quote_id: quote_id.id,
              booking_ref: ticket.booking_ref,
              tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
              ticket_type: ticket.ticket_type,
              date_of_visit: ticket.date_of_visit ? new Date(ticket.date_of_visit) : null,
              cost: ticket.cost?.toString() ?? '0',
              commission: ticket.commission?.toString() ?? '0',
              number_of_tickets: ticket.number_of_tickets,
              is_included_in_package: ticket.is_included_in_package,
            }))
          );
        }
        if (data.car_hire && data.car_hire.length > 0) {
          await tx.insert(quote_car_hire).values(
            data.car_hire.map((car) => ({
              quote_id: quote_id.id,
              booking_ref: car.booking_ref,
              tour_operator_id: car.is_included_in_package ? data.main_tour_operator_id : car.tour_operator_id,
              pick_up_location: car.pick_up_location,
              drop_off_location: car.drop_off_location,
              pick_up_time: car.pick_up_time ? new Date(car.pick_up_time) : null,
              drop_off_time: car.drop_off_time ? new Date(car.drop_off_time) : null,
              no_of_days: car.no_of_days,
              driver_age: car.driver_age,
              is_included_in_package: car.is_included_in_package,
              cost: car.cost?.toString() ?? '0',
              commission: car.commission?.toString() ?? '0',
            }))
          );
        }
        if (data.transfers && data.transfers.length > 0) {
          await tx.insert(quote_transfers).values(
            data.transfers.map((transfer) => ({
              quote_id: quote_id.id,
              booking_ref: transfer.booking_ref,
              tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
              pick_up_location: transfer.pick_up_location,
              drop_off_location: transfer.drop_off_location,
              pick_up_time: transfer.pick_up_time ? new Date(transfer.pick_up_time) : null,
              drop_off_time: transfer.drop_off_time ? new Date(transfer.drop_off_time) : null,
              is_included_in_package: transfer.is_included_in_package,
              cost: transfer.cost?.toString() ?? '0',
              commission: transfer.commission?.toString() ?? '0',
              note: transfer.note,
            }))
          );
        }

        return {
          transaction_id: transaction_id.id,
          quote_id: quote_id.id,
          quote_status: quote_id.quote_status as string,
          holiday_type: 'Cruise Package',
        };
      });
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong inserting quote ', true, 500);
    }
  },
  duplicateCruise: async (data) => {
    try {
      const now = new Date();
      const plus2 = new Date(now);
      plus2.setDate(now.getDate() + 2);
      const date_expiry = data.is_future_deal ? null : data.date_expiry ? new Date(data.date_expiry) : plus2;
      return await db.transaction(async (tx) => {
        const [quote_id] = await tx
          .insert(quote)
          .values({
            transaction_id: data.transaction_id!,
            holiday_type_id: data.holiday_type,
            travel_date: data.travel_date,
            discounts: data.discount?.toString() ?? '0',
            service_charge: data.service_charge?.toString() ?? '0',
            quote_type: 'secondary',
            title: data.title,
            quote_ref: data.quote_ref,
            sales_price: data.sales_price?.toString() ?? '0',
            price_per_person: data.price_per_person ? data.price_per_person.toString() : "0.00",
            package_commission: data.commission?.toString() ?? '0',
            num_of_nights: data.no_of_nights ? parseInt(data.no_of_nights) : 0,
            transfer_type: data.transfer_type ?? "N/A",
            quote_status: 'QUOTE_IN_PROGRESS',
            main_tour_operator_id: data.main_tour_operator_id,
            infant: data.infants ? data.infants : 0,
            child: data.children ? data.children : 0,
            adult: data.adults ? data.adults : 0,
            date_expiry: date_expiry,
            is_future_deal: data.is_future_deal,
            future_deal_date: data.is_future_deal ? data.future_deal_date : null,
          })
          .returning({ id: quote.id, quote_status: quote.quote_status });
        const [quote_cruise_id] = await tx
          .insert(quote_cruise)
          .values({
            cruise_line: data.cruise_line,
            ship: data.cruise_ship,
            cruise_date: data.cruise_date ? data.cruise_date : null,
            cabin_type: data.cabin_type,
            cruise_name: data.cruise_name,
            tour_operator_id: data.main_tour_operator_id,
            pre_cruise_stay: data.pre_cruise_stay ? parseInt(data.pre_cruise_stay) : 0,
            post_cruise_stay: data.post_cruise_stay ? parseInt(data.post_cruise_stay) : 0,
            quote_id: quote_id.id,
          })
          .returning({ id: quote_cruise.id });

        if (data.voyages && data.voyages.length > 0) {
          await tx.insert(quote_cruise_itinerary).values(
            data.voyages.map((voyage) => ({
              quote_cruise_id: quote_cruise_id.id,
              day_number: voyage.day_number,
              description: voyage.description,
            }))
          );
        }
        if (data.quote_cruise_extra && data.quote_cruise_extra.length > 0) {
          await tx.insert(quote_cruise_item_extra).values(
            data.quote_cruise_extra.map((cruise_extra) => ({
              quote_cruise_id: quote_cruise_id.id,
              cruise_extra_id: cruise_extra,
            }))
          );
        }
        if (data.passengers && data.passengers.length > 0) {
          await tx.insert(passengers).values(
            data.passengers.map((data) => ({
              type: data.type,
              age: data.age,
              quote_id: quote_id.id,
            }))
          );
        }
        if (data.hotels && data.hotels.length > 0) {
          await tx.insert(quote_accomodation).values(
            data.hotels.map((hotel) => ({
              quote_id: quote_id.id,
              booking_ref: hotel.booking_ref,
              tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
              no_of_nights: hotel.no_of_nights ? parseInt(hotel.no_of_nights) : 0,
              room_type: hotel.room_type,
              check_in_date_time: hotel.check_in_date_time ? new Date(hotel.check_in_date_time) : null,
              board_basis_id: hotel.board_basis_id,
              is_primary: false,
              is_included_in_package: hotel.is_included_in_package,
              cost: hotel.cost?.toString() ?? '0',
              commission: hotel.commission?.toString() ?? '0',
              accomodation_id: hotel.accomodation_id,
              stay_type: hotel.stay_type,
            }))
          );
        }
        if (data.flights && data.flights.length > 0) {
          await tx.insert(quote_flights).values(
            data.flights.map((flight) => ({
              quote_id: quote_id.id,
              flight_number: flight.flight_number,
              flight_ref: flight.flight_ref,
              departing_airport_id: flight.departing_airport_id,
              arrival_airport_id: flight.arrival_airport_id,
              tour_operator_id: data.main_tour_operator_id,
              flight_type: flight.flight_type,
              departure_date_time: flight.departure_date_time ? new Date(flight.departure_date_time) : null,
              arrival_date_time: flight.arrival_date_time ? new Date(flight.arrival_date_time) : null,
              is_included_in_package: flight.is_included_in_package,
              cost: flight.cost?.toString() ?? '0',
              commission: flight.commission?.toString() ?? '0',
            }))
          );
        }
        if (data.airport_parking && data.airport_parking.length > 0) {
          await tx.insert(quote_airport_parking).values(
            data.airport_parking.map((parking) => ({
              quote_id: quote_id.id,
              booking_ref: parking.booking_ref,
              airport_id: parking.airport_id,
              parking_type: parking.parking_type,
              car_make: parking.make,
              car_model: parking.model,
              parking_date: parking.parking_date ? new Date(parking.parking_date) : null,
              colour: parking.colour,
              car_reg_number: parking.car_reg_number,
              duration: parking.duration,
              tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
              is_included_in_package: parking.is_included_in_package,
              cost: parking.cost?.toString() ?? '0',
              commission: parking.commission?.toString() ?? '0',
            }))
          );
        }
        if (data.lounge_pass && data.lounge_pass.length > 0) {
          await tx.insert(quote_lounge_pass).values(
            data.lounge_pass.map((lounge) => ({
              airport_id: lounge.airport_id,
              booking_ref: lounge.booking_ref,
              date_of_usage: lounge.date_of_usage ? new Date(lounge.date_of_usage) : null,
              quote_id: quote_id.id,
              terminal: lounge.terminal,
              tour_operator_id: lounge.is_included_in_package ? data.main_tour_operator_id : lounge.tour_operator_id,
              cost: lounge.cost?.toString() ?? '0',
              commission: lounge.commission?.toString() ?? '0',
              is_included_in_package: lounge.is_included_in_package,
              note: lounge.note,
            }))
          );
        }
        if (data.attraction_tickets && data.attraction_tickets.length > 0) {
          await tx.insert(quote_attraction_ticket).values(
            data.attraction_tickets.map((ticket) => ({
              quote_id: quote_id.id,
              booking_ref: ticket.booking_ref,
              tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
              ticket_type: ticket.ticket_type,
              date_of_visit: ticket.date_of_visit ? new Date(ticket.date_of_visit) : null,
              cost: ticket.cost?.toString() ?? '0',
              commission: ticket.commission?.toString() ?? '0',
              number_of_tickets: ticket.number_of_tickets,
              is_included_in_package: ticket.is_included_in_package,
            }))
          );
        }
        if (data.car_hire && data.car_hire.length > 0) {
          await tx.insert(quote_car_hire).values(
            data.car_hire.map((car) => ({
              quote_id: quote_id.id,
              booking_ref: car.booking_ref,
              tour_operator_id: car.is_included_in_package ? data.main_tour_operator_id : car.tour_operator_id,
              pick_up_location: car.pick_up_location,
              drop_off_location: car.drop_off_location,
              pick_up_time: car.pick_up_time ? new Date(car.pick_up_time) : null,
              drop_off_time: car.drop_off_time ? new Date(car.drop_off_time) : null,
              no_of_days: car.no_of_days,
              driver_age: car.driver_age,
              is_included_in_package: car.is_included_in_package,
              cost: car.cost?.toString() ?? '0',
              commission: car.commission?.toString() ?? '0',
            }))
          );
        }
        if (data.transfers && data.transfers.length > 0) {
          await tx.insert(quote_transfers).values(
            data.transfers.map((transfer) => ({
              quote_id: quote_id.id,
              booking_ref: transfer.booking_ref,
              tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
              pick_up_location: transfer.pick_up_location,
              drop_off_location: transfer.drop_off_location,
              pick_up_time: transfer.pick_up_time ? new Date(transfer.pick_up_time) : null,
              drop_off_time: transfer.drop_off_time ? new Date(transfer.drop_off_time) : null,
              is_included_in_package: transfer.is_included_in_package,
              cost: transfer.cost?.toString() ?? '0',
              commission: transfer.commission?.toString() ?? '0',
              note: transfer.note,
            }))
          );
        }
        return {
          transaction_id: data.transaction_id ?? '',
          quote_id: quote_id.id,
          quote_status: quote_id.quote_status!,
          holiday_type: 'Cruise Package',
        };
      });
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong inserting quote ', true, 500);
    }
  },
  fetchQuoteSummaryByClient: async (client_id) => {
    try {
      const response = await db
        .select({
          id: quote.id,
          transaction_id: quote.transaction_id,
          status: transaction.status,
          title: quote.title,
          quote_ref: quote.quote_ref,
          clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
          agent_id: transaction.user_id,
          agentName: sql`${user.firstName} || ' ' || ${user.lastName}`,
          clientId: transaction.client_id,
          no_of_nights: quote.num_of_nights,
          holiday_type: package_type.name,
          lodge_destination: park.city,
          cottage_destination: cottages.location,
          cruise_destination: quote_cruise.cruise_name,
          holiday_destination: destination.name,
          quote_status: quote.quote_status,
          travel_date: quote.travel_date,
          infants: quote.infant,
          children: quote.child,
          adults: quote.adult,
          date_expiry: quote.date_expiry,
          date_created: quote.date_created,
          is_future_deal: quote.is_future_deal,
          future_deal_date: quote.future_deal_date,
          overall_commission: sql`
              COALESCE((SELECT SUM(commission) FROM quote_flights WHERE quote_flights.quote_id = quote_table.id), 0)
              + COALESCE((SELECT SUM(commission) FROM quote_airport_parking WHERE quote_airport_parking.quote_id = quote_table.id), 0)
              + COALESCE((SELECT SUM(commission) FROM quote_lounge_pass WHERE quote_lounge_pass.quote_id = quote_table.id), 0)
              + COALESCE((SELECT SUM(commission) FROM quote_attraction_ticket WHERE quote_attraction_ticket.quote_id = quote_table.id), 0)
              + COALESCE((SELECT SUM(commission) FROM quote_car_hire WHERE quote_car_hire.quote_id = quote_table.id), 0)
              + COALESCE((SELECT SUM(commission) FROM quote_transfers WHERE quote_transfers.quote_id = quote_table.id), 0)
              + COALESCE((SELECT SUM(commission) FROM quote_accomodation WHERE quote_accomodation.quote_id = quote_table.id), 0)
              + quote_table.package_commission
             
            `.as('overall_commission'),

          overall_cost: sql`
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
            `.as('overall_cost'),
        })
        .from(quote)
        .innerJoin(transaction, eq(quote.transaction_id, transaction.id)) // Join transaction after quote
        .leftJoin(package_type, eq(quote.holiday_type_id, package_type.id)) // Now transaction is available
        .innerJoin(clientTable, eq(transaction.client_id, clientTable.id))
        .leftJoin(quote_cruise, eq(quote_cruise.quote_id, quote.id))
        .innerJoin(user, eq(transaction.user_id, user.id))
        .leftJoin(cottages, eq(quote.cottage_id, cottages.id))
        .leftJoin(lodges, eq(quote.lodge_id, lodges.id))
        .leftJoin(park, eq(lodges.park_id, park.id))
        .leftJoin(quote_accomodation, and(eq(quote_accomodation.quote_id, quote.id), eq(quote_accomodation.is_primary, true)))
        .leftJoin(accomodation_list, eq(quote_accomodation.accomodation_id, accomodation_list.id))
        .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
        .leftJoin(destination, eq(resorts.destination_id, destination.id))
        .where(and(ne(quote.quote_status, 'ARCHIVED'), eq(transaction.status, 'on_quote'), eq(quote.is_active, true), eq(transaction.client_id, client_id)))
        .groupBy(
          quote.id,
          quote.transaction_id,
          transaction.status,
          sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
          transaction.user_id,
          sql`${user.firstName} || ' ' || ${user.lastName}`,
          transaction.client_id,
          quote.num_of_nights,
          package_type.name,
          park.city,
          cottages.location,
          quote_cruise.cruise_name,
          quote.travel_date,
          destination.name
        )
        .orderBy(asc(sql`quote_status = 'LOST'`), desc(quote.date_created));

      const payload = response.map((data) => {
        return {
          ...data,
          no_of_nights: data.no_of_nights?.toString() ?? '0',
          travel_date: data.travel_date ? new Date(data.travel_date).toISOString() : null,
        };
      });
      const validate_date = z.array(quoteQuerySummarySchema).safeParse(payload);

      if (!validate_date.success) {
        console.log(validate_date.error);
        throw new AppError('Something went wrong fetching quote ', true, 500);
      }
      return validate_date.data;
    } catch (error) {
      console.error(error);
      throw new AppError('Something went wrong fetching quote ', true, 500);
    }
  },
  fetchQuoteSummaryByAgent: async (agent_id, agentIdToFetch, isFetchAll) => {
    try {
      const agent = await db.query.user.findFirst({
        where: eq(user.id, agent_id),
      });
      const query = db
        .select({
          id: quote.id,
          transaction_id: quote.transaction_id,
          status: transaction.status,
          clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
          agent_id: transaction.user_id,
          agentName: sql`${user.firstName} || ' ' || ${user.lastName}`,
          clientId: transaction.client_id,
          no_of_nights: quote.num_of_nights,
          holiday_type: package_type.name,
          lodge_destination: park.city,
          cottage_destination: cottages.location,
          cruise_destination: quote_cruise.cruise_name,
          holiday_destination: destination.name,
          quote_status: quote.quote_status,
          travel_date: quote.travel_date,
          date_expiry: quote.date_expiry,
          date_created: quote.date_created,
          is_future_deal: quote.is_future_deal,
          future_deal_date: quote.future_deal_date,
          quote_ref: quote.quote_ref,
          overall_commission: sql`
              COALESCE((SELECT SUM(commission) FROM quote_flights WHERE quote_flights.quote_id = quote_table.id), 0)
              + COALESCE((SELECT SUM(commission) FROM quote_airport_parking WHERE quote_airport_parking.quote_id = quote_table.id), 0)
              + COALESCE((SELECT SUM(commission) FROM quote_lounge_pass WHERE quote_lounge_pass.quote_id = quote_table.id), 0)
              + COALESCE((SELECT SUM(commission) FROM quote_attraction_ticket WHERE quote_attraction_ticket.quote_id = quote_table.id), 0)
              + COALESCE((SELECT SUM(commission) FROM quote_car_hire WHERE quote_car_hire.quote_id = quote_table.id), 0)
              + COALESCE((SELECT SUM(commission) FROM quote_transfers WHERE quote_transfers.quote_id = quote_table.id), 0)
              + COALESCE((SELECT SUM(commission) FROM quote_accomodation WHERE quote_accomodation.quote_id = quote_table.id), 0)
              + quote_table.package_commission
             
            `.as('overall_commission'),

          overall_cost: sql`
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
            `.as('overall_cost'),
        })
        .from(quote) // Introduce the quote table first
        .innerJoin(transaction, eq(quote.transaction_id, transaction.id)) // Join transaction after quote
        .leftJoin(package_type, eq(quote.holiday_type_id, package_type.id)) // Now transaction is available
        .innerJoin(clientTable, eq(transaction.client_id, clientTable.id))
        .leftJoin(quote_cruise, eq(quote_cruise.quote_id, quote.id))
        .innerJoin(user, eq(transaction.user_id, user.id))
        .leftJoin(cottages, eq(quote.cottage_id, cottages.id))
        .leftJoin(lodges, eq(quote.lodge_id, lodges.id))
        .leftJoin(park, eq(lodges.park_id, park.id))
        .leftJoin(quote_accomodation, and(eq(quote_accomodation.quote_id, quote.id), eq(quote_accomodation.is_primary, true)))
        .leftJoin(accomodation_list, eq(quote_accomodation.accomodation_id, accomodation_list.id))
        .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
        .leftJoin(destination, eq(resorts.destination_id, destination.id))
        .groupBy(
          quote.id,
          quote.transaction_id,
          transaction.status,
          sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
          transaction.user_id,
          sql`${user.firstName} || ' ' || ${user.lastName}`,
          transaction.client_id,
          quote.num_of_nights,
          package_type.name,
          park.city,
          cottages.location,
          quote_cruise.cruise_name,
          quote.travel_date,
          destination.name
        )
        .orderBy(desc(quote.date_created));

      if (!isFetchAll && agent?.role === 'manager' && agentIdToFetch) {
        query.where(and(eq(quote.isFreeQuote, false), eq(transaction.user_id, agentIdToFetch), eq(transaction.status, 'on_quote'), ne(quote.quote_status, 'LOST')));
      } else if (isFetchAll && agent?.role === 'manager') {
        query.where(and(eq(quote.isFreeQuote, false), eq(transaction.status, 'on_quote'), eq(quote.quote_type, 'primary'), ne(quote.quote_status, 'LOST')));
      } else {
        query.where(and(eq(quote.isFreeQuote, false), eq(transaction.user_id, agent_id), eq(transaction.status, 'on_quote'), ne(quote.quote_status, 'LOST')));
      }

      const response = await query;

      const payload = response.map((data) => {
        return {
          ...data,
          travel_date: data.travel_date ? new Date(data.travel_date).toISOString() : null,
        };
      });
      const validate_date = z.array(quoteQuerySummarySchema).safeParse(payload);

      if (!validate_date.success) {
        console.log(validate_date.error);
        throw new AppError('Something went wrong fetching quote ', true, 500);
      }

      return validate_date.data;
    } catch (error) {
      console.error(error);
      throw new AppError('Something went wrong fetching quote ', true, 500);
    }
  },
  fetchQuoteById: async (quote_id) => {
    const hotel_tour_operator = aliasedTable(tour_operator, 'hotel_tour_operator');
    const transfer_tour_operator = aliasedTable(tour_operator, 'transfer_tour_operator');
    const car_hire_operator = aliasedTable(tour_operator, 'car_hire_operator');
    const ticket_operator = aliasedTable(tour_operator, 'ticket_operator');
    const lounge_pass_operator = aliasedTable(tour_operator, 'lounge_pass_operator');
    const parking_operator = aliasedTable(tour_operator, 'parking_operator');
    const flight_operator = aliasedTable(tour_operator, 'flight_operator');
    const flight_departing_airport = aliasedTable(airport, 'flight_departing_airport');
    const flight_arrival_airport = aliasedTable(airport, 'flight_arrival_airport');
    const lounge_pass_airport = aliasedTable(airport, 'lounge_pass_airport');
    const parking_airport = aliasedTable(airport, 'parking_airport');
    const main_tour_operator = aliasedTable(tour_operator, 'main_tour_operator');
    const cruise_operator = aliasedTable(tour_operator, 'cruise_operator');
    const agentTable = aliasedTable(user, 'user');
    const userReferrer = aliasedTable(user, 'userReferrer');

    try {
      const result = await db
        .select({
          name: package_type.name,
        })
        .from(quote)
        .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
        .innerJoin(package_type, eq(quote.holiday_type_id, package_type.id))
        .where(eq(quote.id, quote_id))
        .limit(1);

      const groupByFields = [
        quote.id,
        agentTable.firstName,
        agentTable.lastName,
        package_type.name,
        clientTable.firstName,
        clientTable.surename,
        transaction.client_id,


        transaction.status,
        transaction.id,
        quote.sales_price,
        quote.package_commission,
        quote.travel_date,
        quote.discounts,
        quote.service_charge,
        quote.num_of_nights,
        quote.quote_type,
        quote.transfer_type,
        quote.quote_status,
        main_tour_operator.name,
        quote.infant,
        quote.child,
        quote.adult,
        quote.date_created,
        quote.date_expiry,
        quote.is_future_deal,
        quote.future_deal_date,
        user.firstName,
        user.lastName,
        transaction.lead_source,

        ...(result.length > 0 && result[0].name === 'Hot Tub Break'
          ? [
            quote.lodge_id,
            quote.lodge_type,
            lodges.lodge_name,
            lodges.lodge_code,
            park.name,
            park.location,
            park.code,
            quote.cottage_id,
            cottages.cottage_name,
            cottages.cottage_code,
            cottages.location,
          ]
          : []),
        ...(result.length > 0 && result[0].name === 'Cruise Package'
          ? [
            quote_cruise.id,
            cruise_operator.name,
            quote_cruise.cruise_line,
            quote_cruise.ship,
            quote_cruise.cruise_date,
            quote_cruise.cabin_type,
            quote_cruise.cruise_name,
            quote_cruise.pre_cruise_stay,
            quote_cruise.post_cruise_stay,
          ]
          : []),
      ];

      const selected_fields: Record<string, any> = {
        id: quote.id,
        holiday_type: package_type.name,
        clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
        clientId: transaction.client_id,
        agentId: transaction.user_id,
        title: quote.title,
        agentName: sql`${agentTable.firstName} || ' ' || ${agentTable.lastName}`,
        status: transaction.status,
        lead_source: transaction.lead_source,
        transaction_id: transaction.id,
        sales_price: quote.sales_price,
        package_commission: quote.package_commission,
        travel_date: quote.travel_date,
        discount: quote.discounts,
        service_charge: quote.service_charge,
        num_of_nights: quote.num_of_nights,
        quote_type: quote.quote_type,
        transfer_type: quote.transfer_type,
        quote_status: quote.quote_status,
        main_tour_operator: main_tour_operator.name,
        infants: quote.infant,
        children: quote.child,
        adults: quote.adult,
        date_created: quote.date_created,
        date_expiry: quote.date_expiry,
        is_future_deal: quote.is_future_deal,
        future_deal_date: quote.future_deal_date,
        quote_ref: quote.quote_ref,


      };

      if (result.length > 0 && result[0].name === 'Hot Tub Break') {
        selected_fields.lodge_id = quote.lodge_id;
        selected_fields.lodge_name = lodges.lodge_name;
        selected_fields.lodge_code = lodges.lodge_code;
        selected_fields.park_name = park.name;
        selected_fields.park_location = park.location;
        selected_fields.park_code = park.code;
        selected_fields.lodge_type = quote.lodge_type;
        selected_fields.cottage_id = quote.cottage_id;
        selected_fields.cottage_name = cottages.cottage_name;
        selected_fields.cottage_code = cottages.cottage_code;
        selected_fields.cottage_location = cottages.location;
      } else if (result.length > 0 && result[0].name === 'Cruise Package') {
        selected_fields.quote_cruise_id = quote_cruise.id;
        selected_fields.cruise_operator = cruise_operator.name;
        selected_fields.cruise_line = quote_cruise.cruise_line;
        selected_fields.cruise_ship = quote_cruise.ship;
        selected_fields.cruise_date = quote_cruise.cruise_date;
        selected_fields.cabin_type = quote_cruise.cabin_type;
        selected_fields.cruise_name = quote_cruise.cruise_name;
        selected_fields.pre_cruise_stay = quote_cruise.pre_cruise_stay;
        selected_fields.post_cruise_stay = quote_cruise.post_cruise_stay;
        selected_fields.voyages = sql`
            (
              SELECT json_agg(row) FROM (
                SELECT DISTINCT ON (qci.id,qci.day_number, qci.description)
                  jsonb_build_object(
                    'id', qci.id,
                    'day_number', qci.day_number,
                    'description', qci.description
                  ) AS row
                FROM quote_cruise_itinerary qci
                WHERE qci.quote_cruise_id = ${quote_cruise.id}
                ORDER BY qci.day_number, qci.description
              ) sub
            )
          `.as('voyages');

        selected_fields.cruise_extra = sql`
          (
            SELECT json_agg(row) FROM (
              SELECT DISTINCT ON (ceit.id)
                jsonb_build_object(
                  'id', ceit.id,
                  'name', ceit.name
                ) AS row
              FROM quote_cruise_item_extra qci
              LEFT JOIN cruise_extra_item_table ceit ON ceit.id = qci.cruise_extra_id
              WHERE qci.quote_cruise_id = ${quote_cruise.id}
              ORDER BY ceit.id  -- Ordering by ceit.id to apply DISTINCT ON
            ) sub
          )
        `.as('cruise_extra');
      }
      let query = db
        .select({
          ...selected_fields,
          has_multiple_quotes: sql`
          (
            SELECT COUNT(*) > 1 
            FROM quote_table AS qt 
            WHERE qt.transaction_id = quote_table.transaction_id 
              AND quote_table.transaction_id IS NOT NULL
          )
        `.as('has_multiple_quotes'),

          overall_commission: sql`
            COALESCE((SELECT SUM(commission) FROM quote_flights WHERE quote_flights.quote_id = quote_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM quote_airport_parking WHERE quote_airport_parking.quote_id = quote_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM quote_lounge_pass WHERE quote_lounge_pass.quote_id = quote_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM quote_attraction_ticket WHERE quote_attraction_ticket.quote_id = quote_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM quote_car_hire WHERE quote_car_hire.quote_id = quote_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM quote_transfers WHERE quote_transfers.quote_id = quote_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM quote_accomodation WHERE quote_accomodation.quote_id = quote_table.id), 0)
            + quote_table.package_commission
            
           
          `.as('overall_commission'),

          overall_cost: sql`
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
          `.as('overall_cost'),
          passengers: sql`json_agg(json_build_object(
                'id', ${passengers.id},
                'type', ${passengers.type},
                'age', ${passengers.age}
              ))`.as('passengers'),

          hotels: sql`json_agg(json_build_object(
                'id', ${quote_accomodation.id},
                'tour_operator', ${hotel_tour_operator.name},
                'board_basis', ${board_basis.type},
                'booking_ref', ${quote_accomodation.booking_ref},
                'no_of_nights', ${quote_accomodation.no_of_nights},
                'room_type', ${quote_accomodation.room_type},
                'check_in_date_time', ${quote_accomodation.check_in_date_time},
                'cost', ${quote_accomodation.cost},
                'commission', ${quote_accomodation.commission},
                'accomodation', ${accomodation_list.name},
                'accomodation_id', ${accomodation_list.id},
                'description', ${accomodation_list.description},
                'resorts', ${resorts.name},
                'destination', ${destination.name},
                'is_primary', ${quote_accomodation.is_primary},
                'country', ${country.country_name},
                'stay_type', ${quote_accomodation.stay_type},
                'is_included_in_package', ${quote_accomodation.is_included_in_package}
                ))`.as('hotels'),
          transfers: sql`json_agg(json_build_object(
                'id', ${quote_transfers.id},
                 'booking_ref', ${quote_transfers.booking_ref},
                'tour_operator', ${transfer_tour_operator.name},
                'pick_up_location', ${quote_transfers.pick_up_location},
                'pick_up_time', ${quote_transfers.pick_up_time},
                'drop_off_time', ${quote_transfers.drop_off_time},
                'drop_off_location', ${quote_transfers.drop_off_location},
                'is_included_in_package', ${quote_transfers.is_included_in_package},
                'cost', ${quote_transfers.cost},
                'commission', ${quote_transfers.commission},
                'note', ${quote_transfers.note}
                ))`.as('transfers'),
          car_hire: sql`json_agg(json_build_object(
                'id', ${quote_car_hire.id},
                'booking_ref', ${quote_car_hire.booking_ref},
                'tour_operator', ${car_hire_operator.name},
                'pick_up_location', ${quote_car_hire.pick_up_location},
                'drop_off_location', ${quote_car_hire.drop_off_location},
                'pick_up_time', ${quote_car_hire.pick_up_time},
                'drop_off_time', ${quote_car_hire.drop_off_time},
                'no_of_days', ${quote_car_hire.no_of_days},
                'driver_age', ${quote_car_hire.driver_age},
                'is_included_in_package', ${quote_car_hire.is_included_in_package},
                'cost', ${quote_car_hire.cost},
                'commission', ${quote_car_hire.commission}
                ))`.as('car_hire'),
          attraction_tickets: sql`json_agg(json_build_object(
                'id', ${quote_attraction_ticket.id},
                'booking_ref', ${quote_attraction_ticket.booking_ref},
                'ticket_type', ${quote_attraction_ticket.ticket_type},
                'tour_operator', ${ticket_operator.name},
                'date_of_visit', ${quote_attraction_ticket.date_of_visit},
                'cost', ${quote_attraction_ticket.cost},
                'commission', ${quote_attraction_ticket.commission},
                'number_of_tickets', ${quote_attraction_ticket.number_of_tickets},
                'is_included_in_package', ${quote_attraction_ticket.is_included_in_package}
                ))`.as('attraction_tickets'),
          lounge_pass: sql`json_agg(json_build_object(
                'id', ${quote_lounge_pass.id},
                'booking_ref', ${quote_lounge_pass.booking_ref},
                'terminal', ${quote_lounge_pass.terminal},
                'airport', ${lounge_pass_airport.airport_name},
                'tour_operator', ${lounge_pass_operator.name},
                'date_of_usage', ${quote_lounge_pass.date_of_usage},
                'cost', ${quote_lounge_pass.cost},
                'commission', ${quote_lounge_pass.commission},
                'is_included_in_package', ${quote_lounge_pass.is_included_in_package},
                'note', ${quote_lounge_pass.note}
                ))`.as('lounge_pass'),
          airport_parking: sql`json_agg(json_build_object(
                'id', ${quote_airport_parking.id},
                'booking_ref', ${quote_airport_parking.booking_ref},
                'airport', ${parking_airport.airport_name},
                'parking_type', ${quote_airport_parking.parking_type},
                'car_make', ${quote_airport_parking.car_make},
                'car_model', ${quote_airport_parking.car_model},
                'colour', ${quote_airport_parking.colour},
                'car_reg_number', ${quote_airport_parking.car_reg_number},
                'parking_date', ${quote_airport_parking.parking_date},
                'duration', ${quote_airport_parking.duration},
                'tour_operator', ${parking_operator.name},
                  'is_included_in_package', ${quote_airport_parking.is_included_in_package},
                  'cost', ${quote_airport_parking.cost},
                  'commission', ${quote_airport_parking.commission}
                  ))`.as('airport_parking'),

          flights: sql`json_agg(json_build_object(
                'id', ${quote_flights.id},
                'flight_number', ${quote_flights.flight_number},
                'flight_ref', ${quote_flights.flight_ref},
                'departing_airport', ${flight_departing_airport.airport_name},
                'arrival_airport', ${flight_arrival_airport.airport_name},
                'tour_operator', ${flight_operator.name},
                'flight_type', ${quote_flights.flight_type},
                'departure_date_time', ${quote_flights.departure_date_time},
                'arrival_date_time', ${quote_flights.arrival_date_time},
                'is_included_in_package', ${quote_flights.is_included_in_package},
                'cost', ${quote_flights.cost},
                'commission', ${quote_flights.commission}
                ))`.as('flights'),
          referrals: sql`json_agg(json_build_object(
                'id', ${referral.id},
                'name', ${userReferrer.firstName} || ' ' || ${userReferrer.lastName},
                'commission', ${referral.potentialCommission}
                ))`.as('referrals'),
        })
        .from(quote)
        .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
        .leftJoin(referral, eq(transaction.id, referral.transactionId))
        .leftJoin(userReferrer, eq(referral.referrerId, userReferrer.id))
        .innerJoin(agentTable, eq(transaction.user_id, agentTable.id))
        .leftJoin(clientTable, eq(transaction.client_id, clientTable.id))
        .innerJoin(package_type, eq(quote.holiday_type_id, package_type.id))
        .leftJoin(quote_accomodation, eq(quote.id, quote_accomodation.quote_id))
        .leftJoin(quote_transfers, eq(quote.id, quote_transfers.quote_id))
        .leftJoin(board_basis, eq(quote_accomodation.board_basis_id, board_basis.id))
        .leftJoin(hotel_tour_operator, eq(quote_accomodation.tour_operator_id, hotel_tour_operator.id))
        .leftJoin(transfer_tour_operator, eq(quote_transfers.tour_operator_id, transfer_tour_operator.id))
        .leftJoin(accomodation_list, eq(quote_accomodation.accomodation_id, accomodation_list.id))
        .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
        .leftJoin(destination, eq(resorts.destination_id, destination.id))
        .leftJoin(country, eq(destination.country_id, country.id))
        .leftJoin(quote_car_hire, eq(quote.id, quote_car_hire.quote_id))
        .leftJoin(car_hire_operator, eq(quote_car_hire.tour_operator_id, car_hire_operator.id))
        .leftJoin(quote_attraction_ticket, eq(quote.id, quote_attraction_ticket.quote_id))
        .leftJoin(ticket_operator, eq(quote_attraction_ticket.tour_operator_id, ticket_operator.id))
        .leftJoin(quote_lounge_pass, eq(quote.id, quote_lounge_pass.quote_id))
        .leftJoin(lounge_pass_operator, eq(quote_lounge_pass.tour_operator_id, lounge_pass_operator.id))
        .leftJoin(lounge_pass_airport, eq(quote_lounge_pass.airport_id, lounge_pass_airport.id))
        .leftJoin(quote_airport_parking, eq(quote.id, quote_airport_parking.quote_id))
        .leftJoin(parking_operator, eq(quote_airport_parking.tour_operator_id, parking_operator.id))
        .leftJoin(parking_airport, eq(quote_airport_parking.airport_id, parking_airport.id))
        .leftJoin(quote_flights, eq(quote.id, quote_flights.quote_id))
        .leftJoin(flight_operator, eq(quote_flights.tour_operator_id, flight_operator.id))
        .leftJoin(flight_departing_airport, eq(quote_flights.departing_airport_id, flight_departing_airport.id))
        .leftJoin(flight_arrival_airport, eq(quote_flights.arrival_airport_id, flight_arrival_airport.id))
        .leftJoin(main_tour_operator, eq(quote.main_tour_operator_id, main_tour_operator.id))
        .leftJoin(passengers, eq(quote.id, passengers.quote_id))

        .where(and(eq(quote.id, quote_id)))
        .groupBy(...groupByFields);

      if (result.length > 0 && result[0].name === 'Hot Tub Break') {
        query = query
          .leftJoin(cottages, eq(quote.cottage_id, cottages.id))
          .leftJoin(lodges, eq(quote.lodge_id, lodges.id))
          .leftJoin(park, eq(lodges.park_id, park.id));
      } else if (result.length > 0 && result[0].name === 'Cruise Package') {
        query = query
          .leftJoin(quote_cruise, eq(quote_cruise.quote_id, quote.id))
          .leftJoin(quote_cruise_item_extra, eq(quote_cruise.id, quote_cruise_item_extra.quote_cruise_id))
          .leftJoin(cruise_extra_item, eq(quote_cruise_item_extra.cruise_extra_id, cruise_extra_item.id))
          .leftJoin(quote_cruise_itinerary, eq(quote_cruise.id, quote_cruise_itinerary.quote_cruise_id))
          .leftJoin(cruise_operator, eq(quote_cruise.tour_operator_id, cruise_operator.id));
      }
      const datas = await query;

      const data = datas[0] as any;

      const referrals = Array.from(new Map((data?.referrals ?? []).filter((r: any) => r?.id).map((r: any) => [r.id, { ...r, id: r.id }])).values()) || [];
      const percentageComission = referrals.reduce((acc: number, curr: any) => acc + parseFloat(curr.commission), 0);

      const payload = {
        ...data,

        cruise_date: data?.cruise_date ? new Date(data.cruise_date) : null,
        post_cruise_stay: data?.post_cruise_stay,
        pre_cruise_stay: data?.pre_cruise_stay,
        future_deal_date: new Date(data?.future_deal_date),
        travel_date: data?.travel_date ? new Date(data.travel_date) : null,
        sales_price: parseFloat(data?.sales_price ?? 0),
        overall_commission: parseFloat(data?.overall_commission ?? 0),
        package_commission: parseFloat(data?.package_commission ?? 0),
        discount: parseFloat(data?.discount ?? 0),
        service_charge: parseFloat(data?.service_charge ?? 0),

        num_of_nights: data.num_of_nights ? parseInt(data?.num_of_nights) : 0,
        overall_cost: parseFloat(data?.overall_cost ?? 0),
        potentialCommission: percentageComission,
        referrerCommission: (parseFloat(data?.overall_commission ?? 0) * (percentageComission ?? 0)) / 100,
        finalCommission:
          parseFloat(data?.overall_commission ?? 0) - (parseFloat(data?.overall_commission ?? 0) * (percentageComission ?? 0)) / 100,
        cruise_extra: Array.from(new Set((data?.cruise_extra ?? []).filter((c: any) => c?.id).map((c: any) => c.name))),

        voyages: Array.from(new Map((data?.voyages ?? []).filter((v: any) => v?.id).map((v: any) => [v.id, { ...v, id: v.id }])).values()),

        passengers: Array.from(
          new Map((data?.passengers ?? []).filter((p: any) => p?.id).map((p: any) => [p.id, { ...p, type: p.type ? p.type : "adult", age: parseInt(p.age) }])).values()
        ),
        referrals: referrals,


        hotels: Array.from(
          new Map(
            (data?.hotels ?? [])
              .filter((h: any) => h?.id)
              .map((h: any) => [
                h.id,
                {
                  ...h,
                  id: h.id,
                  accomodation_id: h.accomodation_id,
                  no_of_nights: h.no_of_nights.toString(),
                  cost: parseFloat(h.cost),
                  commission: parseFloat(h.commission),
                },
              ])
          ).values()
        ),

        transfers: Array.from(
          new Map(
            (data?.transfers ?? [])
              .filter((t: any) => t?.id)
              .map((t: any) => [
                t.id,
                {
                  ...t,
                  pick_up_time: new Date(t.pick_up_time).toISOString(),
                  drop_off_time: new Date(t.drop_off_time).toISOString(),
                  cost: parseFloat(t.cost),
                  commission: parseFloat(t.commission),
                },
              ])
          ).values()
        ),

        car_hire: Array.from(
          new Map(
            (data?.car_hire ?? [])
              .filter((c: any) => c?.id)
              .map((c: any) => [
                c.id,
                {
                  ...c,
                  no_of_days: c.no_of_days.toString(),
                  pick_up_time: new Date(c.pick_up_time),
                  drop_off_time: new Date(c.drop_off_time),
                  driver_age: parseInt(c.driver_age),
                  cost: parseFloat(c.cost),
                  commission: parseFloat(c.commission),
                },
              ])
          ).values()
        ),

        attraction_tickets: Array.from(
          new Map(
            (data?.attraction_tickets ?? [])
              .filter((a: any) => a?.id)
              .map((a: any) => [
                a.id,
                {
                  ...a,
                  number_of_tickets: parseInt(a.number_of_tickets),
                  date_of_visit: new Date(a.date_of_visit),
                  cost: parseFloat(a.cost),
                  commission: parseFloat(a.commission),
                },
              ])
          ).values()
        ),

        lounge_pass: Array.from(
          new Map(
            (data?.lounge_pass ?? [])
              .filter((l: any) => l?.id)
              .map((l: any) => [
                l.id,
                {
                  ...l,
                  date_of_usage: new Date(l.date_of_usage),
                  cost: parseFloat(l.cost),
                  commission: parseFloat(l.commission),
                },
              ])
          ).values()
        ),

        airport_parking: Array.from(
          new Map(
            (data?.airport_parking ?? [])
              .filter((a: any) => a?.id)
              .map((a: any) => [
                a.id,
                {
                  ...a,
                  parking_date: new Date(a.parking_date),
                  cost: parseFloat(a.cost),
                  commission: parseFloat(a.commission),
                },
              ])
          ).values()
        ),

        flights: Array.from(
          new Map(
            (data?.flights ?? [])
              .filter((f: any) => f?.id)
              .map((f: any) => [
                f.id,
                {
                  ...f,
                  cost: parseFloat(f.cost),
                  commission: parseFloat(f.commission),
                  departure_date_time: new Date(f.departure_date_time),
                  arrival_date_time: new Date(f.arrival_date_time),
                },
              ])
          ).values()
        ),
      };

      if (result.length > 0 && result[0].name === 'Hot Tub Break') {
        const data = dataValidator(quoteHotTubQuerySchema, payload);

        return {
          ...data,
          holiday_type: 'Hot Tub Break' as const,
        }
      } else if (result.length > 0 && result[0].name === 'Package Holiday') {
        const data = dataValidator(quotePackageHolidayQuerySchema, payload);
        return {
          ...data,
          holiday_type: 'Package Holiday' as const,
        }
      } else if (result.length > 0 && result[0].name === 'Cruise Package') {
        const data = dataValidator(quoteCruiseQuerySchema, payload);
        return {
          ...data,
          holiday_type: 'Cruise Package' as const,
        }
      } else {
        const data = dataValidator(quoteBasedSchema, payload);
        return {
          ...data,
          holiday_type: 'Others' as const,
        }
      }
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong fetching quote ', true, 500);
    }
  },
  fetchPackageToUpdate: async (quote_id) => {
    try {
      const response = await db.query.quote.findFirst({
        where: eq(quote.id, quote_id),
        with: {
          lodge: {
            with: {
              park: true,
            },
          },
          passengers: true,
          flights: {
            with: {
              departing_airport: true,
              arrival_airport: true,
            },
          },
          transfers: true,
          car_hire: true,
          attraction_tickets: true,
          airport_parking: true,
          lounge_pass: true,
          accomodation: {
            with: {
              accomodation: {
                with: {
                  resorts: {
                    with: {
                      destination: true,
                    },
                  },
                },
              },
            },
          },
          holiday_type: true,
          transaction: {
            with: {
              referrals: true,
            },
          },
        },
      });
      if (!response || !response.holiday_type_id) {
        throw new Error('Quote not found');
      }
      const holiday = await db.query.package_type.findFirst({
        where: eq(package_type.id, response.holiday_type_id),
      });
      if (!holiday) {
        throw new Error('Holiday type not found');
      }
      if (holiday.name === 'Package Holiday') {



        const primary_accomodation = response.accomodation.find((accomodation) => accomodation.is_primary === true);
        // For "27-12-2025"  
        const parsedTravelDate = parse(response.travel_date, "yyyy-MM-dd", new Date());
        console.log('Parsed Travel Date:', response.travel_date, parsedTravelDate);
        const payload_to_validate = {
          deal_type: response.deal_type,
          pre_booked_seats: response.pre_booked_seats,
          flight_meals: response.flight_meals,
          quote_id: response.id,
          transaction_id: response.transaction_id,
          lead_source: response.transaction?.lead_source,
          travel_date: format(parsedTravelDate, "dd-MM-yyyy HH:mm:ss"),
          main_tour_operator_id: response.main_tour_operator_id,
          sales_price: parseFloat(response.sales_price ?? '0'),
          commission: parseFloat(response.package_commission ?? '0'),
          discount: parseFloat(response.discounts ?? '0'),
          service_charge: parseFloat(response.service_charge ?? '0'),
          holiday_type: response.holiday_type_id,
          holiday_type_name: holiday.name,
          transfer_type: response.transfer_type,
          no_of_nights: primary_accomodation?.no_of_nights?.toString() ?? '0',
          agent_id: response.transaction?.user_id,
          client_id: response.transaction?.client_id,
          is_future_deal: response.is_future_deal,
          future_deal_date: response.future_deal_date,
          date_expiry: response.date_expiry ? format(response.date_expiry, 'yyyy-MM-dd') : null,
          check_in_date_time: primary_accomodation?.check_in_date_time ? format(primary_accomodation.check_in_date_time, "dd-MM-yyyy HH:mm:ss") : null,
          title: response.title,
          quote_ref: response.quote_ref,
          country: primary_accomodation?.accomodation?.resorts?.destination?.country_id,
          destination: primary_accomodation?.accomodation?.resorts?.destination_id,
          resort: primary_accomodation?.accomodation?.resorts_id,
          accomodation_id: primary_accomodation?.accomodation_id,
          main_board_basis_id: primary_accomodation?.board_basis_id,
          room_type: primary_accomodation?.room_type,
          is_primary: primary_accomodation?.is_primary,
          // referralId: response.transaction.referrals ? response.transaction.referrals.id : undefined,
          // referrerId: response.transaction.referrals ? response.transaction.referrals.referrerId : undefined,
          // potentialCommission: response.transaction.referrals ? parseInt(response.transaction.referrals.potentialCommission) : undefined,
          adults: response.adult ? response.adult : 0,
          children: response.child ? response.child : 0,
          infants: response.infant ? response.infant : 0,
          passengers: response.passengers.map((data) => ({ type: data.type ?? "adult", age: data.age ?? 0 })),
          flights: response.flights.map((data) => {

            console.log(data.departure_date_time, 'Original Departure Date Time');
            return {
              ...data,
              departure_airport_name: data.departing_airport?.airport_name,
              commission: parseFloat(data.commission ?? '0'),
              cost: parseFloat(data.cost ?? '0'),
              departure_date_time: data.departure_date_time ? format(data.departure_date_time, "dd-MM-yyyy HH:mm:ss") : null,
              arrival_date_time: data.arrival_date_time ? format(data.arrival_date_time, "dd-MM-yyyy HH:mm:ss") : null,
            }
          }),
          transfers: response.transfers.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            drop_off_time: data.drop_off_time ? new Date(data.drop_off_time).toISOString() : null,
            pick_up_time: data.pick_up_time ? new Date(data.pick_up_time).toISOString() : null,
          })),
          car_hire: response.car_hire.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            drop_off_time: data.drop_off_time ? new Date(data.drop_off_time).toISOString() : null,
            pick_up_time: data.pick_up_time ? new Date(data.pick_up_time).toISOString() : null,
          })),
          attraction_tickets: response.attraction_tickets.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            date_of_visit: data.date_of_visit ? new Date(data.date_of_visit).toISOString() : null,
          })),

          lounge_pass: response.lounge_pass.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            date_of_usage: data.date_of_usage ? new Date(data.date_of_usage).toISOString() : null,
          })),
          hotels: response.accomodation
            .filter((accomodation) => accomodation.is_primary === false)
            .map((data) => ({
              ...data,
              commission: parseFloat(data.commission ?? '0'),
              cost: parseFloat(data.cost ?? '0'),
              no_of_nights: data.no_of_nights.toString() ?? '0',
              is_primary: data.is_primary,
              resort: data.accomodation?.resorts_id,
              destination: data.accomodation?.resorts?.destination_id,
              country: data.accomodation?.resorts?.destination?.country_id,

              accomodation_id: data.accomodation_id,
              check_in_date_time: data.check_in_date_time ? new Date(data.check_in_date_time).toISOString() : null,
            })),
        };

        const validate_date = quote_mutate_schema.safeParse(payload_to_validate);

        if (validate_date.error) {
          console.log(validate_date.error);
          throw new Error('Invalid data');
        }
        return validate_date.data;
      } else if (holiday.name === 'Hot Tub Break') {
        const parsedTravelDate = parse(response.travel_date, "yyyy-MM-dd", new Date());
        const payload_to_validate = {
          deal_type: response.deal_type,
          pre_booked_seats: response.pre_booked_seats,
          flight_meals: response.flight_meals,
          quote_id: response.id,
          transaction_id: response.transaction_id,
          lead_source: response.transaction?.lead_source,
          travel_date: format(parsedTravelDate, "dd-MM-yyyy HH:mm:ss"),
          main_tour_operator_id: response.main_tour_operator_id,
          sales_price: parseFloat(response.sales_price ?? '0'),
          commission: parseFloat(response.package_commission ?? '0'),
          discount: parseFloat(response.discounts ?? '0'),
          holiday_type_name: holiday.name,
          service_charge: parseFloat(response.service_charge ?? '0'),
          holiday_type: response.holiday_type_id,
          transfer_type: response.transfer_type,
          no_of_nights: response.num_of_nights.toString() ?? '0',
          agent_id: response.transaction?.user_id,
          client_id: response.transaction?.client_id,
          is_future_deal: response.is_future_deal,
          future_deal_date: response.future_deal_date,
          date_expiry: response.date_expiry ? format(response.date_expiry, 'yyyy-MM-dd') : null,
          title: response.title,
          quote_ref: response.quote_ref,
          lodge_id: response.lodge_id,
          lodge_type: response.lodge_type,
          pets: response.pets,
          lodge_park_name: response.lodge?.park?.name,
          lodge_code: response.lodge?.lodge_code,
          lodge_park_type: response.lodge_type,
          cottage_id: response.cottage_id,

          // referralId: response.transaction.referrals ? response.transaction.referrals.id : undefined,
          // referrerId: response.transaction.referrals ? response.transaction.referrals.referrerId : undefined,
          // potentialCommission: response.transaction.referrals ? parseInt(response.transaction.referrals.potentialCommission) : undefined,

          adults: response.adult,
          children: response.child,
          infants: response.infant,

          passengers: response.passengers.map((data) => ({ type: data.type ?? "adult", age: data.age ?? 0 })),
          flights: response.flights.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            departure_airport_name: data.departing_airport?.airport_name,
            cost: parseFloat(data.cost ?? '0'),
            departure_date_time: data.departure_date_time ? format(data.departure_date_time, "dd-MM-yyyy HH:mm:ss") : null,
            arrival_date_time: data.arrival_date_time ? format(data.arrival_date_time, "dd-MM-yyyy HH:mm:ss") : null,
          })),
          transfers: response.transfers.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            drop_off_time: data.drop_off_time ? new Date(data.drop_off_time).toISOString() : null,
            pick_up_time: data.pick_up_time ? new Date(data.pick_up_time).toISOString() : null,
          })),
          car_hire: response.car_hire.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            drop_off_time: data.drop_off_time ? new Date(data.drop_off_time).toISOString() : null,
            pick_up_time: data.pick_up_time ? new Date(data.pick_up_time).toISOString() : null,
          })),
          attraction_tickets: response.attraction_tickets.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            date_of_visit: data.date_of_visit ? new Date(data.date_of_visit).toISOString() : null,
          })),
          airport_parking: response.airport_parking.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            make: data.car_make,
            parking_date: data.parking_date ? new Date(data.parking_date).toISOString() : null,
          })),
          lounge_pass: response.lounge_pass.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            date_of_usage: data.date_of_usage ? new Date(data.date_of_usage).toISOString() : null,
          })),
          hotels: response.accomodation
            .filter((accomodation) => accomodation.is_primary === false)
            .map((data) => ({
              ...data,
              no_of_nights: data.no_of_nights.toString() ?? '0',
              commission: parseFloat(data.commission ?? '0'),
              cost: parseFloat(data.cost ?? '0'),
              resort: data.accomodation?.resorts_id,
              destination: data.accomodation?.resorts?.destination_id,
              country: data.accomodation?.resorts?.destination?.country_id,

              accomodation_id: data.accomodation_id,
              check_in_date_time: data.check_in_date_time ? new Date(data.check_in_date_time).toISOString() : null,
            })),
        };

        const validate_date = quote_mutate_schema.safeParse(payload_to_validate);

        if (validate_date.error) {
          console.log(validate_date.error);
          throw new Error('Invalid data');
        }
        return validate_date.data;
      } else {
        const parsedTravelDate = parse(response.travel_date, "yyyy-MM-dd", new Date());
        const payload_to_validate = {
          deal_type: response.deal_type,
          pre_booked_seats: response.pre_booked_seats,
          flight_meals: response.flight_meals,
          quote_id: response.id,
          transaction_id: response.transaction_id,
          lead_source: response.transaction?.lead_source,
          travel_date: format(parsedTravelDate, "dd-MM-yyyy HH:mm:ss"),
          main_tour_operator_id: response.main_tour_operator_id,
          sales_price: parseFloat(response.sales_price ?? '0'),
          commission: parseFloat(response.package_commission ?? '0'),
          discount: parseFloat(response.discounts ?? '0'),
          holiday_type_name: holiday.name,
          service_charge: parseFloat(response.service_charge ?? '0'),
          holiday_type: response.holiday_type_id,
          transfer_type: response.transfer_type,
          no_of_nights: response.num_of_nights.toString() ?? '0',
          title: response.title,
          quote_ref: response.quote_ref,
          agent_id: response.transaction?.user_id,
          client_id: response.transaction?.client_id,
          is_future_deal: response.is_future_deal,
          future_deal_date: response.future_deal_date,
          date_expiry: response.date_expiry ? format(response.date_expiry, 'yyyy-MM-dd') : null,
          adults: response.adult,
          children: response.child,
          infants: response.infant,

          // referralId: response.transaction.referrals ? response.transaction.referrals.id : undefined,
          // referrerId: response.transaction.referrals ? response.transaction.referrals.referrerId : undefined,
          // potentialCommission: response.transaction.referrals ? parseInt(response.transaction.referrals.potentialCommission) : undefined,

          passengers: response.passengers.map((data) => ({ type: data.type ?? "adult", age: data.age ?? 0 })),
          flights: response.flights.map((data) => ({
            ...data,
            departure_airport_name: data.departing_airport?.airport_name,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            departure_date_time: data.departure_date_time ? format(data.departure_date_time, "dd-MM-yyyy HH:mm:ss") : null,
            arrival_date_time: data.arrival_date_time ? format(data.arrival_date_time, "dd-MM-yyyy HH:mm:ss") : null,
          })),
          transfers: response.transfers.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            drop_off_time: data.drop_off_time ? new Date(data.drop_off_time).toISOString() : null,
            pick_up_time: data.pick_up_time ? new Date(data.pick_up_time).toISOString() : null,
          })),
          car_hire: response.car_hire.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            drop_off_time: data.drop_off_time ? new Date(data.drop_off_time).toISOString() : null,
            pick_up_time: data.pick_up_time ? new Date(data.pick_up_time).toISOString() : null,
          })),
          attraction_tickets: response.attraction_tickets.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            date_of_visit: data.date_of_visit ? new Date(data.date_of_visit).toISOString() : null,
          })),
          airport_parking: response.airport_parking.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            make: data.car_make,
            parking_date: data.parking_date ? new Date(data.parking_date).toISOString() : null,
          })),
          lounge_pass: response.lounge_pass.map((data) => ({
            ...data,
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            date_of_usage: data.date_of_usage ? new Date(data.date_of_usage).toISOString() : null,
          })),
          hotels: response.accomodation
            .filter((accomodation) => accomodation.is_primary === false)
            .map((data) => ({
              ...data,
              no_of_nights: data.no_of_nights.toString() ?? '0',
              commission: parseFloat(data.commission ?? '0'),
              cost: parseFloat(data.cost ?? '0'),
              resort: data.accomodation?.resorts_id,
              destination: data.accomodation?.resorts?.destination_id,
              country: data.accomodation?.resorts?.destination?.country_id,

              accomodation_id: data.accomodation_id,
              check_in_date_time: data.check_in_date_time ? new Date(data.check_in_date_time).toISOString() : null,
            })),
        };

        const validate_date = quote_mutate_schema.safeParse(payload_to_validate);

        if (validate_date.error) {
          console.log(validate_date.error);
          throw new Error('Invalid data');
        }
        return validate_date.data;
      }
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong fetching quote ', true, 500);
    }
  },

  //OPTIMIZE:
  fetchCruiseToUpdate: async (quote_id) => {
    try {
      const response = await db.query.quote.findFirst({
        where: eq(quote.id, quote_id),

        with: {
          passengers: true,
          flights: true,
          transfers: {
            with: {
              tour_operator: true,
            },
          },
          car_hire: {
            with: {
              tour_operator: true,
            },
          },
          attraction_tickets: {
            with: {
              tour_operator: true,
            },
          },
          airport_parking: {
            with: {
              tour_operator: true,
            },
          },
          lounge_pass: {
            with: {
              tour_operator: true,
            },
          },
          lodge: {
            with: {
              park: true,
            },
          },
          accomodation: {
            with: {
              accomodation: {
                with: {
                  resorts: {
                    with: {
                      destination: {
                        with: {
                          country: true,
                        },
                      },
                    },
                  },
                },
              },
              tour_operator: true,
            },
          },
          holiday_type: true,
          transaction: {
            with: {
              referrals: true,
            },
          },
          quote_cruise: {
            with: {
              cruise_extra: {
                with: {
                  cruise_extra: true,
                },
              },
              cruise_itinerary: true,
            },
          },
        },
      });
      if (!response) {
        throw new Error('Quote not found');
      }

      const parsedTravelDate = parse(response.travel_date, "yyyy-MM-dd", new Date());

      const payload_to_validate = {
        deal_type: response.deal_type,
        pre_booked_seats: response.pre_booked_seats,
        flight_meals: response.flight_meals,
        quote_id: response.id,
        transaction_id: response.transaction_id,
        travel_date: format(parsedTravelDate, "dd-MM-yyyy HH:mm:ss"),
        lead_source: response.transaction?.lead_source,
        main_tour_operator_id: response.main_tour_operator_id,
        sales_price: parseFloat(response.sales_price ?? '0'),
        commission: parseFloat(response.package_commission ?? '0'),
        discount: parseFloat(response.discounts ?? '0'),
        quote_type: response.quote_type,
        is_future_deal: response.is_future_deal,
        future_deal_date: response.future_deal_date,
        service_charge: parseFloat(response.service_charge ?? '0'),
        holiday_type: response.holiday_type_id,
        holiday_type_name: response.holiday_type?.name,
        date_expiry: response.date_expiry ? format(response.date_expiry, 'yyyy-MM-dd') : null,
        title: response.title,
        quote_ref: response.quote_ref,
        adults: response.adult ? response.adult : 0,
        children: response.child ? response.child : 0,
        infants: response.infant ? response.infant : 0,

        // referralId: response.transaction.referrals ? response.transaction.referrals.id : undefined,
        // referrerId: response.transaction.referrals ? response.transaction.referrals.referrerId : undefined,
        // potentialCommission: response.transaction.referrals ? parseInt(response.transaction.referrals.potentialCommission) : undefined,
        quote_cruise_id: response.quote_cruise.id,
        cruise_date: response.quote_cruise.cruise_date ? new Date(response.quote_cruise.cruise_date).toISOString() : null,
        cabin_type: response.quote_cruise.cabin_type,
        cruise_line: response.quote_cruise.cruise_line,
        cruise_ship: response.quote_cruise.ship ?? "N/A",
        cruise_name: response.quote_cruise.cruise_name,
        no_of_nights: response.num_of_nights.toString() ?? '0',

        transfer_type: response.transfer_type,
        agent_id: response.transaction?.user_id,
        client_id: response.transaction?.client_id,
        voyages: response.quote_cruise.cruise_itinerary.map((data) => ({ ...data, day_number: data.day_number ? data.day_number : 0 })),
        passengers: response.passengers.map((data) => ({ type: data.type ?? "adult", age: data.age ?? 0 })),
        hotels: response.accomodation
          .filter((accomodation) => accomodation.is_primary === false)
          .map((data) => ({
            ...data,
            no_of_nights: data.no_of_nights.toString() ?? '0',
            commission: parseFloat(data.commission ?? '0'),
            cost: parseFloat(data.cost ?? '0'),
            resort: data.accomodation?.resorts_id,
            destination: data.accomodation?.resorts?.destination_id,
            country: data.accomodation?.resorts?.destination?.country_id,

            accomodation_id: data.accomodation_id,
            check_in_date_time: data.check_in_date_time ? new Date(data.check_in_date_time).toISOString() : null,
          })),
        quote_cruise_extra: response.quote_cruise.cruise_extra.map((data) => data.cruise_extra_id),
        pre_cruise_stay: response.quote_cruise.pre_cruise_stay.toString(),
        post_cruise_stay: response.quote_cruise.post_cruise_stay.toString(),
        flights: response.flights.map((data) => ({
          ...data,
          commission: parseFloat(data.commission ?? '0'),
          cost: parseFloat(data.cost ?? '0'),
          departure_date_time: data.departure_date_time ? format(data.departure_date_time, "dd-MM-yyyy HH:mm:ss") : null,
          arrival_date_time: data.arrival_date_time ? format(data.arrival_date_time, "dd-MM-yyyy HH:mm:ss") : null,
        })),
        transfers: response.transfers.map((data) => ({
          ...data,
          commission: parseFloat(data.commission ?? '0'),
          cost: parseFloat(data.cost ?? '0'),
          drop_off_time: data.drop_off_time ? new Date(data.drop_off_time).toISOString() : null,
          pick_up_time: data.pick_up_time ? new Date(data.pick_up_time).toISOString() : null,
        })),
        car_hire: response.car_hire.map((data) => ({
          ...data,
          commission: parseFloat(data.commission ?? '0'),
          cost: parseFloat(data.cost ?? '0'),
          drop_off_time: data.drop_off_time ? new Date(data.drop_off_time).toISOString() : null,
          pick_up_time: data.pick_up_time ? new Date(data.pick_up_time).toISOString() : null,
        })),
        attraction_tickets: response.attraction_tickets.map((data) => ({
          ...data,
          commission: parseFloat(data.commission ?? '0'),
          cost: parseFloat(data.cost ?? '0'),
          date_of_visit: data.date_of_visit ? new Date(data.date_of_visit).toISOString() : null,
        })),
        airport_parking: response.airport_parking.map((data) => ({
          ...data,
          commission: parseFloat(data.commission ?? '0'),
          cost: parseFloat(data.cost ?? '0'),
          make: data.car_make,
          parking_date: data.parking_date ? new Date(data.parking_date).toISOString() : null,
        })),
        lounge_pass: response.lounge_pass.map((data) => ({
          ...data,
          commission: parseFloat(data.commission ?? '0'),
          cost: parseFloat(data.cost ?? '0'),
          date_of_usage: data.date_of_usage ? new Date(data.date_of_usage).toISOString() : null,
        })),
      };

      const validate_date = quote_mutate_schema.safeParse(payload_to_validate);

      if (validate_date.error) {
        console.log(validate_date.error);
        throw new Error('Invalid data');
      }
      return validate_date.data;
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong fetching quote ', true, 500);
    }
  },

  //OPTIMIZE:
  updateCruise: async (data, quote_id) => {
    try {
      const pre_process_data = await preProcessUpdate(quote_id, data);
      if (!data.transaction_id) {
        throw new AppError('Transaction id is required', true, 400);
      }
      await db.transaction(async (tx) => {
        const deletions = [
          { table: quote_flights, ids: pre_process_data.removedFlights },
          { table: quote_airport_parking, ids: pre_process_data.removedAirportParking },
          { table: quote_lounge_pass, ids: pre_process_data.removedLoungePass },
          { table: quote_attraction_ticket, ids: pre_process_data.removedAttractionTickets },
          { table: quote_car_hire, ids: pre_process_data.removedCarHire },
          { table: quote_transfers, ids: pre_process_data.removedTransfers },
          { table: quote_accomodation, ids: pre_process_data.removedHotels },
          // { table: passengers, ids: pre_process_data.removedPassengers },
        ].filter(Boolean);

        // Filter out empty lists and delete in batch
        await Promise.all(
          deletions
            .filter(({ ids }) => ids.length > 0) // Remove empty deletions
            .map(({ table, ids }) => tx.delete(table).where(inArray(table.id, ids)))
        );

        const sectorToAdd = [
          { table: quote_flights, data: pre_process_data.flightsToAdd },
          {
            table: quote_airport_parking,
            data: pre_process_data.airportParkingToAdd.map((parking) => ({
              ...parking,
              car_make: parking.make,
              car_model: parking.model,
              tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
            })),
          },
          {
            table: quote_lounge_pass,
            data: pre_process_data.loungePassToAdd.map((lounge) => ({
              ...lounge,
              tour_operator_id: lounge.is_included_in_package ? data.main_tour_operator_id : lounge.tour_operator_id,
            })),
          },
          {
            table: quote_attraction_ticket,
            data: pre_process_data.attractionTicketsToAdd.map((ticket) => ({
              ...ticket,
              tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
            })),
          },
          {
            table: quote_car_hire,
            data: pre_process_data.carHireToAdd.map((car) => ({
              ...car,
              tour_operator_id: car.is_included_in_package ? data.main_tour_operator_id : car.tour_operator_id,
            })),
          },
          {
            table: quote_transfers,
            data: pre_process_data.transfersToAdd.map((transfer) => ({
              ...transfer,
              tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
            })),
          },
          {
            table: quote_accomodation,
            data: pre_process_data.hotelsToAdd.map((hotel) => ({
              ...hotel,
              tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
            })),
          },
          // { table: passengers, data: pre_process_data.passengersToAdd },
        ].filter(Boolean);
        // Update the rest of the data
        await Promise.all(
          sectorToAdd
            .filter(({ data }) => data.length > 0) // Only process non-empty data sets
            .map(({ table, data }) =>
              tx.insert(table).values(
                data.map((item) => ({
                  ...item,
                  commission: item.commission.toString(),
                  cost: item.cost.toString(),
                  quote_id, // Ensure each item has a `quote_id`
                }))
              )
            )
        );
        const sectorToUpdate = [
          { table: quote_flights, data: pre_process_data.flightsToUpdate },
          {
            table: quote_airport_parking,
            data: pre_process_data.airportParkingToUpdate.map((parking) => ({
              ...parking,
              car_make: parking.make,
              car_model: parking.model,
              tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
              cost: parking.cost.toString(),
              commission: parking.commission.toString(),
            })),
          },
          {
            table: quote_lounge_pass,
            data: pre_process_data.loungePassToUpdate.map((lounge) => ({
              ...lounge,
              tour_operator_id: lounge.is_included_in_package ? data.main_tour_operator_id : lounge.tour_operator_id,
              cost: lounge.cost.toString(),
              commission: lounge.commission.toString(),
            })),
          },
          {
            table: quote_attraction_ticket,
            data: pre_process_data.attractionTicketsToUpdate.map((ticket) => ({
              ...ticket,
              tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
              cost: ticket.cost.toString(),
              commission: ticket.commission.toString(),
            })),
          },
          {
            table: quote_car_hire,
            data: pre_process_data.carHireToUpdate.map((car) => ({
              ...car,
              tour_operator_id: car.is_included_in_package ? data.main_tour_operator_id : car.tour_operator_id,
              cost: car.cost.toString(),
              commission: car.commission.toString(),
            })),
          },
          {
            table: quote_transfers,
            data: pre_process_data.transfersToUpdate.map((transfer) => ({
              ...transfer,
              tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
              cost: transfer.cost.toString(),
              commission: transfer.commission.toString(),
            })),
          },
          {
            table: quote_accomodation,
            data: pre_process_data.hotelsToUpdate.map((hotel) => ({
              ...hotel,
              tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
              cost: hotel.cost.toString(),
              commission: hotel.commission.toString(),
            })),
          },
          // { table: passengers, data: pre_process_data.passengersToAdd },
        ].filter(Boolean);

        // const sectorToUpdate = [
        //   { table: quote_flights, data: pre_process_data.flightsToUpdate },
        //   { table: quote_airport_parking, data: pre_process_data.airportParkingToUpdate },
        //   { table: quote_lounge_pass, data: pre_process_data.loungePassToUpdate },
        //   { table: quote_attraction_ticket, data: pre_process_data.attractionTicketsToUpdate },
        //   { table: quote_car_hire, data: pre_process_data.carHireToUpdate },
        //   { table: quote_transfers, data: pre_process_data.transfersToUpdate },
        //   { table: quote_accomodation, data: pre_process_data.hotelsToUpdate },
        //   // { table: passengers, data: pre_process_data.passengersToUpdate },
        // ].filter(Boolean);
        // if (pre_process_data.hotelsToUpdate.length > 0) {
        //   await Promise.all(
        //     pre_process_data.hotelsToUpdate.map(async (item) => {
        //       await tx
        //         .update(quote_accomodation)
        //         .set({ ...item })
        //         .where(eq(quote_accomodation.id, item.id));
        //     })
        //   );
        // }

        await Promise.all(
          sectorToUpdate
            .filter(({ data }) => data.length > 0) // Ensure non-empty updates
            .map(({ table, data }) =>
              Promise.all(
                data.map(async (item) => {
                  if (!item.id) {
                    return;
                  }
                  return tx
                    .update(table)
                    .set({ ...item, cost: item.cost.toString(), commission: item.commission.toString() }) // Ensure only necessary fields are updated
                    .where(eq(table.id, item.id));
                })
              )
            )
        );

        await tx.delete(passengers).where(eq(passengers.quote_id, quote_id));

        if (data.passengers && data.passengers.length > 0) {
          await tx.insert(passengers).values(data.passengers.map((item) => ({ type: item.type ?? "adult", age: item.age ?? 0, quote_id })));
        }

        if (data.voyages && data.voyages.length > 0 && data.quote_cruise_id) {
          await tx.delete(quote_cruise_itinerary).where(eq(quote_cruise_itinerary.quote_cruise_id, data.quote_cruise_id));
          await tx.insert(quote_cruise_itinerary).values(data.voyages.map((item) => ({ ...item, quote_cruise_id: data.quote_cruise_id })));
        }
        if (data.quote_cruise_extra && data.quote_cruise_extra.length > 0 && data.quote_cruise_id) {
          await tx.delete(quote_cruise_item_extra).where(eq(quote_cruise_item_extra.quote_cruise_id, data.quote_cruise_id));
          await tx
            .insert(quote_cruise_item_extra)
            .values(data.quote_cruise_extra.map((item) => ({ cruise_extra_id: item, quote_cruise_id: data.quote_cruise_id })));
        }
        console.log(data.cruise_ship, "<--- cruise ship");
        await tx.update(quote_cruise).set({
          cruise_date: data.cruise_date ? data.cruise_date : null,
          cabin_type: data.cabin_type,
          cruise_line: data.cruise_line,
          ship: data.cruise_ship,
          cruise_name: data.cruise_name,
          pre_cruise_stay: data.pre_cruise_stay ? (Number.isNaN(parseInt(data.pre_cruise_stay)) ? 0 : parseInt(data.pre_cruise_stay)) : 0,
          post_cruise_stay: data.post_cruise_stay ? (Number.isNaN(parseInt(data.post_cruise_stay)) ? 0 : parseInt(data.post_cruise_stay)) : 0,

          tour_operator_id: data.main_tour_operator_id,
        });

        const now = new Date();
        const plus2 = new Date(now);
        plus2.setDate(now.getDate() + 2);

        const date_expiry = data.is_future_deal ? null : data.date_expiry ? new Date(data.date_expiry) : plus2;

        // Calculate price_per_person based on sales_price and total travelers
        const adults = data.adults ?? 0;
        const children = data.children ?? 0;
        const totalTravelers = adults + children;
        const salesPrice = parseFloat(data.sales_price?.toString() ?? '0');
        const calculatedPricePerPerson = totalTravelers > 0
          ? (salesPrice / totalTravelers).toFixed(2)
          : "0.00";

        await tx
          .update(quote)
          .set({
            deal_type: data.deal_type,
            pre_booked_seats: data.pre_booked_seats,
            flight_meals: data.flight_meals,
            holiday_type_id: data.holiday_type,
            travel_date: data.travel_date,
            discounts: data.discount ? data.discount.toString() : '0',
            service_charge: data.service_charge ? data.service_charge.toString() : '0',
            quote_type: data.quote_type,
            sales_price: data.sales_price ? data.sales_price.toString() : '0',
            price_per_person: calculatedPricePerPerson,
            title: data.title,
            quote_ref: data.quote_ref,
            package_commission: data.commission ? data.commission.toString() : '0',
            num_of_nights: data.no_of_nights ? parseInt(data.no_of_nights) : 0,
            transfer_type: data.transfer_type ?? "N/A",
            infant: data.infants ? data.infants : 0,
            main_tour_operator_id: data.main_tour_operator_id,
            child: data.children ? data.children : 0,
            adult: data.adults ? data.adults : 0,
            is_future_deal: data.is_future_deal,
            future_deal_date: data.is_future_deal ? data.future_deal_date : null,
            quote_status: 'QUOTE_IN_PROGRESS',
            date_expiry: date_expiry,
          })
          .where(eq(quote.id, quote_id));

        if (data.referrerId && !data.referralId) {
          await tx.insert(referral).values({
            transactionId: data.transaction_id,
            referrerId: data.referrerId,
            potentialCommission: data.potentialCommission ? data.potentialCommission.toString() : '0',
            commission: '0',
          });
        } else if (data.referrerId && data.referralId) {
          await tx
            .update(referral)
            .set({
              referrerId: data.referrerId,
              potentialCommission: data.potentialCommission ? data.potentialCommission.toString() : '0',
            })
            .where(eq(referral.id, data.referralId));
        }

        await tx
          .update(transaction)
          .set({
            lead_source: data.lead_source,
          })
          .where(eq(transaction.id, data.transaction_id!));

        return;
      });
    } catch (error) {
      console.log(error);
      throw new AppError('something went wrong updating quote', true, 500);
    }
  },
  //OPTIMIZE:
  updateQuote: async (data, quote_id) => {
    try {
      const pre_process_data = await preProcessUpdate(quote_id, data);

      await db.transaction(async (tx) => {
        const deletions = [
          { table: quote_flights, ids: pre_process_data.removedFlights },
          { table: quote_airport_parking, ids: pre_process_data.removedAirportParking },
          { table: quote_lounge_pass, ids: pre_process_data.removedLoungePass },
          { table: quote_attraction_ticket, ids: pre_process_data.removedAttractionTickets },
          { table: quote_car_hire, ids: pre_process_data.removedCarHire },
          { table: quote_transfers, ids: pre_process_data.removedTransfers },
          { table: quote_accomodation, ids: pre_process_data.removedHotels },

          // { table: passengers, ids: pre_process_data.removedPassengers },
        ].filter(Boolean);

        // Filter out empty lists and delete in batch
        await Promise.all(
          deletions
            .filter(({ ids }) => ids.length > 0) // Remove empty deletions
            .map(({ table, ids }) => tx.delete(table).where(inArray(table.id, ids)))
        );

        const sectorToAdd = [
          { table: quote_flights, data: pre_process_data.flightsToAdd },
          {
            table: quote_airport_parking,
            data: pre_process_data.airportParkingToAdd.map((parking) => ({
              ...parking,
              car_make: parking.make,
              car_model: parking.model,
              tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
            })),
          },
          {
            table: quote_lounge_pass,
            data: pre_process_data.loungePassToAdd.map((lounge) => ({
              ...lounge,
              tour_operator_id: lounge.is_included_in_package ? data.main_tour_operator_id : lounge.tour_operator_id,
            })),
          },
          {
            table: quote_attraction_ticket,
            data: pre_process_data.attractionTicketsToAdd.map((ticket) => ({
              ...ticket,
              tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
            })),
          },
          {
            table: quote_car_hire,
            data: pre_process_data.carHireToAdd.map((car) => ({
              ...car,
              tour_operator_id: car.is_included_in_package ? data.main_tour_operator_id : car.tour_operator_id,
            })),
          },
          {
            table: quote_transfers,
            data: pre_process_data.transfersToAdd.map((transfer) => ({
              ...transfer,
              tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
            })),
          },
          {
            table: quote_accomodation,
            data: pre_process_data.hotelsToAdd.map((hotel) => ({
              ...hotel,
              tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
            })),
          },
          // { table: passengers, data: pre_process_data.passengersToAdd },
        ].filter(Boolean);
        // Update the rest of the data
        await Promise.all(
          sectorToAdd
            .filter(({ data }) => data.length > 0) // Only process non-empty data sets
            .map(({ table, data }) =>
              tx.insert(table).values(
                data.map((item) => ({
                  ...item,
                  cost: item.cost.toString(),
                  commission: item.commission.toString(),
                  quote_id, // Ensure each item has a `quote_id`
                }))
              )
            )
        );
        const sectorToUpdate = [
          { table: quote_flights, data: pre_process_data.flightsToUpdate },
          {
            table: quote_airport_parking,
            data: pre_process_data.airportParkingToUpdate.map((parking) => ({
              ...parking,
              car_make: parking.make,
              car_model: parking.model,
              tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
            })),
          },
          {
            table: quote_lounge_pass,
            data: pre_process_data.loungePassToUpdate.map((lounge) => ({
              ...lounge,
              tour_operator_id: lounge.is_included_in_package ? data.main_tour_operator_id : lounge.tour_operator_id,
            })),
          },
          {
            table: quote_attraction_ticket,
            data: pre_process_data.attractionTicketsToUpdate.map((ticket) => ({
              ...ticket,
              tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
            })),
          },
          {
            table: quote_car_hire,
            data: pre_process_data.carHireToUpdate.map((car) => ({
              ...car,
              tour_operator_id: car.is_included_in_package ? data.main_tour_operator_id : car.tour_operator_id,
            })),
          },
          {
            table: quote_transfers,
            data: pre_process_data.transfersToUpdate.map((transfer) => ({
              ...transfer,
              tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
            })),
          },
          {
            table: quote_accomodation,
            data: pre_process_data.hotelsToUpdate.map((hotel) => ({
              ...hotel,
              tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
            })),
          },
          // { table: passengers, data: pre_process_data.passengersToAdd },
        ].filter(Boolean);

        // if (pre_process_data.hotelsToUpdate.length > 0) {
        //   await Promise.all(
        //     pre_process_data.hotelsToUpdate.map(async (item) => {
        //       await tx
        //         .update(quote_accomodation)
        //         .set({ ...item })
        //         .where(eq(quote_accomodation.id, item.id));
        //     })
        //   );
        // }

        await Promise.all(
          sectorToUpdate
            .filter(({ data }) => data.length > 0) // Ensure non-empty updates
            .map(({ table, data }) =>
              Promise.all(
                data.map(async (item) => {
                  if (!item.id) {
                    return;
                  }
                  return tx
                    .update(table)
                    .set({ ...item, cost: item.cost.toString(), commission: item.commission.toString() }) // Ensure only necessary fields are updated
                    .where(eq(table.id, item.id));
                })
              )
            )
        );

        await tx.delete(passengers).where(eq(passengers.quote_id, quote_id));

        if (data.passengers && data.passengers.length > 0) {
          await tx.insert(passengers).values(data.passengers.map((item) => ({ type: item.type ?? "adult", age: item.age ?? 0, quote_id })));
        }
        if (data.accomodation_id) {
          await tx
            .update(quote_accomodation)
            .set({
              tour_operator_id: data.main_tour_operator_id,
              no_of_nights: data.no_of_nights ? parseInt(data.no_of_nights) : 0,
              room_type: data.room_type,
              board_basis_id: data.main_board_basis_id,
              check_in_date_time: data.check_in_date_time ? new Date(data.check_in_date_time) : null,
              accomodation_id: data.accomodation_id,
            })
            .where(and(eq(quote_accomodation.is_primary, true), eq(quote_accomodation.quote_id, quote_id)));
        }

        const now = new Date();
        const plus2 = new Date(now);
        plus2.setDate(now.getDate() + 2);
        const date_expiry = data.is_future_deal ? null : data.date_expiry ? new Date(data.date_expiry) : plus2;

        // Calculate price_per_person based on sales_price and total travelers
        const adults = data.adults ?? 0;
        const children = data.children ?? 0;
        const totalTravelers = adults + children;
        const salesPrice = parseFloat(data.sales_price?.toString() ?? '0');
        const calculatedPricePerPerson = totalTravelers > 0
          ? (salesPrice / totalTravelers).toFixed(2)
          : "0.00";

        await tx
          .update(quote)
          .set({
            pets: data.pets,
            deal_type: data.deal_type,
            pre_booked_seats: data.pre_booked_seats,
            flight_meals: data.flight_meals,
            holiday_type_id: data.holiday_type,
            lodge_id: data.lodge_id,
            cottage_id: data.cottage_id,
            travel_date: data.travel_date,
            discounts: data.discount ? data.discount.toString() : '0',
            title: data.title,
            quote_ref: data.quote_ref,
            service_charge: data.service_charge ? data.service_charge.toString() : '0',
            quote_type: data.quote_type,
            sales_price: data.sales_price ? data.sales_price.toString() : '0',
            price_per_person: calculatedPricePerPerson,
            package_commission: data.commission ? data.commission.toString() : '0',
            num_of_nights: data.no_of_nights ? parseInt(data.no_of_nights) : 0,
            transfer_type: data.transfer_type ?? "N/A",
            main_tour_operator_id: data.main_tour_operator_id,
            infant: data.infants ? data.infants : 0,
            child: data.children ? data.children : 0,
            adult: data.adults ? data.adults : 0,
            is_future_deal: data.is_future_deal,
            date_expiry: date_expiry,
            lodge_type: data.lodge_type ?? null,
            quote_status: 'QUOTE_IN_PROGRESS',
            future_deal_date: data.is_future_deal ? data.future_deal_date : null,
          })
          .where(eq(quote.id, quote_id));

        if (data.referrerId && !data.referralId) {
          await tx.insert(referral).values({
            transactionId: data.transaction_id,
            referrerId: data.referrerId,
            potentialCommission: data.potentialCommission ? data.potentialCommission.toString() : '0',
            commission: '0',
          });
        } else if (data.referrerId && data.referralId) {
          await tx
            .update(referral)
            .set({
              referrerId: data.referrerId,
              potentialCommission: data.potentialCommission ? data.potentialCommission.toString() : '0',
            })
            .where(eq(referral.id, data.referralId));
        }
        await tx
          .update(transaction)
          .set({
            lead_source: data.lead_source,
          })
          .where(eq(transaction.id, data.transaction_id!));
        return;
      });
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong updating quote ', true, 500);
    }
  },
  convertQuoteStatus: async (id, status) => {
    try {
      await db
        .update(quote)
        .set({
          quote_status: status as any,
        })
        .where(eq(quote.id, id));
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong updating quote ', true, 500);
    }
  },
  fetchQuotes: async (agentId, clientId, filters, page, limit) => {
    try {
      const pageNumber = page || 1;
      const pageSize = limit || 10;
      const offset = (pageNumber - 1) * pageSize;

      const query = db
        .select({
          id: quote.id,
          quote_status: quote.quote_status,
          travel_date: quote.travel_date,
          transaction_id: transaction.id,
          status: transaction.status,
          sales_price: quote.sales_price,
          package_commission: quote.package_commission,
          discount: quote.discounts,
          service_charge: quote.service_charge,
          holiday_type: package_type.name,
          client_name: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`.as('client_name'),
          agent_name: sql`${user.firstName} || ' ' || ${user.lastName}`.as('agent_name'),
          clientId: clientTable.id,
          agentId: user.id,
          agent_id: user.id,
          resorts: resorts.name,
          is_future_deal: quote.is_future_deal,
          lodge: lodges.lodge_name,
          title: quote.title,
          quote_ref: quote.quote_ref,
          cottage: cottages.cottage_name,
          cruise_destination: quote_cruise.cruise_name,
          date_created: quote.date_created,

          overall_commission: sql`
                 COALESCE((SELECT SUM(commission) FROM quote_flights WHERE quote_flights.quote_id = quote_table.id), 0)
                 + COALESCE((SELECT SUM(commission) FROM quote_airport_parking WHERE quote_airport_parking.quote_id = quote_table.id), 0)
                 + COALESCE((SELECT SUM(commission) FROM quote_lounge_pass WHERE quote_lounge_pass.quote_id = quote_table.id), 0)
                 + COALESCE((SELECT SUM(commission) FROM quote_attraction_ticket WHERE quote_attraction_ticket.quote_id = quote_table.id), 0)
                 + COALESCE((SELECT SUM(commission) FROM quote_car_hire WHERE quote_car_hire.quote_id = quote_table.id), 0)
                 + COALESCE((SELECT SUM(commission) FROM quote_transfers WHERE quote_transfers.quote_id = quote_table.id), 0)
                 + COALESCE((SELECT SUM(commission) FROM quote_accomodation WHERE quote_accomodation.quote_id = quote_table.id), 0)
                 + quote_table.package_commission
           
               `.as('overall_commission'),
          total_overall_commission: sql`SUM(
                 COALESCE((SELECT SUM(commission) FROM quote_flights WHERE quote_flights.quote_id = quote_table.id), 0)
                 + COALESCE((SELECT SUM(commission) FROM quote_airport_parking WHERE quote_airport_parking.quote_id = quote_table.id), 0)
                 + COALESCE((SELECT SUM(commission) FROM quote_lounge_pass WHERE quote_lounge_pass.quote_id = quote_table.id), 0)
                 + COALESCE((SELECT SUM(commission) FROM quote_attraction_ticket WHERE quote_attraction_ticket.quote_id = quote_table.id), 0)
                 + COALESCE((SELECT SUM(commission) FROM quote_car_hire WHERE quote_car_hire.quote_id = quote_table.id), 0)
                 + COALESCE((SELECT SUM(commission) FROM quote_transfers WHERE quote_transfers.quote_id = quote_table.id), 0)
                 + COALESCE((SELECT SUM(commission) FROM quote_accomodation WHERE quote_accomodation.quote_id = quote_table.id), 0)
                 + quote_table.package_commission
               ) OVER ()`.as('total_overall_commission'),
        })
        .from(transaction)
        .innerJoin(quote, eq(quote.transaction_id, transaction.id))
        .leftJoin(clientTable, eq(clientTable.id, transaction.client_id))
        .leftJoin(user, eq(user.id, transaction.user_id))
        .leftJoin(package_type, eq(package_type.id, quote.holiday_type_id))
        .leftJoin(quote_accomodation, eq(quote_accomodation.quote_id, quote.id))
        .leftJoin(accomodation_list, eq(accomodation_list.id, quote_accomodation.accomodation_id))
        .leftJoin(resorts, eq(resorts.id, accomodation_list.resorts_id))
        .leftJoin(lodges, eq(lodges.id, quote.lodge_id))
        .leftJoin(cottages, eq(cottages.id, quote.lodge_id))
        .leftJoin(quote_cruise, eq(quote_cruise.quote_id, quote.id))
        .groupBy(
          quote.id,
          quote.travel_date,
          transaction.id,
          transaction.status,
          quote.sales_price,
          quote.package_commission,
          quote.discounts,
          quote.service_charge,
          package_type.name,
          clientTable.firstName,
          clientTable.surename,
          user.firstName,
          user.lastName,
          clientTable.id,
          user.id,
          quote.date_created,
          resorts.name,
          lodges.lodge_name,
          cottages.cottage_name,
          quote_cruise.cruise_name
        )
        .orderBy(desc(quote.date_created));

      // Build filter conditions
      const filterConditions = [];
        filterConditions.push(isNotNull(transaction.client_id)); // Dummy condition to simplify logic
      // Base condition - filter by active quotes (unless is_active filter is provided)
      if (filters?.is_active !== undefined) {
        filterConditions.push(eq(quote.is_active, filters.is_active));
      } else {
        // Default to active quotes if no is_active filter is provided
        filterConditions.push(eq(quote.is_active, true));
      }

      // Status filter - if provided, use it; otherwise default to 'on_quote'
      if (filters?.status && filters.status !== 'all') {
        filterConditions.push(eq(transaction.status, filters.status as 'on_quote' | 'on_enquiry' | 'on_booking'));
      } else {
        // Default to 'on_quote' status if no specific status filter is provided
        filterConditions.push(eq(transaction.status, 'on_quote'));
      }

      // Agent and Client filters
      if (agentId && clientId) {
        filterConditions.push(and(eq(transaction.user_id, agentId), eq(transaction.client_id, clientId)));
      } else if (agentId && !clientId) {
        filterConditions.push(eq(transaction.user_id, agentId));
      } else if (!agentId && clientId) {
        filterConditions.push(eq(transaction.client_id, clientId));
      }

      // Additional filters
      if (filters) {
        // Quote status filter
        if (filters.quote_status && filters.quote_status !== 'all') {
          if (filters.quote_status === 'EXPIRED') {
            filterConditions.push(lt(quote.date_expiry, new Date()));
          } else {
            filterConditions.push(
              eq(
                quote.quote_status,
                filters.quote_status as
                | 'NEW_LEAD'
                | 'QUOTE_IN_PROGRESS'
                | 'QUOTE_CALL'
                | 'QUOTE_READY'
                | 'AWAITING_DECISION'
                | 'REQUOTE'
                | 'WON'
                | 'LOST'
                | 'INACTIVE'
                | 'EXPIRED'
              )
            );
          }
        }

        // Holiday type filter
        if (filters.holiday_type && filters.holiday_type !== 'all') {
          filterConditions.push(eq(package_type.name, filters.holiday_type));
        }

        // Travel date range filter
        if (filters.travel_date_from) {
          filterConditions.push(gte(quote.travel_date, filters.travel_date_from));
        }
        if (filters.travel_date_to) {
          filterConditions.push(lte(quote.travel_date, filters.travel_date_to));
        }

        // Sales price range filter
        if (filters.sales_price_min !== undefined) {
          filterConditions.push(gte(quote.sales_price, filters.sales_price_min.toString()));
        }
        if (filters.sales_price_max !== undefined) {
          filterConditions.push(lte(quote.sales_price, filters.sales_price_max.toString()));
        }

        // Future deal filter
        if (filters.is_future_deal !== undefined) {
          filterConditions.push(eq(quote.is_future_deal, filters.is_future_deal));
        }

        // Search filter - search across multiple fields
        if (filters.search) {
          const searchTerm = `%${filters.search}%`;
          const searchConditions = [
            ilike(quote.title, searchTerm),
            ilike(clientTable.firstName, searchTerm),
            ilike(clientTable.surename, searchTerm),
            ilike(sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`, searchTerm),
            ilike(user.firstName, searchTerm),
            ilike(user.lastName, searchTerm),
            ilike(sql`${user.firstName} || ' ' || ${user.lastName}`, searchTerm),
            ilike(resorts.name, searchTerm),
            ilike(lodges.lodge_name, searchTerm),
            ilike(cottages.cottage_name, searchTerm),
            ilike(quote_cruise.cruise_name, searchTerm),
          ];
          filterConditions.push(or(...searchConditions));
        }

        // Individual field filters
        if (filters.destination) {
          const destinationConditions = [
            ilike(resorts.name, `%${filters.destination}%`),
            ilike(lodges.lodge_name, `%${filters.destination}%`),
            ilike(cottages.cottage_name, `%${filters.destination}%`),
            ilike(quote_cruise.cruise_name, `%${filters.destination}%`),
          ];
          filterConditions.push(or(...destinationConditions));
        }

        if (filters.client_name) {
          filterConditions.push(ilike(sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`, `%${filters.client_name}%`));
        }

        if (filters.agent_name) {
          filterConditions.push(ilike(sql`${user.firstName} || ' ' || ${user.lastName}`, `%${filters.agent_name}%`));
        }
      }

      // Apply all filters
      if (filterConditions.length > 0) {
        query.where(and(...filterConditions));
      }

      // Get total count for pagination
      const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(transaction)
        .leftJoin(quote, eq(quote.transaction_id, transaction.id))
        .leftJoin(clientTable, eq(clientTable.id, transaction.client_id))
        .leftJoin(user, eq(user.id, transaction.user_id))
        .leftJoin(package_type, eq(package_type.id, quote.holiday_type_id))
        .leftJoin(quote_accomodation, eq(quote_accomodation.quote_id, quote.id))
        .leftJoin(accomodation_list, eq(accomodation_list.id, quote_accomodation.accomodation_id))
        .leftJoin(resorts, eq(resorts.id, accomodation_list.resorts_id))
        .leftJoin(lodges, eq(lodges.id, quote.lodge_id))
        .leftJoin(cottages, eq(cottages.id, quote.lodge_id))
        .leftJoin(quote_cruise, eq(quote_cruise.quote_id, quote.id))
        .groupBy(
          quote.id,
          quote.travel_date,
          transaction.id,
          transaction.status,
          quote.sales_price,
          quote.package_commission,
          quote.discounts,
          quote.service_charge,
          package_type.name,
          clientTable.firstName,
          clientTable.surename,
          user.firstName,
          user.lastName,
          clientTable.id,
          user.id,
          quote.date_created,
          resorts.name,
          lodges.lodge_name,
          cottages.cottage_name,
          quote_cruise.cruise_name
        );

      if (filterConditions.length > 0) {
        countQuery.where(and(...filterConditions));
      }

      const countResult = await countQuery;
      const total = countResult.length;

      // Apply pagination
      query.limit(pageSize).offset(offset);

      const fetchQuery = await query;

      return {
        data: fetchQuery.map((data) => ({
          ...data,
          quote_status: data.quote_status as string,
          status: data.status as 'on_quote' | 'on_enquiry' | 'on_booking',
          clientId: data.clientId as string,
          agent_id: data.agent_id as string,
          agent_name: data.agent_name as string,
          is_future_deal: data.is_future_deal || false,
          client_name: data.client_name as string,
          destination: data.resorts || data.lodge || data.cottage || data.cruise_destination,
          travel_date: new Date(data.travel_date!),
          date_created: new Date(data.date_created!).toISOString(),
          overall_commission: parseFloat(data.overall_commission as string),
          total_overall_commission: parseFloat(data.total_overall_commission as string),
          sales_price: parseFloat(data.sales_price as string),
          package_commission: parseFloat(data.package_commission as string),
          discount: parseFloat(data.discount as string),
          service_charge: parseFloat(data.service_charge as string),
        })),
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong fetching quotes', true, 500);
    }
  },
  setPrimary: async (primary_id, secondary_id, quote_status) => {
    try {
      await db
        .update(quote)
        .set({
          quote_type: 'secondary',
        })
        .where(eq(quote.id, primary_id));

      await db
        .update(quote)
        .set({ quote_type: 'primary', quote_status: quote_status as any })
        .where(eq(quote.id, secondary_id));

      return;
    } catch (error) {
      throw new AppError('Something went wrong setting primary quotes', true, 500);
    }
  },
  fetchQuoteTitle: async (client_id) => {
    try {
      const response = await db
        .select({
          id: quote.id,
          quote_type: quote.quote_type,
          title: quote.title,
          quote_ref: quote.quote_ref,
          holiday_type: package_type.name,
          transaction_id: quote.transaction_id,
          lodge_destination: park.city,
          cottage_destination: cottages.location,
          cruise_destination: quote_cruise.cruise_name,
          holiday_destination: destination.name,
          quote_status: quote.quote_status,
        })
        .from(quote)
        .innerJoin(transaction, eq(quote.transaction_id, transaction.id)) // Join transaction after quote
        .leftJoin(package_type, eq(quote.holiday_type_id, package_type.id)) // Now transaction is available
        .innerJoin(clientTable, eq(transaction.client_id, clientTable.id))
        .leftJoin(quote_cruise, eq(quote_cruise.quote_id, quote.id))
        .innerJoin(user, eq(transaction.user_id, user.id))
        .leftJoin(cottages, eq(quote.cottage_id, cottages.id))
        .leftJoin(lodges, eq(quote.lodge_id, lodges.id))
        .leftJoin(park, eq(lodges.park_id, park.id))
        .leftJoin(quote_accomodation, and(eq(quote_accomodation.quote_id, quote.id), eq(quote_accomodation.is_primary, true)))
        .leftJoin(accomodation_list, eq(quote_accomodation.accomodation_id, accomodation_list.id))
        .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
        .leftJoin(destination, eq(resorts.destination_id, destination.id))
        .where(and(eq(transaction.status, 'on_quote'), eq(transaction.client_id, client_id)))
        .groupBy(
          quote.id,
          quote.transaction_id,
          transaction.status,
          sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
          transaction.user_id,
          sql`${user.firstName} || ' ' || ${user.lastName}`,
          transaction.client_id,
          quote.num_of_nights,
          package_type.name,
          park.city,
          cottages.location,
          quote_cruise.cruise_name,
          quote.travel_date,
          destination.name
        )
        .orderBy(asc(sql`quote_status = 'LOST'`), desc(quote.date_created));

      const data = (response as z.infer<typeof quoteTitleSchema>[]).reduce<
        Record<string, { primary: z.infer<typeof quoteTitleSchema> | null; children: z.infer<typeof quoteChild>[] }>
      >((acc, item) => {
        const { id, transaction_id, quote_type, title, quote_status } = item;

        if (!acc[transaction_id]) {
          acc[transaction_id] = { primary: null, children: [] };
        }

        if (quote_type === 'primary') {
          acc[transaction_id].primary = { ...item };
        } else {
          acc[transaction_id].children.push({ id, title, status: quote_status });
        }
        return acc;
      }, {});

      const result = Object.values(data)
        .filter((group) => group.primary !== null)
        .map((group) => {
          const primary = group.primary!;
          return group.children.length > 0 ? { ...primary, children: group.children } : primary;
        });

      const validateQuote = z.array(quoteTitleSchema).safeParse(result);

      if (!validateQuote.success) {
        console.log(validateQuote.error);
        throw new AppError('Something went wrong fetching quote ', true, 500);
      }

      return validateQuote.data;
    } catch (error) {
      console.error(error);
      throw new AppError('Something went wrong fetching quote ', true, 500);
    }
  },
  deleteQuote: async (quote_id, deletionCode, deletedBy) => {
    try {
      const deletion_code_data = await db.select().from(deletion_codes).where(eq(deletion_codes.code, deletionCode));

      if (!deletion_code_data.length || deletion_code_data[0].is_used) {
        throw new AppError('Invalid deletion code', true, 400);
      }

      const now = new Date();

      await db
        .update(quote)
        .set({
          is_active: false,
          deletion_code: deletionCode,
          deleted_by_v2: deletedBy,
          deleted_at: now,
        })
        .where(eq(quote.id, quote_id));

      await db.update(deletion_codes).set({ is_used: true }).where(eq(deletion_codes.code, deletionCode));
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw new AppError('Failed to delete quote', true, 500);
    }
  },
  fetchFreeQuotesInfinite: async (
    search,
    country_id,
    package_type_id,
    min_price,
    schedule_filter, // NEW PARAMETER: 'today' | 'this_week' | 'this_month'
    max_price,
    start_date,
    end_date,

    cursor,
    limit
  ) => {
    try {

      console.log(schedule_filter);
      const pageSize = limit || 10;

      const query = db
        .select({
          id: quote.id,
          holiday_type: package_type.name,
          title: quote.title,
          park_id: park.id,
          quote_ref: quote.quote_ref,
          num_of_nights: quote.num_of_nights,
          lodge_destination: park.city,
          park_county: park.county,
          park_location: park.location,
          lodge_name: lodges.lodge_name,
          lodge_id: lodges.id,
          country: country.country_name,
          destination: destination.name,
          cottage_destination: cottages.location,
          cruise_destination: quote_cruise.cruise_name,
          holiday_destination: accomodation_list.name,
          accomodation_id: quote_accomodation.accomodation_id,
          resort_name: resorts.name,
          date_created: quote.date_created,
          tour_operator: tour_operator.name,
          sales_price: quote.sales_price,
          quote_status: quote.quote_status,
          price_per_person: quote.price_per_person,
          board_basis: board_basis.type,
          travel_date: quote.travel_date,
          onlySocialId: travelDeal.onlySocialsId,
          scheduledPostDate: travelDeal.postSchedule,
          hotel: sql<string[]>`array_agg(DISTINCT ${accomodation_list.name})`.as('hotel'),

          departure_airport: sql<string>`(
          SELECT airport_table.airport_name 
          FROM quote_flights 
          LEFT JOIN airport_table ON quote_flights.departing_airport_id = airport_table.id 
          WHERE quote_flights.quote_id = quote_table.id 
          ORDER BY quote_flights.departure_date_time ASC 
          LIMIT 1
        )`.as('departure_airport'),
          transfers: quote.transfer_type,
          postCount: db.$count(travelDeal, eq(travelDeal.quote_id, quote.id))
        })
        .from(quote)
        .leftJoin(travelDeal, eq(travelDeal.quote_id, quote.id))
        .leftJoin(transaction, eq(quote.transaction_id, transaction.id))
        .leftJoin(tour_operator, eq(quote.main_tour_operator_id, tour_operator.id))
        .leftJoin(package_type, eq(quote.holiday_type_id, package_type.id))
        .leftJoin(lodges, eq(quote.lodge_id, lodges.id))
        .leftJoin(park, eq(lodges.park_id, park.id))
        .leftJoin(cottages, eq(quote.cottage_id, cottages.id))
        .leftJoin(quote_cruise, eq(quote_cruise.quote_id, quote.id))
        .leftJoin(
          quote_accomodation,
          and(
            eq(quote_accomodation.quote_id, quote.id),
            eq(quote_accomodation.is_primary, true)
          )
        )
        .leftJoin(board_basis, eq(quote_accomodation.board_basis_id, board_basis.id))
        .leftJoin(accomodation_list, eq(quote_accomodation.accomodation_id, accomodation_list.id))
        .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
        .leftJoin(destination, eq(resorts.destination_id, destination.id))
        .leftJoin(country, eq(destination.country_id, country.id))

      const words = search?.trim().split(/\s+/).filter(Boolean) ?? [];

      const searchOrs = words.length
        ? words.map((word) =>
          or(
            ilike(quote.title, `%${word}%`),
            ilike(lodges.lodge_name, `%${word}%`),
            ilike(cottages.location, `%${word}%`),
            ilike(quote_cruise.cruise_name, `%${word}%`),
            ilike(destination.name, `%${word}%`),
            ilike(country.country_name, `%${word}%`),
            ilike(resorts.name, `%${word}%`),
            ilike(accomodation_list.name, `%${word}%`)
          )
        )
        : [];

      // ✅ NEW: Schedule date filter logic
      const getScheduleDateFilter = () => {
        if (!schedule_filter) return undefined;

        const now = new Date();

        switch (schedule_filter) {
          case 'today':
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date(now);
            todayEnd.setHours(23, 59, 59, 999);

            return and(
              gte(travelDeal.postSchedule, todayStart),
              lte(travelDeal.postSchedule, todayEnd)
            );

          case 'this_week':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
            endOfWeek.setHours(23, 59, 59, 999);

            return and(
              gte(travelDeal.postSchedule, startOfWeek),
              lte(travelDeal.postSchedule, endOfWeek)
            );

          case 'this_month':
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            startOfMonth.setHours(0, 0, 0, 0);

            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);

            return and(
              gte(travelDeal.postSchedule, startOfMonth),
              lte(travelDeal.postSchedule, endOfMonth)
            );

          default:
            return undefined;
        }
      };

      const filters = [
        ...searchOrs,
        package_type_id ? eq(quote.holiday_type_id, package_type_id) : undefined,
        country_id ? eq(country.id, country_id) : undefined,
        min_price ? gte(quote.sales_price, min_price) : undefined,
        max_price ? lte(quote.sales_price, max_price) : undefined,
        start_date ? gte(quote.travel_date, format(new Date(start_date), "yyyy-MM-dd")) : undefined,
        end_date ? lte(quote.travel_date, format(new Date(end_date), "yyyy-MM-dd")) : undefined,
        getScheduleDateFilter(), // ✅ NEW: Add schedule date filter
        cursor ? gt(quote.id, cursor) : undefined,
      ].filter(Boolean);
      console.log(filters.length, "filter Length")
      // ✅ Always include base conditions
      const baseConditions = [eq(quote.isQuoteCopy, false), eq(quote.isFreeQuote, true)];
      const whereClause = filters.length > 0
        ? and(...baseConditions, ...filters)
        : and(...baseConditions);

      const primaryOrder = (start_date || end_date)
        ? asc(quote.travel_date)
        : desc(quote.date_created);

      // Apply query with cursor-based pagination and tie-breaker
      const response = await query
        .where(whereClause)
        .groupBy(
          quote.id,
          package_type.name,
          quote.title,
          lodges.id,
          quote.quote_ref,
          park.county,
          park.location,
          park.city,
          park.id,
          quote.num_of_nights,
          lodges.lodge_name,
          country.country_name,
          cottages.location,
          quote_cruise.cruise_name,
          accomodation_list.name,
          quote_accomodation.accomodation_id,
          resorts.name,
          quote.date_created,
          tour_operator.name,
          quote.sales_price,
          quote.quote_status,
          quote.price_per_person,
          board_basis.type,
          quote.travel_date,
          destination.name,
          quote.transfer_type,
          travelDeal.onlySocialsId,
          travelDeal.postSchedule
        )
        .orderBy(primaryOrder, asc(quote.id))
        .limit(pageSize + 1);



      const accomIds = response
        .map(deal => deal.accomodation_id)
        .filter((id): id is string => !!id); // filter out undefined

      const allImages = await db.query.deal_images.findMany({
        where: accomIds.length > 0 ? inArray(deal_images.owner_id, accomIds) : undefined,
      });
      const imagesMap = allImages.reduce<Record<string, string[]>>((acc, img) => {
        if (!acc[img.owner_id]) acc[img.owner_id] = [];

        const url = img.image_url ?? " ";

        if (img.isPrimary) {
          // Put primary image at the front
          acc[img.owner_id].unshift(url);
        } else {
          acc[img.owner_id].push(url);
        }

        return acc;
      }, {});

      const hasMore = response.length > pageSize;
      const data = hasMore ? response.slice(0, pageSize) : response;
      const nextCursor = hasMore ? data[data.length - 1]?.id : null;


      const payload = response.map(data => {
        const accomId = data.accomodation_id;
        if (data.holiday_type === "Hot Tub Break") {
          console.log(data)
        }
        const destination = data.holiday_type === "Hot Tub Break" ? data.park_location : data.holiday_type == "Cruise Package" ? data.cruise_destination : `${data.country} ${data.destination}`

        return {
          id: data.id,
          onlySocialId: data.onlySocialId,
          scheduledPostDate: data.scheduledPostDate ? new Date(data.scheduledPostDate).toISOString() : null,
          tour_operator: data.tour_operator ?? 'N/A',
          departureAirport: data.departure_airport ?? 'N/A',
          hasPost: data.postCount > 0,
          luggageTransfers: data.transfers ?? 'N/A',
          travel_date: data.travel_date ? new Date(data.travel_date).toISOString() : null,
          title: data.title,
          holiday_type: data.holiday_type,
          hotel: data.holiday_type === "Hot Tub Break" ? data.lodge_name : data.holiday_type == "Cruise Package" ? data.cruise_destination : data.hotel[0],

          quote_ref: data.quote_ref,
          num_of_nights: data.num_of_nights.toString(),
          lodge_destination: data.lodge_destination ?? null,
          lodge_name: data.lodge_name ?? null,
          country: null,
          cottage_destination: data.cottage_destination ?? null,
          cruise_destination: data.cruise_destination ?? null,
          holiday_destination: data.holiday_destination ?? null,
          resort_name: null,
          date_created: new Date(data.date_created!).toISOString(),
          price_per_person: parseFloat(data.price_per_person),
          quote_status: data.quote_status,
          board_basis: data.board_basis ?? null,
          deal_images: accomId ? imagesMap[accomId] ?? [] : [],
          destination: destination ?? "No Destination",
        }
      })

      return {
        data: payload,
        nextCursor,
        hasMore,
      }

    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong fetching free quotes', true, 500);
    }
  },
  updateQuoteExpiry: async (id, date_expiry) => {
    try {
      const quote_data = await db.select().from(quote).where(eq(quote.id, id));

      if (!quote_data.length && !quote_data[0].transaction_id) {
        throw new AppError('Quote not found', true, 404);
      }

      // Ensure the date is in ISO format
      const expiryDate = new Date(date_expiry);
      if (isNaN(expiryDate.getTime())) {
        throw new AppError('Invalid date format', true, 400);
      }

      const now = new Date();
      const isExpired = expiryDate < now;
      const [updatedQuote] = await db
        .update(quote)
        .set({
          date_expiry: expiryDate,
        })
        .where(eq(quote.transaction_id, quote_data[0].transaction_id!))
        .returning();

      if (!updatedQuote) {
        throw new AppError('Quote not found', true, 404);
      }

      return updatedQuote;
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong updating quote expiry', true, 500);
    }
  },
  getDeletedQuotes: async (page, limit) => {
    try {
      const pageNumber = page || 1;
      const pageSize = limit || 10;
      const offset = (pageNumber - 1) * pageSize;

      // Count query for pagination
      const countQuery = db.select().from(quote).where(eq(quote.is_active, false));

      const countResult = await countQuery;
      const total = countResult.length;

      // Main query with pagination
      const quotes = await db
        .select({
          id: quote.id,
          quote_status: quote.quote_status,
          travel_date: quote.travel_date,
          transaction_id: quote.transaction_id,
          status: transaction.status,
          sales_price: quote.sales_price,
          package_commission: quote.package_commission,
          discount: quote.discounts,
          service_charge: quote.service_charge,
          holiday_type: package_type.name,
          client_name: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`.as('client_name'),
          title: quote.title,
          clientId: transaction.client_id,
          agent_id: transaction.user_id,
          agent_name: sql`${user.firstName} || ' ' || ${user.lastName}`.as('agent_name'),
          is_future_deal: quote.is_future_deal,
          date_created: quote.date_created,
          quote_ref: quote.quote_ref,
        })
        .from(quote)
        .leftJoin(transaction, eq(quote.transaction_id, transaction.id))
        .leftJoin(clientTable, eq(transaction.client_id, clientTable.id))
        .leftJoin(user, eq(transaction.user_id, user.id))
        .leftJoin(package_type, eq(quote.holiday_type_id, package_type.id))
        .where(eq(quote.is_active, false))
        .orderBy(desc(quote.deleted_at))
        .limit(pageSize)
        .offset(offset);
      if (quotes.length === 0) {
        return {
          data: [],
          pagination: {
            total: 0,
            page: pageNumber,
            limit: pageSize,
            totalPages: 0,
          },
        };
      }
      return {
        data: quotes.map((quote) => ({
          ...quote,
          quote_status: quote.quote_status as string,
          holiday_type: quote.holiday_type as string,
          is_future_deal: quote.is_future_deal || false,
          clientId: quote.clientId as string,
          agent_id: quote.agent_id as string,
          status: quote.status as 'on_quote' | 'on_enquiry' | 'on_booking',
          travel_date: new Date(quote.travel_date!),
          client_name: quote.client_name as string,
          agent_name: quote.agent_name as string,
          date_created: new Date(quote.date_created!).toISOString(),
          sales_price: parseFloat(quote.sales_price as string),
          package_commission: parseFloat(quote.package_commission as string),
          discount: parseFloat(quote.discount as string),
          service_charge: parseFloat(quote.service_charge as string),
        })),
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error('Error fetching deleted quotes:', error);
      throw new AppError('Something went wrong fetching deleted quotes', true, 500);
    }
  },
  setFutureDealDate: async (id: string, future_deal_date: string) => {
    try {
      await db
        .update(quote)
        .set({
          is_future_deal: true,
          future_deal_date: new Date(future_deal_date).toISOString(),
          date_expiry: null,
        })
        .where(eq(quote.id, id));
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong setting future deal', true, 500);
    }
  },
  unsetFutureDealDate: async (id: string, status?: string) => {
    try {
      const now = new Date();
      const plus7 = new Date(now);
      plus7.setDate(now.getDate() + 7);

      await db
        .update(quote)
        .set({
          is_future_deal: false,
          future_deal_date: null,
          date_expiry: plus7,
          ...(status && { quote_status: status as any }),
        })
        .where(eq(quote.id, id));
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong unsetting future deal', true, 500);
    }
  },
  insertTravelDeal: async (data, quote_id) => {
    const arr = data.hashtags.split(" ").map(word => word.replace("#", ""));
    const response = await db.insert(travelDeal).values({
      post: data.post,
      subtitle: data.subtitle,
      resortSummary: data.resortSummary,
      hashtags: arr,
      title: data.deal.title,
      travelDate: data.deal.travelDate,
      nights: parseInt(data.deal.nights),
      boardBasis: data.deal.boardBasis,
      departureAirport: data.deal.departureAirport,
      luggageTransfers: data.deal.luggageTransfers,
      price: data.deal.price,
      quote_id: quote_id,
    }).returning({
      id: travelDeal.id,
    });
    return response[0].id;
  },
  fetchTravelDeals: async (search, country_id, package_type_id, min_price, max_price, start_date, end_date, cursor, limit) => {
    try {

      const query = db.select({
        id: travelDeal.id,
        hashtags: travelDeal.hashtags,
        resortSummary: travelDeal.resortSummary,
        subtitle: travelDeal.subtitle,
        clientId: transaction.client_id,
        quoteId: quote.id,
        title: travelDeal.title,
        lodge_name: lodges.lodge_name,
        cottage_location: cottages.location,
        cruise_name: quote_cruise.cruise_name,
        accomodation_name: accomodation_list.name,
        subTitle: travelDeal.subtitle,
        travelDate: quote.travel_date,
        nights: travelDeal.nights,
        post: travelDeal.post,
        boardBasis: travelDeal.boardBasis,
        departureAirport: travelDeal.departureAirport,
        luggageTransfers: travelDeal.luggageTransfers,
        accomodation_id: quote_accomodation.accomodation_id,
        deal_id: quote.deal_id,
        price: travelDeal.price,
      }).from(travelDeal)
        .innerJoin(quote, eq(travelDeal.quote_id, quote.id))
        .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
        .leftJoin(quote_accomodation, and(eq(quote_accomodation.quote_id, quote.id), eq(quote_accomodation.is_primary, true)))
        .leftJoin(accomodation_list, eq(quote_accomodation.accomodation_id, accomodation_list.id))
        .leftJoin(lodges, eq(quote.lodge_id, lodges.id))
        .leftJoin(cottages, eq(quote.cottage_id, cottages.id))
        .leftJoin(quote_cruise, eq(quote_cruise.quote_id, quote.id))
        .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
        .leftJoin(destination, eq(resorts.destination_id, destination.id))
        .leftJoin(country, eq(destination.country_id, country.id))

      const words = search?.trim().split(/\s+/).filter(Boolean) ?? [];

      const searchOrs = words.map((word) =>
        or(
          like(quote.title, `%${word}%`),
          like(lodges.lodge_name, `%${word}%`),
          like(cottages.location, `%${word}%`),
          like(quote_cruise.cruise_name, `%${word}%`),
          like(destination.name, `%${word}%`),
          like(country.country_name, `%${word}%`),
          like(resorts.name, `%${word}%`),
          like(accomodation_list.name, `%${word}%`),
          eq(quote.deal_id, word)
        )
      );

      const filters = [
        ...searchOrs,
        package_type_id ? eq(quote.holiday_type_id, package_type_id) : undefined,
        country_id ? eq(country.id, country_id) : undefined,
        min_price ? gte(quote.sales_price, min_price) : undefined,
        max_price ? lte(quote.sales_price, max_price) : undefined,
        start_date ? gte(quote.travel_date, format(new Date(start_date), "yyyy-MM-dd")) : undefined,
        end_date ? lte(quote.travel_date, format(new Date(end_date), "yyyy-MM-dd")) : undefined,
        cursor ? gt(quote.id, cursor) : undefined, // cursor-based pagination
      ].filter(Boolean);

      const baseConditions = [eq(quote_accomodation.is_primary, true)];

      const whereClause = filters.length
        ? and(...baseConditions, ...filters)
        : and(...baseConditions);
      const order = (start_date || end_date)
        ? asc(quote.travel_date)               // sort by travel_date when filtering by date
        : desc(travelDeal.created_at);

      const deals = await query.where(whereClause).orderBy(order);

      // const response = await db.query.travelDeal.findMany({
      //   with: {
      //     quote: {
      //       columns: {
      //         id: true,
      //       },
      //       with: {
      //         transaction: {
      //           columns: {
      //             client_id: true,
      //           }
      //         },
      //         accomodation: {
      //           where: (accom, { eq }) => eq(accom.is_primary, true),
      //           with: {
      //             board_basis: true,
      //             accomodation: true,
      //           }
      //         },
      //         lodge: {
      //           with: {

      //             park: true
      //           }
      //         },
      //         cottage: true,
      //         quote_cruise: true,

      //       }

      //     }
      //   },
      //   orderBy: (deal, { desc }) => [desc(deal.created_at)],
      // });

      const accomIds = deals
        .map(deal => deal.accomodation_id)
        .filter((id): id is string => !!id); // filter out undefined

      const allImages = await db.query.deal_images.findMany({
        where: accomIds.length > 0 ? inArray(deal_images.owner_id, accomIds) : undefined,
      });

      // Map images to their owner_id
      const imagesMap = allImages.reduce<Record<string, string[]>>((acc, img) => {
        if (!acc[img.owner_id]) acc[img.owner_id] = [];

        const url = img.image_url ?? " ";

        if (img.isPrimary) {
          // Put primary image at the front
          acc[img.owner_id].unshift(url);
        } else {
          acc[img.owner_id].push(url);
        }

        return acc;
      }, {});


      // Attach images to each deal
      return deals.map(deal => {
        const accomId = deal.accomodation_id;
        const destination =
          deal.lodge_name ??
          deal.cottage_location ??
          deal.cruise_name ??
          deal.accomodation_name
        return {
          id: deal.id,
          post: deal.post || "N/A",
          hashtags: deal.hashtags && deal.hashtags.length > 0
            ? deal.hashtags.map(tag => `#${tag}`).join(', ')
            : " ",
          resortSummary: deal.resortSummary || "N/A",
          subtitle: deal.subtitle || "N/A",
          clientId: deal.clientId || "N/A",
          quoteId: deal.quoteId || "N/A",
          destination: destination || "No Destination",
          deal_id: deal.deal_id || "N/A",
          deal: {
            subtitle: deal.subtitle || "N/A",
            title: deal.title,
            travelDate: deal.travelDate!,
            nights: deal.nights.toString(),
            boardBasis: deal.boardBasis ?? 'N/A',
            departureAirport: deal.departureAirport ?? 'N/A',
            luggageTransfers: deal.luggageTransfers ?? 'N/A',
            price: deal.price ?? "0",
          },
          deal_images: accomId ? imagesMap[accomId] ?? [] : [],
        };
      });
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong fetching travel deals', true, 500);
    }
  },
  getLastId: async () => {
    const response = await db.query.quote.findMany({
      orderBy: desc(quote.date_created),
      limit: 1,
    });
    return response.length > 0 ? response[0].deal_id : null;
  }

};
