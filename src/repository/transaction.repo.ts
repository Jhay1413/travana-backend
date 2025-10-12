import { db } from '../db/db';
import { user } from '../schema/auth-schema';
import { clientTable } from '../schema/client-schema';
import { sql, ilike, inArray, or, eq, and, gte, lt, desc, asc, ne, aliasedTable, lte, gt, sum } from 'drizzle-orm';
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
} from '../schema/quote-schema';

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
  room_type,
  tour_operator,
} from '../schema/transactions-schema';
import { transaction } from '../schema/transactions-schema';
import { boardBasisQuerySchema } from '../types/modules/accomodations';
import { airportMutationSchema, airportQuerySchema } from '../types/modules/airports';
import { countryMutateSchema, countryQuerySchema } from '../types/modules/country';
import { cruiseDestinationQuerySchema, cruiseLineQuerySchema, portQuerySchema } from '../types/modules/cruise';
import { accomodation_mutate_schema, cruise_destination_mutate_schema, cruise_destination_query_schema, cruise_itinerary_mutate_schema, cruise_itinerary_query_schema, cruise_ship_mutate_schema, cruise_ship_query_schema, cruise_line_mutate_schema, cruise_line_query_schema, cruise_voyage_mutate_schema, cruise_voyage_query_schema, lodgeMutateSchema, lodgeQuerySchema, tour_operator_mutate_schema, tour_operator_query_schema, port_mutate_schema, port_query_schema, headlinesSchema, headlinesMutationSchema } from '../types/modules/data-management';
import { destinationQuerySchema } from '../types/modules/destination';
import { unionAllType, unionAllTypeWithChildren } from '../types/modules/quote';
import {
  accomodationQuerySchema,
  bookingPipelineSchema,
  cruiseDateQuerySchema,
  destinationMutateSchema,
  enquiryPipelineSchema,
  noteMutateSchema,
  notesQuerySchema,
  quoteChild,
  quotePipelineSchema,
  resortMutateSchema,
  resortQuerySchema,
  salesSummarySchema,
  tourOperatorQuerySchema,
} from '../types/modules/transaction';
import { formatDistanceToNow, startOfMonth } from 'date-fns';
import { endOfMonth } from 'date-fns';
import z from 'zod';
import { AppError } from '../middleware/errorHandler';
import { enquiry_cruise_destination, enquiry_destination, enquiry_table } from '../schema/enquiry-schema';
import { airport } from '../schema/flights-schema';
import { cruise_destination, cruise_itenary, cruise_line, cruise_ship, cruise_voyage, port } from '../schema/cruise-schema';
import { dataValidator } from '../helpers/data-validator';
import { booking, booking_accomodation, booking_cruise } from '../schema/booking-schema';
import { allDealsQueryResult } from './type';
import { notes } from '../schema/note-schema';
import { nestedBuilder } from '../utils/nested-condition';
import { task } from '../schema/task-schema';
import { headlinesTable } from '../schema/headlines-schema';

