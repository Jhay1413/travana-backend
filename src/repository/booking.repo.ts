import { db } from '../db/db';
import { user } from '../schema/auth-schema';
import {
  booking,
  booking_accomodation,
  booking_airport_parking,
  booking_attraction_ticket,
  booking_car_hire,
  booking_flights,
  booking_lounge_pass,
  booking_transfers,
  booking_cruise,
  booking_cruise_item_extra,
  booking_cruise_itinerary,
} from '../schema/booking-schema';
import { clientTable } from '../schema/client-schema';
import { airport } from '../schema/flights-schema';
import { historicalBooking } from '../schema/historical-schema';
import { passengers } from '../schema/quote-schema';
import { referral } from '../schema/referral-schema';
import {
  accomodation_list,
  board_basis,
  cottages,
  country,
  cruise_extra_item,
  deletion_codes,
  destination,
  lodges,
  package_type,
  park,
  resorts,
  tour_operator,
  transaction,
} from '../schema/transactions-schema';
import {
  booking_mutate_schema,
  bookingForReportQuerySchema,
  bookingQuerySummarySchema,
  bookingReportQuerySchema,
  forwardsSchema,
  unifiedBookingSchema,
  bookingQuerySchema,
  bookingCruiseQuerySchema,
  bookingHotTubQuerySchema,
} from '../types/modules/booking';
import { endOfYear, startOfYear } from 'date-fns';
import { eq, sql, desc, or, and, asc, ilike, gte, lte, gt, lt, inArray, aliasedTable, ne, SQL, count } from 'drizzle-orm';
import z from 'zod';
import { dataValidator } from '../helpers/data-validator';
import { AppError } from '../middleware/errorHandler';
import { preProcessUpdate } from '../helpers/pre_process';
export type BookingRepo = {
  convertCruise: (transaction_id: string, data: z.infer<typeof booking_mutate_schema>) => Promise<{ id: string }>;
  convertPackage: (transaction_id: string, data: z.infer<typeof booking_mutate_schema>) => Promise<{ id: string }>;
  fetchHolidayTypeById: (booking_id: string) => Promise<string | undefined>;
  insert: (data: z.infer<typeof booking_mutate_schema>) => Promise<{ id: string }>;
  insertCruise: (data: z.infer<typeof booking_mutate_schema>) => Promise<{ id: string }>;
  fetchBookingSummaryByAgent: (
    id: string,
    type: string,
    isFetchAll?: boolean | null,
    agentToFetch?: string
  ) => Promise<z.infer<typeof bookingQuerySummarySchema>[]>;
  fetchPackageToUpdate: (booking_id: string) => Promise<z.infer<typeof booking_mutate_schema>>;
  fetchCruiseToUpdate: (booking_id: string) => Promise<z.infer<typeof booking_mutate_schema>>;
  updatePackage: (data: z.infer<typeof booking_mutate_schema>, booking_id: string) => Promise<void>;
  updateCruise: (data: z.infer<typeof booking_mutate_schema>, booking_id: string) => Promise<void>;
  fetchBookingReport: () => Promise<z.infer<typeof bookingReportQuerySchema>>;
  fetchBookings: (
    agentId?: string,
    clientId?: string,
    filters?: {
      search?: string;
      booking_status?: string;
      holiday_type?: string;
      travel_date_from?: string;
      travel_date_to?: string;
      sales_price_min?: string;
      sales_price_max?: string;
      destination?: string;
      is_future_deal?: string;
      client_name?: string;
      agent_name?: string;
      is_active?: boolean;
    },
    pagination?: {
      page?: number;
      limit?: number;
    }
  ) => Promise<{
    data: z.infer<typeof bookingForReportQuerySchema>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  delete: (booking_id: string, deletion_code: string, deleted_by: string) => Promise<void>;
  fetchBookingById: (booking_id: string) => Promise<z.infer<typeof unifiedBookingSchema>>;
  restore: (booking_id: string) => Promise<void>;
  fetchDeletedBookings: (
    page: number,
    limit: number
  ) => Promise<{
    data: z.infer<typeof bookingForReportQuerySchema>[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
  fetchHistoricalBookings: (id: string) => Promise<any[]>;
  fetchHistoricalBookingById: (id: string) => Promise<any>;
  fetchForwardCommission: () => Promise<z.infer<typeof forwardsSchema>[]>;
};

export const bookingRepo: BookingRepo = {
  convertCruise: async (transaction_id, data) => {
    return await db.transaction(async (tx) => {
      await tx
        .update(transaction)
        .set({
          status: 'on_booking',
          user_id: data.agent_id,
          client_id: data.client_id,
        })
        .where(eq(transaction.id, transaction_id));

      const [booking_id] = await tx
        .insert(booking)
        .values({
          transaction_id: transaction_id,
          holiday_type_id: data.holiday_type,
          hays_ref: data.hays_ref,
          supplier_ref: data.supplier_ref,
          is_active: true,
          sales_price: data.sales_price?.toString() ?? '0',
          package_commission: data.commission.toString() ?? '0',
          travel_date: data.travel_date,
          title: data.title,
          discounts: data.discount?.toString() ?? '0',
          service_charge: data.service_charge?.toString() ?? '0',
          num_of_nights: parseInt(data.no_of_nights ?? '0'),
          pets: data.pets ?? 0,
          cottage_id: data.cottage_id,
          lodge_id: data.lodge_id,
          lodge_type: data.lodge_type,
          transfer_type: data.transfer_type,
          infant: data.infants ?? 0,
          child: data.children ?? 0,
          adult: data.adults ?? 0,
          booking_status: 'BOOKED',
          main_tour_operator_id: data.main_tour_operator_id,
        })
        .returning({ id: booking.id });

      const [booking_cruise_id] = await tx
        .insert(booking_cruise)
        .values({
          cruise_line: data.cruise_line,
          ship: data.cruise_ship,
          cruise_date: data.cruise_date ? data.cruise_date : null,
          cabin_type: data.cabin_type,
          cruise_name: data.cruise_name,
          tour_operator_id: data.main_tour_operator_id,
          pre_cruise_stay: data.pre_cruise_stay ? parseInt(data.pre_cruise_stay) : 0,
          post_cruise_stay: data.post_cruise_stay ? parseInt(data.post_cruise_stay) : 0,
          booking_id: booking_id.id,
        })
        .returning({ id: booking_cruise.id });

      const cruise_data = [
        { table: booking_cruise_itinerary, data: data.voyages?.map((data) => ({ ...data, booking_cruise_id: booking_cruise_id.id })) ?? [] },
        {
          table: booking_cruise_item_extra,
          data: data.booking_cruise_extra?.map((data) => ({ cruise_extra_id: data, booking_cruise_id: booking_cruise_id.id })) ?? [],
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
            booking_id: booking_id.id,
          }))
        );
      }
      const sectorToAdd = [
        {
          table: booking_accomodation,
          data:
            data.hotels?.map((hotel) => ({
              ...hotel,
              cost: hotel.cost ? hotel.cost : 0,
              commission: hotel.commission ? hotel.commission : 0,
              check_in_date_time: new Date(hotel.check_in_date_time),
              tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_flights,
          data:
            data.flights?.map((flight) => ({
              ...flight,
              cost: flight.cost ? flight.cost : 0,
              tour_operator_id: data.main_tour_operator_id,
              commission: flight.commission ? flight.commission : 0,
              departure_date_time: new Date(flight.departure_date_time),
              arrival_date_time: new Date(flight.arrival_date_time),
            })) ?? [],
        },
        {
          table: booking_airport_parking,
          data:
            data.airport_parking?.map((parking) => ({
              ...parking,
              car_make: parking.make,
              car_model: parking.model,
              cost: parking.cost ? parking.cost : 0,
              commission: parking.commission ? parking.commission : 0,
              parking_date: new Date(parking.parking_date),
              tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_lounge_pass,
          data:
            data.lounge_pass?.map((lounge) => ({
              ...lounge,
              cost: lounge.cost ? lounge.cost : 0,
              commission: lounge.commission ? lounge.commission : 0,
              date_of_usage: new Date(lounge.date_of_usage),
              tour_operator_id: lounge.is_included_in_package ? data.main_tour_operator_id : lounge.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_attraction_ticket,
          data:
            data.attraction_tickets?.map((ticket) => ({
              ...ticket,
              cost: ticket.cost ? ticket.cost : 0,
              commission: ticket.commission ? ticket.commission : 0,
              date_of_visit: new Date(ticket.date_of_visit),
              tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_car_hire,
          data:
            data.car_hire?.map((car) => ({
              ...car,
              cost: car.cost ? car.cost : 0,
              pick_up_time: new Date(car.pick_up_time),
              drop_off_time: new Date(car.drop_off_time),
              commission: car.commission ? car.commission : 0,
              tour_operator_id: car.is_included_in_package ? data.main_tour_operator_id : car.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_transfers,
          data:
            data.transfers?.map((transfer) => ({
              ...transfer,
              pick_up_time: new Date(transfer.pick_up_time),
              drop_off_time: new Date(transfer.drop_off_time),
              cost: transfer.cost ? transfer.cost : 0,
              commission: transfer.commission ? transfer.commission : 0,
              tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
            })) ?? [],
        },
      ];

      await Promise.all(
        sectorToAdd
          .filter(({ data }) => data.length > 0)
          .map(({ table, data }) =>
            tx.insert(table).values(
              data.map((item) => ({
                ...item,
                booking_id: booking_id.id,
                commission: item.commission.toString(),
                cost: item.cost.toString(),
              }))
            )
          )
      );
      return { id: booking_id.id };
    });
  },
  convertPackage: async (transaction_id, data) => {
    const holiday_type = await db.query.package_type.findFirst({
      where: eq(package_type.id, data.holiday_type),
    });

    return await db.transaction(async (tx) => {
      await tx
        .update(transaction)
        .set({
          status: 'on_booking',
          user_id: data.agent_id,
          client_id: data.client_id,
        })
        .where(eq(transaction.id, transaction_id));

      const [booking_id] = await tx
        .insert(booking)
        .values({
          transaction_id: transaction_id,
          holiday_type_id: data.holiday_type,
          hays_ref: data.hays_ref,
          supplier_ref: data.supplier_ref,
          is_active: true,
          sales_price: data.sales_price?.toString() ?? '0',
          package_commission: data.commission.toString() ?? '0',
          travel_date: data.travel_date,
          title: data.title,
          discounts: data.discount?.toString() ?? '0',
          service_charge: data.service_charge?.toString() ?? '0',
          num_of_nights: parseInt(data.no_of_nights ?? '0'),
          pets: data.pets ?? 0,
          cottage_id: data.cottage_id,
          lodge_id: data.lodge_id,
          lodge_type: data.lodge_type,
          transfer_type: data.transfer_type,
          infant: data.infants ?? 0,
          child: data.children ?? 0,
          adult: data.adults ?? 0,
          booking_status: 'BOOKED',
          main_tour_operator_id: data.main_tour_operator_id,
        })
        .returning({ id: booking.id });

      if (holiday_type?.name === 'Package Holiday') {
        await tx.insert(booking_accomodation).values({
          booking_id: booking_id.id,
          tour_operator_id: data.main_tour_operator_id,
          no_of_nights: data.no_of_nights ? parseInt(data.no_of_nights) : 0,
          room_type: data.room_type,
          check_in_date_time: new Date(data.check_in_date_time!),
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
            booking_id: booking_id.id,
          }))
        );
      }
      const sectorToAdd = [
        {
          table: booking_accomodation,
          data:
            data.hotels?.map((hotel) => ({
              ...hotel,
              cost: hotel.cost ? hotel.cost : 0,
              commission: hotel.commission ? hotel.commission : 0,
              check_in_date_time: new Date(hotel.check_in_date_time),
              tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_flights,
          data:
            data.flights?.map((flight) => ({
              ...flight,
              cost: flight.cost ? flight.cost : 0,
              tour_operator_id: data.main_tour_operator_id,
              commission: flight.commission ? flight.commission : 0,
              departure_date_time: new Date(flight.departure_date_time),
              arrival_date_time: new Date(flight.arrival_date_time),
            })) ?? [],
        },
        {
          table: booking_airport_parking,
          data:
            data.airport_parking?.map((parking) => ({
              ...parking,
              car_make: parking.make,
              car_model: parking.model,
              parking_date: new Date(parking.parking_date),
              cost: parking.cost ? parking.cost : 0,
              commission: parking.commission ? parking.commission : 0,
              tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_lounge_pass,
          data:
            data.lounge_pass?.map((lounge) => ({
              ...lounge,
              cost: lounge.cost ? lounge.cost : 0,
              commission: lounge.commission ? lounge.commission : 0,
              date_of_usage: new Date(lounge.date_of_usage),
              tour_operator_id: lounge.is_included_in_package ? data.main_tour_operator_id : lounge.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_attraction_ticket,
          data:
            data.attraction_tickets?.map((ticket) => ({
              ...ticket,
              cost: ticket.cost ? ticket.cost : 0,
              commission: ticket.commission ? ticket.commission : 0,
              date_of_visit: new Date(ticket.date_of_visit),
              tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_car_hire,
          data:
            data.car_hire?.map((car) => ({
              ...car,
              pick_up_time: new Date(car.pick_up_time),
              drop_off_time: new Date(car.drop_off_time),
              cost: car.cost ? car.cost : 0,
              commission: car.commission ? car.commission : 0,
              tour_operator_id: car.is_included_in_package ? data.main_tour_operator_id : car.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_transfers,
          data:
            data.transfers?.map((transfer) => ({
              ...transfer,
              pick_up_time: new Date(transfer.pick_up_time),
              drop_off_time: new Date(transfer.drop_off_time),
              cost: transfer.cost ? transfer.cost : 0,
              commission: transfer.commission ? transfer.commission : 0,
              tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
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
                booking_id: booking_id.id,
                commission: item.commission.toString(),
                cost: item.cost.toString(),
              }))
            )
          )
      );
      return { id: booking_id.id };
    });
  },
  fetchHolidayTypeById: async (booking_id: string) => {
    const response = await db.query.booking.findFirst({
      where: eq(booking.id, booking_id),
      with: {
        holiday_type: true,
      },
    });
    return response?.holiday_type.name;
  },
  insert: async (data) => {
    const holiday_type = await db.query.package_type.findFirst({
      where: eq(package_type.id, data.holiday_type),
    });

    return await db.transaction(async (tx) => {
      const [transaction_data] = await tx
        .insert(transaction)
        .values({
          status: 'on_booking',
          user_id: data.agent_id,
          client_id: data.client_id,
          lead_source: data.lead_source,
        })
        .returning({ id: transaction.id });

      const [booking_id] = await tx
        .insert(booking)
        .values({
          transaction_id: transaction_data.id,
          holiday_type_id: data.holiday_type,
          hays_ref: data.hays_ref,
          supplier_ref: data.supplier_ref,
          is_active: true,
          sales_price: data.sales_price?.toString() ?? '0',
          package_commission: data.commission.toString() ?? '0',
          travel_date: data.travel_date,
          title: data.title,
          discounts: data.discount?.toString() ?? '0',
          service_charge: data.service_charge?.toString() ?? '0',
          num_of_nights: parseInt(data.no_of_nights ?? '0'),
          pets: data.pets ?? 0,
          cottage_id: data.cottage_id,
          lodge_id: data.lodge_id,
          lodge_type: data.lodge_type,
          transfer_type: data.transfer_type,
          infant: data.infants ?? 0,
          child: data.children ?? 0,
          adult: data.adults ?? 0,
          booking_status: 'BOOKED',
          main_tour_operator_id: data.main_tour_operator_id,
        })
        .returning({ id: booking.id });

      if (holiday_type?.name === 'Package Holiday') {
        await tx.insert(booking_accomodation).values({
          booking_id: booking_id.id,
          tour_operator_id: data.main_tour_operator_id,
          no_of_nights: parseInt(data.no_of_nights ?? '0'),
          room_type: data.room_type,
          check_in_date_time: new Date(data.check_in_date_time!),
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
            booking_id: booking_id.id,
          }))
        );
      }
      const sectorToAdd = [
        {
          table: booking_accomodation,
          data:
            data.hotels?.map((hotel) => ({
              ...hotel,
              cost: hotel.cost ? hotel.cost : 0,
              commission: hotel.commission ? hotel.commission : 0,
              check_in_date_time: new Date(hotel.check_in_date_time),
              tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_flights,
          data:
            data.flights?.map((flight) => ({
              ...flight,
              cost: flight.cost ? flight.cost : 0,
              tour_operator_id: data.main_tour_operator_id,
              commission: flight.commission ? flight.commission : 0,
              departure_date_time: new Date(flight.departure_date_time),
              arrival_date_time: new Date(flight.arrival_date_time),
            })) ?? [],
        },
        {
          table: booking_airport_parking,
          data:
            data.airport_parking?.map((parking) => ({
              ...parking,
              parking_date: new Date(parking.parking_date),
              car_make: parking.make,
              car_model: parking.model,
              cost: parking.cost ? parking.cost : 0,
              commission: parking.commission ? parking.commission : 0,
              tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_lounge_pass,
          data:
            data.lounge_pass?.map((lounge) => ({
              ...lounge,
              cost: lounge.cost ? lounge.cost : 0,
              commission: lounge.commission ? lounge.commission : 0,
              date_of_usage: new Date(lounge.date_of_usage),
              tour_operator_id: lounge.is_included_in_package ? data.main_tour_operator_id : lounge.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_attraction_ticket,
          data:
            data.attraction_tickets?.map((ticket) => ({
              ...ticket,
              cost: ticket.cost ? ticket.cost : 0,
              commission: ticket.commission ? ticket.commission : 0,
              date_of_visit: new Date(ticket.date_of_visit),
              tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_car_hire,
          data:
            data.car_hire?.map((car) => ({
              ...car,
              pick_up_time: new Date(car.pick_up_time),
              drop_off_time: new Date(car.drop_off_time),
              cost: car.cost ? car.cost : 0,
              commission: car.commission ? car.commission : 0,
              tour_operator_id: car.is_included_in_package ? data.main_tour_operator_id : car.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_transfers,
          data:
            data.transfers?.map((transfer) => ({
              ...transfer,
              pick_up_time: new Date(transfer.pick_up_time),
              drop_off_time: new Date(transfer.drop_off_time),
              cost: transfer.cost ? transfer.cost : 0,
              commission: transfer.commission ? transfer.commission : 0,
              tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
            })) ?? [],
        },
      ];

      await Promise.all(
        sectorToAdd
          .filter(({ data }) => data.length > 0)
          .map(({ table, data }) =>
            tx.insert(table).values(
              data.map((item) => ({
                ...item,
                booking_id: booking_id.id,
                commission: item.commission.toString(),
                cost: item.cost.toString(),
              }))
            )
          )
      );
      if (data.referrerId) {
        await tx.insert(referral).values({
          transactionId: transaction_data.id,
          referrerId: data.referrerId,
          potentialCommission: data.potentialCommission?.toString() || '0',
          commission: '0',
        });
      }
      return { id: booking_id.id };
    });
  },
  insertCruise: async (data) => {
    return await db.transaction(async (tx) => {
      const [transaction_data] = await tx
        .insert(transaction)
        .values({
          status: 'on_booking',
          user_id: data.agent_id,

          client_id: data.client_id,
          lead_source: data.lead_source,
        })
        .returning({ id: transaction.id });

      const [booking_id] = await tx
        .insert(booking)
        .values({
          transaction_id: transaction_data.id,
          holiday_type_id: data.holiday_type,
          hays_ref: data.hays_ref,
          supplier_ref: data.supplier_ref,
          is_active: true,
          sales_price: data.sales_price?.toString() ?? '0',
          package_commission: data.commission.toString() ?? '0',
          travel_date: data.travel_date,
          title: data.title,
          discounts: data.discount?.toString() ?? '0',
          service_charge: data.service_charge?.toString() ?? '0',
          num_of_nights: parseInt(data.no_of_nights ?? '0'),
          pets: data.pets ?? 0,
          cottage_id: data.cottage_id,
          lodge_id: data.lodge_id,
          lodge_type: data.lodge_type,
          transfer_type: data.transfer_type,
          infant: data.infants ?? 0,
          child: data.children ?? 0,
          adult: data.adults ?? 0,
          booking_status: 'BOOKED',
          main_tour_operator_id: data.main_tour_operator_id,
        })
        .returning({ id: booking.id });

      const [booking_cruise_id] = await tx
        .insert(booking_cruise)
        .values({
          cruise_line: data.cruise_line,
          ship: data.cruise_ship,
          cruise_date: data.cruise_date ? data.cruise_date : null,
          cabin_type: data.cabin_type,
          cruise_name: data.cruise_name,
          tour_operator_id: data.main_tour_operator_id,
          pre_cruise_stay: data.pre_cruise_stay ? parseInt(data.pre_cruise_stay) : 0,
          post_cruise_stay: data.post_cruise_stay ? parseInt(data.post_cruise_stay) : 0,
          booking_id: booking_id.id,
        })
        .returning({ id: booking_cruise.id });

      const cruise_data = [
        { table: booking_cruise_itinerary, data: data.voyages?.map((data) => ({ ...data, booking_cruise_id: booking_cruise_id.id })) ?? [] },
        {
          table: booking_cruise_item_extra,
          data: data.booking_cruise_extra?.map((data) => ({ cruise_extra_id: data, booking_cruise_id: booking_cruise_id.id })) ?? [],
        },
      ];

      await Promise.all(
        cruise_data.filter(({ data }) => data.length > 0).map(({ table, data }) => tx.insert(table).values(data.map((item) => item)))
      );

      if (data.passengers && data.passengers.length > 0) {
        await tx.insert(passengers).values(
          data.passengers.map((data) => ({
            type: data.type,
            age: data.age ? data.age : 0,
            booking_id: booking_id.id,
          }))
        );
      }
      const sectorToAdd = [
        {
          table: booking_accomodation,
          data:
            data.hotels?.map((hotel) => ({
              ...hotel,
              cost: hotel.cost ? hotel.cost : 0,
              commission: hotel.commission ? hotel.commission : 0,
              check_in_date_time: new Date(hotel.check_in_date_time),
              tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_flights,
          data:
            data.flights?.map((flight) => ({
              ...flight,
              cost: flight.cost ? flight.cost : 0,
              tour_operator_id: data.main_tour_operator_id,
              commission: flight.commission ? flight.commission : 0,
              departure_date_time: new Date(flight.departure_date_time),
              arrival_date_time: new Date(flight.arrival_date_time),
            })) ?? [],
        },
        {
          table: booking_airport_parking,
          data:
            data.airport_parking?.map((parking) => ({
              ...parking,
              parking_date: new Date(parking.parking_date),

              car_make: parking.make,
              car_model: parking.model,
              cost: parking.cost ? parking.cost : 0,
              commission: parking.commission ? parking.commission : 0,
              tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_lounge_pass,
          data:
            data.lounge_pass?.map((lounge) => ({
              ...lounge,

              cost: lounge.cost ? lounge.cost : 0,
              commission: lounge.commission ? lounge.commission : 0,
              date_of_usage: new Date(lounge.date_of_usage),
              tour_operator_id: lounge.is_included_in_package ? data.main_tour_operator_id : lounge.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_attraction_ticket,
          data:
            data.attraction_tickets?.map((ticket) => ({
              ...ticket,
              cost: ticket.cost ? ticket.cost : 0,
              commission: ticket.commission ? ticket.commission : 0,
              date_of_visit: new Date(ticket.date_of_visit),
              tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_car_hire,
          data:
            data.car_hire?.map((car) => ({
              ...car,
              pick_up_time: new Date(car.pick_up_time),
              drop_off_time: new Date(car.drop_off_time),
              cost: car.cost ? car.cost : 0,
              commission: car.commission ? car.commission : 0,
              tour_operator_id: car.is_included_in_package ? data.main_tour_operator_id : car.tour_operator_id,
            })) ?? [],
        },
        {
          table: booking_transfers,
          data:
            data.transfers?.map((transfer) => ({
              ...transfer,
              pick_up_time: new Date(transfer.pick_up_time),
              drop_off_time: new Date(transfer.drop_off_time),
              cost: transfer.cost ? transfer.cost : 0,
              commission: transfer.commission ? transfer.commission : 0,
              tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
            })) ?? [],
        },
      ];

      await Promise.all(
        sectorToAdd
          .filter(({ data }) => data.length > 0)
          .map(({ table, data }) =>
            tx.insert(table).values(
              data.map((item) => ({
                ...item,
                booking_id: booking_id.id,
                commission: item.commission.toString(),
                cost: item.cost.toString(),
              }))
            )
          )
      );
      if (data.referrerId) {
        await tx.insert(referral).values({
          transactionId: transaction_data.id,
          referrerId: data.referrerId,
          potentialCommission: data.potentialCommission?.toString() || '0',
          commission: '0',
        });
      }
      return { id: booking_id.id };
    });
  },
  fetchBookingSummaryByAgent: async (id, type, isFetchAll, agentToFetch) => {
    const agent = await db.query.user.findFirst({
      where: eq(user.id, id),
    });

    const query = db
      .select({
        id: booking.id,
        transaction_id: transaction.id,
        status: transaction.status,
        hays_ref: booking.hays_ref,
        supplier_ref: booking.supplier_ref,
        title: booking.title,
        clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`.as('clientName'),
        agent_id: transaction.user_id,
        agentName: sql`${user.firstName} || ' ' || ${user.lastName}`.as('agentName'),
        clientId: transaction.client_id,
        no_of_nights: booking.num_of_nights,
        holiday_type: package_type.name,
        lodge_destination: park.city,
        cottage_destination: cottages.location,
        cruise_destination: booking_cruise.cruise_name,
        holiday_destination: destination.name,
        booking_status: booking.booking_status,
        travel_date: booking.travel_date,

        // Subqueries for commissions
        overall_commission: sql`
      COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
      + booking_table.package_commission
     
    `.as('overall_commission'),

        overall_cost: sql`
      COALESCE((SELECT SUM(cost) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(cost) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(cost) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(cost) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(cost) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(cost) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(cost) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
      - booking_table.discounts
      + booking_table.service_charge
      + booking_table.sales_price
    `.as('overall_cost'),
      })
      .from(booking)
      .innerJoin(transaction, eq(transaction.id, booking.transaction_id))
      .leftJoin(package_type, eq(booking.holiday_type_id, package_type.id))
      .innerJoin(clientTable, eq(transaction.client_id, clientTable.id))
      .leftJoin(booking_cruise, eq(booking_cruise.booking_id, booking.id))
      .innerJoin(user, eq(transaction.user_id, user.id))
      .leftJoin(cottages, eq(booking.cottage_id, cottages.id))
      .leftJoin(lodges, eq(booking.lodge_id, lodges.id))
      .leftJoin(park, eq(lodges.park_id, park.id))
      .leftJoin(booking_accomodation, and(eq(booking_accomodation.booking_id, booking.id), eq(booking_accomodation.is_primary, true)))
      .leftJoin(accomodation_list, eq(booking_accomodation.accomodation_id, accomodation_list.id))
      .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
      .leftJoin(destination, eq(resorts.destination_id, destination.id))
      // **GROUP BY**
      .groupBy(
        booking.id,
        transaction.id,
        transaction.status,
        package_type.name,
        park.city,
        cottages.location,
        booking_cruise.cruise_name,
        destination.name,
        booking.booking_status,
        booking.travel_date,
        sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
        sql`${user.firstName} || ' ' || ${user.lastName}`
      )
      .orderBy(desc(booking.date_created));
    if (type === 'client') {
      query.where(and(eq(transaction.client_id, id), eq(transaction.status, 'on_booking')));
    } else if (type === 'agent') {
      if (agent?.role === 'manager' && isFetchAll) {
        query.where(eq(transaction.status, 'on_booking'));
      } else if (agent?.role === 'manager' && !isFetchAll) {
        query.where(and(eq(transaction.status, 'on_booking'), eq(transaction.user_id, agentToFetch!)));
      } else {
        query.where(and(eq(transaction.user_id, id), eq(transaction.status, 'on_booking')));
      }
    }

    const response = await query;

    const payload = response.map((data) => {
      return {
        ...data,
        no_of_nights: data.no_of_nights?.toString() ?? '0',
        travel_date: new Date(data.travel_date).toISOString(),
      };
    });
    const validated_data = z.array(bookingQuerySummarySchema).safeParse(payload);

    if (!validated_data.success) {
      console.log(validated_data.error);
      throw new AppError('Something went wrong fetching booking ', true, 500);
    }
    return validated_data.data;
  },
  //OPTIMIZE:
  fetchPackageToUpdate: async (booking_id: string) => {
    const response = await db.query.booking.findFirst({
      where: eq(booking.id, booking_id),
      with: {
        lodge: {
          with: {
            park: true,
          },
        },
        passengers: true,
        flights: true,
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
    const holiday = await db.query.package_type.findFirst({
      where: eq(package_type.id, response?.holiday_type_id!),
    });
    console.log(holiday);
    if (holiday?.name === 'Package Holiday') {
      const primary_accomodation = response?.accomodation.find((accomodation) => accomodation.is_primary === true);
      const payload_to_validate = {
        transaction_id: response?.transaction_id,
        hays_ref: response?.hays_ref,
        supplier_ref: response?.supplier_ref,
        booking_status: response?.booking_status,
        lead_source: response?.transaction.lead_source,
        title: response?.title,
        travel_date: new Date(response?.travel_date!).toISOString(),
        main_tour_operator_id: response?.main_tour_operator_id,
        sales_price: parseFloat(response?.sales_price ?? '0'),
        commission: parseFloat(response?.package_commission ?? '0'),
        discount: parseFloat(response?.discounts ?? '0'),
        service_charge: parseFloat(response?.service_charge ?? '0'),
        holiday_type: response?.holiday_type_id,
        transfer_type: response?.transfer_type,
        no_of_nights: primary_accomodation?.no_of_nights,
        agent_id: response?.transaction.user_id,
        client_id: response?.transaction.client_id,
        check_in_date_time: new Date(primary_accomodation?.check_in_date_time!).toISOString(),

        country: primary_accomodation?.accomodation?.resorts?.destination?.country_id,
        destination: primary_accomodation?.accomodation?.resorts?.destination_id,
        resort: primary_accomodation?.accomodation?.resorts_id,
        accomodation_id: primary_accomodation?.accomodation_id,
        main_board_basis_id: primary_accomodation?.board_basis_id,
        room_type: primary_accomodation?.room_type,

        adults: response?.adult ? response?.adult : 0,
        children: response?.child ? response?.child : 0,
        infants: response?.infant ? response?.infant : 0,
        passengers: response?.passengers.map((data) => ({ ...data, age: data.age })),
        flights: response?.flights.map((data) => ({
          ...data,
          departure_date_time: new Date(data.departure_date_time!).toISOString(),
          arrival_date_time: new Date(data.arrival_date_time!).toISOString(),
        })),
        transfers: response?.transfers.map((data) => ({
          ...data,
          drop_off_time: new Date(data.drop_off_time!).toISOString(),
          pick_up_time: new Date(data.pick_up_time!).toISOString(),
        })),
        car_hire: response?.car_hire.map((data) => ({
          ...data,
          drop_off_time: new Date(data.drop_off_time!).toISOString(),
          pick_up_time: new Date(data.pick_up_time!).toISOString(),
        })),
        attraction_tickets: response?.attraction_tickets.map((data) => ({ ...data, date_of_visit: new Date(data.date_of_visit!).toISOString() })),
        airport_parking: response?.airport_parking.map((data) => ({ ...data, make: data.car_make, parking_date: data.parking_date!.toISOString() })),
        lounge_pass: response?.lounge_pass.map((data) => ({ ...data, date_of_usage: new Date(data.date_of_usage!).toISOString() })),
        hotels: response?.accomodation
          .filter((accomodation) => accomodation.is_primary === false)
          .map((data) => ({
            ...data,

            resort: data.accomodation?.resorts_id,
            destination: data.accomodation?.resorts?.destination_id,
            country: data.accomodation?.resorts?.destination?.country_id,

            accomodation_id: data.accomodation_id,
            check_in_date_time: new Date(data.check_in_date_time!).toISOString(),
          })),
        // referralId: response.transaction.referrals ? response.transaction.referrals.id : undefined,
        // referrerId: response.transaction.referrals ? response.transaction.referrals.referrerId : undefined,
        // potentialCommission: response.transaction.referrals ? parseInt(response.transaction.referrals.potentialCommission) : undefined,
      };

      const validate_date = booking_mutate_schema.safeParse(payload_to_validate);

      if (validate_date.error) {
        console.log(validate_date.error);
        throw new Error('Invalid data');
      }
      return validate_date.data;
    } else if (holiday?.name === 'Hot Tub Break') {
      const payload_to_validate = {
        transaction_id: response?.transaction_id,
        hays_ref: response?.hays_ref,
        supplier_ref: response?.supplier_ref,
        booking_status: response?.booking_status,
        lead_source: response?.transaction.lead_source,
        title: response?.title,
        travel_date: new Date(response?.travel_date!).toISOString(),
        main_tour_operator_id: response?.main_tour_operator_id,
        sales_price: parseFloat(response?.sales_price ?? '0'),
        commission: parseFloat(response?.package_commission ?? '0'),
        discount: parseFloat(response?.discounts ?? '0'),
        service_charge: parseFloat(response?.service_charge ?? '0'),
        holiday_type: response?.holiday_type_id,
        transfer_type: response?.transfer_type,
        no_of_nights: response?.num_of_nights,
        agent_id: response?.transaction.user_id,
        client_id: response?.transaction.client_id,

        lodge_id: response?.lodge_id,
        pets: response?.pets ?? 0,
        lodge_park_name: response?.lodge?.park?.name,
        lodge_code: response?.lodge?.lodge_code,
        lodge_park_type: response?.lodge_type,
        cottage_id: response?.cottage_id,

        adults: response?.adult,
        children: response?.child,
        infants: response?.infant,

        passengers: response?.passengers.map((data) => ({ ...data, age: data.age })),
        flights: response?.flights.map((data) => ({
          ...data,
          departure_date_time: new Date(data.departure_date_time!).toISOString(),
          arrival_date_time: new Date(data.arrival_date_time!).toISOString(),
        })),
        transfers: response?.transfers.map((data) => ({
          ...data,
          drop_off_time: new Date(data.drop_off_time!).toISOString(),
          pick_up_time: new Date(data.pick_up_time!).toISOString(),
        })),
        car_hire: response?.car_hire.map((data) => ({
          ...data,
          drop_off_time: new Date(data.drop_off_time!).toISOString(),
          pick_up_time: new Date(data.pick_up_time!).toISOString(),
        })),
        attraction_tickets: response?.attraction_tickets.map((data) => ({ ...data, date_of_visit: new Date(data.date_of_visit!).toISOString() })),
        airport_parking: response?.airport_parking.map((data) => ({ ...data, make: data.car_make, parking_date: data.parking_date!.toISOString() })),
        lounge_pass: response?.lounge_pass.map((data) => ({ ...data, date_of_usage: new Date(data.date_of_usage!).toISOString() })),
        hotels: response?.accomodation
          .filter((accomodation) => accomodation.is_primary === false)
          .map((data) => ({
            ...data,

            resort: data.accomodation?.resorts_id,
            destination: data.accomodation?.resorts?.destination_id,
            country: data.accomodation?.resorts?.destination?.country_id,

            accomodation_id: data.accomodation_id,
            check_in_date_time: new Date(data.check_in_date_time!).toISOString(),
          })),

        // referralId: response.transaction.referrals ? response.transaction.referrals.id : undefined,
        // referrerId: response.transaction.referrals ? response.transaction.referrals.referrerId : undefined,
        // potentialCommission: response.transaction.referrals ? parseInt(response.transaction.referrals.potentialCommission) : undefined,
      };

      const validate_date = booking_mutate_schema.safeParse(payload_to_validate);

      if (validate_date.error) {
        console.log(validate_date.error);
        throw new Error('Invalid data');
      }
      return validate_date.data;
    } else {
      const payload_to_validate = {
        transaction_id: response?.transaction_id,
        hays_ref: response?.hays_ref,
        supplier_ref: response?.supplier_ref,
        booking_status: response?.booking_status,
        lead_source: response?.transaction.lead_source,
        title: response?.title,
        travel_date: new Date(response?.travel_date!).toISOString(),
        main_tour_operator_id: response?.main_tour_operator_id,
        sales_price: parseFloat(response?.sales_price ?? '0'),
        commission: parseFloat(response?.package_commission ?? '0'),
        discount: parseFloat(response?.discounts ?? '0'),
        service_charge: parseFloat(response?.service_charge ?? '0'),
        holiday_type: response?.holiday_type_id,
        transfer_type: response?.transfer_type,
        no_of_nights: response?.num_of_nights,
        agent_id: response?.transaction.user_id,
        client_id: response?.transaction.client_id,

        adults: response?.adult,
        children: response?.child,
        infants: response?.infant,

        passengers: response?.passengers.map((data) => ({ ...data, age: data.age })),
        flights: response?.flights.map((data) => ({
          ...data,
          departure_date_time: new Date(data.departure_date_time!).toISOString(),
          arrival_date_time: new Date(data.arrival_date_time!).toISOString(),
        })),
        transfers: response?.transfers.map((data) => ({
          ...data,
          drop_off_time: new Date(data.drop_off_time!).toISOString(),
          pick_up_time: new Date(data.pick_up_time!).toISOString(),
        })),
        car_hire: response?.car_hire.map((data) => ({
          ...data,
          drop_off_time: new Date(data.drop_off_time!).toISOString(),
          pick_up_time: new Date(data.pick_up_time!).toISOString(),
        })),
        attraction_tickets: response?.attraction_tickets.map((data) => ({ ...data, date_of_visit: new Date(data.date_of_visit!).toISOString() })),
        airport_parking: response?.airport_parking.map((data) => ({ ...data, make: data.car_make, parking_date: data.parking_date!.toISOString() })),
        lounge_pass: response?.lounge_pass.map((data) => ({ ...data, date_of_usage: new Date(data.date_of_usage!).toISOString() })),
        hotels: response?.accomodation
          .filter((accomodation) => accomodation.is_primary === false)
          .map((data) => ({
            ...data,

            resort: data.accomodation?.resorts_id,
            destination: data.accomodation?.resorts?.destination_id,
            country: data.accomodation?.resorts?.destination?.country_id,

            accomodation_id: data.accomodation_id,
            check_in_date_time: new Date(data.check_in_date_time!).toISOString(),
          })),

        // referralId: response.transaction.referrals ? response.transaction.referrals.id : undefined,
        // referrerId: response.transaction.referrals ? response.transaction.referrals.referrerId : undefined,
        // potentialCommission: response.transaction.referrals ? parseInt(response.transaction.referrals.potentialCommission) : undefined,
      };

      const validate_date = booking_mutate_schema.safeParse(payload_to_validate);

      if (validate_date.error) {
        console.log(validate_date.error);
        throw new Error('Invalid data');
      }
      return validate_date.data;
    }
  },
  fetchCruiseToUpdate: async (booking_id: string) => {
    const response = await db.query.booking.findFirst({
      where: eq(booking.id, booking_id),

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
        booking_cruise: {
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

    const payload_to_validate = {
      travel_date: response?.travel_date,
      main_tour_operator_id: response?.main_tour_operator_id,
      sales_price: parseFloat(response?.sales_price ?? '0'),
      commission: parseFloat(response?.package_commission ?? '0'),
      discount: parseFloat(response?.discounts ?? '0'),
      hays_ref: response?.hays_ref,
      supplier_ref: response?.supplier_ref,
      booking_status: response?.booking_status,
      title: response?.title,
      service_charge: parseFloat(response?.service_charge ?? '0'),
      holiday_type: response?.holiday_type_id,
      lead_source: response?.transaction.lead_source,

      adults: response?.adult ? response?.adult : 0,
      children: response?.child ? response?.child : 0,
      infants: response?.infant ? response?.infant : 0,

      booking_cruise_id: response?.booking_cruise.id,
      cruise_date: new Date(response?.booking_cruise.cruise_date!).toISOString(),
      cabin_type: response?.booking_cruise.cabin_type,
      cruise_line: response?.booking_cruise.cruise_line,
      cruise_ship: response?.booking_cruise.ship,
      cruise_name: response?.booking_cruise.cruise_name,
      no_of_nights: response?.num_of_nights,

      transfer_type: response?.transfer_type,
      agent_id: response?.transaction.user_id,
      client_id: response?.transaction.client_id,

      passengers: response?.passengers.map((data) => ({ ...data, age: data.age })),
      hotels: response?.accomodation
        .filter((accomodation) => accomodation.is_primary === false)
        .map((data) => ({
          ...data,
          resort: data.accomodation?.resorts_id,
          destination: data.accomodation?.resorts?.destination_id,
          country: data.accomodation?.resorts?.destination?.country_id,

          accomodation_id: data.accomodation_id,
          check_in_date_time: new Date(data.check_in_date_time!).toISOString(),
        })),
      booking_cruise_extra: response?.booking_cruise.cruise_extra.map((data) => data.cruise_extra_id),
      pre_cruise_stay: response?.booking_cruise.pre_cruise_stay?.toString(),
      post_cruise_stay: response?.booking_cruise.post_cruise_stay?.toString(),
      flights: response?.flights.map((data) => ({
        ...data,
        departure_date_time: new Date(data.departure_date_time!).toISOString(),
        arrival_date_time: new Date(data.arrival_date_time!).toISOString(),
      })),
      transfers: response?.transfers.map((data) => ({
        ...data,
        drop_off_time: new Date(data.drop_off_time!).toISOString(),
        pick_up_time: new Date(data.pick_up_time!).toISOString(),
      })),

      car_hire: response?.car_hire.map((data) => ({
        ...data,
        drop_off_time: new Date(data.drop_off_time!).toISOString(),
        pick_up_time: new Date(data.pick_up_time!).toISOString(),
      })),
      attraction_tickets: response?.attraction_tickets.map((data) => ({ ...data, date_of_visit: new Date(data.date_of_visit!).toISOString() })),
      airport_parking: response?.airport_parking.map((data) => ({ ...data, make: data.car_make, parking_date: data.parking_date!.toISOString() })),
      lounge_pass: response?.lounge_pass.map((data) => ({ ...data, date_of_usage: new Date(data.date_of_usage!).toISOString() })),

      // referralId: response.transaction.referrals ? response.transaction.referrals.id : undefined,
      // referrerId: response.transaction.referrals ? response.transaction.referrals.referrerId : undefined,
      // potentialCommission: response.transaction.referrals ? parseInt(response.transaction.referrals.potentialCommission) : undefined,
    };

    const validate_date = booking_mutate_schema.safeParse(payload_to_validate);

    if (validate_date.error) {
      console.log(validate_date.error);
      throw new Error('Invalid data');
    }
    return validate_date.data;
  },
  updatePackage: async (data: z.infer<typeof booking_mutate_schema>, booking_id: string) => {
    const pre_process_data = await preProcessUpdate(booking_id, data, 'BOOKING');

    await db.transaction(async (tx) => {
      const deletions = [
        { table: booking_flights, ids: pre_process_data.removedFlights },
        { table: booking_airport_parking, ids: pre_process_data.removedAirportParking },
        { table: booking_lounge_pass, ids: pre_process_data.removedLoungePass },
        { table: booking_attraction_ticket, ids: pre_process_data.removedAttractionTickets },
        { table: booking_car_hire, ids: pre_process_data.removedCarHire },
        { table: booking_transfers, ids: pre_process_data.removedTransfers },
        { table: booking_accomodation, ids: pre_process_data.removedHotels },

        // { table: passengers, ids: pre_process_data.removedPassengers },
      ];

      // Filter out empty lists and delete in batch
      await Promise.all(
        deletions
          .filter(({ ids }) => ids.length > 0) // Remove empty deletions
          .map(({ table, ids }) => tx.delete(table).where(inArray(table.id, ids)))
      );

      const sectorToAdd = [
        { table: booking_flights, data: pre_process_data.flightsToAdd },
        { table: booking_airport_parking, data: pre_process_data.airportParkingToAdd },
        { table: booking_lounge_pass, data: pre_process_data.loungePassToAdd },
        { table: booking_attraction_ticket, data: pre_process_data.attractionTicketsToAdd },
        { table: booking_car_hire, data: pre_process_data.carHireToAdd },
        { table: booking_transfers, data: pre_process_data.transfersToAdd },
        { table: booking_accomodation, data: pre_process_data.hotelsToAdd },
        // { table: passengers, data: pre_process_data.passengersToAdd },
      ];

      // Update the rest of the data
      await Promise.all(
        sectorToAdd
          .filter(({ data }) => data.length > 0) // Only process non-empty data sets
          .map(({ table, data }) =>
            tx.insert(table).values(
              data.map((item) => ({
                ...item,
                commission: item.commission.toString(),
                booking_id, // Ensure each item has a `booking_id`
                cost: item.cost.toString(),
              }))
            )
          )
      );
      const sectorToUpdate = [
        { table: booking_flights, data: pre_process_data.flightsToUpdate },
        { table: booking_airport_parking, data: pre_process_data.airportParkingToUpdate },
        { table: booking_lounge_pass, data: pre_process_data.loungePassToUpdate },
        { table: booking_attraction_ticket, data: pre_process_data.attractionTicketsToUpdate },
        { table: booking_car_hire, data: pre_process_data.carHireToUpdate },
        { table: booking_transfers, data: pre_process_data.transfersToUpdate },
        { table: booking_accomodation, data: pre_process_data.hotelsToUpdate },
      ];

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

      await tx.delete(passengers).where(eq(passengers.booking_id, booking_id));

      if (data.passengers.length > 0) {
        await tx.insert(passengers).values(data.passengers.map((item) => ({ ...item, booking_id })));
      }
      if (data.accomodation_id) {
        await tx
          .update(booking_accomodation)
          .set({
            tour_operator_id: data.main_tour_operator_id,
            no_of_nights: data.no_of_nights ? parseInt(data.no_of_nights) : 0,
            room_type: data.room_type,
            board_basis_id: data.main_board_basis_id,
            check_in_date_time: new Date(data.check_in_date_time!),
            accomodation_id: data.accomodation_id,
          })
          .where(and(eq(booking_accomodation.is_primary, true), eq(booking_accomodation.booking_id, booking_id)));
      }
      await tx
        .update(booking)
        .set({
          holiday_type_id: data.holiday_type,
          pets: data.pets,
          hays_ref: data.hays_ref,
          supplier_ref: data.supplier_ref,
          lodge_id: data.lodge_id,
          cottage_id: data.cottage_id,
          title: data.title,
          travel_date: data.travel_date,
          discounts: data.discount?.toString(),
          service_charge: data.service_charge?.toString(),
          sales_price: data.sales_price?.toString(),
          package_commission: data.commission?.toString(),
          num_of_nights: data.no_of_nights ? parseInt(data.no_of_nights) : 0,
          transfer_type: data.transfer_type,
          main_tour_operator_id: data.main_tour_operator_id,
          infant: data.infants ? data.infants : 0,
          child: data.children ? data.children : 0,
          adult: data.adults ? data.adults : 0,
        })
        .where(eq(booking.id, booking_id));

      if (data.referrerId && !data.referralId) {
        await tx.insert(referral).values({
          transactionId: data.transaction_id,
          referrerId: data.referrerId,
          potentialCommission: data.potentialCommission?.toString() || '0',
          commission: '0',
        });
      } else if (data.referrerId && data.referralId) {
        await tx
          .update(referral)
          .set({
            referrerId: data.referrerId,
            potentialCommission: data.potentialCommission?.toString() || '0',
            commission: '0',
          })
          .where(eq(referral.id, data.referralId));
      }
      await tx
        .update(transaction)
        .set({
          lead_source: data.lead_source,
        })
        .where(eq(transaction.id, data.transaction_id!));
    });
  },
  updateCruise: async (data: z.infer<typeof booking_mutate_schema>, booking_id: string) => {
    const pre_process_data = await preProcessUpdate(booking_id, data);

    await db.transaction(async (tx) => {
      const deletions = [
        { table: booking_flights, ids: pre_process_data.removedFlights },
        { table: booking_airport_parking, ids: pre_process_data.removedAirportParking },
        { table: booking_lounge_pass, ids: pre_process_data.removedLoungePass },
        { table: booking_attraction_ticket, ids: pre_process_data.removedAttractionTickets },
        { table: booking_car_hire, ids: pre_process_data.removedCarHire },
        { table: booking_transfers, ids: pre_process_data.removedTransfers },
        { table: booking_accomodation, ids: pre_process_data.removedHotels },
        // { table: passengers, ids: pre_process_data.removedPassengers },
      ];

      // Filter out empty lists and delete in batch
      await Promise.all(
        deletions
          .filter(({ ids }) => ids.length > 0) // Remove empty deletions
          .map(({ table, ids }) => tx.delete(table).where(inArray(table.id, ids)))
      );

      const sectorToAdd = [
        { table: booking_flights, data: pre_process_data.flightsToAdd },
        { table: booking_airport_parking, data: pre_process_data.airportParkingToAdd },
        { table: booking_lounge_pass, data: pre_process_data.loungePassToAdd },
        { table: booking_attraction_ticket, data: pre_process_data.attractionTicketsToAdd },
        { table: booking_car_hire, data: pre_process_data.carHireToAdd },
        { table: booking_transfers, data: pre_process_data.transfersToAdd },
        { table: booking_accomodation, data: pre_process_data.hotelsToAdd },
        // { table: passengers, data: pre_process_data.passengersToAdd },
      ];
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
                booking_id, // Ensure each item has a `booking_id`
              }))
            )
          )
      );
      const sectorToUpdate = [
        { table: booking_flights, data: pre_process_data.flightsToUpdate },
        { table: booking_airport_parking, data: pre_process_data.airportParkingToUpdate },
        { table: booking_lounge_pass, data: pre_process_data.loungePassToUpdate },
        { table: booking_attraction_ticket, data: pre_process_data.attractionTicketsToUpdate },
        { table: booking_car_hire, data: pre_process_data.carHireToUpdate },
        { table: booking_transfers, data: pre_process_data.transfersToUpdate },
        { table: booking_accomodation, data: pre_process_data.hotelsToUpdate },
        // { table: passengers, data: pre_process_data.passengersToUpdate },
      ];

      // if (pre_process_data.hotelsToUpdate.length > 0) {
      //   await Promise.all(
      //     pre_process_data.hotelsToUpdate.map(async (item) => {
      //       await tx
      //         .update(booking_accomodation)
      //         .set({ ...item })
      //         .where(eq(booking_accomodation.id, item.id));
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

      await tx.delete(passengers).where(eq(passengers.booking_id, booking_id));

      if (data.passengers.length > 0) {
        await tx.insert(passengers).values(data.passengers.map((item) => ({ ...item, booking_id, age: item.age })));
      }

      if (data.voyages && data.voyages.length > 0 && data.booking_cruise_id) {
        await tx.delete(booking_cruise_itinerary).where(eq(booking_cruise_itinerary.booking_cruise_id, data.booking_cruise_id));
        await tx
          .insert(booking_cruise_itinerary)
          .values(data.voyages.map((item) => ({ ...item, day_number: item.day_number, booking_cruise_id: data.booking_cruise_id })));
      }
      if (data.booking_cruise_extra && data.booking_cruise_id && data.booking_cruise_extra.length > 0) {
        await tx.delete(booking_cruise_item_extra).where(eq(booking_cruise_item_extra.booking_cruise_id, data.booking_cruise_id));
        await tx
          .insert(booking_cruise_item_extra)
          .values(data.booking_cruise_extra.map((item) => ({ cruise_extra_id: item, booking_cruise_id: data.booking_cruise_id })));
      }

      await tx.update(booking_cruise).set({
        cruise_date: data.cruise_date,
        cabin_type: data.cabin_type,
        cruise_line: data.cruise_line,
        ship: data.cruise_ship,
        cruise_name: data.cruise_name,
        pre_cruise_stay: Number.isNaN(parseInt(data.pre_cruise_stay || '0')) ? 0 : parseInt(data.pre_cruise_stay || '0'),
        post_cruise_stay: Number.isNaN(parseInt(data.post_cruise_stay || '0')) ? 0 : parseInt(data.post_cruise_stay || '0'),

        tour_operator_id: data.main_tour_operator_id,
      });

      await tx
        .update(booking)
        .set({
          holiday_type_id: data.holiday_type,
          travel_date: data.travel_date ? new Date(data.travel_date).toISOString() : new Date().toISOString(),
          discounts: data.discount ? data.discount.toString() : '0',
          hays_ref: data.hays_ref,
          supplier_ref: data.supplier_ref,
          service_charge: data.service_charge?.toString(),
          sales_price: data.sales_price?.toString(),
          title: data.title,
          package_commission: data.commission?.toString(),
          num_of_nights: data.no_of_nights ? parseInt(data.no_of_nights) : 0,
          transfer_type: data.transfer_type,
          main_tour_operator_id: data.main_tour_operator_id,
          infant: data.infants ? data.infants : 0,
          child: data.children ? data.children : 0,
          adult: data.adults ? data.adults : 0,
        })
        .where(eq(booking.id, booking_id));

      if (data.referrerId && !data.referralId && data.transaction_id) {
        await tx.insert(referral).values({
          transactionId: data.transaction_id,
          referrerId: data.referrerId,
          potentialCommission: data.potentialCommission?.toString() || '0',
          commission: '0',
        });
      } else if (data.referrerId && data.referralId) {
        await tx
          .update(referral)
          .set({
            referrerId: data.referrerId,
            potentialCommission: data.potentialCommission?.toString() || '0',
          })
          .where(eq(referral.id, data.referralId));
      }
      await tx
        .update(transaction)
        .set({
          lead_source: data.lead_source,
        })
        .where(eq(transaction.id, data.transaction_id!));
    });
  },
  fetchBookingReport: async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const response = await db
      .select({
        id: booking.id,
        hays_ref: booking.hays_ref,
        supplier_ref: booking.supplier_ref,
        travel_date: booking.travel_date,
        transaction_id: transaction.id,
        status: transaction.status,
        sales_price: booking.sales_price,
        package_commission: booking.package_commission,
        discount: booking.discounts,
        service_charge: booking.service_charge,
        holiday_type: package_type.name,
        client_name: sql<string>`${clientTable.firstName} || ' ' || ${clientTable.surename}`.as('client_name'),
        agent_name: sql<string>`${user.firstName} || ' ' || ${user.lastName}`.as('agent_name'),
        clientId: clientTable.id,
        agentId: user.id,
        date_created: booking.date_created,
        overall_commission: sql`
      
      COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
      + booking_table.package_commission

    `.as('overall_commission'),
        total_overall_commission: sql`SUM(
      COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
      + booking_table.package_commission
    ) OVER ()`.as('total_overall_commission'),
        total_bookings: sql`COUNT(*) OVER ()`.as('total_bookings'),
      })
      .from(transaction)
      .leftJoin(booking, eq(booking.transaction_id, transaction.id))
      .leftJoin(clientTable, eq(clientTable.id, transaction.client_id))
      .leftJoin(user, eq(user.id, transaction.user_id))
      .leftJoin(package_type, eq(package_type.id, booking.holiday_type_id))
      .groupBy(
        booking.id,
        booking.hays_ref,
        booking.supplier_ref,
        booking.travel_date,
        transaction.id,
        transaction.status,
        booking.sales_price,
        booking.package_commission,
        booking.discounts,
        booking.service_charge,
        package_type.name,
        clientTable.firstName,
        clientTable.surename,
        user.firstName,
        user.lastName,
        clientTable.id,
        user.id,
        booking.date_created
      )
      .orderBy(desc(booking.date_created))
      .where(and(eq(transaction.status, 'on_booking'), gte(booking.date_created, monthStart)));

    const booking_payload = response.map((data) => {
      return {
        id: data.id as string,
        hays_ref: data.hays_ref as string,
        supplier_ref: data.supplier_ref as string,
        travel_date: new Date(data.travel_date!),
        transaction_id: data.transaction_id as string,
        status: data.status as 'on_quote' | 'on_enquiry' | 'on_booking',
        sales_price: parseFloat(data.sales_price as string),
        package_commission: parseFloat(data.package_commission as string),
        discount: parseFloat(data.discount as string),

        service_charge: parseFloat(data.service_charge as string),
        holiday_type: data.holiday_type as string,
        client_name: data.client_name as string,
        clientId: data.clientId as string,

        agent_id: data.agentId as string,
        agent_name: data.agent_name,

        total_bookings: parseInt(data.total_bookings as string),
        date_created: new Date(data.date_created!).toISOString(),
        overall_commission: parseFloat(data.overall_commission as string),
        total_overall_commission: parseFloat(data.total_overall_commission as string),
      };
    });

    const number_of_booking = await db
      .select({
        count: count(),
      })
      .from(transaction)
      .leftJoin(booking, eq(booking.transaction_id, transaction.id))
      .where(and(eq(transaction.status, 'on_booking')))
      .limit(1);

    const booking_count = number_of_booking[0].count ?? 0;
    const total_bookings = booking_payload[0].total_bookings ?? 0;

    return {
      bookings: booking_payload,

      total_overall_commission: booking_payload[0].total_overall_commission,
      total_bookings: booking_payload[0].total_bookings,
      booking_percentage: booking_count > 0 ? (total_bookings / booking_count) * 100 : 0,
    };
  },
  fetchBookings: async (agentId, clientId, filters, pagination) => {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = (page - 1) * limit;

    const query = db
      .select({
        id: booking.id,
        hays_ref: booking.hays_ref,
        supplier_ref: booking.supplier_ref,
        travel_date: booking.travel_date,
        transaction_id: transaction.id,
        status: transaction.status,
        sales_price: booking.sales_price,
        package_commission: booking.package_commission,
        discount: booking.discounts,
        service_charge: booking.service_charge,
        holiday_type: package_type.name,
        agent_id: user.id,
        client_name: sql<string>`${clientTable.firstName} || ' ' || ${clientTable.surename}`.as('client_name'),
        agent_name: sql<string>`${user.firstName} || ' ' || ${user.lastName}`.as('agent_name'),
        clientId: clientTable.id,
        agentId: user.id,
        accomodation: accomodation_list.name,
        resorts: resorts.name,
        lodge: lodges.lodge_name,
        cottage: cottages.cottage_name,
        cruise_destination: booking_cruise.cruise_name,
        date_created: booking.date_created,

        overall_commission: sql`
        
      
      COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
      + booking_table.package_commission

    `.as('overall_commission'),
      })
      .from(transaction)
      .innerJoin(booking, eq(booking.transaction_id, transaction.id))
      .leftJoin(clientTable, eq(clientTable.id, transaction.client_id))
      .leftJoin(user, eq(user.id, transaction.user_id))
      .leftJoin(package_type, eq(package_type.id, booking.holiday_type_id))
      .leftJoin(booking_accomodation, eq(booking_accomodation.booking_id, booking.id))
      .leftJoin(accomodation_list, eq(accomodation_list.id, booking_accomodation.accomodation_id))
      .leftJoin(resorts, eq(resorts.id, accomodation_list.resorts_id))
      .leftJoin(lodges, eq(lodges.id, booking.lodge_id))
      .leftJoin(cottages, eq(cottages.id, booking.lodge_id))
      .leftJoin(booking_cruise, eq(booking_cruise.booking_id, booking.id))
      .groupBy(
        booking.id,
        booking.hays_ref,
        booking.supplier_ref,
        booking.travel_date,
        transaction.id,
        transaction.status,
        booking.sales_price,
        booking.package_commission,
        booking.discounts,
        booking.service_charge,
        package_type.name,
        accomodation_list.name,
        clientTable.firstName,
        clientTable.surename,
        user.firstName,
        user.lastName,
        clientTable.id,
        user.id,
        booking.date_created,
        resorts.name,
        lodges.lodge_name,
        cottages.cottage_name,
        booking_cruise.cruise_name
      )
      .orderBy(desc(booking.date_created));

    const historial_monthly_data = db
      .select({
        id: historicalBooking.id,
        hays_ref: historicalBooking.booking_ref,
        travel_date: historicalBooking.departure_date,
        status: sql<any>`'on_booking'`,
        sales_price: historicalBooking.gross_before_discount,
        package_commission: historicalBooking.profit,
        discount: sql<string>`0`,
        service_charge: sql<string>`0`,
        client_name: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`.as('client_name'),
        clientId: clientTable.id,
        date_created: sql<any>`${historicalBooking.booking_date}`,

        overall_commission: historicalBooking.profit,
      })
      .from(historicalBooking)
      .leftJoin(clientTable, eq(clientTable.id, historicalBooking.client_id));

    // Build filter conditions
    const filterConditions = [];
    const historical_filterConditions = [];

    // Add is_active filter
    filterConditions.push(eq(transaction.status, 'on_booking'));
    filterConditions.push(eq(booking.is_active, true));
    if (filters?.is_active !== undefined) {
      filterConditions.push(eq(booking.is_active, filters.is_active));
    } else {
      // Default to active bookings if no is_active filter is provided
      filterConditions.push(eq(booking.is_active, true));
    }

    if (agentId && clientId) {
      filterConditions.push(and(eq(transaction.user_id, agentId), eq(transaction.client_id, clientId)));
    } else if (agentId && !clientId) {
      filterConditions.push(eq(transaction.user_id, agentId));
    } else if (!agentId && clientId) {
      historical_filterConditions.push(eq(historicalBooking.client_id, clientId));
      filterConditions.push(eq(transaction.client_id, clientId));
    }

    // Apply filters
    if (filters) {
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        historical_filterConditions.push(
          or(ilike(sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`, searchTerm), ilike(historicalBooking.booking_ref, searchTerm))
        );
        filterConditions.push(
          or(
            ilike(sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`, searchTerm),
            ilike(sql`${user.firstName} || ' ' || ${user.lastName}`, searchTerm),
            ilike(booking.hays_ref, searchTerm),
            ilike(booking.supplier_ref, searchTerm),
            ilike(accomodation_list.name, searchTerm),
            ilike(resorts.name, searchTerm),
            ilike(lodges.lodge_name, searchTerm),
            ilike(cottages.cottage_name, searchTerm),
            ilike(booking_cruise.cruise_name, searchTerm)
          )
        );
      }

      if (filters.booking_status) {
        filterConditions.push(eq(booking.booking_status, filters.booking_status as any));
      }

      if (filters.holiday_type) {
        filterConditions.push(eq(package_type.name, filters.holiday_type));
      }

      if (filters.travel_date_from) {
        historical_filterConditions.push(gte(historicalBooking.departure_date, filters.travel_date_from));
        filterConditions.push(gte(booking.travel_date, filters.travel_date_from));
      }

      if (filters.travel_date_to) {
        historical_filterConditions.push(lte(historicalBooking.departure_date, filters.travel_date_to));
        filterConditions.push(lte(booking.travel_date, filters.travel_date_to));
      }

      if (filters.sales_price_min) {
        historical_filterConditions.push(gte(historicalBooking.gross_before_discount, filters.sales_price_min));
        filterConditions.push(gte(booking.sales_price, filters.sales_price_min));
      }

      if (filters.sales_price_max) {
        historical_filterConditions.push(lte(historicalBooking.gross_before_discount, filters.sales_price_max));
        filterConditions.push(lte(booking.sales_price, filters.sales_price_max));
      }

      if (filters.destination) {
        const destinationTerm = `%${filters.destination}%`;
        filterConditions.push(
          or(
            ilike(accomodation_list.name, destinationTerm),
            ilike(resorts.name, destinationTerm),
            ilike(lodges.lodge_name, destinationTerm),
            ilike(cottages.cottage_name, destinationTerm),
            ilike(booking_cruise.cruise_name, destinationTerm)
          )
        );
      }

      if (filters.client_name) {
        const clientTerm = `%${filters.client_name}%`;
        historical_filterConditions.push(ilike(sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`, clientTerm));
        filterConditions.push(ilike(sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`, clientTerm));
      }

      if (filters.agent_name) {
        const agentTerm = `%${filters.agent_name}%`;
        filterConditions.push(ilike(sql`${user.firstName} || ' ' || ${user.lastName}`, agentTerm));
      }
    }
    // Apply filter conditions
    if (filterConditions.length > 0) {
      historial_monthly_data.where(and(...historical_filterConditions));
      query.where(and(...filterConditions));
    }

    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(transaction)
      .leftJoin(booking, eq(booking.transaction_id, transaction.id))
      .leftJoin(clientTable, eq(clientTable.id, transaction.client_id))
      .leftJoin(user, eq(user.id, transaction.user_id))
      .leftJoin(package_type, eq(package_type.id, booking.holiday_type_id))
      .leftJoin(booking_accomodation, eq(booking_accomodation.booking_id, booking.id))
      .leftJoin(accomodation_list, eq(accomodation_list.id, booking_accomodation.accomodation_id))
      .leftJoin(resorts, eq(resorts.id, accomodation_list.resorts_id))
      .leftJoin(lodges, eq(lodges.id, booking.lodge_id))
      .leftJoin(cottages, eq(cottages.id, booking.lodge_id))
      .leftJoin(booking_cruise, eq(booking_cruise.booking_id, booking.id))
      .groupBy(
        booking.id,
        booking.hays_ref,
        booking.supplier_ref,
        booking.travel_date,
        transaction.id,
        transaction.status,
        booking.sales_price,
        booking.package_commission,
        booking.discounts,
        booking.service_charge,
        package_type.name,
        accomodation_list.name,
        clientTable.firstName,
        clientTable.surename,
        user.firstName,
        user.lastName,
        clientTable.id,
        user.id,
        booking.date_created,
        resorts.name,
        lodges.lodge_name,
        cottages.cottage_name,
        booking_cruise.cruise_name
      );
    const countQuery_historical = db
      .select({ count: sql<number>`count(*)` })
      .from(historicalBooking)
      .leftJoin(clientTable, eq(clientTable.id, historicalBooking.client_id));

    if (filterConditions.length > 0) {
      countQuery.where(and(...filterConditions));
    }
    if (historical_filterConditions.length > 0) {
      countQuery_historical.where(and(...historical_filterConditions));
    }
    const countResult = await countQuery;
    const countResult_historical = await countQuery_historical;
    const total = countResult.length + countResult_historical.length;

    // Apply pagination
    query.limit(limit).offset(offset);
    historial_monthly_data.limit(limit).offset(offset);

    // Execute both queries separately and combine results
    const [fetchQuery, historicalData] = await Promise.all([query, historial_monthly_data]);

    const result = [
      ...fetchQuery,
      ...historicalData.map((data) => ({
        ...data,
        supplier_ref: null,
        transaction_id: null,
        holiday_type: null,
        agentId: null,
        accomodation: null,
        resorts: null,
        lodge: null,
        cottage: null,
        cruise_destination: null,
        agent_name: 'No Agent',
      })),
    ];
    const booking_payload = result.map((data) => {
      return {
        ...data,
        transaction_id: data.transaction_id as string,
        hays_ref: data.hays_ref as string,
        supplier_ref: data.supplier_ref as string,
        agent_id: data.agentId as string,
        clientId: data.clientId as string,
        holiday_type: data.holiday_type as string,
        status: data.status as 'on_quote' | 'on_enquiry' | 'on_booking',
        accomodation: data.accomodation,
        destination: data.resorts || data.lodge || data.cottage || data.cruise_destination || (' ' as string),
        travel_date: new Date(data.travel_date!),
        date_created: new Date(data.date_created!).toISOString(),
        overall_commission: parseFloat(data.overall_commission as string),
        sales_price: parseFloat(data.sales_price as string),
        package_commission: parseFloat(data.package_commission as string),
        discount: parseFloat(data.discount as string),
        service_charge: parseFloat(data.service_charge as string),
        client_name: data.client_name as string,
        agent_name: data.agent_name,
      };
    });

    return {
      data: booking_payload,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  delete: async (booking_id, deletion_code, deleted_by) => {
    const deletion_code_data = await db.select().from(deletion_codes).where(eq(deletion_codes.code, deletion_code));

    if (!deletion_code_data.length || deletion_code_data[0].is_used) {
      throw new AppError('Invalid deletion code', true, 400);
    }

    const now = new Date();

    await db
      .update(booking)
      .set({
        is_active: false,
        deletion_code: deletion_code,
        deleted_by: deleted_by,
        deleted_at: now,
      })
      .where(eq(booking.id, booking_id));

    await db.update(deletion_codes).set({ is_used: true }).where(eq(deletion_codes.code, deletion_code));
  },
  //OPTIMIZE:
  fetchBookingById: async (booking_id) => {
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

    const result = await db
      .select({
        name: package_type.name,
      })
      .from(booking)
      .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
      .innerJoin(package_type, eq(booking.holiday_type_id, package_type.id))
      .where(eq(booking.id, booking_id))
      .limit(1);

    const groupByFields = [
      booking.id,
      userReferrer.firstName,
      userReferrer.lastName,
      agentTable.firstName,
      agentTable.lastName,
      package_type.name,
      clientTable.firstName,
      clientTable.surename,
      transaction.client_id,

      transaction.status,
      transaction.id,
      booking.sales_price,
      booking.package_commission,
      booking.travel_date,
      booking.discounts,
      booking.service_charge,
      booking.num_of_nights,
      booking.transfer_type,
      booking.booking_status,
      main_tour_operator.name,
      booking.infant,
      booking.child,
      booking.adult,
      booking.date_created,
      referral.referrerId,
      referral.potentialCommission,
      user.firstName,
      user.lastName,
      transaction.lead_source,
      ...(result.length > 0 && result[0].name === 'Hot Tub Break'
        ? [
            booking.lodge_id,
            lodges.lodge_name,
            lodges.lodge_code,
            park.name,
            park.location,
            park.code,
            booking.cottage_id,
            cottages.cottage_name,
            cottages.cottage_code,
            cottages.location,
          ]
        : []),
      ...(result.length > 0 && result[0].name === 'Cruise Package'
        ? [
            booking_cruise.id,
            cruise_operator.name,
            booking_cruise.cruise_line,
            booking_cruise.ship,
            booking_cruise.cruise_date,
            booking_cruise.cabin_type,
            booking_cruise.cruise_name,
            booking_cruise.pre_cruise_stay,
            booking_cruise.post_cruise_stay,
          ]
        : []),
    ];

    const selected_fields: Record<string, any> = {
      id: booking.id,
      hays_ref: booking.hays_ref,
      title: booking.title,
      supplier_ref: booking.supplier_ref,
      holiday_type: package_type.name,
      clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
      clientId: transaction.client_id,
      agentName: sql`${agentTable.firstName} || ' ' || ${agentTable.lastName}`,
      agentId: transaction.user_id,
      status: transaction.status,
      transaction_id: transaction.id,
      sales_price: booking.sales_price,
      package_commission: booking.package_commission,
      travel_date: booking.travel_date,
      discount: booking.discounts,
      service_charge: booking.service_charge,
      num_of_nights: booking.num_of_nights,
      transfer_type: booking.transfer_type,
      booking_status: booking.booking_status,
      main_tour_operator: main_tour_operator.name,
      infants: booking.infant,
      children: booking.child,
      adults: booking.adult,
      date_created: booking.date_created,
      lead_source: transaction.lead_source,
      referrerName: sql`${userReferrer.firstName} || ' ' || ${userReferrer.lastName}`,
      referrerId: referral.referrerId,
      potentialCommission: referral.potentialCommission,
    };

    if (result.length > 0 && result[0].name === 'Hot Tub Break') {
      selected_fields.lodge_id = booking.lodge_id;
      selected_fields.lodge_name = lodges.lodge_name;
      selected_fields.lodge_code = lodges.lodge_code;
      selected_fields.park_name = park.name;
      selected_fields.park_location = park.location;
      selected_fields.park_code = park.code;
      selected_fields.cottage_id = booking.cottage_id;
      selected_fields.cottage_name = cottages.cottage_name;
      selected_fields.cottage_code = cottages.cottage_code;
      selected_fields.cottage_location = cottages.location;
    } else if (result.length > 0 && result[0].name === 'Cruise Package') {
      selected_fields.booking_cruise_id = booking_cruise.id;
      selected_fields.cruise_operator = cruise_operator.name;
      selected_fields.cruise_line = booking_cruise.cruise_line;
      selected_fields.cruise_ship = booking_cruise.ship;
      selected_fields.cruise_date = booking_cruise.cruise_date;
      selected_fields.cabin_type = booking_cruise.cabin_type;
      selected_fields.cruise_name = booking_cruise.cruise_name;
      selected_fields.pre_cruise_stay = booking_cruise.pre_cruise_stay;
      selected_fields.post_cruise_stay = booking_cruise.post_cruise_stay;
      selected_fields.voyages = sql`
            (
              SELECT json_agg(row) FROM (
                SELECT DISTINCT ON (qci.id,qci.day_number, qci.description)
                  jsonb_build_object(
                    'id', qci.id,
                    'day_number', qci.day_number,
                    'description', qci.description
                  ) AS row
                FROM booking_cruise_itinerary qci
                WHERE qci.booking_cruise_id = ${booking_cruise.id}
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
              FROM booking_cruise_item_extra qci
              LEFT JOIN cruise_extra_item_table ceit ON ceit.id = qci.cruise_extra_id
              WHERE qci.booking_cruise_id = ${booking_cruise.id}
              ORDER BY ceit.id  -- Ordering by ceit.id to apply DISTINCT ON
            ) sub
          )
        `.as('cruise_extra');
    }
    let query = db
      .select({
        ...selected_fields,

        overall_commission: sql`
            COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
            + booking_table.package_commission
           
          `.as('overall_commission'),

        overall_cost: sql`
            COALESCE((SELECT SUM(cost) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(cost) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(cost) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(cost) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(cost) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(cost) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
            + COALESCE((SELECT SUM(cost) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
            - booking_table.discounts
            + booking_table.service_charge
            + booking_table.sales_price
          `.as('overall_cost'),
        passengers: sql`json_agg(json_build_object(
                'id', ${passengers.id},
                'type', ${passengers.type},
                'age', ${passengers.age}
              ))`.as('passengers'),

        hotels: sql`json_agg(json_build_object(
                'id', ${booking_accomodation.id},
                'tour_operator', ${hotel_tour_operator.name},
                'board_basis', ${board_basis.type},
                'booking_ref', ${booking_accomodation.booking_ref},
                'no_of_nights', ${booking_accomodation.no_of_nights},
                'room_type', ${booking_accomodation.room_type},
                'check_in_date_time', ${booking_accomodation.check_in_date_time},
                'cost', ${booking_accomodation.cost},
                'commission', ${booking_accomodation.commission},
                'accomodation', ${accomodation_list.name},
                'resorts', ${resorts.name},
                'destination', ${destination.name},
                'is_primary', ${booking_accomodation.is_primary},
                'country', ${country.country_name},
                'stay_type', ${booking_accomodation.stay_type},
                'is_included_in_package', ${booking_accomodation.is_included_in_package}
                ))`.as('hotels'),
        transfers: sql`json_agg(json_build_object(
                'id', ${booking_transfers.id},
                 'booking_ref', ${booking_transfers.booking_ref},
                'tour_operator', ${transfer_tour_operator.name},
                'pick_up_location', ${booking_transfers.pick_up_location},
                'pick_up_time', ${booking_transfers.pick_up_time},
                'drop_off_time', ${booking_transfers.drop_off_time},
                'drop_off_location', ${booking_transfers.drop_off_location},
                'is_included_in_package', ${booking_transfers.is_included_in_package},
                'cost', ${booking_transfers.cost},
                'commission', ${booking_transfers.commission},
                'note', ${booking_transfers.note}
                ))`.as('transfers'),
        car_hire: sql`json_agg(json_build_object(
                'id', ${booking_car_hire.id},
                'booking_ref', ${booking_car_hire.booking_ref},
                'tour_operator', ${car_hire_operator.name},
                'pick_up_location', ${booking_car_hire.pick_up_location},
                'drop_off_location', ${booking_car_hire.drop_off_location},
                'pick_up_time', ${booking_car_hire.pick_up_time},
                'drop_off_time', ${booking_car_hire.drop_off_time},
                'no_of_days', ${booking_car_hire.no_of_days},
                'driver_age', ${booking_car_hire.driver_age},
                'is_included_in_package', ${booking_car_hire.is_included_in_package},
                'cost', ${booking_car_hire.cost},
                'commission', ${booking_car_hire.commission}
                ))`.as('car_hire'),
        attraction_tickets: sql`json_agg(json_build_object(
                'id', ${booking_attraction_ticket.id},
                'booking_ref', ${booking_attraction_ticket.booking_ref},
                'ticket_type', ${booking_attraction_ticket.ticket_type},
                'tour_operator', ${ticket_operator.name},
                'date_of_visit', ${booking_attraction_ticket.date_of_visit},
                'cost', ${booking_attraction_ticket.cost},
                'commission', ${booking_attraction_ticket.commission},
                'number_of_tickets', ${booking_attraction_ticket.number_of_tickets},
                'is_included_in_package', ${booking_attraction_ticket.is_included_in_package}
                ))`.as('attraction_tickets'),
        lounge_pass: sql`json_agg(json_build_object(
                'id', ${booking_lounge_pass.id},
                'booking_ref', ${booking_lounge_pass.booking_ref},
                'terminal', ${booking_lounge_pass.terminal},
                'airport', ${lounge_pass_airport.airport_name},
                'tour_operator', ${lounge_pass_operator.name},
                'date_of_usage', ${booking_lounge_pass.date_of_usage},
                'cost', ${booking_lounge_pass.cost},
                'commission', ${booking_lounge_pass.commission},
                'is_included_in_package', ${booking_lounge_pass.is_included_in_package},
                'note', ${booking_lounge_pass.note}
                ))`.as('lounge_pass'),
        airport_parking: sql`json_agg(json_build_object(
                'id', ${booking_airport_parking.id},
                'booking_ref', ${booking_airport_parking.booking_ref},
                'airport', ${parking_airport.airport_name},
                'parking_type', ${booking_airport_parking.parking_type},
                'car_make', ${booking_airport_parking.car_make},
                'car_model', ${booking_airport_parking.car_model},
                'colour', ${booking_airport_parking.colour},
                'car_reg_number', ${booking_airport_parking.car_reg_number},
                'parking_date', ${booking_airport_parking.parking_date},
                'duration', ${booking_airport_parking.duration},
                'tour_operator', ${parking_operator.name},
                  'is_included_in_package', ${booking_airport_parking.is_included_in_package},
                  'cost', ${booking_airport_parking.cost},
                  'commission', ${booking_airport_parking.commission}
                  ))`.as('airport_parking'),

        flights: sql`json_agg(json_build_object(
                'id', ${booking_flights.id},
                'flight_number', ${booking_flights.flight_number},
                'flight_ref', ${booking_flights.flight_ref},
                'departing_airport', ${flight_departing_airport.airport_name},
                'arrival_airport', ${flight_arrival_airport.airport_name},
                'tour_operator', ${flight_operator.name},
                'flight_type', ${booking_flights.flight_type},
                'departure_date_time', ${booking_flights.departure_date_time},
                'arrival_date_time', ${booking_flights.arrival_date_time},
                'is_included_in_package', ${booking_flights.is_included_in_package},
                'cost', ${booking_flights.cost},
                'commission', ${booking_flights.commission}
                ))`.as('flights'),
      })
      .from(booking)
      .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
      .innerJoin(agentTable, eq(transaction.user_id, agentTable.id))
      .leftJoin(referral, eq(transaction.id, referral.transactionId))
      .leftJoin(userReferrer, eq(referral.referrerId, userReferrer.id))
      .innerJoin(clientTable, eq(transaction.client_id, clientTable.id))
      .innerJoin(package_type, eq(booking.holiday_type_id, package_type.id))
      .leftJoin(booking_accomodation, eq(booking.id, booking_accomodation.booking_id))
      .leftJoin(booking_transfers, eq(booking.id, booking_transfers.booking_id))
      .leftJoin(board_basis, eq(booking_accomodation.board_basis_id, board_basis.id))
      .leftJoin(hotel_tour_operator, eq(booking_accomodation.tour_operator_id, hotel_tour_operator.id))
      .leftJoin(transfer_tour_operator, eq(booking_transfers.tour_operator_id, transfer_tour_operator.id))
      .leftJoin(accomodation_list, eq(booking_accomodation.accomodation_id, accomodation_list.id))
      .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
      .leftJoin(destination, eq(resorts.destination_id, destination.id))
      .leftJoin(country, eq(destination.country_id, country.id))
      .leftJoin(booking_car_hire, eq(booking.id, booking_car_hire.booking_id))
      .leftJoin(car_hire_operator, eq(booking_car_hire.tour_operator_id, car_hire_operator.id))
      .leftJoin(booking_attraction_ticket, eq(booking.id, booking_attraction_ticket.booking_id))
      .leftJoin(ticket_operator, eq(booking_attraction_ticket.tour_operator_id, ticket_operator.id))
      .leftJoin(booking_lounge_pass, eq(booking.id, booking_lounge_pass.booking_id))
      .leftJoin(lounge_pass_operator, eq(booking_lounge_pass.tour_operator_id, lounge_pass_operator.id))
      .leftJoin(lounge_pass_airport, eq(booking_lounge_pass.airport_id, lounge_pass_airport.id))
      .leftJoin(booking_airport_parking, eq(booking.id, booking_airport_parking.booking_id))
      .leftJoin(parking_operator, eq(booking_airport_parking.tour_operator_id, parking_operator.id))
      .leftJoin(parking_airport, eq(booking_airport_parking.airport_id, parking_airport.id))
      .leftJoin(booking_flights, eq(booking.id, booking_flights.booking_id))
      .leftJoin(flight_operator, eq(booking_flights.tour_operator_id, flight_operator.id))
      .leftJoin(flight_departing_airport, eq(booking_flights.departing_airport_id, flight_departing_airport.id))
      .leftJoin(flight_arrival_airport, eq(booking_flights.arrival_airport_id, flight_arrival_airport.id))
      .leftJoin(main_tour_operator, eq(booking.main_tour_operator_id, main_tour_operator.id))
      .leftJoin(passengers, eq(booking.id, passengers.booking_id))

      .where(and(eq(booking.id, booking_id), eq(transaction.status, 'on_booking'), ne(booking.is_active, false)))
      .groupBy(...groupByFields);

    if (result.length > 0 && result[0].name === 'Hot Tub Break') {
      query = query
        .leftJoin(cottages, eq(booking.cottage_id, cottages.id))
        .leftJoin(lodges, eq(booking.lodge_id, lodges.id))
        .leftJoin(park, eq(lodges.park_id, park.id));
    } else if (result.length > 0 && result[0].name === 'Cruise Package') {
      query = query
        .leftJoin(booking_cruise, eq(booking_cruise.booking_id, booking.id))
        .leftJoin(booking_cruise_item_extra, eq(booking_cruise.id, booking_cruise_item_extra.booking_cruise_id))
        .leftJoin(cruise_extra_item, eq(booking_cruise_item_extra.cruise_extra_id, cruise_extra_item.id))
        .leftJoin(booking_cruise_itinerary, eq(booking_cruise.id, booking_cruise_itinerary.booking_cruise_id))
        .leftJoin(cruise_operator, eq(booking_cruise.tour_operator_id, cruise_operator.id));
    }

    const datas = await query;
    const data = datas[0] as any;
    const payload = {
      ...data,
      no_of_nights: data?.num_of_nights.toString() ?? "0",
      cruise_date: data?.cruise_date ? new Date(data.cruise_date) : null,
      post_cruise_stay: data?.post_cruise_stay ? parseInt(data.post_cruise_stay) : null,
      pre_cruise_stay: data?.pre_cruise_stay ? parseInt(data.pre_cruise_stay) : null,
      future_deal_date: data?.future_deal_date ? new Date(data.future_deal_date) : null,
      travel_date: data?.travel_date ? new Date(data.travel_date) : null,
      sales_price: parseFloat(data?.sales_price ?? 0),
      package_commission: parseFloat(data?.package_commission ?? 0),
      discount: parseFloat(data?.discount ?? 0),
      service_charge: parseFloat(data?.service_charge ?? 0),
      overall_commission: parseFloat(data?.overall_commission ?? 0),
      overall_cost: parseFloat(data?.overall_cost ?? 0),

      referrerName: data?.referrerName ? data?.referrerName : undefined,
      referrerId: data?.referrerId ? data?.referrerId : undefined,
      potentialCommission: data?.potentialCommission ? parseFloat(data?.potentialCommission) : undefined,
      referrerCommission: parseFloat(data?.overall_commission ?? 0) * (parseFloat(data?.potentialCommission ?? 0) / 100),
      finalCommission:
        parseFloat(data?.overall_commission ?? 0) - parseFloat(data?.overall_commission ?? 0) * (parseFloat(data?.potentialCommission ?? 0) / 100),
      cruise_extra: Array.from(new Set((data?.cruise_extra ?? []).filter((c: any) => c?.id).map((c: any) => c.name))),

      voyages: Array.from(new Map((data?.voyages ?? []).filter((v: any) => v?.id).map((v: any) => [v.id, { ...v, id: v.id }])).values()),

      passengers: Array.from(
        new Map((data?.passengers ?? []).filter((p: any) => p?.id).map((p: any) => [p.id, { ...p, age: parseInt(p.age) }])).values()
      ),

      hotels: Array.from(
        new Map(
          (data?.hotels ?? [])
            .filter((h: any) => h?.id)
            .map((h: any) => [
              h.id,
              {
                ...h,
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
                drop_off_time: new Date(c.drop_off_time),
                pick_up_time: new Date(c.pick_up_time),
                no_of_days: c.no_of_days.toString(),
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
      return dataValidator(bookingHotTubQuerySchema, payload);
    } else if (result.length > 0 && result[0].name === 'Package Holiday') {
      return dataValidator(bookingQuerySchema, payload);
    } else if (result.length > 0 && result[0].name === 'Cruise Package') {
      return dataValidator(bookingCruiseQuerySchema, payload);
    } else {
      return dataValidator(bookingQuerySchema, payload);
    }
  },
  restore: async (booking_id) => {
    await db
      .update(booking)
      .set({
        is_active: true,
        deletion_code: null,
        deleted_by: null,
        deleted_at: null,
      })
      .where(eq(booking.id, booking_id));
  },
  fetchDeletedBookings: async (page, limit) => {
    const pageNumber = page || 1;
    const pageSize = limit || 10;
    const offset = (pageNumber - 1) * pageSize;

    // Count query for pagination
    const countQuery = db.select().from(booking).where(eq(booking.is_active, false));

    const countResult = await countQuery;
    const total = countResult.length;

    // Main query with pagination
    const bookings = await db
      .select({
        id: booking.id,
        hays_ref: booking.hays_ref || '',
        supplier_ref: booking.supplier_ref,
        travel_date: booking.travel_date,
        transaction_id: booking.transaction_id,
        status: sql<'on_quote' | 'on_enquiry' | 'on_booking'>`'on_booking'`.as('status'),
        sales_price: booking.sales_price,
        package_commission: booking.package_commission,
        discount: booking.discounts,
        service_charge: booking.service_charge,
        holiday_type: package_type.name,
        client_name: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`.as('client_name'),
        clientId: transaction.client_id,
        destination: sql<string>`''`.as('destination'),
        accomodation: sql<string | null>`null`.as('accomodation'),
        agent_id: transaction.user_id,
        agent_name: sql`${user.firstName} || ' ' || ${user.lastName}`.as('agent_name'),
        date_created: booking.date_created,
        overall_commission: sql<number>`0`.as('overall_commission'),
      })
      .from(booking)
      .leftJoin(transaction, eq(booking.transaction_id, transaction.id))
      .leftJoin(clientTable, eq(transaction.client_id, clientTable.id))
      .leftJoin(user, eq(transaction.user_id, user.id))
      .leftJoin(package_type, eq(booking.holiday_type_id, package_type.id))
      .where(eq(booking.is_active, false))
      .orderBy(desc(booking.deleted_at))
      .limit(pageSize)
      .offset(offset);

    return {
      data: bookings.map((booking) => ({
        ...booking,
        clientId: booking.clientId as string,
        agent_id: booking.agent_id as string,
        holiday_type: booking.holiday_type as string,
        client_name: booking.client_name as string,
        agent_name: booking.agent_name as string,
        travel_date: booking.travel_date ? new Date(booking.travel_date) : new Date(),
        sales_price: parseFloat(booking.sales_price as string),
        package_commission: parseFloat(booking.package_commission as string),
        discount: parseFloat(booking.discount as string),
        service_charge: parseFloat(booking.service_charge as string),
        overall_commission: booking.overall_commission || 0,
        date_created: booking.date_created!.toISOString(),
      })),
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },
  fetchHistoricalBookings: async (id) => {
    const bookings = await db.select().from(historicalBooking).where(eq(historicalBooking.client_id, id));
    return bookings.map((booking) => ({
      ...booking,
      booking_date: booking.booking_date ? new Date(booking.booking_date).toISOString() : null,
      departure_date: booking.departure_date ? new Date(booking.departure_date).toISOString() : null,
      return_date: booking.return_date ? new Date(booking.return_date).toISOString() : null,
      cancelled_date: booking.cancelled_date ? new Date(booking.cancelled_date).toISOString() : null,
      gross_price: booking.gross_price ? parseFloat(booking.gross_price) : 0,
      net_price: booking.net_price ? parseFloat(booking.net_price) : 0,
      gross_before_discount: booking.gross_before_discount ? parseFloat(booking.gross_before_discount) : 0,
      profit: booking.profit ? parseFloat(booking.profit) : 0,
      total_payment: booking.total_payment ? parseFloat(booking.total_payment) : 0,
      duration: booking.duration ? parseInt(booking.duration) : 0,
      passegners: booking.passegners ? parseInt(booking.passegners) : 0,
      adults: booking.adults ? parseInt(booking.adults) : 0,
      children: booking.children ? parseInt(booking.children) : 0,
      infants: booking.infants ? parseInt(booking.infants) : 0,
      seniors: booking.seniors ? parseInt(booking.seniors) : 0,
    }));
  },
  fetchHistoricalBookingById: async (id) => {
    const bookings = await db.query.historicalBooking.findFirst({
      where: eq(historicalBooking.id, id),
    });

    return {
      ...bookings,
      booking_date: bookings?.booking_date ? new Date(bookings.booking_date).toISOString() : null,
      departure_date: bookings?.departure_date ? new Date(bookings.departure_date).toISOString() : null,
      return_date: bookings?.return_date ? new Date(bookings.return_date).toISOString() : null,
      cancelled_date: bookings?.cancelled_date ? new Date(bookings.cancelled_date).toISOString() : null,
      gross_price: bookings?.gross_price ? parseFloat(bookings.gross_price) : 0,
      net_price: bookings?.net_price ? parseFloat(bookings.net_price) : 0,
      gross_before_discount: bookings?.gross_before_discount ? parseFloat(bookings.gross_before_discount) : 0,
      profit: bookings?.profit ? parseFloat(bookings.profit) : 0,
      total_payment: bookings?.total_payment ? parseFloat(bookings.total_payment) : 0,
      duration: bookings?.duration ? parseInt(bookings.duration) : 0,
      passegners: bookings?.passegners ? parseInt(bookings.passegners) : 0,
      adults: bookings?.adults ? parseInt(bookings.adults) : 0,
      children: bookings?.children ? parseInt(bookings.children) : 0,
      infants: bookings?.infants ? parseInt(bookings.infants) : 0,
      seniors: bookings?.seniors ? parseInt(bookings.seniors) : 0,
    };
  },
  fetchForwardCommission: async () => {
    const currentDate = new Date();
    const startYear = startOfYear(currentDate);
    const endYear = endOfYear(currentDate);

    // Add first 2 months of next year
    const nextYear = new Date(currentDate.getFullYear() + 1, 0, 1); // January 1st of next year
    const nextYearEnd = new Date(currentDate.getFullYear() + 1, 1, 28); // End of February next year (28th to handle leap years)

    const response = await db
      .select({
        id: booking.id,
        travel_date: booking.travel_date,
        booking_commission: sql<string>`
              COALESCE(flight_comm.total, 0)
              + COALESCE(parking_comm.total, 0)
              + COALESCE(lounge_comm.total, 0)
              + COALESCE(attraction_comm.total, 0)
              + COALESCE(car_comm.total, 0)
              + COALESCE(transfer_comm.total, 0)
              + COALESCE(accom_comm.total, 0)
              + booking_table.package_commission
              - COALESCE(referral_comm.total * (${booking.package_commission} / 100), 0)
              `.as('booking_commission'),
        referral_commission: sql<string>`COALESCE(referral_comm.total * (${booking.package_commission} / 100), 0)
              `.as('referral_commission'),
      })
      .from(booking)
      .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
      .leftJoin(
        db
          .select({
            transactionId: referral.transactionId,
            total: sql<number>`SUM (referral."potentialCommission")`.as('total'),
          })
          .from(referral)
          .groupBy(referral.transactionId)
          .as('referral_comm'),
        eq(transaction.id, sql`referral_comm."transactionId"`)
      )
      .leftJoin(
        db
          .select({
            booking_id: booking_flights.booking_id,
            total: sql<number>`SUM(${booking_flights.commission})`.as('total'),
          })
          .from(booking_flights)
          .groupBy(booking_flights.booking_id)
          .as('flight_comm'),
        eq(booking.id, sql`flight_comm.booking_id`)
      )
      .leftJoin(
        db
          .select({
            booking_id: booking_airport_parking.booking_id,
            total: sql<number>`SUM(${booking_airport_parking.commission})`.as('total'),
          })
          .from(booking_airport_parking)
          .groupBy(booking_airport_parking.booking_id)
          .as('parking_comm'),
        eq(booking.id, sql`parking_comm.booking_id`)
      )

      .leftJoin(
        db
          .select({
            booking_id: booking_lounge_pass.booking_id,
            total: sql<number>`SUM(${booking_lounge_pass.commission})`.as('total'),
          })
          .from(booking_lounge_pass)
          .groupBy(booking_lounge_pass.booking_id)
          .as('lounge_comm'),
        eq(booking.id, sql`lounge_comm.booking_id`)
      )
      .leftJoin(
        db
          .select({
            booking_id: booking_attraction_ticket.booking_id,
            total: sql<number>`SUM(${booking_attraction_ticket.commission})`.as('total'),
          })
          .from(booking_attraction_ticket)
          .groupBy(booking_attraction_ticket.booking_id)
          .as('attraction_comm'),
        eq(booking.id, sql`attraction_comm.booking_id`)
      )

      .leftJoin(
        db
          .select({
            booking_id: booking_car_hire.booking_id,
            total: sql<number>`SUM(${booking_car_hire.commission})`.as('total'),
          })
          .from(booking_car_hire)
          .groupBy(booking_car_hire.booking_id)
          .as('car_comm'),
        eq(booking.id, sql`car_comm.booking_id`)
      )
      .leftJoin(
        db
          .select({
            booking_id: booking_transfers.booking_id,
            total: sql<number>`SUM(${booking_transfers.commission})`.as('total'),
          })
          .from(booking_transfers)
          .groupBy(booking_transfers.booking_id)
          .as('transfer_comm'),
        eq(booking.id, sql`transfer_comm.booking_id`)
      )
      .leftJoin(
        db
          .select({
            booking_id: booking_accomodation.booking_id,
            total: sql<number>`SUM(${booking_accomodation.commission})`.as('total'),
          })
          .from(booking_accomodation)
          .groupBy(booking_accomodation.booking_id)
          .as('accom_comm'),
        eq(booking.id, sql`accom_comm.booking_id`)
      )

      .where(
        and(
          eq(booking.is_active, true),
          or(
            // Current year bookings
            and(gte(booking.travel_date, startYear.toISOString().split('T')[0]), lte(booking.travel_date, endYear.toISOString().split('T')[0])),
            // First 2 months of next year
            and(gte(booking.travel_date, nextYear.toISOString()), lte(booking.travel_date, nextYearEnd.toISOString()))
          )
        )
      );

    const historial_monthly_data = await db
      .select({
        id: historicalBooking.id,
        travel_date: historicalBooking.departure_date,
        booking_commission: historicalBooking.profit,
      })
      .from(historicalBooking)
      .where(
        and(
          eq(historicalBooking.cancelled, false),
          or(
            and(
              gte(historicalBooking.departure_date, startYear.toISOString().split('T')[0]),
              lte(historicalBooking.departure_date, endYear.toISOString().split('T')[0])
            ),
            and(
              gte(historicalBooking.departure_date, nextYear.toISOString().split('T')[0]),
              lte(historicalBooking.departure_date, nextYearEnd.toISOString().split('T')[0])
            )
          )
        )
      );

    const historical_data = historial_monthly_data.map((booking) => ({
      ...booking,
      referral_commission: '0',
    }));

    const monthlyData = [...response, ...historical_data].reduce((acc, booking) => {
      if (booking.travel_date) {
        const travelDate = new Date(booking.travel_date);
        const month = travelDate.getMonth() + 1;

        const year = travelDate.getFullYear();
        const currentYear = new Date().getFullYear();

        let monthKey = month;
        if (year === currentYear + 1) {
          monthKey = month + 12;
        }

        if (!acc[monthKey]) {
          acc[monthKey] = [];
        }
        acc[monthKey].push({
          ...booking,
          travel_date: booking.travel_date || '',
          booking_commission: booking.booking_commission || '0',
          referral_commission: booking.referral_commission || '0',
        });
      }
      return acc;
    }, {} as Record<number, typeof response>);

    // Create array of objects with month names and total commissions (14 months total)
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
      'January (Next Year)',
      'February (Next Year)',
    ];

    const monthlyCommissions = monthNames.map((monthName, index) => {
      const monthNumber = index + 1; // 1-14
      const monthBookings = monthlyData[monthNumber + 2] || [];
      const totalCommission = monthBookings.reduce((sum: number, booking: (typeof response)[0]) => {
        return sum + (parseFloat(booking.booking_commission || '0') || 0);
      }, 0);
      const totalReferralCommission = monthBookings.reduce((sum: number, booking: (typeof response)[0]) => {
        return sum + (parseFloat(booking.referral_commission || '0') || 0);
      }, 0);
      return {
        month: monthName,
        travanaCommission: totalCommission,
        referralCommission: totalReferralCommission,
        target: 15000,
        target_remaining: 15000 - (totalCommission + totalReferralCommission),
        total_commission: totalCommission + totalReferralCommission,
      };
    });

    return monthlyCommissions.slice(0, 12);
  },
};
