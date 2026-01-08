import { db } from '../db/db';
import { AppError } from '../middleware/errorHandler';
import {
  enquiry_accomodation,
  enquiry_board_basis,
  enquiry_cruise_destination,
  enquiry_cruise_line,
  enquiry_departure_airport,
  enquiry_departure_port,
  enquiry_destination,
  enquiry_passenger,
  enquiry_resorts,
  enquiry_table,
} from '../schema/enquiry-schema';
import { notes } from '../schema/note-schema';
import { referral } from '../schema/referral-schema';
import {
  accomodation_list,
  board_basis,
  country,
  deletion_codes,
  destination,
  package_type,
  resorts,
  transaction,
} from '../schema/transactions-schema';
import { enquiry_mutate_schema, enquiryQuerySchema, InquiryMutate } from '../types/modules/transaction';
import { and, desc, eq, sql } from 'drizzle-orm';
import { format, parse } from 'date-fns';
import { clientTable } from '../schema/client-schema';
import { user } from '../schema/auth-schema';
import { cruise_destination, cruise_line, port } from '../schema/cruise-schema';
import { airport } from '../schema/flights-schema';
import z from 'zod';
import { pre_process_data } from '../helpers/pre_process_inquiry';
import { enquiryListQuerySchema } from '../types/modules/agent';