export type TransactionRepo = {
  fetchExpiredQuotes: (agent_id?: string) => Promise<{ data: z.infer<typeof quotePipelineSchema>[] }>;
  fetchQuotesByStatus: (
    status: string,
    agent_id?: string,
    page?: number,
    limit?: number,
    search?: string
  ) => Promise<{ data: z.infer<typeof quotePipelineSchema>[]; profit: number; hasMore: boolean; totalCount: number }>;
  updateNote: (content: string, note_id: string) => Promise<void>;

  insertNote: (content: string, transaction_id: string, agent_id: string, parent_id?: string) => Promise<void>;

  reassignTransaction: (transactionId: string, agent_id: string) => Promise<void>;

  fetchDestination: (country_ids?: string[], selectedIds?: string[], search?: string) => Promise<z.infer<typeof destinationQuerySchema>[]>;

  fetchPort: (
    search?: string,
    cruise_destination_id?: string[],
    selectedIds?: string[],
    page?: number,
    limit?: number
  ) => Promise<{ data: z.infer<typeof portQuerySchema>[]; pagination: any }>;

  fetchAirport: (search?: string, selectedIds?: string[]) => Promise<z.infer<typeof airportQuerySchema>[]>;

  fetchBoardBasis: () => Promise<z.infer<typeof boardBasisQuerySchema>[]>;

  fetchCruiseLine: (search?: string, page?: number, limit?: number) => Promise<{ data: z.infer<typeof cruiseLineQuerySchema>[]; pagination: any }>;

  fetchCountry: (search?: string) => Promise<z.infer<typeof countryQuerySchema>[]>;

  fetchAccomodation: (search?: string, resort_ids?: string[], selectedIds?: string[]) => Promise<z.infer<typeof accomodationQuerySchema>[]>;

  fetchResorts: (search?: string, destinationIds?: string[], selectedIds?: string[]) => Promise<z.infer<typeof resortQuerySchema>[]>;

  fetchAccomodationType: () => Promise<{ id: string; type: string }[]>;
  fetchCruiseDestination: (
    search?: string,
    page?: number,
    limit?: number
  ) => Promise<{ data: z.infer<typeof cruiseDestinationQuerySchema>[]; pagination: any }>;
  fetchTourOperator: (search?: string, selectedIds?: string[]) => Promise<z.infer<typeof tourOperatorQuerySchema>[]>;
  fetchPackageType: () => Promise<{ id: string; name: string }[]>;

  fetchLodges: (search?: string) => Promise<z.infer<typeof lodgeQuerySchema>[]>;
  fetchCruiseDate: (date: string, ship_id: string) => Promise<z.infer<typeof cruiseDateQuerySchema>[]>;
  fetchCruises: () => Promise<{ id: string; name: string }[]>;
  fetchShips: (
    cruise_line_id: string,
    search?: string,
    page?: number,
    limit?: number
  ) => Promise<{ data: { id: string; name: string }[]; pagination: any }>;
  fetchCruiseExtras: () => Promise<{ id: string; name: string }[]>;
  fetchNotes: (transaction_id: string) => Promise<z.infer<typeof notesQuerySchema>[]>;

  fetchNoteById: (id: string) => Promise<z.infer<typeof noteMutateSchema>>;
  deleteNote: (note_id: string) => Promise<void>;

  fetchKanbanInquries: (
    agent_id?: string,
    page?: number,
    limit?: number,
    search?: string
  ) => Promise<{ data: z.infer<typeof enquiryPipelineSchema>[]; profit: number; hasMore: boolean; totalCount: number }>;
  fetchBookings: (agent_id?: string) => Promise<{ data: z.infer<typeof bookingPipelineSchema>[]; profit: number }>;

  fetchTransactionSummaryByAgent: (agent_id: string) => Promise<{
    enquiries: z.infer<typeof salesSummarySchema>[];
    quotes: z.infer<typeof salesSummarySchema>[];
    bookings: z.infer<typeof salesSummarySchema>[];
  }>;
  fetchFutureDealsKanban: (
    agent_id?: string,
    page?: number,
    limit?: number,
    search?: string
  ) => Promise<{
    data: (z.infer<typeof enquiryPipelineSchema> | z.infer<typeof quotePipelineSchema>)[];
    profit: number;
    hasMore: boolean;
    totalCount: number;
  }>;
  fetchFutureDeal: (client_id: string) => Promise<
    {
      title: string;
      id: string;
      type: string;
    }[]
  >;
  fetchAllDeals: (client_id: string) => Promise<z.infer<typeof unionAllTypeWithChildren>[]>;
  fetchDashboardSummary: (agent_id?: string) => Promise<{
    percentage_budget: number;
    profit_quote_in_progress: number;
    profit_awaiting_decision: number;
    profit_booking: number;
    profit_lost: number;
  }>;
  updateLodge: (lodge_id: string, data: z.infer<typeof lodgeMutateSchema>) => Promise<void>;
  deleteLodge: (lodge_id: string) => Promise<void>;
  fetchRoomTypes: () => Promise<{ id: string; name: string }[]>;
  updateLeadSource: (transaction_id: string, lead_source: "SHOP" | "FACEBOOK" | "WHATSAPP" | "INSTAGRAM" | "PHONE_ENQUIRY") => Promise<void>;


  fetchTourOperators: (search?: string) => Promise<z.infer<typeof tour_operator_query_schema>[]>
  fetchTourOperatorById: (id: string) => Promise<z.infer<typeof tour_operator_mutate_schema>>
  fetchAccomodationById: (id: string) => Promise<z.infer<typeof accomodation_mutate_schema>>


  insertDestination: (data: z.infer<typeof destinationMutateSchema>) => Promise<void>
  insertResort: (data: z.infer<typeof resortMutateSchema>) => Promise<void>
  insertAccomodation: (data: { resort_id: string, name: string, type_id: string }) => Promise<void>
  insertCountry: (name: string, code: string) => Promise<void>
  insertLodge: (data: z.infer<typeof lodgeMutateSchema>) => Promise<void>
  insertTourOperator: (data: z.infer<typeof tour_operator_mutate_schema>) => Promise<void>

  updateTourOperator: (id: string, data: z.infer<typeof tour_operator_mutate_schema>) => Promise<void>

  // Cruise Itinerary endpoints
  insertCruiseItinerary: (data: z.infer<typeof cruise_itinerary_mutate_schema>) => Promise<void>;
  updateCruiseItinerary: (id: string, data: z.infer<typeof cruise_itinerary_mutate_schema>) => Promise<void>;
  fetchAllCruiseItineraries: (search?: string, ship_id?: string, page?: number, limit?: number) => Promise<{
    data: z.infer<typeof cruise_itinerary_query_schema>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  fetchCruiseItineraryById: (id: string) => Promise<z.infer<typeof cruise_itinerary_mutate_schema>>;
  deleteCruiseItinerary: (id: string) => Promise<void>;

  // Cruise Voyage endpoints
  insertCruiseVoyage: (data: z.infer<typeof cruise_voyage_mutate_schema>) => Promise<void>;
  updateCruiseVoyage: (id: string, data: z.infer<typeof cruise_voyage_mutate_schema>) => Promise<void>;
  fetchAllCruiseVoyages: (search?: string, itinerary_id?: string, page?: number, limit?: number) => Promise<{
    data: z.infer<typeof cruise_voyage_query_schema>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  fetchCruiseVoyageById: (id: string) => Promise<z.infer<typeof cruise_voyage_mutate_schema>>;
  deleteCruiseVoyage: (id: string) => Promise<void>;


  fetchAllRoomTypes: () => Promise<{ id: string; name: string }[]>;
  insertRoomType: (data: { name: string }) => Promise<void>;
  updateRoomType: (id: string, data: { name: string }) => Promise<void>;
  deleteRoomType: (id: string) => Promise<void>;

  // Airport endpoints
  fetchAllAirports: (search?: string, page?: number, limit?: number) => Promise<{
    data: z.infer<typeof airportQuerySchema>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  insertAirport: (data: z.infer<typeof airportMutationSchema>) => Promise<void>;
  updateAirport: (id: string, data: z.infer<typeof airportMutationSchema>) => Promise<void>;
  fetchAirportById: (id: string) => Promise<z.infer<typeof airportQuerySchema>>;
  deleteAirport: (id: string) => Promise<void>;


  fetchCountryById: (id: string) => Promise<z.infer<typeof countryQuerySchema>>;

  updateCountry: (id: string, data: z.infer<typeof countryMutateSchema>) => Promise<void>;
  deleteCountry: (id: string) => Promise<void>;

  // Lodge endpoints
  fetchAllLodges: () => Promise<z.infer<typeof lodgeQuerySchema>[]>;
  fetchLodgeById: (id: string) => Promise<z.infer<typeof lodgeMutateSchema>>;

  // Parks endpoints
  fetchAllParks: () => Promise<{ id: string; name: string }[]>;

  // Deletion Codes endpoints
  generateDeletionCodes: (data: { numberOfCodes: number }) => Promise<void>;
  insertDeletionCode: (data: { code: string }) => Promise<void>;
  updateDeletionCode: (id: string, data: { code: string; isUsed: boolean }) => Promise<void>;
  deleteDeletionCode: (id: string) => Promise<void>;
  fetchAllDeletionCodes: () => Promise<{
    id: string;
    code: string;
    isUsed: boolean;
    createdAt: string;
  }[]>;
  fetchDeletionCodeById: (id: string) => Promise<{
    id: string;
    code: string;
    isUsed: boolean;
    createdAt: string;
  }>;

  // Cruise Line endpoints
  insertCruiseLine: (data: z.infer<typeof cruise_line_mutate_schema>) => Promise<void>;
  updateCruiseLine: (id: string, data: z.infer<typeof cruise_line_mutate_schema>) => Promise<void>;
  fetchAllCruiseLines: (search?: string, page?: number, limit?: number) => Promise<{
    data: z.infer<typeof cruise_line_query_schema>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  fetchCruiseLineById: (id: string) => Promise<z.infer<typeof cruise_line_mutate_schema>>;
  deleteCruiseLine: (id: string) => Promise<void>;

  // Cruise Ship endpoints
  insertCruiseShip: (data: z.infer<typeof cruise_ship_mutate_schema>) => Promise<void>;
  updateCruiseShip: (id: string, data: z.infer<typeof cruise_ship_mutate_schema>) => Promise<void>;
  fetchAllCruiseShips: (search?: string, cruise_line_id?: string, page?: number, limit?: number) => Promise<{
    data: z.infer<typeof cruise_ship_query_schema>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  fetchCruiseShipById: (id: string) => Promise<z.infer<typeof cruise_ship_mutate_schema>>;
  deleteCruiseShip: (id: string) => Promise<void>;

  // Cruise Destination endpoints
  insertCruiseDestination: (data: z.infer<typeof cruise_destination_mutate_schema>) => Promise<void>;
  updateCruiseDestination: (id: string, data: z.infer<typeof cruise_destination_mutate_schema>) => Promise<void>;
  fetchAllCruiseDestinations: (search?: string, page?: number, limit?: number) => Promise<{
    data: z.infer<typeof cruise_destination_query_schema>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  fetchCruiseDestinationById: (id: string) => Promise<z.infer<typeof cruise_destination_mutate_schema>>;
  deleteCruiseDestination: (id: string) => Promise<void>;

  // Port endpoints
  insertPort: (data: z.infer<typeof port_mutate_schema>) => Promise<void>;
  updatePort: (id: string, data: z.infer<typeof port_mutate_schema>) => Promise<void>;
  fetchAllPorts: (search?: string, cruise_destination_id?: string, page?: number, limit?: number) => Promise<{
    data: z.infer<typeof port_query_schema>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  fetchPortById: (id: string) => Promise<z.infer<typeof port_mutate_schema>>;
  deletePort: (id: string) => Promise<void>;

  // Accomodation endpoints
  updateAccomodation: (id: string, data: z.infer<typeof accomodation_mutate_schema>) => Promise<void>;

  // Destination endpoints
  updateDestination: (id: string, data: z.infer<typeof destinationMutateSchema>) => Promise<void>;
  fetchDestinationById: (id: string) => Promise<z.infer<typeof destinationMutateSchema>>;

  // Resort endpoints
  updateResort: (id: string, data: z.infer<typeof resortMutateSchema>) => Promise<void>;
  fetchResortById: (id: string) => Promise<z.infer<typeof resortMutateSchema>>;



  // Headlines endpoints
  insertHeadline: (data: z.infer<typeof headlinesMutationSchema>) => Promise<void>;
  updateHeadline: (id: string, data: z.infer<typeof headlinesMutationSchema>) => Promise<void>;
  fetchAllHeadlines: () => Promise<z.infer<typeof headlinesSchema>[]>;
  fetchHeadlineById: (id: string) => Promise<z.infer<typeof headlinesSchema>>;
  deleteHeadline: (id: string) => Promise<void>;

};

export const transactionRepo: TransactionRepo = {
  fetchDestinationById: async (id) => {
    const response = await db.query.destination.findFirst({
      where: eq(destination.id, id),
    });
    if (!response) {
      throw new AppError('Destination not found', true, 404);
    }
    return {
      id: response.id ?? '',
      name: response.name ?? '',
      country_id: response.country_id ?? '',
    };
  },
  generateDeletionCodes: async (data) => {
    const numberOfCodes = data.numberOfCodes || 1;
    const codes = [];
    for (let i = 0; i < numberOfCodes; i++) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';

      const part1 = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
      const part2 = Array.from({ length: 4 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');
      const part3 = Array.from({ length: 2 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');

      const code = `${part1}-${part2}-${part3}`;
      codes.push(code);
    }

    await db.insert(deletion_codes).values(
      codes.map(code => ({
        code: code,
      }))
    );

  },
  updateDestination: async (id, data) => {
    await db.update(destination).set(data).where(eq(destination.id, id));
  },
  fetchCruiseItineraryById: async (id) => {
    const response = await db.query.cruise_itenary.findFirst({
      where: eq(cruise_itenary.id, id),
    });

    if (!response) {
      throw new AppError('Cruise itinerary not found', true, 404);
    }

    return {
      id: response.id ?? '',
      ship_id: response.ship_id ?? '',
      itinerary: response.itenary ?? '',
      departure_port: response.departure_port ?? '',
      date: response.date ?? '',
    };
  },
  fetchAllCruiseItineraries: async (search, ship_id, page = 1, limit = 10) => {
    const conditions = [
      search ? ilike(cruise_itenary.itenary, `%${search}%`) : undefined,
      ship_id ? eq(cruise_itenary.ship_id, ship_id) : undefined,
    ].filter(Boolean);
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(cruise_itenary)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .then(result => result[0]?.count || 0);

    const response = await db.query.cruise_itenary.findMany({
      columns: {
        id: true,
        ship_id: true,
        itenary: true,
        departure_port: true,
        date: true,
      },
      with: {
        cruise_ship: {
          columns: {
            name: true,
          },
        },
      },
      ...(conditions.length > 0 ? { where: and(...conditions) } : {}),
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: response.map(itinerary => ({
        id: itinerary.id,
        ship_id: itinerary.ship_id ?? '',
        ship_name: itinerary.cruise_ship?.name ?? '',
        itinerary: itinerary.itenary ?? '',
        departure_port: itinerary.departure_port ?? '',
        date: itinerary.date ?? '',
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    };
  },
  updateCruiseItinerary: async (id, data) => {
    await db.update(cruise_itenary).set(data).where(eq(cruise_itenary.id, id));
  },

  fetchTourOperators: async (search) => {
    const conditions = [search ? ilike(tour_operator.name, `%${search}%`) : undefined].filter(Boolean);

    const response = await db.query.tour_operator.findMany({
      columns: {
        id: true,
        name: true,
      },
      with: {
        tour_package_commission: {
          with: {
            package_type: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      ...(conditions.length > 0 ? { where: conditions[0] } : {}),
    });

    // Flatten the data structure for table display
    const flattenedPayload = response.flatMap((tourOperator) => {
      // If no commissions exist, return one row with empty commission data
      if (tourOperator.tour_package_commission.length === 0) {
        return [
          {
            tour_operator_id: tourOperator.id ?? '',
            tour_operator_name: tourOperator.name ?? '',
            package_type_id: "",
            package_type_name: "",
            percentage_commission: 0,
          },
        ];
      }

      // Return one row for each commission
      return tourOperator.tour_package_commission.map((commission) => ({
        tour_operator_id: tourOperator.id ?? '',
        tour_operator_name: tourOperator.name ?? '',
        package_type_id: commission.package_type_id ?? '',
        package_type_name: commission.package_type?.name ?? '',
        percentage_commission: Math.round(parseFloat(commission.percentage_commission ?? '0') * 100) / 100,
      }));
    });
    return flattenedPayload;
  },
  fetchTourOperatorById: async (id) => {
    const response = await db.query.tour_operator.findFirst({
      where: eq(tour_operator.id, id),
      with: {
        tour_package_commission: {
          with: {
            package_type: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!response) {
      throw new AppError('Tour operator not found', true, 404);
    }

    // Transform the data to match tour_operator_mutate_schema structure
    const transformedData = {
      id: response.id ?? '',
      name: response.name ?? '',
      percentage_commission: response.tour_package_commission.map((commission) => ({
        package_id: commission.package_type_id ?? '',
        percentage: parseFloat(commission.percentage_commission ?? '0'),
      })),
    };

    return transformedData;
  },
  fetchAccomodationById: async (id) => {
    const response = await db.query.accomodation_list.findFirst({
      where: eq(accomodation_list.id, id),
      with: {
        type: true,
        resorts: {
          with: {
            destination: {
              with: {
                country: true
              }
            }
          }
        }
      }
    });
    if (!response) {
      throw new AppError('Accomodation not found', true, 404);
    }
    return {
      id: response.id ?? '',
      name: response.name ?? '',
      type_id: response.type_id ?? '',
      resorts_id: response.resorts_id ?? '',
      country: response.resorts?.destination?.country?.country_name ?? '',
      destination: response.resorts?.destination?.name ?? '',
      resort_id: response.resorts?.id ?? '',
    };
  },
  insertDestination: async (data) => {
    await db.insert(destination).values(data);
  },
  insertResort: async (data) => {
    await db.insert(resorts).values(data);
  },
  insertCountry: async (name, code) => {
    await db.insert(country).values({
      country_name: name,
      country_code: code,
    });
  },

  insertLodge: async (data) => {
    await db.insert(lodges).values(data);
  },

  insertTourOperator: async (data) => {
    await db.insert(tour_operator).values(data);
  },
  updateTourOperator: async (id, data) => {
    await db.update(tour_operator).set(data).where(eq(tour_operator.id, id));
  },

  insertCruiseItinerary: async (data) => {
    await db.insert(cruise_itenary).values(data);
  },

  deleteCruiseItinerary: async (id) => {
    await db.delete(cruise_itenary).where(eq(cruise_itenary.id, id));
  },

  insertCruiseVoyage: async (data) => {
    await db.insert(cruise_voyage).values({
      itinerary_id: data.itinerary_id,
      day_number: data.day_number.toString(),
      description: data.description,
    });
  },
  updateCruiseVoyage: async (id, data) => {
    await db.update(cruise_voyage).set({
      itinerary_id: data.itinerary_id,
      day_number: data.day_number.toString(),
      description: data.description,
    }).where(eq(cruise_voyage.id, id));
  },
  fetchAllCruiseVoyages: async (search, itinerary_id, page = 1, limit = 10) => {
    const conditions = [
      search ? ilike(cruise_voyage.description, `%${search}%`) : undefined,
      itinerary_id ? eq(cruise_voyage.itinerary_id, itinerary_id) : undefined,
    ].filter(Boolean);
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(cruise_voyage)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .then(result => result[0]?.count || 0);

    const response = await db.query.cruise_voyage.findMany({
      columns: {
        id: true,
        itinerary_id: true,
        day_number: true,
        description: true,
      },
      with: {
        cruise_itenary: {
          columns: {
            itenary: true,
            departure_port: true,
            date: true,
          },
          with: {
            cruise_ship: {
              columns: {
                name: true,
              },
            },
          },
        },
      },
      ...(conditions.length > 0 ? { where: and(...conditions) } : {}),
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: response.map(voyage => ({
        id: voyage.id,
        itinerary_id: voyage.itinerary_id ?? '',
        day_number: parseInt(voyage.day_number ?? '0'),
        description: voyage.description ?? '',
        itinerary_description: voyage.cruise_itenary?.itenary ?? '',
        departure_port: voyage.cruise_itenary?.departure_port ?? '',
        date: voyage.cruise_itenary?.date ?? '',
        ship_name: voyage.cruise_itenary?.cruise_ship?.name ?? '',
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    };
  },
  fetchCruiseVoyageById: async (id) => {
    const response = await db.query.cruise_voyage.findFirst({
      where: eq(cruise_voyage.id, id),
    });
    if (!response) {
      throw new AppError('Cruise voyage not found', true, 404);
    }
    return {
      id: response.id ?? '',
      itinerary_id: response.itinerary_id ?? '',
      day_number: parseInt(response.day_number ?? '0'),
      description: response.description ?? '',
    };
  },
  deleteCruiseVoyage: async (id) => {
    await db.delete(cruise_voyage).where(eq(cruise_voyage.id, id));
  },
  fetchAllRoomTypes: async () => {
    const response = await db.query.room_type.findMany({
      columns: {
        id: true,
        name: true,
      },
    });
    return response.map((data) => ({
      id: data.id ?? '',
      name: data.name ?? '',
    }));
  },
  insertRoomType: async (data) => {
    await db.insert(room_type).values(data);
  },
  updateRoomType: async (id, data) => {
    await db.update(room_type).set(data).where(eq(room_type.id, id));
  },
  deleteRoomType: async (id) => {
    await db.delete(room_type).where(eq(room_type.id, id));
  },
  fetchAllAirports: async (search, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const conditions = [search ? or(ilike(airport.airport_name, `%${search}%`), ilike(airport.airport_code, `%${search}%`)) : undefined].filter(Boolean);

    const query = db.select().from(airport);
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(airport)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const airports = await query.limit(limit).offset(offset);

    return {
      data: airports.map((data) => ({
        id: data.id ?? '',
        airport_name: data.airport_name ?? '',
        airport_code: data.airport_code ?? '',
      })),
      pagination: {
        page,
        limit,
        total: totalCount.count,
        totalPages: Math.ceil(totalCount.count / limit),
      },
    };
  },
  insertAirport: async (data) => {
    await db.insert(airport).values(data);
  },
  updateAirport: async (id, data) => {
    await db.update(airport).set(data).where(eq(airport.id, id));
  },
  fetchAirportById: async (id) => {
    const response = await db.query.airport.findFirst({
      where: eq(airport.id, id),
    });
    if (!response) {
      throw new AppError('Airport not found', true, 404);
    }
    return {
      id: response.id ?? '',
      airport_name: response.airport_name ?? '',
      airport_code: response.airport_code ?? '',
    };
  },
  deleteAirport: async (id) => {
    await db.delete(airport).where(eq(airport.id, id));
  },
  fetchCountryById: async (id) => {
    const response = await db.query.country.findFirst({
      where: eq(country.id, id),
    });
    if (!response) {
      throw new AppError('Country not found', true, 404);
    }
    return {
      id: response.id ?? '',
      country_name: response.country_name ?? '',
      country_code: response.country_code ?? '',
    };
  },
  updateCountry: async (id, data) => {
    await db.update(country).set(data).where(eq(country.id, id));
  },
  deleteCountry: async (id) => {
    await db.delete(country).where(eq(country.id, id));
  },
  fetchAllLodges: async () => {
    const lodgesList = await db.query.lodges.findMany({
      columns: {
        id: true,
        lodge_name: true,
        lodge_code: true,
        image: true,
        adults: true,
        children: true,
        bedrooms: true,
        bathrooms: true,
        pets: true,
        sleeps: true,
        infants: true,
      },
      with: {
        park: {
          columns: {
            id: true,
            name: true,
            location: true,
            city: true,
            county: true,
            code: true,
            description: true,
          },
        },
      },
    });
    return lodgesList.map((data) => ({
      id: data.id ?? '',
      lodge_name: data.lodge_name ?? '',
      lodge_code: data.lodge_code ?? '',
      image: data.image ?? '',
      adults: data.adults ?? 0,
      children: data.children ?? 0,
      bedrooms: data.bedrooms ?? 0,
      bathrooms: data.bathrooms ?? 0,
      pets: data.pets ?? 0,
      sleeps: data.sleeps ?? 0,
      infants: data.infants ?? 0,
      park: data.park ? {
        id: data.park.id ?? '',
        name: data.park.name ?? '',
        location: data.park.location ?? '',
        city: data.park.city ?? '',
        county: data.park.county ?? '',
        code: data.park.code ?? '',
        description: data.park.description ?? '',
      } : null,
      park_name: data.park?.name ?? '',
      park_id: data.park?.id ?? '',
      location: data.park?.location ?? '',
      city: data.park?.city ?? '',
      county: data.park?.county ?? '',
      code: data.park?.code ?? '',
      description: data.park?.description ?? '',
    }));
  },
  fetchLodgeById: async (id) => {
    const lodge = await db.query.lodges.findFirst({
      where: eq(lodges.id, id),
      columns: {
        id: true,
        park_id: true,
        lodge_name: true,
        lodge_code: true,
        image: true,
        adults: true,
        children: true,
        bedrooms: true,
        bathrooms: true,
        pets: true,
        sleeps: true,
        infants: true,
      },
      with: {
        park: {
          columns: {
            id: true,
            name: true,
            location: true,
            city: true,
            county: true,
            code: true,
            description: true,
          },
        },
      },
    });
    if (!lodge) throw new AppError('Lodge not found', true, 404);
    return {
      id: lodge.id ?? '',
      lodge_name: lodge.lodge_name ?? '',
      lodge_code: lodge.lodge_code ?? '',
      image: lodge.image ?? '',
      adults: lodge.adults ?? 0,
      children: lodge.children ?? 0,
      bedrooms: lodge.bedrooms ?? 0,
      bathrooms: lodge.bathrooms ?? 0,
      pets: lodge.pets ?? 0,
      sleeps: lodge.sleeps ?? 0,
      infants: lodge.infants ?? 0,
      park_id: lodge.park_id ?? '',
      park_name: lodge?.park?.name ?? '',
      location: lodge?.park?.location ?? '',
      city: lodge?.park?.city ?? '',
      county: lodge?.park?.county ?? '',
      code: lodge?.park?.code ?? '',
      description: lodge?.park?.description ?? '',
    };
  },
  fetchAllParks: async () => {
    const parks = await db.query.park.findMany({
      columns: {
        id: true,
        name: true,
      },
    });
    return parks.map(park => ({
      id: park.id ?? '',
      name: park.name ?? '',
    }));
  },
  deleteDeletionCode: async (id) => {
    await db.delete(deletion_codes).where(eq(deletion_codes.id, id));
  },
  insertDeletionCode: async (data) => {
    await db.insert(deletion_codes).values(data);
  },
  updateDeletionCode: async (id, data) => {
    await db.update(deletion_codes).set(data).where(eq(deletion_codes.id, id));
  },
  fetchAllDeletionCodes: async () => {
    const response = await db.query.deletion_codes.findMany({
      orderBy: [desc(deletion_codes.created_at)],
    });

    return response.map(code => ({
      id: code.id,
      code: code.code ?? '',
      isUsed: code.is_used ?? false,
      createdAt: code.created_at ?? '',
    }));
  },
  fetchDeletionCodeById: async (id) => {
    const response = await db.query.deletion_codes.findFirst({
      where: eq(deletion_codes.id, id),
    });
    if (!response) {
      throw new AppError('Deletion code not found', true, 404);
    }
    return {
      id: response?.id ?? '',
      code: response?.code ?? '',
      isUsed: response?.is_used ?? false,
      createdAt: response?.created_at ?? '',
    };
  },
  insertCruiseLine: async (data) => {
    await db.insert(cruise_line).values(data);
  },
  updateCruiseLine: async (id, data) => {
    await db.update(cruise_line).set(data).where(eq(cruise_line.id, id));
  },
  fetchAllCruiseLines: async (search, page = 1, limit = 10) => {
    const conditions = [search ? ilike(cruise_line.name, `%${search}%`) : undefined].filter(Boolean);
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(cruise_line)
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .then(result => result[0]?.count || 0);

    const response = await db.query.cruise_line.findMany({
      columns: {
        id: true,
        name: true,
      },
      ...(conditions.length > 0 ? { where: conditions[0] } : {}),
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: response.map(cruise_line => ({
        id: cruise_line.id ?? '',
        name: cruise_line.name ?? '',
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    };
  },
  fetchCruiseLineById: async (id) => {
    const response = await db.query.cruise_line.findFirst({
      where: eq(cruise_line.id, id),
    });

    return {
      id: response?.id ?? '',
      name: response?.name ?? '',
    }
  },
  deleteCruiseLine: async (id) => {
    await db.delete(cruise_line).where(eq(cruise_line.id, id));
  },
  insertCruiseShip: async (data) => {
    await db.insert(cruise_ship).values(data);
  },
  updateCruiseShip: async (id, data) => {
    await db.update(cruise_ship).set(data).where(eq(cruise_ship.id, id));
  },
  fetchAllCruiseShips: async (search, cruise_line_id, page = 1, limit = 10) => {
    const conditions = [
      search ? ilike(cruise_ship.name, `%${search}%`) : undefined,
      cruise_line_id ? eq(cruise_ship.cruise_line_id, cruise_line_id) : undefined,
    ].filter(Boolean);
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(cruise_ship)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .then(result => result[0]?.count || 0);

    const response = await db.query.cruise_ship.findMany({
      columns: {
        id: true,
        name: true,
        cruise_line_id: true,
      },
      with: {
        cruise_line: {
          columns: {
            name: true,
          },
        },
      },
      ...(conditions.length > 0 ? { where: and(...conditions) } : {}),
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: response.map(ship => ({
        id: ship.id,
        name: ship.name ?? '',
        cruise_line_id: ship.cruise_line_id ?? '',
        cruise_line_name: ship.cruise_line?.name ?? '',
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    };
  },
  fetchCruiseShipById: async (id) => {
    const response = await db.query.cruise_ship.findFirst({
      where: eq(cruise_ship.id, id),
    });

    if (!response) {
      throw new AppError('Cruise ship not found', true, 404);
    }

    return {
      id: response.id ?? '',
      name: response.name ?? '',
      cruise_line_id: response.cruise_line_id ?? '',
    };
  },
  deleteCruiseShip: async (id) => {
    await db.delete(cruise_ship).where(eq(cruise_ship.id, id));
  },
  insertCruiseDestination: async (data) => {
    await db.insert(cruise_destination).values(data);
  },
  updateCruiseDestination: async (id, data) => {
    await db.update(cruise_destination).set(data).where(eq(cruise_destination.id, id));
  },
  fetchAllCruiseDestinations: async (search, page = 1, limit = 10) => {
    const conditions = [search ? ilike(cruise_destination.name, `%${search}%`) : undefined].filter(Boolean);
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(cruise_destination)
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .then(result => result[0]?.count || 0);

    const response = await db.query.cruise_destination.findMany({
      columns: {
        id: true,
        name: true,
      },
      ...(conditions.length > 0 ? { where: conditions[0] } : {}),
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: response.map(data => ({
        id: data.id ?? '',
        name: data.name ?? '',
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    };
  },
  fetchCruiseDestinationById: async (id) => {
    const response = await db.query.cruise_destination.findFirst({
      where: eq(cruise_destination.id, id),
    });

    if (!response) {
      throw new AppError('Cruise destination not found', true, 404);
    }

    return {
      id: response.id ?? '',
      name: response.name ?? '',
    };
  },
  deleteCruiseDestination: async (id) => {
    await db.delete(cruise_destination).where(eq(cruise_destination.id, id));
  },
  insertPort: async (data) => {
    await db.insert(port).values(data);
  },
  updatePort: async (id, data) => {
    await db.update(port).set(data).where(eq(port.id, id));
  },

  fetchAllPorts: async (search, cruise_destination_id, page = 1, limit = 10) => {
    const conditions = [
      search ? ilike(port.name, `%${search}%`) : undefined,
      cruise_destination_id ? eq(port.cruise_destination_id, cruise_destination_id) : undefined,
    ].filter(Boolean);
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(port)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .then(result => result[0]?.count || 0);

    const response = await db.query.port.findMany({
      columns: {
        id: true,
        name: true,
        cruise_destination_id: true,
      },
      with: {
        cruise_destination: {
          columns: {
            name: true,
          },
        },
      },
      ...(conditions.length > 0 ? { where: and(...conditions) } : {}),
      limit: limit,
      offset,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: response.map(port => ({
        id: port.id,
        name: port.name ?? '',
        cruise_destination_id: port.cruise_destination_id ?? '',
        cruise_destination_name: port.cruise_destination?.name ?? '',
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    };
  },
  fetchPortById: async (id) => {
    const response = await db.query.port.findFirst({
      where: eq(port.id, id),
    });

    if (!response) {
      throw new AppError('Port not found', true, 404);
    }

    return {
      id: response.id ?? '',
      name: response.name ?? '',
      cruise_destination_id: response.cruise_destination_id ?? '',
    };
  },
  deletePort: async (id) => {
    await db.delete(port).where(eq(port.id, id));
  },
  updateAccomodation: async (id, data) => {
    await db.update(accomodation_list).set(data).where(eq(accomodation_list.id, id));
  },
  updateResort: async (id, data) => {
    await db.update(resorts).set(data).where(eq(resorts.id, id));
  },
  fetchResortById: async (id) => {
    const resort = await db.query.resorts.findFirst({
      where: eq(resorts.id, id),
      with: {
        destination: true
      }
    });
    if (!resort) {
      throw new AppError('Resort not found', true, 404);
    }
    return {
      id: resort.id ?? '',
      name: resort.name ?? '',
      destination_id: resort.destination_id ?? '',
      country_id: resort.destination?.country_id ?? '',
    };
  },
  insertHeadline: async (data) => {
    await db.insert(headlinesTable).values(data);
  },
  updateHeadline: async (id, data) => {
    await db.update(headlinesTable).set(data).where(eq(headlinesTable.id, id));
  },
  fetchAllHeadlines: async () => {
    const headlines = await db.select().from(headlinesTable);
    return headlines.map((headline) => ({
      id: headline.id ?? '',
      title: headline.title ?? '',
      message: headline.message ?? '',
      link: headline.link ?? '',
      expiry_date: headline.expiry_date ?? '',
      created_at: headline.created_at ?? '',
      updated_at: headline.updated_at ?? '',
      post_type: headline.post_type as 'Flash Sale' | 'Hot Deal' | 'Admin' | 'Urgent',
    }));
  },
  fetchHeadlineById: async (id) => {
    const [headline] = await db.select().from(headlinesTable).where(eq(headlinesTable.id, id));
    if (!headline) {
      throw new AppError('Headline not found', true, 404);
    }
    return {
      title: headline.title ?? '',
      message: headline.message ?? '',
      link: headline.link ?? '',
      expiry_date: headline.expiry_date ?? '',
      created_at: headline.created_at ?? '',
      updated_at: headline.updated_at ?? '',
      post_type: headline.post_type as 'Flash Sale' | 'Hot Deal' | 'Admin' | 'Urgent',
    };
  },
  deleteHeadline: async (id) => {
    await db.delete(headlinesTable).where(eq(headlinesTable.id, id));
  },

  //Starts here


  insertAccomodation: async (data) => {
    await db.insert(accomodation_list).values(data);
  },
  updateLeadSource: async (transaction_id, lead_source) => {

    await db
      .update(transaction)
      .set({
        lead_source: lead_source,
      })
      .where(eq(transaction.id, transaction_id));
  },
  fetchRoomTypes: async () => {
    const response = await db.query.room_type.findMany({
      columns: {
        id: true,
        name: true,
      },
    });
    return response.map((data) => ({
      id: data.id,
      name: data.name ?? '',
    }));
  },
  reassignTransaction: async (transactionId, agent_id) => {
    await db
      .update(transaction)
      .set({
        user_id: agent_id,
      })
      .where(eq(transaction.id, transactionId));

    await db
      .update(task)
      .set({
        user_id: agent_id,
      })
      .where(eq(task.transaction_id, transactionId));
  },
  fetchDestination: async (country_ids, selectedIds, search) => {
    const response = await db
      .select({
        id: destination.id,
        name: destination.name,

        country_id: destination.country_id,
        country: {
          id: country.id,
          country_name: country.country_name, // Use actual column name from your schema
        },
      })
      .from(destination)
      .innerJoin(country, eq(destination.country_id, country.id))
      .where(
        or(
          search ? or(ilike(destination.name, `%${search}%`), ilike(country.country_name, `%${search}%`)) : undefined,
          or(
            country_ids?.length ? inArray(destination.country_id, country_ids) : undefined,
            selectedIds?.length ? inArray(destination.id, selectedIds) : undefined
          )
        )
      );

    return response.map((data) => ({
      id: data.id,
      name: data.name ?? '',
      country_id: data.country_id ?? '',
      country: data.country
        ? {
          id: data.country.id,
          country_name: data.country.country_name ?? '',
        }
        : null,
    }));
  },
  fetchPort: async (search, cruise_destination_id, selectedIds, page = 1, limit = 10) => {
    const conditions = [
      search ? ilike(port.name, `%${search}%`) : undefined,
      cruise_destination_id?.length ? inArray(port.cruise_destination_id, cruise_destination_id) : undefined,
      selectedIds?.length ? inArray(port.id, selectedIds) : undefined,
    ].filter(Boolean);
    const offset = (page - 1) * limit;

    const whereClause = nestedBuilder(conditions);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(port)
      .where(whereClause || undefined)
      .then((result) => result[0]?.count || 0);

    const response = await db.query.port.findMany({
      columns: {
        id: true,
        name: true,
      },
      with: {
        cruise_destination: true,
      },
      ...(whereClause ? { where: whereClause } : {}),
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: response.map((data) => ({
        id: data.id,
        name: data.name ?? '',
        cruise_destination: data.cruise_destination
          ? {
            id: data.cruise_destination.id,
            name: data.cruise_destination.name ?? '',
          }
          : null,
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    };
  },
  fetchAirport: async (search, selectedIds) => {
    const conditions = [
      search ? or(ilike(airport.airport_name, `%${search}%`), ilike(airport.airport_code, `%${search}%`)) : undefined,
      selectedIds && selectedIds?.length ? inArray(airport.id, selectedIds) : undefined,
    ].filter(Boolean);

    const whereClause = nestedBuilder(conditions);
    const response = await db.query.airport.findMany({
      columns: {
        id: true,
        airport_name: true,
        airport_code: true,
      },
      ...(whereClause ? { where: whereClause } : {}),
    });
    return response.map((data) => ({
      id: data.id,
      airport_name: data.airport_name ?? '',
      airport_code: data.airport_code ?? '',
    }));
  },
  fetchBoardBasis: async () => {
    const response = await db.query.board_basis.findMany({
      columns: {
        id: true,
        type: true,
      },
    });
    return response.map((data) => ({
      id: data.id,
      type: data.type ?? '',
    }));
  },
  fetchCruiseLine: async (search, page = 1, limit = 10) => {
    const conditions = [search ? ilike(cruise_line.name, `%${search}%`) : undefined].filter(Boolean);
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(cruise_line)
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .then((result) => result[0]?.count || 0);

    const response = await db.query.cruise_line.findMany({
      columns: {
        id: true,
        name: true,
      },
      ...(conditions.length > 0 ? { where: conditions[0] } : {}),
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: response.map((data) => ({
        id: data.id,
        name: data.name ?? '',
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    };
  },
  fetchCountry: async (search) => {
    const conditions = [search ? ilike(country.country_name, `%${search}%`) : undefined].filter(Boolean);

    const whereClause = nestedBuilder(conditions);
    const response = await db.query.country.findMany({
      columns: {
        id: true,
        country_name: true,
      },
      ...(whereClause ? { where: whereClause } : {}),
    });
    return response.map((data) => ({
      id: data.id,
      country_name: data.country_name ?? '',
    }));
  },
  fetchAccomodation: async (search, resort_ids, selectedIds) => {
    let whereClause: any = undefined;

    if (search && resort_ids?.length) {
      // If both search and resort_ids are provided, use AND logic
      whereClause = and(ilike(accomodation_list.name, `%${search}%`), inArray(accomodation_list.resorts_id, resort_ids));
    } else if (search) {
      // Only search term
      whereClause = ilike(accomodation_list.name, `%${search}%`);
    } else if (resort_ids?.length) {
      // Only resort_ids
      whereClause = inArray(accomodation_list.resorts_id, resort_ids);
    }

    // Add selectedIds condition if provided
    if (selectedIds?.length) {
      if (whereClause) {
        whereClause = and(whereClause, inArray(accomodation_list.id, selectedIds));
      } else {
        whereClause = inArray(accomodation_list.id, selectedIds);
      }
    }

    const response = await db.query.accomodation_list.findMany({
      columns: {
        id: true,
        name: true,
        resorts_id: true,
      },
      with: {
        type: {
          columns: {
            id: true,
            type: true,
          },
        },
        resorts: {
          columns: {
            id: true,
            name: true,
          },
          with: {
            destination: {
              columns: {
                id: true,
                name: true,
                country_id: true,
              },
              with: {
                country: {
                  columns: {
                    id: true,
                    country_name: true,
                  },
                },
              },
            },
          },
        },
      },
      ...(whereClause ? { where: whereClause } : {}),
      orderBy: search
        ? [
          desc(ilike(accomodation_list.name, `${search}%`)), // Exact prefix match first
          desc(ilike(accomodation_list.name, `%${search}%`)), // Partial match
        ]
        : undefined,
      limit: 100,
    });
    return response.map((data) => ({
      id: data.id,
      name: data.name ?? '',
      resorts_id: data.resorts_id ?? '',

      type: data.type
        ? {
          id: data.type.id,
          type: data.type.type ?? '',
        }
        : null,
      resorts: data.resorts
        ? {
          id: data.resorts.id,
          name: data.resorts.name ?? '',
          destination_id: data.resorts.destination?.id ?? '',
          destination: data.resorts.destination
            ? {
              id: data.resorts.destination.id,
              name: data.resorts.destination.name ?? '',
            }
            : null,
        }
        : null,
    }));
  },
  fetchResorts: async (search, destinationIds, selectedIds) => {



    const conditions = [
      search && ilike(resorts.name, `%${search}%`),
      destinationIds?.length && inArray(resorts.destination_id, destinationIds),
      selectedIds?.length && inArray(resorts.id, selectedIds),
    ].filter(Boolean);

    const whereClause = nestedBuilder(conditions);
    const response = await db.query.resorts.findMany({
      columns: {
        id: true,
        name: true,
        destination_id: true,
      },
      with: {
        destination: {
          columns: {
            id: true,
            name: true,
            country_id: true,
          },
          with: {
            country: {
              columns: {
                id: true,
                country_name: true,
              },
            },
          },
        },
      },
      ...(whereClause ? { where: whereClause } : {}),
      limit: 100, // Apply `where` only if it exists
    });
    return response.map((data) => ({
      id: data.id,
      name: data.name ?? '',
      destination_id: data.destination_id ?? '',
      destination: data.destination
        ? {
          id: data.destination.id,
          name: data.destination.name ?? '',
          country_id: data.destination.country_id ?? '',
          country: data.destination.country
            ? {
              id: data.destination.country.id,
              country_name: data.destination.country.country_name ?? '',
            }
            : null,
        }
        : null,
    }));
  },
  fetchAccomodationType: async () => {
    const response = await db.query.accomodation_type.findMany({
      columns: {
        id: true,
        type: true,
      },
    });
    return response.map((data) => ({
      id: data.id,
      type: data.type ?? '',
    }));
  },
  fetchCruiseDestination: async (search, page = 1, limit = 10) => {
    const conditions = [search ? ilike(cruise_destination.name, `%${search}%`) : undefined].filter(Boolean);
    const offset = (page - 1) * limit;

    const whereClause = nestedBuilder(conditions);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(cruise_destination)
      .where(whereClause || undefined)
      .then((result) => result[0]?.count || 0);

    const response = await db.query.cruise_destination.findMany({
      columns: {
        id: true,
        name: true,
      },
      ...(whereClause ? { where: whereClause } : {}),
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: response.map((data) => ({
        id: data.id,
        name: data.name ?? '',
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    };
  },
  fetchTourOperator: async (search, selectedIds) => {
    const conditions = [search ? ilike(tour_operator.name, `%${search}%`) : undefined, selectedIds?.length ? inArray(tour_operator.id, selectedIds) : undefined].filter(Boolean);

    const whereClause = nestedBuilder(conditions);

    const response = await db.query.tour_operator.findMany({
      columns: {
        id: true,
        name: true,
      },
      with: {
        tour_package_commission: {
          with: {
            package_type: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      ...(whereClause ? { where: whereClause } : {}),
    });

    const payload = response.map((data) => {
      return {
        ...data,
        name: data.name ?? '',
        tour_package_commission: data.tour_package_commission.map((commission) => {
          return {
            percentage_commission: Math.round(parseFloat(commission.percentage_commission || '0') * 100) / 100,
            package_type: commission.package_type?.name ?? '',
            package_type_id: commission.package_type_id ?? '',
          };
        }),
      };
    });

    return payload;
  },
  fetchPackageType: async () => {
    const response = await db.query.package_type.findMany({
      columns: {
        id: true,
        name: true,
      },
    });
    return response;
  },
  fetchLodges: async (search) => {
    const conditions = [search ? or(ilike(lodges.lodge_name, `%${search}%`), ilike(lodges.lodge_code, `%${search}%`)) : undefined].filter(Boolean);

    const whereClause = nestedBuilder(conditions);
    const response = await db.query.lodges.findMany({
      columns: {
        id: true,
        lodge_name: true,
        lodge_code: true,
        image: true,
        adults: true,
        children: true,
        bedrooms: true,
        bathrooms: true,
        pets: true,
        sleeps: true,
        infants: true,
        park_id: true,
      },
      where: whereClause,
      with: {
        park: {
          columns: {
            id: true,
            name: true,
            city: true,
            location: true,
            county: true,
            code: true,
            description: true,
          },
        },
      },
      limit: 40,
    });
    return response.map((data) => ({
      id: data.id,
      lodge_name: data.lodge_name ?? '',
      lodge_code: data.lodge_code ?? '',
      image: data.image ?? '',
      adults: data.adults ?? 0,
      children: data.children ?? 0,
      bedrooms: data.bedrooms ?? 0,
      bathrooms: data.bathrooms ?? 0,
      pets: data.pets ?? 0,
      sleeps: data.sleeps ?? 0,
      infants: data.infants ?? 0,
      park: data.park
        ? {
          id: data.park.id,
          name: data.park.name ?? '',
          city: data.park.city ?? '',
          location: data.park.location ?? '',
          county: data.park.county ?? '',
          code: data.park.code ?? '',
          description: data.park.description ?? '',
        }
        : null,
    }));
  },

  fetchCruiseDate: async (date, ship_id) => {
    const [year, month] = date.split('-');
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

    const nextMonth = new Date(parseInt(year), parseInt(month), 1); // Auto handles overflow
    const endDate = nextMonth.toISOString().split('T')[0];
    const response = await db
      .select({
        date: cruise_itenary.date,
        itenary: cruise_itenary.itenary,
        day_number: cruise_voyage.day_number,
        description: cruise_voyage.description,
      })
      .from(cruise_itenary)
      .innerJoin(cruise_ship, eq(cruise_ship.id, cruise_itenary.ship_id)) // ✅ Ensuring itinerary belongs to the ship
      .leftJoin(cruise_voyage, eq(cruise_voyage.itinerary_id, cruise_itenary.id))
      .where(
        and(
          eq(cruise_itenary.ship_id, ship_id), // ✅ Correct ship_id filter
          gte(cruise_itenary.date, startDate),
          lt(cruise_itenary.date, endDate)
        )
      )
      .orderBy(cruise_itenary.date);

    const groupedResults = response.reduce((acc: Record<string, any>, item) => {
      const { date, itenary, day_number, description } = item;
      if (date) {
        if (!acc[date]) {
          acc[date] = {
            date,
            itenary,
            voyages: [], // Initialize voyages array
          };
        }

        // Add voyage details if they exist
        const isDuplicate = acc[date].voyages.some((voyage: any) => voyage.day_number === parseInt(day_number || '0'));

        // Add voyage details if they exist and the day_number is not a duplicate
        if ((day_number !== null || description !== null) && !isDuplicate) {
          acc[date].voyages.push({
            day_number: parseInt(day_number || '0'),
            description,
          });
        }
      }
      return acc;
    }, {});

    const structuredResults = Object.values(groupedResults);

    const validateResult = z.array(cruiseDateQuerySchema).safeParse(structuredResults);

    if (!validateResult.success) {
      console.log(validateResult.error);
      throw new AppError('Invalid cruise date response', true, 500);
    }
    return validateResult.data;
  },
  fetchCruises: async () => {
    const response = await db.query.cruise_line.findMany({
      columns: {
        id: true,
        name: true,
      },
    });
    return response.map((data) => ({
      id: data.id,
      name: data.name ?? '',
    }));
  },
  fetchShips: async (cruise_line_id, search, page = 1, limit = 10) => {
    const conditions = [eq(cruise_ship.cruise_line_id, cruise_line_id), search ? ilike(cruise_ship.name, `%${search}%`) : undefined].filter(Boolean);
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(cruise_ship)
      .where(and(...conditions))
      .then((result) => result[0]?.count || 0);

    const response = await db.query.cruise_ship.findMany({
      where: and(...conditions),
      columns: {
        id: true,
        name: true,
      },
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: response.map((data) => ({
        id: data.id,
        name: data.name ?? '',
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    };
  },
  fetchCruiseExtras: async () => {
    const response = await db.query.cruise_extra_item.findMany({
      columns: {
        id: true,
        name: true,
      },
    });
    return response.map((data) => ({
      id: data.id,
      name: data.name ?? '',
    }));
  },
  fetchNotes: async (transaction_id) => {
    const allNotes = await db.query.notes.findMany({
      where: eq(notes.transaction_id, transaction_id),
      with: {
        user: true,
      },
      orderBy: [desc(notes.createdAt)],
    });

    // Separate top-level notes and replies
    const topLevelNotes = allNotes.filter((note) => !note.parent_id);
    const replies = allNotes.filter((note) => note.parent_id);

    // Group replies by parent_id
    const repliesByParent = replies.reduce((acc, reply) => {
      if (!acc[reply.parent_id!]) {
        acc[reply.parent_id!] = [];
      }
      acc[reply.parent_id!].push(reply);
      return acc;
    }, {} as Record<string, typeof replies>);

    const payload = topLevelNotes.map((data) => {
      const timeAgo = formatDistanceToNow(new Date(data.createdAt), { addSuffix: true });
      const noteReplies = repliesByParent[data.id] || [];

      const repliesWithTimeAgo = noteReplies
        .map((reply) => {
          const replyTimeAgo = formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true });
          return {
            ...reply,
            transaction_id: reply.transaction_id ?? '',
            agent_id: reply.agent_id ?? '',
            content: reply.content ?? '',
            description: reply.description ?? '',
            agent: `${reply.user?.firstName} ${reply.user?.lastName}`,
            ago: replyTimeAgo,
          };
        })
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      return {
        ...data,
        transaction_id: data.transaction_id ?? '',
        description: data.description ?? '',
        agent_id: data.agent_id ?? '',
        content: data.content ?? '',
        agent: `${data.user?.firstName} ${data.user?.lastName}`,
        ago: timeAgo,
        replies: repliesWithTimeAgo,
      };
    });
    return payload;
  },
  insertNote: async (content, transaction_id, agent_id, parent_id) => {
    await db.insert(notes).values({
      transaction_id: transaction_id,
      content: content,
      user_id: agent_id,
      parent_id: parent_id || null,
    });
  },

  updateNote: async (content, note_id) => {
    await db
      .update(notes)
      .set({
        content: content,
      })
      .where(eq(notes.id, note_id));
  },

  fetchNoteById: async (note_id) => {
    const response = await db.query.notes.findFirst({
      where: eq(notes.id, note_id),
      with: {
        user: true,
      },
    });
    return {
      ...response,
      transaction_id: response?.transaction_id ?? '',
      parent_id: response?.parent_id ?? '',
      description: response?.description ?? '',
      agent_id: response?.agent_id ?? '',
      agent: response?.user,
    };
  },
  deleteNote: async (note_id) => {
    await db.delete(notes).where(eq(notes.id, note_id));
  },
  fetchKanbanInquries: async (agent_id, page = 1, limit = 10, search) => {
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());

    const enquiryQuery = db
      .select({
        id: enquiry_table.id,
        title: enquiry_table.title,
        total_cost: enquiry_table.budget,
        budget: enquiry_table.budget,
        holiday_type: package_type.name,
        travel_date: enquiry_table.travel_date,
        no_of_nights: enquiry_table.no_of_nights,
        enquiry_status: enquiry_table.status,
        status: transaction.status,
        agent_id: transaction.user_id,
        client_id: transaction.user_id,
        transactionId: transaction.id,
        is_expired: sql`CASE WHEN ${enquiry_table.date_expiry} < ${new Date()} THEN true ELSE false END`,
        agentName: sql`${user.firstName} || ' ' || ${user.lastName}`,
        clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
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
      .orderBy(asc(sql`CASE WHEN ${enquiry_table.date_expiry} < ${new Date()} THEN true ELSE false END`), desc(enquiry_table.date_created));

    // Add search filter if provided
    if (search) {
      enquiryQuery.where(
        and(
          eq(transaction.status, 'on_enquiry'),
          eq(enquiry_table.is_future_deal, false),
          eq(enquiry_table.is_active, true),
          ne(enquiry_table.status, 'LOST'),
          or(
            and(gt(enquiry_table.date_created, currentMonthStart), lt(enquiry_table.date_created, currentMonthEnd)),
            or(gte(enquiry_table.date_expiry, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), gte(enquiry_table.date_expiry, new Date()))
          ),
          agent_id ? eq(transaction.user_id, agent_id) : undefined,
          or(ilike(enquiry_table.title, `%${search}%`), ilike(sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`, `%${search}%`))
        )
      );
    } else if (agent_id) {
      enquiryQuery.where(
        and(
          or(
            and(gt(enquiry_table.date_created, currentMonthStart), lt(enquiry_table.date_created, currentMonthEnd)),
            or(gte(enquiry_table.date_expiry, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), gte(enquiry_table.date_expiry, new Date()))
          ),
          eq(transaction.status, 'on_enquiry'),
          eq(enquiry_table.is_future_deal, false),
          eq(enquiry_table.is_active, true),
          ne(enquiry_table.status, 'LOST'),
          eq(transaction.user_id, agent_id)
        )
      );
    } else {
      enquiryQuery.where(
        and(
          or(
            and(gt(enquiry_table.date_created, currentMonthStart), lt(enquiry_table.date_created, currentMonthEnd)),
            or(gte(enquiry_table.date_expiry, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), gte(enquiry_table.date_expiry, new Date()))
          ),
          eq(transaction.status, 'on_enquiry'),
          eq(enquiry_table.is_future_deal, false),
          eq(enquiry_table.is_active, true),
          ne(enquiry_table.status, 'LOST')
        )
      );
    }

    // Get total count for pagination
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(enquiry_table)
      .leftJoin(transaction, eq(transaction.id, enquiry_table.transaction_id))
      .leftJoin(clientTable, eq(clientTable.id, transaction.client_id));

    // Apply same filters to count query
    if (search) {
      totalCountQuery.where(
        and(
          or(
            and(gt(enquiry_table.date_created, currentMonthStart), lt(enquiry_table.date_created, currentMonthEnd)),
            or(gte(enquiry_table.date_expiry, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), gte(enquiry_table.date_expiry, new Date()))
          ),
          eq(transaction.status, 'on_enquiry'),
          eq(enquiry_table.is_future_deal, false),
          eq(enquiry_table.is_active, true),
          ne(enquiry_table.status, 'LOST'),
          agent_id ? eq(transaction.user_id, agent_id) : undefined,
          or(ilike(enquiry_table.title, `%${search}%`), ilike(sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`, `%${search}%`))
        )
      );
    } else if (agent_id) {
      totalCountQuery.where(
        and(
          or(
            and(gt(enquiry_table.date_created, currentMonthStart), lt(enquiry_table.date_created, currentMonthEnd)),
            or(gte(enquiry_table.date_expiry, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), gte(enquiry_table.date_expiry, new Date()))
          ),
          eq(transaction.status, 'on_enquiry'),
          eq(enquiry_table.is_future_deal, false),
          eq(enquiry_table.is_active, true),
          ne(enquiry_table.status, 'LOST'),
          eq(transaction.user_id, agent_id)
        )
      );
    } else {
      totalCountQuery.where(
        and(
          or(
            and(gt(enquiry_table.date_created, currentMonthStart), lt(enquiry_table.date_created, currentMonthEnd)),
            or(gte(enquiry_table.date_expiry, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), gte(enquiry_table.date_expiry, new Date()))
          ),
          eq(transaction.status, 'on_enquiry'),
          eq(enquiry_table.is_future_deal, false),
          eq(enquiry_table.is_active, true),
          ne(enquiry_table.status, 'LOST')
        )
      );
    }

    const [{ count: totalCount }] = await totalCountQuery;

    // Apply pagination
    const offset = (page - 1) * limit;
    enquiryQuery.limit(limit).offset(offset);

    const enquiry = await enquiryQuery;
    const groupedResults = enquiry.reduce((acc, curr) => {
      const { id, travel_date, ...rest } = curr;
      if (!acc[id]) {
        acc[id] = {
          id,
          ...rest,
          no_of_nights: curr.no_of_nights?.toString() ?? '0',
          travel_date: travel_date ? new Date(travel_date).toISOString() : null,
          enquiry_cruise_destination: [],
          destination: [],
        };
      }
      if (curr.enquiry_cruise_destination && curr.enquiry_cruise_destination.id) {
        acc[id].enquiry_cruise_destination.push(curr.enquiry_cruise_destination);
      }
      if (curr.destination && curr.destination.id) {
        acc[id].destination.push(curr.destination);
      }
      return acc;
    }, {} as Record<string, any>);
    const structuredResults = Object.values(groupedResults);

    const validateEnquiry = z.array(enquiryPipelineSchema).safeParse(structuredResults);

    const budget_for_current_month = await db
      .select({
        budget: sum(enquiry_table.budget),
      })
      .from(enquiry_table)
      .leftJoin(transaction, eq(transaction.id, enquiry_table.transaction_id))
      .where(
        and(
          or(
            and(gt(enquiry_table.date_created, currentMonthStart), lt(enquiry_table.date_created, currentMonthEnd)),
            or(gte(enquiry_table.date_expiry, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), gte(enquiry_table.date_expiry, new Date()))
          ),
          eq(enquiry_table.is_active, true),
          eq(enquiry_table.is_future_deal, false),

          eq(enquiry_table.status, 'NEW_LEAD'),
          eq(transaction.status, 'on_enquiry'),
          agent_id ? eq(transaction.user_id, agent_id) : undefined
        )
      );

    if (!validateEnquiry.success) {
      console.log(validateEnquiry.error);
      throw new AppError('Invalid data structure !', true, 500);
    }

    const hasMore = offset + limit < totalCount;

    return {
      data: validateEnquiry.data.filter((data) => data.enquiry_status !== 'LOST'),
      profit: parseFloat(budget_for_current_month[0]?.budget || '0'),
      hasMore,
      totalCount,
    };
  },
  fetchBookings: async (agent_id) => {
    const bookingQuery = db
      .select({
        id: booking.id,
        title: booking.title,
        travel_date: booking.travel_date,
        no_of_nights: booking.num_of_nights,
        status: transaction.status,
        holiday_type: package_type.name,
        clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`.as('clientName'),
        agent_id: transaction.user_id,
        agentName: sql`${user.firstName} || ' ' || ${user.lastName}`.as('agentName'),
        client_id: transaction.client_id,
        lodge_destination: park.city,
        cottage_destination: cottages.location,
        cruise_destination: booking_cruise.cruise_name,
        holiday_destination: destination.name,
        booking_status: booking.booking_status,
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
      .groupBy(
        booking.id,
        transaction.status,
        sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
        transaction.user_id,
        sql`${user.firstName} || ' ' || ${user.lastName}`,
        transaction.client_id,
        package_type.name,
        park.city,
        cottages.location,
        booking_cruise.cruise_name,
        destination.name,
        booking.booking_status,
        booking.travel_date,
        booking.service_charge,

        booking.sales_price
      )
      .orderBy(desc(booking.date_created));

    if (agent_id) {
      bookingQuery.where(and(eq(transaction.user_id, agent_id), eq(booking.is_active, true), eq(transaction.status, 'on_booking')));
    } else {
      bookingQuery.where(and(eq(transaction.status, 'on_booking'), eq(booking.is_active, true)));
    }

    const bookingData = await bookingQuery;
    const dataToValidate = bookingData.map((data) => ({
      ...data, travel_date: data.travel_date ? new Date(data.travel_date).toISOString() : null,
      no_of_nights: data.no_of_nights?.toString() ?? '0',
    }));
    const validateBooking = z.array(bookingPipelineSchema).safeParse(dataToValidate);

    if (!validateBooking.success) {
      console.log(validateBooking.error);
      throw new AppError('Something went wrong fetching booking', true, 500);
    }

    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());

    const profit = await db
      .select({
        overall_commission: sum(sql`
      COALESCE((SELECT SUM(commission) FROM booking_flights WHERE booking_flights.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_airport_parking WHERE booking_airport_parking.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_lounge_pass WHERE booking_lounge_pass.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_attraction_ticket WHERE booking_attraction_ticket.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_car_hire WHERE booking_car_hire.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_transfers WHERE booking_transfers.booking_id = booking_table.id), 0)
      + COALESCE((SELECT SUM(commission) FROM booking_accomodation WHERE booking_accomodation.booking_id = booking_table.id), 0)
      + booking_table.package_commission
    `).as('overall_commission'),
      })
      .from(booking)
      .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
      .where(
        and(
          eq(transaction.status, 'on_booking'),
          eq(booking.is_active, true),
          agent_id ? eq(transaction.user_id, agent_id) : undefined,
          gt(booking.date_created, currentMonthStart),
          lt(booking.date_created, currentMonthEnd)
        )
      );

    return {
      data: validateBooking.data,
      profit: parseFloat(profit[0]?.overall_commission || '0'),
    };
  },

  fetchTransactionSummaryByAgent: async (agent_id) => {
    const inquiries = await db.query.transaction.findMany({
      where: and(eq(transaction.status, 'on_enquiry'), eq(transaction.user_id, agent_id)),
      with: {
        client: {
          columns: {
            id: true,
            firstName: true,
            surename: true,
            phoneNumber: true,
          },
        },
        enquiry: {
          with: {
            board_basis: {
              with: {
                board_basis: true,
              },
            },

            resortss: {
              with: {
                resorts: true,
              },
            },
            destination: {
              with: {
                destination: true,
              },
            },
            enquiry_cruise_destination: {
              with: {
                cruise_destination: true,
              },
            },
          },
        },
      },
      limit: 5,
    });

    const enquiryList = inquiries.map((data) => ({
      id: data.enquiry.id,
      clientId: data.client_id,
      clientName: `${data.client?.firstName} ${data.client?.surename}`,
      phoneNumber: data.client?.phoneNumber,
      destination: data.enquiry.resortss?.length
        ? data.enquiry.resortss.map((item) => item.resorts?.name).join(', ')
        : data.enquiry.destination?.length
          ? data.enquiry.destination.map((item) => item.destination?.name).join(', ')
          : data.enquiry.enquiry_cruise_destination?.length
            ? data.enquiry.enquiry_cruise_destination.map((item) => item.cruise_destination?.name).join(', ')
            : 'No Destination',
      no_of_nights: data.enquiry.no_of_nights?.toString() ?? '0',
      board_basis: data.enquiry.board_basis?.length ? data.enquiry.board_basis.map((data) => data.board_basis?.type).join(',') : 'No Board Basis',
      amount: parseFloat(data.enquiry.budget || '0').toFixed(2),
      travel_date: data.enquiry.travel_date ?? 'No Travel Date',
      title: data.enquiry.title,
    }));

    const quotes = await db
      .select({
        id: quote.id,
        transaction_id: quote.transaction_id,
        clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
        clientPhoneNumber: clientTable.phoneNumber,
        client_id: transaction.client_id,
        no_of_nights: quote.num_of_nights,
        board_basis: board_basis.type,
        lodge_destination: park.city,
        cottage_destination: cottages.location,
        cruise_destination: quote_cruise.cruise_name,
        holiday_destination: destination.name,
        quote_status: quote.quote_status,
        travel_date: quote.travel_date,
        title: quote.title,
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
      .leftJoin(board_basis, eq(quote_accomodation.board_basis_id, board_basis.id))
      .leftJoin(accomodation_list, eq(quote_accomodation.accomodation_id, accomodation_list.id))
      .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
      .leftJoin(destination, eq(resorts.destination_id, destination.id))
      .where(and(eq(transaction.status, 'on_quote'), eq(quote.quote_type, 'primary'), eq(transaction.user_id, agent_id)))
      .groupBy(
        quote.id,
        quote.transaction_id,
        transaction.status,
        board_basis.type,
        clientTable.phoneNumber,
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
      .limit(5)
      .orderBy(asc(sql`quote_status = 'LOST'`), desc(quote.date_created));

    const quoteList = quotes.map((data) => ({
      id: data.id,
      clientId: data.client_id,
      clientName: data.clientName as string,
      phoneNumber: data.clientPhoneNumber,
      title: data.title,
      destination: data.lodge_destination ?? data.holiday_destination ?? data.cruise_destination ?? 'No Destination',

      no_of_nights: data.no_of_nights.toString() ?? '0',
      board_basis: data.board_basis ?? 'No Board Basis',
      amount: parseFloat(data.overall_cost as string).toFixed(2),
      travel_date: data.travel_date,
    }));

    const bookings = await db
      .select({
        id: booking.id,
        transaction_id: booking.transaction_id,
        clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
        clientPhoneNumber: clientTable.phoneNumber,
        client_id: transaction.client_id,
        no_of_nights: booking.num_of_nights,
        title: booking.title,
        board_basis: board_basis.type,
        lodge_destination: park.city,
        cottage_destination: cottages.location,
        cruise_destination: booking_cruise.cruise_name,
        holiday_destination: destination.name,
        booking_status: booking.booking_status,
        travel_date: booking.travel_date,
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
      .innerJoin(transaction, eq(booking.transaction_id, transaction.id)) // Join transaction after booking
      .leftJoin(package_type, eq(booking.holiday_type_id, package_type.id)) // Now transaction is available
      .innerJoin(clientTable, eq(transaction.client_id, clientTable.id))
      .leftJoin(booking_cruise, eq(booking_cruise.booking_id, booking.id))
      .innerJoin(user, eq(transaction.user_id, user.id))
      .leftJoin(cottages, eq(booking.cottage_id, cottages.id))
      .leftJoin(lodges, eq(booking.lodge_id, lodges.id))
      .leftJoin(park, eq(lodges.park_id, park.id))
      .leftJoin(booking_accomodation, and(eq(booking_accomodation.booking_id, booking.id), eq(booking_accomodation.is_primary, true)))
      .leftJoin(board_basis, eq(booking_accomodation.board_basis_id, board_basis.id))
      .leftJoin(accomodation_list, eq(booking_accomodation.accomodation_id, accomodation_list.id))
      .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
      .leftJoin(destination, eq(resorts.destination_id, destination.id))
      .where(and(eq(transaction.status, 'on_booking'), eq(transaction.user_id, agent_id)))
      .groupBy(
        booking.id,
        booking.transaction_id,
        transaction.status,
        board_basis.type,
        clientTable.phoneNumber,
        sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
        transaction.user_id,
        sql`${user.firstName} || ' ' || ${user.lastName}`,
        transaction.client_id,
        booking.num_of_nights,
        package_type.name,
        park.city,
        cottages.location,
        booking_cruise.cruise_name,
        booking.travel_date,
        destination.name
      )
      .limit(5)
      .orderBy(asc(sql`booking_status = 'LOST'`), desc(booking.date_created));

    const bookingList = bookings.map((data) => ({
      id: data.id,
      clientId: data.client_id,
      clientName: data.clientName as string,
      phoneNumber: data.clientPhoneNumber,
      title: data.title,
      destination: data.lodge_destination ?? data.holiday_destination ?? data.cruise_destination ?? 'No Destination',

      no_of_nights: data.no_of_nights.toString() ?? '0',
      board_basis: data.board_basis ?? 'No Board Basis',
      amount: parseFloat(data.overall_cost as string).toFixed(2),
      travel_date: data.travel_date,
    }));

    return {
      enquiries: enquiryList,
      quotes: quoteList,
      bookings: bookingList,
    };
  },
  fetchFutureDealsKanban: async (agent_id, page = 1, limit = 10, search) => {
    const offset = (page - 1) * limit;

    // Fetch future quotes
    const futureQuotesQuery = db
      .select({
        id: quote.id,
        title: quote.title,
        transaction_id: transaction.id,
        status: transaction.status,
        travel_date: quote.travel_date,
        no_of_nights: quote.num_of_nights,
        clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
        agent_id: transaction.user_id,
        agentName: sql`${user.firstName} || ' ' || ${user.lastName}`,
        client_id: transaction.client_id,
        lodge_destination: park.city,
        cottage_destination: cottages.location,
        cruise_destination: quote_cruise.cruise_name,
        holiday_destination: destination.name,
        quote_status: quote.quote_status,
        holiday_type: package_type.name,
        quote_type: quote.quote_type,
        overall_commission: sql`
          COALESCE((SELECT SUM(commission) FROM quote_flights WHERE quote_flights.quote_id = quote_table.id), 0)
          + COALESCE((SELECT SUM(commission) FROM quote_airport_parking WHERE quote_airport_parking.quote_id = quote_table.id), 0)
          + COALESCE((SELECT SUM(commission) FROM quote_lounge_pass WHERE quote_lounge_pass.quote_id = quote_table.id), 0)
          + COALESCE((SELECT SUM(commission) FROM quote_attraction_ticket WHERE quote_attraction_ticket.quote_id = quote_table.id), 0)
          + COALESCE((SELECT SUM(commission) FROM quote_car_hire WHERE quote_car_hire.quote_id = quote_table.id), 0)
          + COALESCE((SELECT SUM(commission) FROM quote_transfers WHERE quote_transfers.quote_id = quote_table.id), 0)
          + COALESCE((SELECT SUM(commission) FROM quote_accomodation WHERE quote_accomodation.quote_id = quote_table.id), 0)
          + quote_table.package_commission
        `,
        type: sql`'quote'`,
        is_future_deal: quote.is_future_deal,
        future_deal_date: quote.future_deal_date,
      })
      .from(quote)
      .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
      .innerJoin(clientTable, eq(transaction.client_id, clientTable.id))
      .leftJoin(package_type, eq(quote.holiday_type_id, package_type.id))
      .leftJoin(quote_cruise, eq(quote_cruise.quote_id, quote.id))
      .leftJoin(user, eq(transaction.user_id, user.id))
      .leftJoin(cottages, eq(quote.cottage_id, cottages.id))
      .leftJoin(lodges, eq(quote.lodge_id, lodges.id))
      .leftJoin(park, eq(lodges.park_id, park.id))
      .leftJoin(quote_accomodation, and(eq(quote_accomodation.quote_id, quote.id), eq(quote_accomodation.is_primary, true)))
      .leftJoin(accomodation_list, eq(quote_accomodation.accomodation_id, accomodation_list.id))
      .leftJoin(resorts, eq(accomodation_list.resorts_id, resorts.id))
      .leftJoin(destination, eq(resorts.destination_id, destination.id));

    // Add filters for future quotes
    const quoteFilters = [eq(transaction.status, 'on_quote'), eq(quote.is_future_deal, true), eq(quote.is_active, true)];

    if (agent_id) {
      quoteFilters.push(eq(transaction.user_id, agent_id));
    }

    // if (search) {
    //   quoteFilters.push(
    //     or(
    //       ilike(sql`COALESCE(${quote.title}, '')`, search),
    //     )
    //   );
    // }

    const futureQuotes = await futureQuotesQuery
      .where(and(...quoteFilters.filter(Boolean)))
      .groupBy(
        quote.id,
        quote.transaction_id,
        transaction.id,
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
        destination.name,
        quote.is_future_deal,
        quote.future_deal_date
      )
      .orderBy(desc(quote.date_created))
      .limit(limit ?? 10)
      .offset(offset);

    // Fetch future enquiries
    const futureEnquiriesQuery = db
      .select({
        id: enquiry_table.id,
        title: enquiry_table.title,
        transaction_id: transaction.id,
        status: transaction.status,
        travel_date: enquiry_table.travel_date,
        no_of_nights: enquiry_table.no_of_nights,
        clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
        agent_id: transaction.user_id,
        agentName: sql`${user.firstName} || ' ' || ${user.lastName}`,
        client_id: transaction.client_id,
        holiday_type: package_type.name,
        budget: enquiry_table.budget,
        type: sql`'enquiry'`,
        is_future_deal: enquiry_table.is_future_deal,
        future_deal_date: enquiry_table.future_deal_date,
      })
      .from(enquiry_table)
      .innerJoin(transaction, eq(transaction.id, enquiry_table.transaction_id))
      .innerJoin(clientTable, eq(transaction.client_id, clientTable.id))
      .leftJoin(package_type, eq(package_type.id, enquiry_table.holiday_type_id))
      .leftJoin(user, eq(user.id, transaction.user_id));

    // Add filters for future enquiries
    const enquiryFilters = [eq(transaction.status, 'on_enquiry'), eq(enquiry_table.is_future_deal, true), eq(enquiry_table.is_active, true)];

    if (agent_id) {
      enquiryFilters.push(eq(transaction.user_id, agent_id));
    }

    // if (search) {
    //   enquiryFilters.push(or(ilike(sql`COALESCE(${enquiry_table.title}, '')`!, `%${search}%`)));
    // }

    const futureEnquiries = await futureEnquiriesQuery
      .where(and(...enquiryFilters))
      .orderBy(desc(enquiry_table.date_created))
      .limit(limit)
      .offset(offset);

    // Combine and sort results
    const combinedResults = [...futureQuotes, ...futureEnquiries].sort((a, b) => {
      const dateA = a.travel_date ? new Date(a.travel_date).getTime() : 0;
      const dateB = b.travel_date ? new Date(b.travel_date).getTime() : 0;
      return dateA - dateB;
    });

    // Calculate total profit
    const totalProfit = combinedResults.reduce((sum, item) => {
      if (item.type === 'quote') {
        return sum + parseFloat((item as any).overall_commission || 0);
      } else if (item.type === 'enquiry') {
        return sum + parseFloat((item as any).budget || 0);
      }
      return sum;
    }, 0);

    // Get total count for pagination
    const totalQuotesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(quote)
      .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
      .innerJoin(clientTable, eq(transaction.client_id, clientTable.id))
      .where(and(...quoteFilters));

    const totalEnquiriesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(enquiry_table)
      .innerJoin(transaction, eq(transaction.id, enquiry_table.transaction_id))
      .innerJoin(clientTable, eq(transaction.client_id, clientTable.id))
      .where(and(...enquiryFilters));

    const totalCount = (totalQuotesCount[0]?.count || 0) + (totalEnquiriesCount[0]?.count || 0);
    const hasMore = totalCount > offset + combinedResults.length;

    return {
      data: combinedResults.map((item) => {
        if (item.type === 'quote') {
          return {
            id: item.id,
            no_of_nights: item.no_of_nights?.toString() || '0',
            travel_date: item.travel_date ? new Date(item.travel_date).toISOString() : new Date().toISOString(),
            status: item.status as 'on_quote' | 'on_enquiry' | 'on_booking',
            clientName: item.clientName as string,
            agent_id: item.agent_id as string,
            agentName: item.agentName as string,
            client_id: item.client_id as string,
            quote_type: (item as any).quote_type || 'primary',
            title: item.title,
            holiday_type: (item as any).holiday_type || '',
            transaction_id: item.transaction_id,
            lodge_destination: (item as any).lodge_destination || null,
            cottage_destination: (item as any).cottage_destination || null,
            cruise_destination: (item as any).cruise_destination || null,
            holiday_destination: (item as any).holiday_destination || null,
            overall_commission: String((item as any).overall_commission || 0),
            overall_cost: String((item as any).overall_cost || 0),
            quote_status: (item as any).quote_status || '',
            is_future_deal: (item as any).is_future_deal || false,
            future_deal_date: (item as any).future_deal_date || null,
          };
        } else {
          return {
            id: item.id,
            clientName: item.clientName as string,
            no_of_nights: item.no_of_nights?.toString() || '0',
            agent_id: item.agent_id as string,
            client_id: item.client_id as string,
            travel_date: item.travel_date ? new Date(item.travel_date).toISOString() : new Date().toISOString(),
            transactionId: item.transaction_id,
            enquiry_status: 'NEW_LEAD',
            agentName: item.agentName as string,
            is_expired: false,
            holiday_type: (item as any).holiday_type || '',
            status: item.status as string,
            budget: String((item as any).budget || 0),
            enquiry_cruise_destination: null,
            destination: [],
            title: item.title,
            is_future_deal: (item as any).is_future_deal || false,
            future_deal_date: (item as any).future_deal_date || null,
          };
        }
      }),
      profit: totalProfit,
      hasMore,
      totalCount,
    };
  },
  fetchFutureDeal: async (client_id) => {
    const quotes = await db
      .select({
        id: quote.id,
        quote_type: quote.quote_type,
        title: quote.title,
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
      .where(and(eq(transaction.status, 'on_quote'), eq(transaction.client_id, client_id), eq(quote.is_future_deal, true)))
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

    const enquiries = await db
      .select({
        id: enquiry_table.id,
        holiday_type: package_type.name,
        status: transaction.status,
        transaction_id: transaction.id,
        title: enquiry_table.title,
        email: enquiry_table.email,
        agent_id: transaction.user_id,
        agentName: sql`${user.firstName} || ' ' || ${user.lastName}`,
        clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
        clientId: transaction.client_id,
        no_of_nights: enquiry_table.no_of_nights,
        budget: enquiry_table.budget,
        travel_date: enquiry_table.travel_date,
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
      .where(and(eq(transaction.client_id, client_id), eq(transaction.status, 'on_enquiry'), eq(enquiry_table.is_future_deal, true)));

    const groupedResults = enquiries.reduce((acc, curr) => {
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

    const quote_payload = quotes.map((data) => ({
      title: data.title || data.cottage_destination || data.cruise_destination || data.holiday_destination || data.lodge_destination,
      id: data.id,
      type: 'Quote',
    }));

    const enquiry_payload = structuredResults.map((data: any) => ({
      title:
        (data.title as string) ||
        data.enquiry_cruise_destination?.map((data: any) => data.name).join(', ') ||
        data.destination?.map((data: any) => data.name).join(', '),
      id: data.id as string,
      type: 'Enquiry',
    }));
    return [...quote_payload, ...enquiry_payload];
  },
  fetchAllDeals: async (client_id) => {
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
    const groupByFields = [
      quote.id,
      package_type.name,
      clientTable.firstName,
      clientTable.surename,
      transaction.client_id,
      user.firstName,
      user.lastName,
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
      quote.lodge_id,
      lodges.lodge_name,
      lodges.lodge_code,
      park.name,
      park.location,
      park.code,
      quote.cottage_id,
      cottages.cottage_name,
      cottages.cottage_code,
      cottages.location,

      quote_cruise.id,
      cruise_operator.name,
      quote_cruise.cruise_line,
      quote_cruise.ship,
      quote_cruise.cruise_date,
      quote_cruise.cabin_type,
      quote_cruise.cruise_name,
      quote_cruise.pre_cruise_stay,
      quote_cruise.post_cruise_stay,
    ];

    const selected_fields: Record<string, any> = {
      id: quote.id,
      holiday_type: package_type.name,
      clientName: sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
      clientId: transaction.client_id,
      agentId: transaction.user_id,
      title: quote.title,
      agentName: sql`${user.firstName} || ' ' || ${user.lastName}`,
      status: transaction.status,
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
      lodge_id: quote.lodge_id,
      lodge_name: lodges.lodge_name,
      lodge_code: lodges.lodge_code,
      park_name: park.name,
      park_location: park.location,
      park_code: park.code,
      cottage_id: quote.cottage_id,
      cottage_name: cottages.cottage_name,
      cottage_code: cottages.cottage_code,
      cottage_location: cottages.location,
      quote_cruise_id: quote_cruise.id,
      cruise_operator: cruise_operator.name,
      cruise_line: quote_cruise.cruise_line,
      cruise_ship: quote_cruise.ship,
      cruise_date: quote_cruise.cruise_date,
      cabin_type: quote_cruise.cabin_type,
      cruise_name: quote_cruise.cruise_name,
      pre_cruise_stay: quote_cruise.pre_cruise_stay,
      post_cruise_stay: quote_cruise.post_cruise_stay,
      voyages: sql`
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
        `.as('voyages'),

      cruise_extra: sql`
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
      `.as('cruise_extra'),
    };
    let query = db
      .select({
        ...selected_fields,

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
      })
      .from(quote)
      .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
      .innerJoin(clientTable, eq(transaction.client_id, clientTable.id))
      .innerJoin(user, eq(transaction.user_id, user.id))
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
      .leftJoin(cottages, eq(quote.cottage_id, cottages.id))
      .leftJoin(lodges, eq(quote.lodge_id, lodges.id))
      .leftJoin(park, eq(lodges.park_id, park.id))
      .leftJoin(quote_cruise, eq(quote_cruise.quote_id, quote.id))
      .leftJoin(quote_cruise_item_extra, eq(quote_cruise.id, quote_cruise_item_extra.quote_cruise_id))
      .leftJoin(cruise_extra_item, eq(quote_cruise_item_extra.cruise_extra_id, cruise_extra_item.id))
      .leftJoin(quote_cruise_itinerary, eq(quote_cruise.id, quote_cruise_itinerary.quote_cruise_id))
      .leftJoin(cruise_operator, eq(quote_cruise.tour_operator_id, cruise_operator.id))
      .where(and(eq(transaction.client_id, client_id), eq(transaction.status, 'on_quote')))
      .groupBy(...groupByFields);

    const data: unknown[] = await query;

    const parsedQueryResult = z.array(allDealsQueryResult).parse(data);
    const payload = parsedQueryResult.map((data) => ({
      ...data,
      cruise_date: data?.cruise_date ? new Date(data.cruise_date) : null,
      post_cruise_stay: data?.post_cruise_stay ? data.post_cruise_stay : null,
      pre_cruise_stay: data?.pre_cruise_stay ? data.pre_cruise_stay : null,
      future_deal_date: data?.future_deal_date ? new Date(data.future_deal_date) : null,
      travel_date: data?.travel_date ? new Date(data.travel_date) : null,
      sales_price: parseFloat(data?.sales_price ?? 0),
      package_commission: parseFloat(data?.package_commission ?? 0),
      discount: parseFloat(data?.discount ?? 0),
      service_charge: parseFloat(data?.service_charge ?? 0),
      num_of_nights: data.num_of_nights ? data.num_of_nights : 0,
      overall_commission: data?.overall_commission ? data.overall_commission : 0,
      overall_cost: data?.overall_cost ? data.overall_cost : 0,

      cruise_extra: Array.from(new Set((data?.cruise_extra ?? []).filter((c) => c?.id).map((c) => c.name))),

      voyages: Array.from(new Map((data?.voyages ?? []).filter((v) => v?.id).map((v) => [v.id, { ...v, id: v.id }])).values()),

      passengers: Array.from(new Map((data?.passengers ?? []).filter((p) => p?.id).map((p) => [p.id, { ...p, age: p.age }])).values()),

      hotels: Array.from(
        new Map(
          (data?.hotels ?? [])
            .filter((h) => h?.id)
            .map((h) => [
              h.id,
              {
                ...h,

                cost: parseFloat(h.cost.toString()),
                commission: parseFloat(h.commission.toString()),
              },
            ])
        ).values()
      ),

      transfers: Array.from(
        new Map(
          (data?.transfers ?? [])
            .filter((t) => t?.id)
            .map((t) => [
              t.id,
              {
                ...t,
                pick_up_time: new Date(t.pick_up_time).toISOString(),
                drop_off_time: new Date(t.drop_off_time).toISOString(),
                cost: parseFloat(t.cost.toString()),
                commission: parseFloat(t.commission.toString()),
              },
            ])
        ).values()
      ),

      car_hire: Array.from(
        new Map(
          (data?.car_hire ?? [])
            .filter((c) => c?.id)
            .map((c) => [
              c.id,
              {
                ...c,
                no_of_days: c.no_of_days.toString(),
                pick_up_time: new Date(c.pick_up_time),
                drop_off_time: new Date(c.drop_off_time),
                driver_age: c.driver_age,
                cost: parseFloat(c.cost.toString()),
                commission: parseFloat(c.commission.toString()),
              },
            ])
        ).values()
      ),

      attraction_tickets: Array.from(
        new Map(
          (data?.attraction_tickets ?? [])
            .filter((a) => a?.id)
            .map((a) => [
              a.id,
              {
                ...a,
                number_of_tickets: a.number_of_tickets,
                date_of_visit: new Date(a.date_of_visit),
                cost: parseFloat(a.cost.toString()),
                commission: parseFloat(a.commission.toString()),
              },
            ])
        ).values()
      ),

      lounge_pass: Array.from(
        new Map(
          (data?.lounge_pass ?? [])
            .filter((l) => l?.id)
            .map((l) => [
              l.id,
              {
                ...l,
                date_of_usage: new Date(l.date_of_usage),
                cost: parseFloat(l.cost.toString()),
                commission: parseFloat(l.commission.toString()),
              },
            ])
        ).values()
      ),

      airport_parking: Array.from(
        new Map(
          (data?.airport_parking ?? [])
            .filter((a) => a?.id)
            .map((a) => [
              a.id,
              {
                ...a,
                parking_date: new Date(a.parking_date),
                cost: parseFloat(a.cost.toString()),
                commission: parseFloat(a.commission.toString()),
              },
            ])
        ).values()
      ),

      flights: Array.from(
        new Map(
          (data?.flights ?? [])
            .filter((f) => f?.id)
            .map((f) => [
              f.id,
              {
                ...f,
                cost: parseFloat(f.cost.toString()),
                commission: parseFloat(f.commission.toString()),
                departure_date_time: new Date(f.departure_date_time),
                arrival_date_time: new Date(f.arrival_date_time),
              },
            ])
        ).values()
      ),
    }));

    // const payload_to_return = payload.map((data) => processQuoteData(unionAllType, data));
    const groupedQuotes = Object.values(
      payload
        .map((data) => dataValidator(unionAllType, data))
        .reduce((acc, quote) => {
          const txId = quote.transaction_id;
          if (!acc[txId]) acc[txId] = [];
          acc[txId].push({ ...quote, transaction_id: quote.transaction_id!, quote_type: quote.quote_type! });
          return acc;
        }, {} as Record<string, z.infer<typeof unionAllType>[]>)
    );
    const result: z.infer<typeof unionAllTypeWithChildren>[] = [];

    groupedQuotes.forEach((quotes) => {
      const parent = quotes.find((q) => q?.quote_type === 'primary');

      if (!parent) return;

      const children = quotes.filter((q) => q !== parent);

      result.push({
        ...parent,
        child_quotes: children,
      });
    });
    return result;
  },
 
  updateLodge: async (lodge_id, data) => {
    await db.update(lodges).set(data).where(eq(lodges.id, lodge_id));
  },
  deleteLodge: async (lodge_id) => {
    await db.delete(lodges).where(eq(lodges.id, lodge_id)).returning();
  },
  fetchDashboardSummary: async (agent_id) => {
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());

    const enquiryBudgetQuery = db
      .select({
        budget: enquiry_table.budget,
      })
      .from(enquiry_table)
      .leftJoin(transaction, eq(transaction.id, enquiry_table.transaction_id))
      .where(
        and(
          eq(transaction.status, 'on_enquiry'),
          eq(enquiry_table.is_future_deal, false),
          eq(enquiry_table.is_active, true),
          gt(enquiry_table.date_expiry, new Date()),
          eq(enquiry_table.status, 'NEW_LEAD'),
          gte(enquiry_table.date_created, currentMonthStart),
          lte(enquiry_table.date_created, currentMonthEnd),
          agent_id ? eq(transaction.user_id, agent_id) : undefined
        )
      );

    const enquiryBudgets = await enquiryBudgetQuery;
    const percentage_budget = enquiryBudgets.reduce((acc, item) => acc + parseFloat(item.budget as string), 0) * 0.1;

    // Quote profits calculation
    const quoteProfitQuery = db
      .select({
        quote_status: quote.quote_status,
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
      })
      .from(quote)
      .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
      .where(
        and(
          eq(transaction.status, 'on_quote'),
          eq(quote.is_active, true),
          eq(quote.is_future_deal, false),
          gte(quote.date_created, currentMonthStart),
          lte(quote.date_created, currentMonthEnd),
          gt(quote.date_expiry, new Date()),
          ne(quote.quote_status, 'LOST'),

          agent_id ? eq(transaction.user_id, agent_id) : undefined
        )
      );

    const quoteProfits = await quoteProfitQuery;

    const profit_quote_in_progress = quoteProfits
      .filter((item) => item.quote_status === 'QUOTE_IN_PROGRESS')
      .reduce((acc, item) => acc + parseFloat(item.overall_commission as string), 0);

    const profit_awaiting_decision = quoteProfits
      .filter((item) => item.quote_status === 'AWAITING_DECISION')
      .reduce((acc, item) => acc + parseFloat(item.overall_commission as string), 0);

    const profit_lost = quoteProfits
      .filter((item) => item.quote_status === 'LOST')
      .reduce((acc, item) => acc + parseFloat(item.overall_commission as string), 0);

    // Booking profits calculation
    const bookingProfitQuery = db
      .select({
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
      .from(booking)
      .innerJoin(transaction, eq(booking.transaction_id, transaction.id))
      .where(
        and(
          eq(transaction.status, 'on_booking'),
          eq(booking.is_active, true),
          gte(booking.date_created, currentMonthStart),
          lte(booking.date_created, currentMonthEnd),

          agent_id ? eq(transaction.user_id, agent_id) : undefined
        )
      );

    const bookingProfits = await bookingProfitQuery;
    const profit_booking = bookingProfits.reduce((acc, item) => acc + parseFloat(item.overall_commission as string), 0);

    return {
      percentage_budget,
      profit_quote_in_progress,
      profit_awaiting_decision,
      profit_booking,
      profit_lost,
    };
  },
  fetchExpiredQuotes: async (agent_id) => {
    const quoteQuery = db
      .select({
        id: quote.id,
        title: quote.title,
        transaction_id: transaction.id,
        status: transaction.status,
        travel_date: quote.travel_date,
        no_of_nights: quote.num_of_nights,
        clientName: sql<string>`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
        agent_id: transaction.user_id,
        agentName: sql<string>`${user.firstName} || ' ' || ${user.lastName}`,
        client_id: transaction.client_id,
        lodge_destination: park.city,
        cottage_destination: cottages.location,
        cruise_destination: quote_cruise.cruise_name,
        holiday_destination: destination.name,
        quote_status: quote.quote_status,
        holiday_type: package_type.name,
        quote_type: quote.quote_type,
        overall_commission: sql<string>`
    COALESCE((SELECT SUM(commission) FROM quote_flights WHERE quote_flights.quote_id = quote_table.id), 0)
    + COALESCE((SELECT SUM(commission) FROM quote_airport_parking WHERE quote_airport_parking.quote_id = quote_table.id), 0)
    + COALESCE((SELECT SUM(commission) FROM quote_lounge_pass WHERE quote_lounge_pass.quote_id = quote_table.id), 0)
    + COALESCE((SELECT SUM(commission) FROM quote_attraction_ticket WHERE quote_attraction_ticket.quote_id = quote_table.id), 0)
    + COALESCE((SELECT SUM(commission) FROM quote_car_hire WHERE quote_car_hire.quote_id = quote_table.id), 0)
    + COALESCE((SELECT SUM(commission) FROM quote_transfers WHERE quote_transfers.quote_id = quote_table.id), 0)
    + COALESCE((SELECT SUM(commission) FROM quote_accomodation WHERE quote_accomodation.quote_id = quote_table.id), 0)
    + quote_table.package_commission
  `.as('overall_commission'),
        overall_cost: sql<string>`
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
      .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
      .leftJoin(package_type, eq(quote.holiday_type_id, package_type.id))
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
        transaction.id,
        package_type.name,
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

    if (agent_id) {
      quoteQuery.where(
        and(
          eq(transaction.status, 'on_quote'),
          eq(quote.is_active, true),
          eq(transaction.user_id, agent_id),
          eq(quote.is_future_deal, false),
          lt(quote.date_expiry, new Date())
        )
      );
    } else {
      quoteQuery.where(
        and(eq(transaction.status, 'on_quote'), eq(quote.is_future_deal, false), eq(quote.is_active, true), lt(quote.date_expiry, new Date()))
      );
    }

    const quoteData = await quoteQuery;
    const data = quoteData.reduce<Record<string, { primary: z.infer<typeof quotePipelineSchema> | null; children: z.infer<typeof quoteChild>[] }>>(
      (acc, item) => {
        const { id, transaction_id, quote_type, title, travel_date, overall_cost } = item;

        if (!acc[transaction_id]) {
          acc[transaction_id] = { primary: null, children: [] };
        }

        if (quote_type === 'primary') {
          acc[transaction_id].primary = {
            ...item,
            status: item.status as 'on_quote' | 'on_enquiry' | 'on_booking',
            quote_status: item.quote_status as string,
            no_of_nights: item.no_of_nights.toString(),
            travel_date: new Date(item.travel_date!).toISOString(),
            client_id: item.client_id,
            agent_id: item.agent_id,
            holiday_type: item.holiday_type as string,
          };
        } else {
          acc[transaction_id].children.push({
            id,
            title,
            travel_date: travel_date ? new Date(travel_date).toISOString() : null,
            sales_price: overall_cost ? parseFloat(parseFloat(overall_cost).toFixed(2)) : 0,
          });
        }
        return acc;
      },
      {}
    );

    const result = Object.values(data)
      .filter((group) => group.primary !== null)
      .map((group) => {
        const primary = group.primary!;
        return group.children.length > 0 ? { ...primary, children: group.children } : primary;
      });

    const quoteToValidate = result.map((data) => ({ ...data, travel_date: new Date(data.travel_date).toISOString() }));
    const validateQuote = z.array(quotePipelineSchema).safeParse(quoteToValidate);

    if (!validateQuote.success) {
      console.log(validateQuote.error);
      throw new AppError('Something went wrong fetching expired quotes', true, 500);
    }

    return {
      data: validateQuote.data,
    };
  },
  fetchQuotesByStatus: async (status, agent_id, page, limit, search) => {
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());
    const quoteQuery = db
      .select({
        id: quote.id,
        title: quote.title,
        transaction_id: transaction.id,
        status: transaction.status,
        travel_date: quote.travel_date,
        no_of_nights: quote.num_of_nights,
        clientName: sql<string>`${clientTable.firstName} || ' ' || ${clientTable.surename}`,
        agent_id: transaction.user_id,
        agentName: sql<string>`${user.firstName} || ' ' || ${user.lastName}`,
        client_id: transaction.client_id,
        lodge_destination: park.city,
        cottage_destination: cottages.location,
        cruise_destination: quote_cruise.cruise_name,
        holiday_destination: destination.name,
        quote_status: quote.quote_status,
        holiday_type: package_type.name,
        is_expired: sql<boolean>`CASE WHEN ${quote.date_expiry} < ${new Date()} THEN true ELSE false END`,
        quote_type: quote.quote_type,
        overall_commission: sql<string>`
        COALESCE((SELECT SUM(commission) FROM quote_flights WHERE quote_flights.quote_id = quote_table.id), 0)
        + COALESCE((SELECT SUM(commission) FROM quote_airport_parking WHERE quote_airport_parking.quote_id = quote_table.id), 0)
        + COALESCE((SELECT SUM(commission) FROM quote_lounge_pass WHERE quote_lounge_pass.quote_id = quote_table.id), 0)
        + COALESCE((SELECT SUM(commission) FROM quote_attraction_ticket WHERE quote_attraction_ticket.quote_id = quote_table.id), 0)
        + COALESCE((SELECT SUM(commission) FROM quote_car_hire WHERE quote_car_hire.quote_id = quote_table.id), 0)
        + COALESCE((SELECT SUM(commission) FROM quote_transfers WHERE quote_transfers.quote_id = quote_table.id), 0)
        + COALESCE((SELECT SUM(commission) FROM quote_accomodation WHERE quote_accomodation.quote_id = quote_table.id), 0)
        + quote_table.package_commission
      `.as('overall_commission'),
        overall_cost: sql<string>`
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
      .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
      .leftJoin(package_type, eq(quote.holiday_type_id, package_type.id))
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
        transaction.id,
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
      .orderBy(asc(sql`CASE WHEN ${quote.date_expiry} < ${new Date()} THEN true ELSE false END`), desc(quote.date_created));

    if (search) {
      quoteQuery.where(
        and(
          or(
            and(gt(quote.date_created, currentMonthStart), lt(quote.date_created, currentMonthEnd)),
            or(gte(quote.date_expiry, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), gte(quote.date_expiry, new Date()))
          ),
          eq(transaction.status, 'on_quote'),
          eq(quote.is_active, true),
          agent_id ? eq(transaction.user_id, agent_id) : undefined,
          eq(quote.is_future_deal, false),
          status === 'EXPIRED'
            ? lt(quote.date_expiry, new Date())
            : eq(
              quote.quote_status,
              status as 'EXPIRED' | 'NEW_LEAD' | 'QUOTE_IN_PROGRESS' | 'QUOTE_READY' | 'AWAITING_DECISION' | 'REQUOTE' | 'WON' | 'LOST' | 'INACTIVE'
            ),
          or(ilike(quote.title, `%${search}%`), ilike(sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`, `%${search}%`))
        )
      );
    } else if (agent_id) {
      quoteQuery.where(
        and(
          or(
            and(gt(quote.date_created, currentMonthStart), lt(quote.date_created, currentMonthEnd)),
            or(gte(quote.date_expiry, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), gte(quote.date_expiry, new Date()))
          ),
          eq(transaction.status, 'on_quote'),
          eq(quote.is_active, true),
          eq(transaction.user_id, agent_id),
          eq(quote.is_future_deal, false),
          status === 'EXPIRED'
            ? lt(quote.date_expiry, new Date())
            : eq(
              quote.quote_status,
              status as 'EXPIRED' | 'NEW_LEAD' | 'QUOTE_IN_PROGRESS' | 'QUOTE_READY' | 'AWAITING_DECISION' | 'REQUOTE' | 'WON' | 'LOST' | 'INACTIVE'
            )
        )
      );
    } else {
      quoteQuery.where(
        and(
          or(
            and(gt(quote.date_created, currentMonthStart), lt(quote.date_created, currentMonthEnd)),
            or(gte(quote.date_expiry, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), gte(quote.date_expiry, new Date()))
          ),
          eq(transaction.status, 'on_quote'),
          eq(quote.is_future_deal, false),
          eq(quote.is_active, true),
          status === 'EXPIRED'
            ? lt(quote.date_expiry, new Date())
            : eq(
              quote.quote_status,
              status as 'EXPIRED' | 'NEW_LEAD' | 'QUOTE_IN_PROGRESS' | 'QUOTE_READY' | 'AWAITING_DECISION' | 'REQUOTE' | 'WON' | 'LOST' | 'INACTIVE'
            )
        )
      );
    }

    // Get total count for pagination
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(quote)
      .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
      .innerJoin(clientTable, eq(transaction.client_id, clientTable.id));

    // Apply same filters to count query
    if (search) {
      totalCountQuery.where(
        and(
          or(
            and(gt(quote.date_created, currentMonthStart), lt(quote.date_created, currentMonthEnd)),
            or(gte(quote.date_expiry, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), gte(quote.date_expiry, new Date()))
          ),
          eq(transaction.status, 'on_quote'),
          eq(quote.is_active, true),
          agent_id ? eq(transaction.user_id, agent_id) : undefined,
          eq(quote.is_future_deal, false),
          status === 'EXPIRED'
            ? lt(quote.date_expiry, new Date())
            : eq(
              quote.quote_status,
              status as 'EXPIRED' | 'NEW_LEAD' | 'QUOTE_IN_PROGRESS' | 'QUOTE_READY' | 'AWAITING_DECISION' | 'REQUOTE' | 'WON' | 'LOST' | 'INACTIVE'
            ),
          or(ilike(quote.title, `%${search}%`), ilike(sql`${clientTable.firstName} || ' ' || ${clientTable.surename}`, `%${search}%`))
        )
      );
    } else if (agent_id) {
      totalCountQuery.where(
        and(
          or(
            and(gt(quote.date_created, currentMonthStart), lt(quote.date_created, currentMonthEnd)),
            or(gte(quote.date_expiry, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), gte(quote.date_expiry, new Date()))
          ),
          eq(transaction.status, 'on_quote'),
          eq(quote.is_active, true),
          eq(transaction.user_id, agent_id),
          eq(quote.is_future_deal, false),
          status === 'EXPIRED'
            ? lt(quote.date_expiry, new Date())
            : eq(
              quote.quote_status,
              status as 'EXPIRED' | 'NEW_LEAD' | 'QUOTE_IN_PROGRESS' | 'QUOTE_READY' | 'AWAITING_DECISION' | 'REQUOTE' | 'WON' | 'LOST' | 'INACTIVE'
            )
        )
      );
    } else {
      totalCountQuery.where(
        and(
          or(
            and(gt(quote.date_created, currentMonthStart), lt(quote.date_created, currentMonthEnd)),
            or(gte(quote.date_expiry, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), gte(quote.date_expiry, new Date()))
          ),
          eq(transaction.status, 'on_quote'),
          eq(quote.is_future_deal, false),
          eq(quote.is_active, true),
          status === 'EXPIRED'
            ? lt(quote.date_expiry, new Date())
            : eq(
              quote.quote_status,
              status as 'EXPIRED' | 'NEW_LEAD' | 'QUOTE_IN_PROGRESS' | 'QUOTE_READY' | 'AWAITING_DECISION' | 'REQUOTE' | 'WON' | 'LOST' | 'INACTIVE'
            )
        )
      );
    }

    const [{ count: totalCount }] = await totalCountQuery;
    // Apply pagination
    const offset = (page! - 1) * limit!;
    quoteQuery.limit(limit!).offset(offset);

    const quoteData = await quoteQuery;
    const data = quoteData.reduce<Record<string, { primary: z.infer<typeof quotePipelineSchema> | null; children: z.infer<typeof quoteChild>[] }>>(
      (acc, item) => {
        const { id, transaction_id, quote_type, title, travel_date, overall_cost } = item;

        if (!acc[transaction_id]) {
          acc[transaction_id] = { primary: null, children: [] };
        }

        if (quote_type === 'primary') {
          acc[transaction_id].primary = {
            ...item,
            status: item.status as 'on_quote' | 'on_enquiry' | 'on_booking',
            quote_status: item.quote_status as string,
            no_of_nights: item.no_of_nights.toString(),
            travel_date: new Date(item.travel_date!).toISOString(),
            client_id: item.client_id,
            agent_id: item.agent_id,
            holiday_type: item.holiday_type as string,
          };
        } else {
          acc[transaction_id].children.push({
            id,
            title,
            travel_date: travel_date ? new Date(travel_date).toISOString() : null,
            sales_price: overall_cost ? parseFloat(parseFloat(overall_cost).toFixed(2)) : 0,
          });
        }
        return acc;
      },
      {}
    );
    const result = Object.values(data)
      .filter((group) => group.primary !== null)
      .map((group) => {
        const primary = group.primary!;
        return group.children.length > 0 ? { ...primary, children: group.children } : primary;
      });

    const quoteToValidate = result.map((data) => ({ ...data, travel_date: new Date(data.travel_date).toISOString() }));
    const validateQuote = z.array(quotePipelineSchema).safeParse(quoteToValidate);

    if (!validateQuote.success) {
      console.log(validateQuote.error);
      throw new AppError('Something went wrong fetching quotes by status', true, 500);
    }

    // // Calculate profit by looping through validated data using overall_commission
    // const profit = validateQuote.data.reduce((acc, item) => {
    //   return acc + (parseFloat(item.overall_commission as string) || 0);
    // }, 0);

    const profit = await db
      .select({
        overall_commission: sum(sql`
        COALESCE((SELECT SUM(commission) FROM quote_flights WHERE quote_flights.quote_id = quote_table.id), 0)
        + COALESCE((SELECT SUM(commission) FROM quote_airport_parking WHERE quote_airport_parking.quote_id = quote_table.id), 0)
        + COALESCE((SELECT SUM(commission) FROM quote_lounge_pass WHERE quote_lounge_pass.quote_id = quote_table.id), 0)
        + COALESCE((SELECT SUM(commission) FROM quote_attraction_ticket WHERE quote_attraction_ticket.quote_id = quote_table.id), 0)
        + COALESCE((SELECT SUM(commission) FROM quote_car_hire WHERE quote_car_hire.quote_id = quote_table.id), 0)
        + COALESCE((SELECT SUM(commission) FROM quote_transfers WHERE quote_transfers.quote_id = quote_table.id), 0)
        + COALESCE((SELECT SUM(commission) FROM quote_accomodation WHERE quote_accomodation.quote_id = quote_table.id), 0)
        + quote_table.package_commission
      `).as('overall_commission'),
      })
      .from(quote)
      .innerJoin(transaction, eq(quote.transaction_id, transaction.id))
      .where(
        and(
          eq(quote.is_active, true),
          eq(quote.is_future_deal, false),
          eq(
            quote.quote_status,
            status as 'EXPIRED' | 'NEW_LEAD' | 'QUOTE_IN_PROGRESS' | 'QUOTE_READY' | 'AWAITING_DECISION' | 'REQUOTE' | 'WON' | 'LOST' | 'INACTIVE'
          ),
          or(
            or(gte(quote.date_expiry, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), gte(quote.date_expiry, new Date())),
            and(gt(quote.date_created, currentMonthStart), lt(quote.date_created, currentMonthEnd))
          ),
          eq(transaction.status, 'on_quote'),
          agent_id ? eq(transaction.user_id, agent_id) : undefined
        )
      );

    const hasMore = offset + limit! < totalCount;

    return {
      data: validateQuote.data,
      profit: parseFloat(profit[0]?.overall_commission || '0'),
      hasMore,
      totalCount,
    };
  },
};
