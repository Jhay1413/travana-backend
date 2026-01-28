import { enquirySummaryQuerySchema } from '../types/modules/agent';
import { db } from '../db/db';
import { AppError } from '../middleware/errorHandler';
import { clientTable } from '../schema/client-schema';
import { clientMutationSchema, clientQuerySchema, clientTransactionSchema } from '../types/modules/client';
import { and, asc, count, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import z from 'zod';
import { nestedBuilder } from '../utils/nested-condition';
import { booking } from '../schema/booking-schema';
import { accomodation_list, country, destination, lodges, package_type, park, transaction } from '../schema/transactions-schema';
import { enquiry_cruise_destination, enquiry_destination, enquiry_table } from '../schema/enquiry-schema';
import { user } from '../schema/auth-schema';
import { cruise_destination } from '../schema/cruise-schema';
import { clientFileMutationSchema, clientFileQuerySchema } from '../types/modules/client-file';
import { clientFileTable } from '../schema/client-file-schema';
import { quote, quote_accomodation, quote_cruise } from '../schema/quote-schema';

export type ClientRepo = {
  fetchClientById: (id: string) => Promise<z.infer<typeof clientQuerySchema>>;
  fetchClients: (page: number, query?: string, clientId?: string) => Promise<z.infer<typeof clientQuerySchema>[]>;
  createClient: (data: z.infer<typeof clientMutationSchema>) => Promise<{ clientId: string }>;
  updateClient: (id: string, data: z.infer<typeof clientMutationSchema>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  fetchInquirySummary: (clientId: string) => Promise<z.infer<typeof enquirySummaryQuerySchema>[]>;
  fetchClientTransactions: (clientId: string, status: string) => Promise<z.infer<typeof clientTransactionSchema>[]>;
  fetchClientForUpdate: (id: string) => Promise<z.infer<typeof clientMutationSchema>>;
  uploadClientAvatar: (id: string, avatar: string) => Promise<void>;

  insertClientFile: (data: z.infer<typeof clientFileMutationSchema>) => Promise<string>;
  fetchClientFiles: (clientId: string) => Promise<z.infer<typeof clientFileQuerySchema>[]>;
  fetchClientFile: (fileId: string) => Promise<z.infer<typeof clientFileQuerySchema> | null>;
  deleteClientFile: (fileId: string) => Promise<void>;
  getClientName: (clientId: string) => Promise<string | null>;
  getClientFileCount: (clientId: string) => Promise<number>;

};

export const clientRepo: ClientRepo = {
  insertClientFile: async (data) => {
    const response = await db
      .insert(clientFileTable)
      .values({
        fileTitle: data.fileTitle,
        filename: data.filename,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        clientId: data.clientId,
      })
      .returning({ id: clientFileTable.id });

    return response[0].id;
  },
  fetchClientFiles: async (clientId) => {
    const files = await db.query.clientFileTable.findMany({
      where: eq(clientFileTable.clientId, clientId),
      orderBy: [desc(clientFileTable.createdAt)],
    });

    return files.map((file) => ({
      ...file,
      clientId: file?.clientId || "", id: file.id, fileType: file?.fileType || "", fileUrl: file?.fileUrl || "", fileTitle: file?.fileTitle || '', filename: file?.filename || '',
      createdAt: file.createdAt.toISOString(),
    }));
  },
  fetchClientFile: async (fileId) => {
    const file = await db.query.clientFileTable.findFirst({
      where: eq(clientFileTable.id, fileId),
    });
    if (!file) return null;
    return { ...file, clientId: file?.clientId || "", id: file.id, fileType: file?.fileType || "", fileUrl: file?.fileUrl || "", fileTitle: file?.fileTitle || '', filename: file?.filename || '', createdAt: file?.createdAt.toISOString() };
  },
  deleteClientFile: async (fileId) => {
    await db.delete(clientFileTable).where(eq(clientFileTable.id, fileId));
  },
  getClientName: async (clientId) => {
    const client = await db.query.clientTable.findFirst({
      where: eq(clientTable.id, clientId),
      columns: {
        firstName: true,
        surename: true,
      },
    });

    if (!client) return null

    return `${client.firstName}-${client.surename}`;
  },
  getClientFileCount: async (clientId) => {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(clientFileTable)
      .where(eq(clientFileTable.clientId, clientId));
    return result[0]?.count || 0;
  },
  fetchClientById: async (id) => {
    const response = await db.query.clientTable.findFirst({
      where: eq(clientTable.id, id),
      columns: {
        id: true,
        title: true,
        firstName: true,
        surename: true,
        DOB: true,
        badge: true,
        phoneNumber: true,
        avatarUrl: true,
        email: true,
        emailIsAllowed: true,
        VMB: true,
        VMBfirstAccess: true,
        whatsAppVerified: true,
        mailAllowed: true,
        houseNumber: true,
        city: true,
        street: true,
        country: true,
        post_code: true,
      },
      with: {
        referrer: {
          columns: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!response) {
      throw new AppError('Client not found', true, 404);
    };
    return {
      ...response,
      referrerName: response.referrer ? `${response.referrer?.firstName} ${response.referrer?.lastName}` : undefined,
      referrerPhoneNumber: response.referrer ? response.referrer?.phoneNumber : undefined,
    };
  },
  fetchClients: async (page, query, clientId) => {
    const words = query ? query.split(/\s+/).filter(Boolean) : [];

    const whereClause = words.length
      ? and(
        ...words.map((word) =>
          or(
            ilike(clientTable.firstName, `%${word}%`),
            ilike(clientTable.surename, `%${word}%`),
            ilike(clientTable.phoneNumber, `%${word}%`),
            ilike(clientTable.email, `%${word}%`)
          )
        )
      )
      : undefined;

    const clients = await db.query.clientTable.findMany({
      columns: {
        id: true,
        title: true,
        firstName: true,
        surename: true,
        DOB: true,
        badge: true,
        avatarUrl: true,
        phoneNumber: true,
        email: true,
        emailIsAllowed: true,
        VMB: true,
        VMBfirstAccess: true,
        whatsAppVerified: true,
        mailAllowed: true,
        houseNumber: true,
        city: true,
        street: true,
        country: true,
        post_code: true,
      },
      where: and(clientId ? eq(clientTable.id, clientId) : undefined, whereClause),
      orderBy: [desc(clientTable.createdAt)],
      limit: 50,
      // limit: pageSize,
      // offset,
    });

    // First, get all client IDs
    const clientIds = clients.map((c) => c.id);

    // Use a single query with WHERE IN to get latest bookings for all clients at once
    const latestBookings = await db
      .select({
        clientId: transaction.client_id,
        bookingId: booking.id,
        bookingDate: booking.date_created,
      })
      .from(transaction)
      .leftJoin(booking, eq(booking.transaction_id, transaction.id))
      .where(inArray(transaction.client_id, clientIds))
      .groupBy(transaction.client_id, booking.id)
      .orderBy(desc(booking.date_created))
      .then((res) => {
        // Create a map for quick lookup
        const map = new Map<string, (typeof res)[0]>();
        res.forEach((row) => {
          if (row.clientId === null) return;
          if (!map.has(row.clientId) || (map.get(row.clientId)?.bookingDate || 0) < (row.bookingDate || 0)) {
            map.set(row.clientId, row);
          }
        });
        return map;
      });

    // Get overall profit for all clients in one query
    const overallProfitResults = await db
      .select({
        clientId: transaction.client_id,
        overall_commission: sql`
      SUM(
        COALESCE((SELECT SUM(bf.commission) FROM booking_flights bf WHERE bf.booking_id = ${booking.id}), 0) +
        COALESCE((SELECT SUM(bap.commission) FROM booking_airport_parking bap WHERE bap.booking_id = ${booking.id}), 0) +
        COALESCE((SELECT SUM(blp.commission) FROM booking_lounge_pass blp WHERE blp.booking_id = ${booking.id}), 0) +
        COALESCE((SELECT SUM(bat.commission) FROM booking_attraction_ticket bat WHERE bat.booking_id = ${booking.id}), 0) +
        COALESCE((SELECT SUM(bch.commission) FROM booking_car_hire bch WHERE bch.booking_id = ${booking.id}), 0) +
        COALESCE((SELECT SUM(bt.commission) FROM booking_transfers bt WHERE bt.booking_id = ${booking.id}), 0) +
        COALESCE((SELECT SUM(ba.commission) FROM booking_accomodation ba WHERE ba.booking_id = ${booking.id}), 0) +
        COALESCE(${booking.package_commission}, 0)
      )
    `.as('overall_commission'),
      })
      .from(booking)
      .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
      .where(inArray(transaction.client_id, clientIds))
      .groupBy(transaction.client_id)
      .then((res) => new Map(res.map((row) => [row.clientId, row.overall_commission])));

    // Get total bookings count for all clients in one query
    const totalBookingsResults = await db
      .select({
        clientId: transaction.client_id,
        count: count(),
      })
      .from(booking)
      .leftJoin(transaction, eq(transaction.id, booking.transaction_id))
      .where(inArray(transaction.client_id, clientIds))
      .groupBy(transaction.client_id)
      .then((res) => new Map(res.map((row) => [row.clientId, row.count])));

    // Enrich clients
    const enrichedClients = clients.map((client) => {
      const booking = latestBookings.get(client.id);
      const profit = parseFloat(overallProfitResults.get(client.id) as string) || 0;
      const bookings = totalBookingsResults.get(client.id) || 0;
      const ppb = bookings > 0 ? profit / bookings : 0;

      return {
        ...client,
        lastBookingDate: booking?.bookingDate ? new Date(booking.bookingDate).toISOString() : undefined,
        averagePPb: ppb,
        totalBookings: bookings,
      };
    });
    return enrichedClients;
  },
  createClient: async (data) => {
    const is_exist = await db.query.clientTable.findFirst({
      where: and(eq(clientTable.surename, data.surename), eq(clientTable.phoneNumber, data.phoneNumber)),
    });

    //OPTIMIZE
    if (is_exist) throw new AppError('Client already exists ! ', true, 500);
    const response = await db
      .insert(clientTable)
      .values({
        title: data.title,
        firstName: data.firstName,
        surename: data.surename,
        DOB: data.DOB,
        phoneNumber: data.phoneNumber,
        email: data.email,
        VMB: data.VMB,
        avatarUrl: data.avatarUrl,
        badge: data.badge,
        VMBfirstAccess: data.VMBfirstAccess,
        whatsAppVerified: data.whatsAppVerified,
        mailAllowed: data.mailAllowed,
        houseNumber: data.houseNumber,
        city: data.city,
        street: data.street,
        country: data.country,
        post_code: data.post_code,
      })
      .returning({ id: clientTable.id });

    return { clientId: response[0].id };
  },
  updateClient: async (id, data) => {
    await db
      .update(clientTable)
      .set({
        title: data.title,
        firstName: data.firstName,
        avatarUrl: data.avatarUrl,
        surename: data.surename,
        DOB: data.DOB,
        badge: data.badge,
        phoneNumber: data.phoneNumber,
        email: data.email,
        VMB: data.VMB,
        VMBfirstAccess: data.VMBfirstAccess,
        whatsAppVerified: data.whatsAppVerified,
        mailAllowed: data.mailAllowed,
        houseNumber: data.houseNumber,
        city: data.city,
        street: data.street,
        country: data.country,
        post_code: data.post_code,
      })
      .where(eq(clientTable.id, id));
  },
  deleteClient: async (id) => {
    await db.delete(clientTable).where(eq(clientTable.id, id));

  },
  fetchInquirySummary: async (id) => {
    const response = await db
      .select({
        id: enquiry_table.id,
        holiday_type: package_type.name,
        status: transaction.status,
        enquiry_status: enquiry_table.status,
        transaction_id: transaction.id,
        agent_id: transaction.user_id,
        agentName: sql`${user.firstName} || ' ' || ${user.lastName}`,
        clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
        clientId: transaction.client_id,
        no_of_nights: enquiry_table.no_of_nights,
        budget: enquiry_table.budget,
        travel_date: enquiry_table.travel_date,
        date_expiry: enquiry_table.date_expiry,
        date_created: enquiry_table.date_created,
        is_future_deal: enquiry_table.is_future_deal,
        title: enquiry_table.title,
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
      .leftJoin(package_type, eq(package_type.id, enquiry_table.holiday_type_id))
      .leftJoin(user, eq(user.id, transaction.user_id))
      .leftJoin(clientTable, eq(clientTable.id, transaction.client_id))
      .leftJoin(enquiry_cruise_destination, eq(enquiry_cruise_destination.enquiry_id, enquiry_table.id))
      .leftJoin(cruise_destination, eq(cruise_destination.id, enquiry_cruise_destination.cruise_destination_id))
      .leftJoin(enquiry_destination, eq(enquiry_destination.enquiry_id, enquiry_table.id))
      .leftJoin(destination, eq(destination.id, enquiry_destination.destination_id))
      .leftJoin(country, eq(country.id, destination.country_id))

      .where(and(eq(transaction.client_id, id), eq(transaction.status, 'on_enquiry'), eq(enquiry_table.is_active, true)))
      .orderBy(asc(sql`enquiry_table.status = 'LOST'`), desc(enquiry_table.date_created));

    if (response.length === 0) return [];
    const groupedResults = response.reduce((acc, curr) => {
      const { id, ...rest } = curr; // Destructure to separate id from the rest of the object
      if (!acc[id]) {
        acc[id] = { id, ...rest, enquiry_cruise_destination: [], destination: [] };
      }
      if (curr.enquiry_cruise_destination) {
        acc[id].enquiry_cruise_destination.push(curr.enquiry_cruise_destination);
      }
      if (curr.destination) {
        acc[id].destination.push(curr.destination);
      }
      return acc;
    }, {} as Record<string, any>);
    const structuredResults = Object.values(groupedResults);

    return structuredResults;
  },
  fetchClientTransactions: async (id, status) => {
    if (status === 'on_enquiry') {
      const response = await db.query.transaction.findMany({
        where: and(eq(transaction.client_id, id), eq(transaction.status, status as any)),
        with: {
          enquiry: {
            with: {
              holiday_type: true,
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
            },
          },
        },
      });

      return response
        .map((data) => ({
          holiday_type: data.enquiry?.holiday_type?.name ?? "",
          date_created: data.enquiry?.date_created!,
          id: data.id,
          title: data.enquiry?.title,
          deal_id: data.enquiry?.id,
          travel_date: new Date(data.enquiry.travel_date!),
          destination:
            data.enquiry?.holiday_type?.name !== 'Cruise Package'
              ? data.enquiry?.destination.map((item) => `${item.destination?.name} ${item.destination?.country?.country_name}`).join(', ') || "No destination"
              : data.enquiry?.enquiry_cruise_destination.map((item) => item.cruise_destination?.name).join(', ') || "No destination",
        }))
        .sort((a, b) => new Date(b.date_created!).getTime() - new Date(a.date_created!).getTime());
    } else if (status === 'on_quote') {


      const response2 = await db.select(
        {
          id: transaction.id,
          deal_id: quote.id,
          holiday_type: package_type.name,
          cruise_destination: quote_cruise.cruise_name,
          lodge_destination: park.location,
          holiday_destination: sql<string[]>`array_agg(DISTINCT ${accomodation_list.name})`.as('holiday_destination'),
          title: quote.title,
          date_created: quote.date_created,
          travel_date: quote.travel_date,
        }
      ).from(transaction)
        .leftJoin(quote, eq(quote.transaction_id, transaction.id))
        .leftJoin(package_type, eq(package_type.id, quote.holiday_type_id))
        .leftJoin(quote_cruise, eq(quote_cruise.quote_id, quote.id))
        .leftJoin(lodges, eq(lodges.id, quote.lodge_id))
        .leftJoin(park, eq(park.id, lodges.park_id))
        .leftJoin(quote_accomodation, eq(quote_accomodation.quote_id, quote.id))
        .leftJoin(accomodation_list, eq(accomodation_list.id, quote_accomodation.accomodation_id)).where(and(eq(transaction.client_id, id), eq(transaction.status, status as any)))
        .groupBy(
          transaction.id,
          quote.id,
          quote_cruise.cruise_name,
          park.location,
          quote.title,
          quote.date_created,
          quote.travel_date,
          package_type.name
          
        );

      return response2.map(data => ({
        id: data.id,
        deal_id: data.deal_id,
        holiday_type: data.holiday_type || "",
        title: data.title,
        date_created: data.date_created!,
        travel_date: new Date(data.travel_date!),
        destination:
          data.holiday_type === 'Cruise Package'
            ? data.cruise_destination || "No destination"
            : data.holiday_type === 'Hot Tub Break'
              ? data.lodge_destination || "No destination"
              : data.holiday_destination[0] || "No destination",
      })).sort((a, b) => new Date(b.date_created!).getTime() - new Date(a.date_created!).getTime());


    } else if (status === 'on_booking') {
      const response = await db.query.transaction.findMany({
        where: and(eq(transaction.client_id, id), eq(transaction.status, status as any)),
        with: {
          booking: {
            with: {
              holiday_type: true,
              accomodation: {
                with: {
                  accomodation: true,
                },
              },
              lodge: {
                with: {
                  park: true,
                },
              },
              cottage: true,
              booking_cruise: true,
            },
          },
        },
      });
      return response
        .map((data) => {
          const cruise_destination = data.booking.booking_cruise?.cruise_name ?? null;
          const lodge_destination = data.booking.lodge?.park?.location ?? null;
          const holiday_destination = data.booking.accomodation?.[0]?.accomodation?.name ?? null;

          return {
            id: data.id,
            holiday_type: data.booking?.holiday_type?.name,
            deal_id: data.booking?.id,
            title: data.booking?.title,
            date_created: data.booking.date_created!,
            travel_date: new Date(data.booking.travel_date!),
            destination:
              data.booking?.holiday_type?.name === 'Cruise Package'
                ? cruise_destination || "No destination"
                : data.booking?.holiday_type?.name === 'Hot Tub Break'
                  ? lodge_destination || "No destination"
                  : holiday_destination || "No destination",
          };
        })
        .sort((a, b) => new Date(b.date_created!).getTime() - new Date(a.date_created!).getTime());
    } else {
      return [];
    }
  },
  fetchClientForUpdate: async (id) => {
    const response = await db.query.clientTable.findFirst({
      where: eq(clientTable.id, id),
    });
    if (!response) throw new AppError('Client not found', true, 404);
    return response;
  },
  uploadClientAvatar: async (id, avatar) => {
    await db.update(clientTable).set({ avatarUrl: avatar }).where(eq(clientTable.id, id));
  },

};