export type InquiryRepo = {
  markDeletionCodeAsUsed: (deletionCodeId: string) => Promise<void>;
  softDeleteInquiry: (inquiryId: string, deletionCode: string, deletedBy: string) => Promise<void>;
  restoreInquiry: (inquiryId: string) => Promise<void>;
  getDeletedInquiries: (
    page: number,
    limit: number
  ) => Promise<{
    data: z.infer<typeof enquiryListQuerySchema>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  insertInquiry: (data: InquiryMutate) => Promise<{ transaction_id: string }>;
  updateInquiry: (inquiryId: string, data: InquiryMutate) => Promise<void>;
  fetchInquiryById: (inquiryId: string) => Promise<z.infer<typeof enquiryQuerySchema>>;
  fetchInquiryForUpdate: (inquiryId: string) => Promise<z.infer<typeof enquiry_mutate_schema>>;
  fetchInquiryToConvert: (inquiryId: string) => Promise<z.infer<typeof enquiry_mutate_schema>>;
  fetchInquiries: (
    agentId?: string,
    clientId?: string,
    filters?: {
      search?: string;
      enquiry_status?: string;
      holiday_type?: string;
      travel_date_from?: string;
      travel_date_to?: string;
      budget_min?: string;
      budget_max?: string;
      destination?: string;
      is_future_deal?: string;
      is_active?: boolean;
      client_name?: string;
      agent_name?: string;
      cabin_type?: string;
      board_basis?: string;
      departure_port?: string;
      departure_airport?: string;
    },
    pagination?: {
      page?: number;
      limit?: number;
    }
  ) => Promise<{
    data: z.infer<typeof enquiryListQuerySchema>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  updateInquiryExpiry: (inquiryId: string, date_expiry: string, user_id: string) => Promise<void>;
  setFutureDealDate: (inquiryId: string, futureDealDate: string) => Promise<void>;
  unsetFutureDealDate: (inquiryId: string) => Promise<void>;
  updateInquiryStatus: (inquiryId: string, status: string) => Promise<void>;
};

export const inquiryRepo: InquiryRepo = {
  markDeletionCodeAsUsed: async (deletionCodeId: string) => {
    await db.update(deletion_codes).set({ is_used: true }).where(eq(deletion_codes.id, deletionCodeId));
  },

  softDeleteInquiry: async (inquiryId: string, deletionCode: string, deletedBy: string) => {
    await db
      .update(enquiry_table)
      .set({
        is_active: false,
        deletion_code: deletionCode,
        deleted_by: deletedBy,
        deleted_at: new Date(),
      })
      .where(eq(enquiry_table.id, inquiryId));
  },
  restoreInquiry: async (inquiryId: string) => {
    await db
      .update(enquiry_table)
      .set({ is_active: true, deletion_code: null, deleted_by: null, deleted_at: null })
      .where(eq(enquiry_table.id, inquiryId));
  },

  getDeletedInquiries: async (page: number, limit: number) => {
    try {
      const pageNumber = page || 1;
      const pageSize = limit || 10;
      const offset = (pageNumber - 1) * pageSize;

      const response = await db.query.enquiry_table.findMany({
        with: {
          holiday_type: true,
          transaction: {
            with: {
              client: true,
              user: true,
            },
          },
          cruise_line: {
            with: {
              cruise_line: true,
            },
          },
          board_basis: {
            with: {
              board_basis: true,
            },
          },
          departure_port: {
            with: {
              port: true,
            },
          },
          enquiry_cruise_destination: {
            with: {
              cruise_destination: true,
            },
          },
          destination: {
            with: {
              destination: {
                with: {
                  country: true,
                },
              },
            },
          },
          resortss: {
            with: {
              resorts: true,
            },
          },
          accomodation: {
            with: {
              accomodation: true,
            },
          },
          departure_airport: {
            with: {
              airport: true,
            },
          },
        },
      });

      // Filter for deleted enquiries only
      let filteredResponse = response.filter((item) => {
        return !item.is_active; // Only include soft-deleted enquiries
      });

      const total = filteredResponse.length;

      // Apply pagination
      const paginatedResponse = filteredResponse.slice(offset, offset + pageSize);

      const payload = paginatedResponse.map((item) => ({
        id: item.id,
        title: item.title,
        deleted_at: item.deleted_at,
        deleted_by: item.deleted_by,
        deletion_code: item.deletion_code,
        date_created: item.date_created,
        travel_date: item.travel_date!,
        budget: item.budget || '0',
        status: item.transaction?.status as 'on_quote' | 'on_enquiry' | 'on_booking',
        enquiry_status: item.status as 'ACTIVE' | 'LOST' | 'INACTIVE' | 'EXPIRED' | 'NEW_LEAD',
        transaction_id: item.transaction_id!,
        clientId: item.transaction?.client_id!,
        clientName: `${item.transaction?.client?.firstName} ${item.transaction?.client?.surename}`,
        agent_id: item.transaction?.user_id!,
        agentName: `${item.transaction?.user?.firstName} ${item.transaction?.user?.lastName}`,
        holiday_type: item.holiday_type?.id!,
        holiday_type_name: item.holiday_type?.name || '',
        no_of_nights: item.no_of_nights?.toString() || '0',
        is_future_deal: item.is_future_deal || false,
        future_deal_date: item.future_deal_date,
        date_expiry: item.date_expiry,
        cruise_line: item.cruise_line?.map((item) => item.cruise_line?.name).filter((name): name is string => name != null) || [],
        board_basis: item.board_basis?.map((item) => item.board_basis?.type).filter((type): type is string => type != null) || [],
        departure_port: item.departure_port?.map((item) => item.port?.name).filter((name): name is string => name != null) || [],
        enquiry_cruise_destination:
          item.enquiry_cruise_destination?.map((item) => item.cruise_destination?.name).filter((name): name is string => name != null) || [],
        destination:
          item.destination
            ?.map((item) => `${item.destination?.name} (${item.destination?.country?.country_name})`)
            .filter((dest): dest is string => dest != null) || [],
        resortss: item.resortss?.map((item) => item.resorts?.name).filter((name): name is string => name != null) || [],
        accomodation: item.accomodation.map((item) => item.accomodation?.name).filter((name): name is string => name != null),
        departure_airport: item.departure_airport.map((item) => item.airport?.airport_name).filter((name): name is string => name != null),
      }));

      return {
        data: payload,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong querying deleted enquiries', true, 500);
    }
  },
  insertInquiry: async (data: InquiryMutate) => {
    try {
      const now = new Date();
      const plus2 = new Date(now);
      plus2.setDate(now.getDate() + 1);
      const date_expiry = data.is_future_deal ? null : data.date_expiry ? new Date(data.date_expiry) : plus2;

      return await db.transaction(async (tx) => {
        // Insert main enquiry record
        const [transaction_id] = await tx
          .insert(transaction)
          .values({
            status: 'on_enquiry',
            client_id: data.client_id,
            user_id: data.agent_id,
            lead_source: data.lead_source,
          })
          .returning({ id: transaction.id });
        const [enquiry] = await tx
          .insert(enquiry_table)
          .values({
            transaction_id: transaction_id.id,
            holiday_type_id: data.holiday_type_id,
            accomodation_type_id: data.accomodation_type_id,
            travel_date: data.travel_date,
            flexibility_date: data.flexibility_date,
            adults: data.adults,
            children: data.children,
            budget_type: data.budget_type,
            infants: data.infants,
            cabin_type: data.cabin_type,
            flexible_date: data.flexible_date,
            accom_min_star_rating: data.accom_min_star_rating,
            weekend_lodge: data.weekend_lodge,
            no_of_nights: parseInt(data.no_of_nights || '0'),
            budget: data.budget.toString(),
            max_budget: data.max_budget?.toString() || '0',
            no_of_guests: data.no_of_guests,
            no_of_pets: data.no_of_pets,
            pre_cruise_stay: data.pre_cruise_stay,
            post_cruise_stay: data.post_cruise_stay,
            email: data.email,
            date_expiry: date_expiry,
            title: data.title,
            is_future_deal: data.is_future_deal ?? false,
            future_deal_date: data.future_deal_date,
            status: 'NEW_LEAD',
          })
          .returning({ id: enquiry_table.id });

        const enquiry_id = enquiry.id;


        if (data.passengers && data.passengers.length > 0) {
          const passengersPayload = data.passengers.map((passenger) => ({
            age: passenger.age,
            type: passenger.type,
            enquiry_id: enquiry_id,
          }));
          await tx.insert(enquiry_passenger).values(passengersPayload);
        }
        //Insert Cruise line
        if (data.cruise_line && data.cruise_line.length) {
          const cruiseLinePayload = data.cruise_line.map((id) => ({
            cruise_line_id: id,
            enquiry_id,
          }));
          await tx.insert(enquiry_cruise_line).values(cruiseLinePayload);
        }

        //insert notes
        if (data.notes) {
          await tx.insert(notes).values({
            description: data.notes,
            transaction_id: transaction_id.id,
            user_id: data.agent_id,
          });
        }
        // Insert board basis entries
        if (data.board_basis && data.board_basis?.length) {
          const boardBasisPayload = data.board_basis.map((id) => ({
            board_basis_id: id,
            enquiry_id,
          }));
          await tx.insert(enquiry_board_basis).values(boardBasisPayload);
        }

        // Insert departure ports
        if (data.departure_port && data.departure_port.length) {
          const portPayload = data.departure_port.map((id) => ({
            port_id: id,
            enquiry_id,
          }));
          await tx.insert(enquiry_departure_port).values(portPayload);
        }
        //insert cruise destination
        if (data.cruise_destination && data.cruise_destination.length) {
          const cruiseDestinationPayload = data.cruise_destination.map((id) => ({
            cruise_destination_id: id,
            enquiry_id,
          }));
          await tx.insert(enquiry_cruise_destination).values(cruiseDestinationPayload);
        }

        // Insert destination
        if (data.destination && data.destination.length) {
          const destinationPayload = data.destination.map((id) => ({
            destination_id: id,
            enquiry_id,
          }));

          await tx.insert(enquiry_destination).values(destinationPayload);
        }
        //insert resortss
        if (data.resorts && data.resorts.length) {
          const resortsPayload = data.resorts.map((id) => ({
            resorts_id: id,
            enquiry_id,
          }));
          await tx.insert(enquiry_resorts).values(resortsPayload);
        }
        //insert accomodation
        if (data.accomodation && data.accomodation.length) {
          const accomodationPayload = data.accomodation.map((id) => ({
            accomodation_id: id,
            enquiry_id,
          }));
          await tx.insert(enquiry_accomodation).values(accomodationPayload);
        }

        // Insert departure airports
        if (data.departure_airport && data.departure_airport?.length) {
          const airportPayload = data.departure_airport.map((id) => ({
            airport_id: id,
            enquiry_id,
          }));
          await tx.insert(enquiry_departure_airport).values(airportPayload);
        }


        return {
          transaction_id: transaction_id.id,
        };
      });
    } catch (error) {
      console.error(error);
      throw new AppError('Something went wrong during the enquiry insertion process', true, 500);
    }
  },
  updateInquiry: async (inquiryId: string, data: InquiryMutate) => {
    try {
      const now = new Date();
      const plus2 = new Date(now);
      plus2.setDate(now.getDate() + 1);
      const date_expiry = data.is_future_deal ? null : data.date_expiry ? new Date(data.date_expiry) : plus2;
      await db.transaction(async (tx) => {
        await tx
          .update(transaction)
          .set({
            lead_source: data.lead_source,
          })
          .where(eq(transaction.id, data.transaction_id!));
        await tx
          .update(enquiry_table)
          .set({
            holiday_type_id: data.holiday_type_id,
            accomodation_type_id: data.accomodation_type_id,
            travel_date: data.travel_date,
            flexibility_date: data.flexibility_date,
            adults: data.adults,
            children: data.children,
            infants: data.infants,
            status: 'NEW_LEAD',
            budget_type: data.budget_type,
            cabin_type: data.cabin_type,
            flexible_date: data.flexible_date,
            accom_min_star_rating: data.accom_min_star_rating,
            weekend_lodge: data.weekend_lodge,
            no_of_nights: parseInt(data.no_of_nights || '0'),
            max_budget: data.max_budget?.toString() || '0',
            budget: data.budget.toString(),
            no_of_guests: data.no_of_guests,
            no_of_pets: data.no_of_pets,
            pre_cruise_stay: data.pre_cruise_stay,
            post_cruise_stay: data.post_cruise_stay,
            email: data.email,
            date_expiry: date_expiry,
            is_future_deal: data.is_future_deal ?? false,
            future_deal_date: data.is_future_deal ? data.future_deal_date : null,
            title: data.title,
          })
          .where(eq(enquiry_table.id, inquiryId));

        if (data.cruise_line && data.cruise_line.length) {
          await tx.delete(enquiry_cruise_line).where(eq(enquiry_cruise_line.enquiry_id, inquiryId));

          const cruiseLinePayload = data.cruise_line.map((id) => ({
            cruise_line_id: id,
            enquiry_id: inquiryId,
          }));
          await tx.insert(enquiry_cruise_line).values(cruiseLinePayload);
        }

        if (data.board_basis && data.board_basis?.length) {
          await tx.delete(enquiry_board_basis).where(eq(enquiry_board_basis.enquiry_id, inquiryId));
          const boardBasisPayload = data.board_basis.map((id) => ({
            board_basis_id: id,
            enquiry_id: inquiryId,
          }));
          await tx.insert(enquiry_board_basis).values(boardBasisPayload);
        }
        if (data.departure_port && data.departure_port.length) {
          await tx.delete(enquiry_departure_port).where(eq(enquiry_departure_port.enquiry_id, inquiryId));
          const portPayload = data.departure_port.map((id) => ({
            port_id: id,
            enquiry_id: inquiryId,
          }));
          await tx.insert(enquiry_departure_port).values(portPayload);
        }
        if (data.cruise_destination && data.cruise_destination.length) {
          await tx.delete(enquiry_cruise_destination).where(eq(enquiry_cruise_destination.enquiry_id, inquiryId));
          const cruiseDestinationPayload = data.cruise_destination.map((id) => ({
            cruise_destination_id: id,
            enquiry_id: inquiryId,
          }));
          await tx.insert(enquiry_cruise_destination).values(cruiseDestinationPayload);
        }
        if (data.destination && data.destination.length) {
          await tx.delete(enquiry_destination).where(eq(enquiry_destination.enquiry_id, inquiryId));
          const destinationPayload = data.destination.map((id) => ({
            destination_id: id,
            enquiry_id: inquiryId,
          }));

          await tx.insert(enquiry_destination).values(destinationPayload);
        }
        //insert resortss
        if (data.resorts && data.resorts.length) {
          await tx.delete(enquiry_resorts).where(eq(enquiry_resorts.enquiry_id, inquiryId));
          const resortsPayload = data.resorts.map((id) => ({
            resorts_id: id,
            enquiry_id: inquiryId,
          }));
          await tx.insert(enquiry_resorts).values(resortsPayload);
        }
        //insert accomodation
        if (data.accomodation && data.accomodation.length) {
          await tx.delete(enquiry_accomodation).where(eq(enquiry_accomodation.enquiry_id, inquiryId));
          const accomodationPayload = data.accomodation.map((id) => ({
            accomodation_id: id,
            enquiry_id: inquiryId,
          }));
          await tx.insert(enquiry_accomodation).values(accomodationPayload);
        }

        // Insert departure airports
        if (data.departure_airport && data.departure_airport?.length) {
          await tx.delete(enquiry_departure_airport).where(eq(enquiry_departure_airport.enquiry_id, inquiryId));
          const airportPayload = data.departure_airport.map((id) => ({
            airport_id: id,
            enquiry_id: inquiryId,
          }));
          await tx.insert(enquiry_departure_airport).values(airportPayload);
        }

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
            })
            .where(eq(referral.id, data.referralId));
        }
      });
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong updating enquiry', true, 500);
    }
  },
  fetchInquiryById: async (inquiryId: string) => {
    try {
      const response1 = await db
        .select({
          id: enquiry_table.id,
          lead_source: transaction.lead_source,
          status: transaction.status,
          title: enquiry_table.title,
          travel_date: enquiry_table.travel_date,
          email: enquiry_table.email,
          holiday_type: package_type.name,
          budget_type: enquiry_table.budget_type,
          agentName: sql<string>`${user.firstName} || ' ' || ${user.lastName}`,
          clientName: sql<string>`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
          clientId: transaction.client_id,
          agentId: transaction.user_id,
          transactionId: transaction.id,
          transaction: enquiry_table.travel_date,
          adults: enquiry_table.adults,
          children: enquiry_table.children,
          infants: enquiry_table.infants,
          cabin_type: enquiry_table.cabin_type,
          flexible_date: enquiry_table.flexible_date,
          weekend_lodge: enquiry_table.weekend_lodge,
          flexibility_date: enquiry_table.flexibility_date,
          no_of_nights: enquiry_table.no_of_nights,
          accom_min_star_rating: enquiry_table.accom_min_star_rating,
          budget: enquiry_table.budget,
          no_of_guests: enquiry_table.no_of_guests,
          no_of_pets: enquiry_table.no_of_pets,
          pre_cruise_stay: enquiry_table.pre_cruise_stay,
          post_cruise_stay: enquiry_table.post_cruise_stay,
          date_created: enquiry_table.date_created,
          date_expiry: enquiry_table.date_expiry,
          enquiry_status: enquiry_table.status,

          cruise_line: {
            id: cruise_line.id,
            name: cruise_line.name,
          },
          board_basis: {
            id: board_basis.id,
            type: board_basis.type,
          },
          departure_port: {
            id: port.id,
            name: port.name,
          },
          enquiry_cruise_destination: {
            id: cruise_destination.id,
            name: cruise_destination.name,
          },
          destination: {
            id: destination.id,
            name: destination.name,
            country_name: country.country_name,
          },
          resorts: {
            id: resorts.id,
            name: resorts.name,
          },
          accomodation: {
            id: accomodation_list.id,
            name: accomodation_list.name,
          },
          departure_airport: {
            id: airport.id,
            airport_name: airport.airport_name,
          },
        })
        .from(enquiry_table)
        .leftJoin(transaction, eq(transaction.id, enquiry_table.transaction_id))
        .leftJoin(package_type, eq(package_type.id, enquiry_table.holiday_type_id))
        .leftJoin(user, eq(user.id, transaction.user_id))
        .leftJoin(clientTable, eq(clientTable.id, transaction.client_id))
        .leftJoin(enquiry_cruise_line, eq(enquiry_cruise_line.enquiry_id, enquiry_table.id))
        .leftJoin(cruise_line, eq(cruise_line.id, enquiry_cruise_line.cruise_line_id))
        .leftJoin(enquiry_board_basis, eq(enquiry_board_basis.enquiry_id, enquiry_table.id))
        .leftJoin(board_basis, eq(board_basis.id, enquiry_board_basis.board_basis_id))
        .leftJoin(enquiry_departure_port, eq(enquiry_departure_port.enquiry_id, enquiry_table.id))
        .leftJoin(port, eq(port.id, enquiry_departure_port.port_id))
        .leftJoin(enquiry_cruise_destination, eq(enquiry_cruise_destination.enquiry_id, enquiry_table.id))
        .leftJoin(cruise_destination, eq(cruise_destination.id, enquiry_cruise_destination.cruise_destination_id))
        .leftJoin(enquiry_destination, eq(enquiry_destination.enquiry_id, enquiry_table.id))
        .leftJoin(destination, eq(destination.id, enquiry_destination.destination_id))
        .leftJoin(country, eq(country.id, destination.country_id))
        .leftJoin(enquiry_resorts, eq(enquiry_resorts.enquiry_id, enquiry_table.id))
        .leftJoin(resorts, eq(resorts.id, enquiry_resorts.resorts_id))
        .leftJoin(enquiry_accomodation, eq(enquiry_accomodation.enquiry_id, enquiry_table.id))
        .leftJoin(accomodation_list, eq(accomodation_list.id, enquiry_accomodation.accomodation_id))
        .leftJoin(enquiry_departure_airport, eq(enquiry_departure_airport.enquiry_id, enquiry_table.id))
        .leftJoin(airport, eq(airport.id, enquiry_departure_airport.airport_id))

        .where(and(eq(enquiry_table.id, inquiryId), eq(transaction.status, 'on_enquiry')));

      if (response1.length === 0) throw new AppError('Enquiry not found', true, 404);
      const groupedResults = response1.reduce((acc, curr) => {
        const {
          id,
          cruise_line,
          board_basis,
          departure_port,
          enquiry_cruise_destination,
          destination,
          resorts,
          accomodation,
          departure_airport,
          ...rest
        } = curr;

        if (!acc[id]) {
          acc[id] = {
            id,
            ...rest,
            travel_date: format(rest.travel_date!, 'yyyy-MM-dd'),
            cruise_line: [],
            board_basis: [],
            departure_port: [],
            enquiry_cruise_destination: [],
            destination: [],
            resorts: [],
            accomodation: [],
            departure_airport: [],
            notes: [],
            status: 'on_enquiry',
            enquiry_status: rest.enquiry_status || '',
            holiday_type: rest.holiday_type || '',
            clientName: rest.clientName || '',
            agentName: rest.agentName || '',
            clientId: rest.clientId || '',
            transactionId: rest.transactionId || '',
            agentId: rest.agentId || '',
            lead_source: rest.lead_source || '',
            adults: rest.adults?.toString() || '0',
            children: rest.children?.toString() || '0    ',
            infants: rest.infants?.toString() || '0',
            cabin_type: rest.cabin_type || '',
            flexible_date: rest.flexible_date || '',
            weekend_lodge: rest.weekend_lodge || '',
            flexibility_date: rest.flexibility_date || '',
            no_of_nights: rest.no_of_nights?.toString() || '0',
            accom_min_star_rating: rest.accom_min_star_rating || '',
            budget: rest.budget || '0',
            no_of_guests: rest.no_of_guests?.toString() || '0',
            no_of_pets: rest.no_of_pets?.toString() || '0',
            pre_cruise_stay: rest.pre_cruise_stay?.toString() || '0',
            post_cruise_stay: rest.post_cruise_stay?.toString() || '0',
            date_created: rest.date_created?.toString() || '',
            date_expiry: rest.date_expiry?.toString() || '',
            title: rest.title || '',
          };
        }

        if (curr.cruise_line && acc[id].cruise_line && !acc[id].cruise_line.some((item) => item.id === curr.cruise_line?.id)) {
          acc[id].cruise_line.push({ ...curr.cruise_line, name: curr.cruise_line.name! });
        }

        if (curr.board_basis && acc[id].board_basis && !acc[id].board_basis.some((item) => item.id === curr.board_basis?.id)) {
          acc[id].board_basis.push({ ...curr.board_basis, type: curr.board_basis.type! });
        }

        if (curr.departure_port && acc[id].departure_port && !acc[id].departure_port.some((item) => item.id === curr.departure_port!.id)) {
          acc[id].departure_port.push({ ...curr.departure_port, name: curr.departure_port.name! });
        }

        if (
          curr.enquiry_cruise_destination &&
          acc[id].enquiry_cruise_destination &&
          !acc[id].enquiry_cruise_destination.some((item) => item.id === curr.enquiry_cruise_destination!.id)
        ) {
          acc[id].enquiry_cruise_destination.push({ ...curr.enquiry_cruise_destination, name: curr.enquiry_cruise_destination.name! });
        }

        if (curr.destination && acc[id].destination && !acc[id].destination.some((item) => item.id === curr.destination!.id)) {
          acc[id].destination.push({
            ...curr.destination,
            id: curr.destination!.id!,
            name: curr.destination.name!,
            country_name: curr.destination.country_name!,
          });
        }

        if (curr.resorts && acc[id].resorts && !acc[id].resorts.some((item) => item.id === curr.resorts!.id)) {
          acc[id].resorts.push({ ...curr.resorts, id: curr.resorts!.id!, name: curr.resorts.name!, destination_id: '' });
        }
        if (curr.accomodation && acc[id].accomodation && !acc[id].accomodation.some((item) => item.id === curr.accomodation!.id)) {
          acc[id].accomodation.push({
            ...curr.accomodation,
            id: curr.accomodation!.id!,
            name: curr.accomodation.name!,
            resorts_id: '',
            type: { id: '', type: '' } as { id: string; type: string },
          });
        }

        if (
          curr.departure_airport &&
          acc[id].departure_airport &&
          !acc[id].departure_airport.some((item) => item.id === curr.departure_airport!.id)
        ) {
          acc[id].departure_airport.push({
            ...curr.departure_airport,
            id: curr.departure_airport!.id!,
            airport_name: curr.departure_airport.airport_name || '',
            airport_code: '',
            country_id: '',
          });
        }

        return acc;
      }, {} as Record<string, z.infer<typeof enquiryQuerySchema>>);

      const structuredResults = Object.values(groupedResults);
      return structuredResults[0];
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong assigning agent enquiry', true, 500);
    }
  },
  fetchInquiryForUpdate: async (inquiryId: string) => {
    try {
      const response = await db
        .select({
          id: enquiry_table.id,
          holiday_type_id: package_type.id,
          holiday_type_name: package_type.name,
          client_id: transaction.client_id,
          agent_id: transaction.user_id,
          travel_date: enquiry_table.travel_date,
          lead_source: transaction.lead_source,
          budget_type: enquiry_table.budget_type,
          referralId: referral.id,
          potentialCommission: referral.potentialCommission,
          referrerId: referral.referrerId,
          flexibility_date: enquiry_table.flexibility_date,
          adults: enquiry_table.adults,
          children: enquiry_table.children,
          infants: enquiry_table.infants,
          email: enquiry_table.email,
          cabin_type: enquiry_table.cabin_type,
          flexible_date: enquiry_table.flexible_date,
          weekend_lodge: enquiry_table.weekend_lodge,
          no_of_nights: enquiry_table.no_of_nights,
          budget: enquiry_table.budget,
          max_budget: enquiry_table.max_budget,
          no_of_guests: enquiry_table.no_of_guests,
          no_of_pets: enquiry_table.no_of_pets,
          pre_cruise_stay: enquiry_table.pre_cruise_stay,
          post_cruise_stay: enquiry_table.post_cruise_stay,
          accom_min_star_rating: enquiry_table.accom_min_star_rating,
          cruise_line: cruise_line.id,
          board_basis: board_basis.id,
          departure_port: port.id,
          cruise_destination: cruise_destination.id,
          is_future_deal: enquiry_table.is_future_deal,
          future_deal_date: enquiry_table.future_deal_date,
          date_expiry: enquiry_table.date_expiry,
          destination: destination.id,
          resorts: resorts.id,
          accomodation: accomodation_list.id,
          departure_airport: airport.id,
          title: enquiry_table.title,
          country_id: destination.country_id,
          accomodation_type_id: enquiry_table.accomodation_type_id,
          client_name: sql<string>`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
        })
        .from(enquiry_table)
        .leftJoin(transaction, eq(transaction.id, enquiry_table.transaction_id))
        .leftJoin(package_type, eq(package_type.id, enquiry_table.holiday_type_id))
        .leftJoin(referral, eq(referral.transactionId, transaction.id))
        .leftJoin(user, eq(user.id, transaction.user_id))
        .leftJoin(clientTable, eq(clientTable.id, transaction.client_id))
        .leftJoin(enquiry_cruise_line, eq(enquiry_cruise_line.enquiry_id, enquiry_table.id))
        .leftJoin(cruise_line, eq(cruise_line.id, enquiry_cruise_line.cruise_line_id))
        .leftJoin(enquiry_board_basis, eq(enquiry_board_basis.enquiry_id, enquiry_table.id))
        .leftJoin(board_basis, eq(board_basis.id, enquiry_board_basis.board_basis_id))
        .leftJoin(enquiry_departure_port, eq(enquiry_departure_port.enquiry_id, enquiry_table.id))
        .leftJoin(port, eq(port.id, enquiry_departure_port.port_id))
        .leftJoin(enquiry_cruise_destination, eq(enquiry_cruise_destination.enquiry_id, enquiry_table.id))
        .leftJoin(cruise_destination, eq(cruise_destination.id, enquiry_cruise_destination.cruise_destination_id))
        .leftJoin(enquiry_destination, eq(enquiry_destination.enquiry_id, enquiry_table.id))
        .leftJoin(destination, eq(destination.id, enquiry_destination.destination_id))
        .leftJoin(country, eq(country.id, destination.country_id))
        .leftJoin(enquiry_resorts, eq(enquiry_resorts.enquiry_id, enquiry_table.id))
        .leftJoin(resorts, eq(resorts.id, enquiry_resorts.resorts_id))
        .leftJoin(enquiry_accomodation, eq(enquiry_accomodation.enquiry_id, enquiry_table.id))
        .leftJoin(accomodation_list, eq(accomodation_list.id, enquiry_accomodation.accomodation_id))
        .leftJoin(enquiry_departure_airport, eq(enquiry_departure_airport.enquiry_id, enquiry_table.id))
        .leftJoin(airport, eq(airport.id, enquiry_departure_airport.airport_id))

        .where(eq(enquiry_table.id, inquiryId));
      if (response.length === 0) throw new AppError('Enquiry not found', true, 404);
      const groupedResults = response.reduce((acc, curr) => {
        const { id, ...rest } = curr; // Destructure to separate id from the rest of the object
        if (!acc[id]) {
          acc[id] = {
            ...rest,
            is_future_deal: rest.is_future_deal ? rest.is_future_deal : false,
            holiday_type_id: rest.holiday_type_id ? rest.holiday_type_id : '',
            date_expiry: rest.date_expiry ? format(rest.date_expiry, 'yyyy-MM-dd') : new Date().toISOString(),
            travel_date: rest.travel_date ? format(rest.travel_date, 'yyyy-MM-dd') : new Date().toISOString(),
            no_of_nights: rest.no_of_nights ? rest.no_of_nights.toString() : '0',
            max_budget: rest.max_budget ? parseInt(rest.max_budget) : 0,
            budget: rest.budget ? parseInt(rest.budget) : 0,
            lead_source: rest.lead_source ? rest.lead_source : 'SHOP',
            client_id: rest.client_id ? rest.client_id : '',
            client_name: rest.client_name ? rest.client_name : '',
            potentialCommission: rest.potentialCommission ? parseFloat(rest.potentialCommission) : 0,
            agent_id: rest.agent_id ? rest.agent_id : '',
            holiday_type_name: rest.holiday_type_name ? rest.holiday_type_name : '',
            adults: rest.adults ? rest.adults : 0,
            children: rest.children ? rest.children : 0,
            infants: rest.infants ? rest.infants : 0,
            no_of_guests: rest.no_of_guests ? rest.no_of_guests : 0,
            no_of_pets: rest.no_of_pets ? rest.no_of_pets : 0,
            pre_cruise_stay: rest.pre_cruise_stay ? rest.pre_cruise_stay : 0,
            post_cruise_stay: rest.post_cruise_stay ? rest.post_cruise_stay : 0,
            country_id: [],
            cruise_line: [],
            board_basis: [],
            departure_port: [],
            cruise_destination: [],
            destination: [],
            resorts: [],
            accomodation: [],
            departure_airport: [],
          };
        }
        if (curr.country_id && acc[id].country_id && !acc[id].country_id.some((item) => item === curr.country_id)) {
          acc[id].country_id.push(curr.country_id);
        }
        if (curr.cruise_line && acc[id].cruise_line && !acc[id].cruise_line.some((item) => item === curr.cruise_line)) {
          acc[id].cruise_line.push(curr.cruise_line);
        }
        if (curr.board_basis && acc[id].board_basis && !acc[id].board_basis.some((item) => item === curr.board_basis)) {
          acc[id].board_basis.push(curr.board_basis);
        }
        if (curr.departure_port && acc[id].departure_port && !acc[id].departure_port.some((item) => item === curr.departure_port)) {
          acc[id].departure_port.push(curr.departure_port);
        }
        if (curr.cruise_destination && acc[id].cruise_destination && !acc[id].cruise_destination.some((item) => item === curr.cruise_destination)) {
          acc[id].cruise_destination.push(curr.cruise_destination);
        }
        if (curr.destination && acc[id].destination && !acc[id].destination.some((item) => item === curr.destination)) {
          acc[id].destination.push(curr.destination);
        }
        if (curr.resorts && acc[id].resorts && !acc[id].resorts.some((item) => item === curr.resorts)) {
          acc[id].resorts.push(curr.resorts);
        }
        if (curr.accomodation && acc[id].accomodation && !acc[id].accomodation.some((item) => item === curr.accomodation)) {
          acc[id].accomodation.push(curr.accomodation);
        }
        if (curr.departure_airport && acc[id].departure_airport && !acc[id].departure_airport.some((item) => item === curr.departure_airport)) {
          acc[id].departure_airport.push(curr.departure_airport);
        }

        return acc;
      }, {} as Record<string, z.infer<typeof enquiry_mutate_schema>>);
      const structuredResults = Object.values(groupedResults);

      return structuredResults[0];
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong querying enquiry', true, 500);
    }
  },
  fetchInquiryToConvert: async (inquiryId: string) => {
    try {


      const accomodation_data = await db.select({
        resorts_id: resorts.id,
        destination_id: destination.id,
        country_id: country.id,
        enquiry_id: enquiry_resorts.enquiry_id,
      }).from(enquiry_resorts)
        .leftJoin(resorts, eq(resorts.id, enquiry_resorts.resorts_id))
        .leftJoin(destination, eq(destination.id, resorts.destination_id))
        .leftJoin(country, eq(country.id, destination.country_id))
        .where(eq(enquiry_resorts.enquiry_id, inquiryId))
        .limit(1);

      console.log('accomodation_data', accomodation_data);
      const response = await db
        .select({
          id: enquiry_table.id,
          transaction_id: enquiry_table.transaction_id,
          holiday_type_id: package_type.id,
          title: enquiry_table.title,
          holiday_type_name: package_type.name,
          client_id: transaction.client_id,
          agent_id: transaction.user_id,
          travel_date: enquiry_table.travel_date,
          flexibility_date: enquiry_table.flexibility_date,
          adults: enquiry_table.adults,
          children: enquiry_table.children,
          infants: enquiry_table.infants,
          email: enquiry_table.email,
          cabin_type: enquiry_table.cabin_type,
          flexible_date: enquiry_table.flexible_date,
          weekend_lodge: enquiry_table.weekend_lodge,
          no_of_nights: enquiry_table.no_of_nights,
          budget: enquiry_table.budget,
          max_budget: enquiry_table.max_budget,
          no_of_guests: enquiry_table.no_of_guests,
          no_of_pets: enquiry_table.no_of_pets,
          pre_cruise_stay: enquiry_table.pre_cruise_stay,
          post_cruise_stay: enquiry_table.post_cruise_stay,
          accom_min_star_rating: enquiry_table.accom_min_star_rating,
          cruise_line: cruise_line.id,
          board_basis: board_basis.id,
          departure_port: port.id,
          cruise_destination: cruise_destination.id,
          is_future_deal: enquiry_table.is_future_deal,
          future_deal_date: enquiry_table.future_deal_date,
          date_expiry: enquiry_table.date_expiry,
          departure_airport: airport.id,

          accomodation_type_id: enquiry_table.accomodation_type_id,
          client_name: sql<string>`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
          lead_source: transaction.lead_source,
          potentialCommission: referral.potentialCommission,
          referrerId: referral.referrerId,
        })
        .from(enquiry_table)
        .leftJoin(transaction, eq(transaction.id, enquiry_table.transaction_id))
        .leftJoin(referral, eq(referral.transactionId, transaction.id))
        .leftJoin(package_type, eq(package_type.id, enquiry_table.holiday_type_id))
        .leftJoin(user, eq(user.id, transaction.user_id))
        .leftJoin(clientTable, eq(clientTable.id, transaction.client_id))
        .leftJoin(enquiry_cruise_line, eq(enquiry_cruise_line.enquiry_id, enquiry_table.id))
        .leftJoin(cruise_line, eq(cruise_line.id, enquiry_cruise_line.cruise_line_id))
        .leftJoin(enquiry_board_basis, eq(enquiry_board_basis.enquiry_id, enquiry_table.id))
        .leftJoin(board_basis, eq(board_basis.id, enquiry_board_basis.board_basis_id))
        .leftJoin(enquiry_departure_port, eq(enquiry_departure_port.enquiry_id, enquiry_table.id))
        .leftJoin(port, eq(port.id, enquiry_departure_port.port_id))
        .leftJoin(enquiry_cruise_destination, eq(enquiry_cruise_destination.enquiry_id, enquiry_table.id))
        .leftJoin(cruise_destination, eq(cruise_destination.id, enquiry_cruise_destination.cruise_destination_id))
        .leftJoin(enquiry_departure_airport, eq(enquiry_departure_airport.enquiry_id, enquiry_table.id))
        .leftJoin(airport, eq(airport.id, enquiry_departure_airport.airport_id))
        .where(eq(enquiry_table.id, inquiryId));


      if (response.length === 0) throw new AppError('Enquiry not found', true, 404);
      const groupedResults = response.reduce((acc, curr) => {
        const { id, ...rest } = curr; // Destructure to separate id from the rest of the object

        // For "27-12-2025"  
        const parsedTravelDate = parse(rest.travel_date!, "yyyy-MM-dd", new Date());
        console.log('parsedTravelDate', rest.travel_date, parsedTravelDate);
        if (!acc[id]) {
          acc[id] = {
            ...rest,
            transaction_id: rest.transaction_id!,
            is_future_deal: rest.is_future_deal ? rest.is_future_deal : false,
            holiday_type_id: rest.holiday_type_id ? rest.holiday_type_id : '',
            holiday_type_name: rest.holiday_type_name ? rest.holiday_type_name : '',
            date_expiry: rest.date_expiry ? format(rest.date_expiry, "dd-MM-yyyy HH:mm:ss") : new Date().toISOString(),
            travel_date: rest.travel_date ? format(parsedTravelDate, "dd-MM-yyyy HH:mm:ss") : new Date().toISOString(),
            no_of_nights: rest.no_of_nights ? rest.no_of_nights.toString() : '0',
            max_budget: rest.max_budget ? parseInt(rest.max_budget) : 0,
            budget: rest.budget ? parseInt(rest.budget) : 0,
            lead_source: rest.lead_source ? rest.lead_source : 'SHOP',
            client_id: rest.client_id ? rest.client_id : '',
            client_name: rest.client_name ? rest.client_name : '',
            potentialCommission: rest.potentialCommission ? parseFloat(rest.potentialCommission) : 0,
            agent_id: rest.agent_id ? rest.agent_id : '',
            adults: rest.adults ? rest.adults : 0,
            children: rest.children ? rest.children : 0,
            infants: rest.infants ? rest.infants : 0,
            no_of_guests: rest.no_of_guests ? rest.no_of_guests : 0,
            no_of_pets: rest.no_of_pets ? rest.no_of_pets : 0,
            pre_cruise_stay: rest.pre_cruise_stay ? rest.pre_cruise_stay : 0,
            post_cruise_stay: rest.post_cruise_stay ? rest.post_cruise_stay : 0,
            country_id: [],
            cruise_line: [],
            board_basis: [],
            departure_port: [],
            cruise_destination: [],
            destination: [],
            resorts: [],
            accomodation: [],
            departure_airport: [],
          };
        }
        if (accomodation_data.length > 0 && accomodation_data[0].country_id && acc[id].country_id && !acc[id].country_id.some((item) => item === accomodation_data[0].country_id)) {
          acc[id].country_id.push(accomodation_data[0].country_id);
        }
        if (curr.cruise_line && acc[id].cruise_line && !acc[id].cruise_line.some((item) => item === curr.cruise_line)) {
          acc[id].cruise_line.push(curr.cruise_line);
        }
        if (curr.board_basis && acc[id].board_basis && !acc[id].board_basis.some((item) => item === curr.board_basis)) {
          acc[id].board_basis.push(curr.board_basis);
        }
        if (curr.departure_port && acc[id].departure_port && !acc[id].departure_port.some((item) => item === curr.departure_port)) {
          acc[id].departure_port.push(curr.departure_port);
        }
        if (curr.cruise_destination && acc[id].cruise_destination && !acc[id].cruise_destination.some((item) => item === curr.cruise_destination)) {
          acc[id].cruise_destination.push(curr.cruise_destination);
        }
        if (accomodation_data.length > 0 && accomodation_data[0].destination_id && acc[id].destination && !acc[id].destination.some((item) => item === accomodation_data[0].destination_id)) {
          acc[id].destination.push(accomodation_data[0].destination_id);
        }
        if (accomodation_data.length > 0 && accomodation_data[0].resorts_id && acc[id].resorts && !acc[id].resorts.some((item) => item === accomodation_data[0].resorts_id)) {
          acc[id].resorts.push(accomodation_data[0].resorts_id);
        }
        // if (accomodation_data.length > 0 && accomodation_data[0].accomodation_id && acc[id].accomodation && !acc[id].accomodation.some((item) => item === accomodation_data[0].accomodation_id)) {
        //   acc[id].accomodation.push(accomodation_data[0].accomodation_id);
        // }
        if (curr.departure_airport && acc[id].departure_airport && !acc[id].departure_airport.some((item) => item === curr.departure_airport)) {
          acc[id].departure_airport.push(curr.departure_airport);
        }

        return acc;
      }, {} as Record<string, z.infer<typeof enquiry_mutate_schema>>);
      const structuredResults = Object.values(groupedResults);
      const payload = pre_process_data(structuredResults[0], structuredResults[0].holiday_type_name!);

      return payload;
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong querying enquiry', true, 500);
    }
  },
  fetchInquiries: async (
    agentId?: string,
    clientId?: string,
    filters?: {
      search?: string;
      enquiry_status?: string;
      holiday_type?: string;
      travel_date_from?: string;
      travel_date_to?: string;
      budget_min?: string;
      budget_max?: string;
      destination?: string;
      is_future_deal?: string;
      is_active?: boolean;
      client_name?: string;
      agent_name?: string;
      cabin_type?: string;
      board_basis?: string;
      departure_port?: string;
      departure_airport?: string;
    },
    pagination?: {
      page?: number;
      limit?: number;
    }
  ) => {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      // Build base conditions

      const response = await db.query.enquiry_table.findMany({
        with: {
          holiday_type: true,
          transaction: {
            with: {
              client: true,
              user: true,
            },
          },
          cruise_line: {
            with: {
              cruise_line: true,
            },
          },
          board_basis: {
            with: {
              board_basis: true,
            },
          },
          departure_port: {
            with: {
              port: true,
            },
          },
          enquiry_cruise_destination: {
            with: {
              cruise_destination: true,
            },
          },
          destination: {
            with: {
              destination: {
                with: {
                  country: true,
                },
              },
            },
          },
          resortss: {
            with: {
              resorts: true,
            },
          },
          accomodation: {
            with: {
              accomodation: true,
            },
          },
          departure_airport: {
            with: {
              airport: true,
            },
          },
        },
        orderBy: [desc(enquiry_table.date_created)],
      });

      let filteredResponse = response.filter((item) => {
        // If agentId is defined, check if it matches the item. If it's undefined, don't filter based on agent.
        const agentMatches = agentId ? item.transaction?.user?.id === agentId : true;

        // If clientId is defined, check if it matches the item. If it's undefined, don't filter based on client.
        const clientMatches = clientId ? item.transaction?.client?.id === clientId : true;

        // Only include items that match both conditions (or where both are true if undefined).
        return agentMatches && clientMatches && item.transaction?.status === 'on_enquiry';
      });

      // Apply additional filters
      if (filters) {
        filteredResponse = filteredResponse.filter((item) => {
          const clientName = `${item.transaction?.client?.firstName} ${item.transaction?.client?.surename}`;
          const agentName = `${item.transaction?.user?.firstName} ${item.transaction?.user?.lastName}`;
          const holidayType = item.holiday_type?.name;
          const enquiryStatus = item.status;
          const travelDate = new Date(item.travel_date!);
          const budget = parseFloat(item.budget as string);
          const cabinType = item.cabin_type;
          const boardBasisList = item.board_basis.map((bb) => bb.board_basis?.type);
          const departurePortList = item.departure_port.map((dp) => dp.port?.name);
          const departureAirportList = item.departure_airport.map((da) => da.airport?.airport_name);
          const destinationList = item.destination.map((d) => `${d.destination?.name} (${d.destination?.country?.country_name})`);

          // Search filter
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const searchableFields = [clientName, agentName, item.title, ...destinationList, ...departurePortList, ...departureAirportList];
            if (!searchableFields.some((field) => field?.toLowerCase().includes(searchTerm))) {
              return false;
            }
          }

          // Enquiry status filter
          if (filters.enquiry_status && enquiryStatus !== filters.enquiry_status) {
            return false;
          }

          // Holiday type filter
          if (filters.holiday_type && holidayType !== filters.holiday_type) {
            return false;
          }

          // Travel date range filter
          if (filters.travel_date_from && travelDate < new Date(filters.travel_date_from)) {
            return false;
          }
          if (filters.travel_date_to && travelDate > new Date(filters.travel_date_to)) {
            return false;
          }

          // Budget range filter
          if (filters.budget_min && budget < parseFloat(filters.budget_min)) {
            return false;
          }
          if (filters.budget_max && budget > parseFloat(filters.budget_max)) {
            return false;
          }

          // Destination filter
          if (filters.destination) {
            const destinationTerm = filters.destination.toLowerCase();
            if (!destinationList.some((dest) => dest.toLowerCase().includes(destinationTerm))) {
              return false;
            }
          }

          // Future deal filter
          if (filters.is_future_deal === 'true' && !item.is_future_deal) {
            return false;
          }

          // Client name filter
          if (filters.client_name && !clientName.toLowerCase().includes(filters.client_name.toLowerCase())) {
            return false;
          }

          // Agent name filter
          if (filters.agent_name && !agentName.toLowerCase().includes(filters.agent_name.toLowerCase())) {
            return false;
          }

          // Cabin type filter
          if (filters.cabin_type && cabinType !== filters.cabin_type) {
            return false;
          }

          // Board basis filter
          if (filters.board_basis && !boardBasisList.includes(filters.board_basis)) {
            return false;
          }

          // Departure port filter
          if (filters.departure_port && !departurePortList.some((port) => port?.toLowerCase().includes(filters.departure_port!.toLowerCase()))) {
            return false;
          }

          // Departure airport filter
          if (
            filters.departure_airport &&
            !departureAirportList.some((airport) => airport?.toLowerCase().includes(filters.departure_airport!.toLowerCase()))
          ) {
            return false;
          }

          return true;
        });
      }

      const total = filteredResponse.filter((data) => data.transaction?.status === 'on_enquiry').length;

      const paginatedResponse = filteredResponse.filter((data) => data.transaction?.status === 'on_enquiry').slice(offset, offset + limit);

      const payload = paginatedResponse.map((item) => ({
        ...item,
   
        enquiry_status: item.status as 'ACTIVE' | 'LOST' | 'INACTIVE' | 'EXPIRED' | 'NEW_LEAD',
        holiday_type_name: item.holiday_type?.name || '',
        travel_date: item.travel_date || '',
        no_of_nights: item.no_of_nights?.toString() || '0',
        budget: item.budget || '0',
        transaction_id: item.transaction?.id!,
        holiday_type: item.holiday_type?.id || '',
        agent_id: item.transaction?.user_id!,
        clientId: item.transaction?.client_id!,
        status: item.transaction?.status as 'on_quote' | 'on_enquiry' | 'on_booking',
        is_future_deal: item.is_future_deal || false,
        clientName: `${item.transaction?.client?.firstName} ${item.transaction?.client?.surename}`,
        agentName: `${item.transaction?.user?.firstName} ${item.transaction?.user?.lastName}`,
        cruise_line: item.cruise_line.map((item) => item.cruise_line?.name).filter((name): name is string => name != null) || [],
        board_basis: item.board_basis.map((item) => item.board_basis?.type).filter((type): type is string => type != null) || [],
        departure_port: item.departure_port.map((item) => item.port?.name).filter((name): name is string => name != null) || [],
        enquiry_cruise_destination: item.enquiry_cruise_destination.map((item) => item.cruise_destination?.name).filter((name): name is string => name != null) || [],
        destination: item.destination.map((item) => `${item.destination?.name} (${item.destination?.country?.country_name})`).filter((dest): dest is string => dest != null) || [],
        resortss: item.resortss.map((item) => item.resorts?.name).filter((name): name is string => name != null) || [],
        accomodation: item.accomodation.map((item) => item.accomodation?.name).filter((name): name is string => name != null) || [],
        departure_airport: item.departure_airport.map((item) => item.airport?.airport_name).filter((name): name is string => name != null) || [],
      }));

      return {
        data: payload,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong querying enquiry', true, 500);
    }
  },
  updateInquiryExpiry: async (inquiryId: string, date_expiry: string, user_id: string) => {
    try {
      const enquiry_data = await db.select().from(enquiry_table).where(eq(enquiry_table.id, inquiryId));

      if (!enquiry_data.length) {
        throw new AppError('Enquiry not found', true, 404);
      }

      const expiryDate = new Date(date_expiry);
      if (isNaN(expiryDate.getTime())) {
        throw new AppError('Invalid date format', true, 400);
      }

      const now = new Date();
      const isExpired = expiryDate < now;
      const [updatedEnquiry] = await db
        .update(enquiry_table)
        .set({
          date_expiry: expiryDate,
        })
        .where(eq(enquiry_table.id, inquiryId))
        .returning();

      if (!updatedEnquiry) {
        throw new AppError('Enquiry not found', true, 404);
      }
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong updating enquiry expiry', true, 500);
    }
  },
  setFutureDealDate: async (inquiryId: string, futureDealDate: string) => {
    try {
      console.log('futureDealDate', futureDealDate);
      await db
        .update(enquiry_table)
        .set({
          is_future_deal: true,
          future_deal_date: futureDealDate,
          date_expiry: null,
        })
        .where(eq(enquiry_table.id, inquiryId));
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong setting future deal date', true, 500);
    }
  },
  unsetFutureDealDate: async (inquiryId: string) => {
    try {
      const now = new Date();
      const plus7 = new Date(now);
      plus7.setDate(now.getDate() + 7);

      await db
        .update(enquiry_table)
        .set({
          is_future_deal: false,
          future_deal_date: null,
          date_expiry: plus7,
        })
        .where(eq(enquiry_table.id, inquiryId));
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong unsetting future deal for enquiry', true, 500);
    }
  },
  updateInquiryStatus: async (inquiryId: string, status: string) => {
    const now = new Date();
    const plus2 = new Date(now);
    plus2.setDate(now.getDate() + 2);

    const updateData: {
      status: 'ACTIVE' | 'LOST' | 'INACTIVE' | 'EXPIRED' | 'NEW_LEAD';
      date_created?: Date;
    } = {
      status: status as 'ACTIVE' | 'LOST' | 'INACTIVE' | 'EXPIRED' | 'NEW_LEAD',
    };

    if (status !== 'LOST') {
      updateData.date_created = plus2; // Store the timestamp (Date object) directly
    }

    await db.update(enquiry_table).set(updateData).where(eq(enquiry_table.id, inquiryId));
  },
};
