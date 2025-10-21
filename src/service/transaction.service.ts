import { ClientRepo } from '../repository/client.repo';
import { NotificationRepo } from '../repository/notification.repo';
import { TransactionRepo } from '../repository/transaction.repo';
import { UserRepo } from '../repository/user.repo';
import { NotificationProvider } from '../provider/notification.provider';
import {
  lodgeMutateSchema,
  headlinesMutationSchema,
  tour_operator_mutate_schema,
  accomodation_mutate_schema,
  cruise_itinerary_mutate_schema,
  cruise_voyage_mutate_schema,
  cruise_line_mutate_schema,
  cruise_ship_mutate_schema,
  cruise_destination_mutate_schema,
  port_mutate_schema
} from '../types/modules/data-management';
import { airportMutationSchema } from '../types/modules/airports/mutation';
import { countryMutateSchema } from '../types/modules/country/mutation';
import { destinationMutateSchema, quote_mutate_schema } from '../types/modules/transaction/mutation';
import { resortMutateSchema } from '../types/modules/transaction/mutation';
import z, { check } from 'zod';
import { StructuredScrapeDataSchema } from '@/types/modules/transaction';
import { board_basis, room_type } from '@/schema/transactions-schema';
import { differenceInCalendarDays, formatISO, parse, startOfDay } from 'date-fns';
import Fuse from 'fuse.js';

export const transactionService = (repo: TransactionRepo, userRepo: UserRepo, clientRepo: ClientRepo, notificationRepo: NotificationRepo, notificationProvider: NotificationProvider) => {
  return {
    fetchRoomTypes: async () => {
      return await repo.fetchRoomTypes();
    },
    fetchExpiredQuotes: async (agent_id?: string) => {
      return await repo.fetchExpiredQuotes(agent_id);
    },
    fetchQuotesByStatus: async (status: string, agent_id?: string, page?: number, limit?: number, search?: string) => {
      return await repo.fetchQuotesByStatus(status, agent_id, page, limit, search);
    },

    updateNote: async (content: string, note_id: string) => {
      return await repo.updateNote(content, note_id);
    },
    insertNote: async (content: string, transaction_id: string, agent_id: string, parent_id?: string) => {
      return await repo.insertNote(content, transaction_id, agent_id, parent_id);
    },
    reassignTransaction: async (agent_id: string, transactionId: string, type: string, client_id: string, current_user_id: string, ref_id: string) => {
      await repo.reassignTransaction(transactionId, agent_id);

      if (current_user_id === agent_id) return

      const [user, client] = await Promise.all([userRepo.fetchUserById(current_user_id), clientRepo.fetchClientById(client_id)]);
      const notif_type = type === 'lead' ? 'enquiry' : 'quote';

      const due_date = null;
      const clientFullName = `${client.firstName} ${client.surename}`;
      const agentFullName = `${user.firstName} ${user.lastName}`;
      const message = `${agentFullName} allocated you a new ${type === 'lead' ? 'lead' : 'quote'} {{${clientFullName}}}!`;


      await notificationRepo.insertNotification(current_user_id, message, notif_type, ref_id, client_id, due_date);
      const tokens = await notificationRepo.fetchUserTokenService(current_user_id);
      const unread_notif = await notificationRepo.countUnreadNotifications(current_user_id);
      if (tokens && tokens.length > 0) {
        await notificationProvider.notifyUser(
          message,
          tokens.filter((token) => token !== null),
          unread_notif
        );
      }

    },
    fetchDestination: async (country_ids?: string[], selectedIds?: string[], search?: string) => {
      return await repo.fetchDestination(country_ids, selectedIds, search);
    },
    fetchPort: async (search?: string, cruise_destination_id?: string[], selectedIds?: string[], page?: number, limit?: number) => {
      return await repo.fetchPort(search, cruise_destination_id, selectedIds, page, limit);
    },
    fetchAirport: async (search?: string, selectedIds?: string[]) => {
      return await repo.fetchAirport(search, selectedIds);
    },
    fetchBoardBasis: async () => {
      return await repo.fetchBoardBasis();
    },
    fetchCruiseLine: async (search?: string, page?: number, limit?: number) => {
      return await repo.fetchCruiseLine(search, page, limit);
    },
    fetchCountry: async (search?: string) => {
      return await repo.fetchCountry(search);
    },
    fetchAccomodation: async (search?: string, resort_ids?: string[], selectedIds?: string[]) => {
      return await repo.fetchAccomodation(search, resort_ids, selectedIds);
    },
    fetchResorts: async (search?: string, destinationIds?: string[], selectedIds?: string[]) => {
      return await repo.fetchResorts(search, destinationIds, selectedIds);
    },
    fetchAccomodationType: async () => {
      return await repo.fetchAccomodationType();
    },
    fetchCruiseDestination: async (search?: string, page?: number, limit?: number) => {
      return await repo.fetchCruiseDestination(search, page, limit);
    },
    fetchTourOperator: async (search?: string, selectedIds?: string[]) => {
      return await repo.fetchTourOperator(search, selectedIds);
    },
    fetchPackageType: async () => {
      return await repo.fetchPackageType();
    },
    fetchLodges: async (search?: string) => {
      return await repo.fetchLodges(search);
    },
    fetchCruiseDate: async (date: string, ship_id: string) => {
      return await repo.fetchCruiseDate(date, ship_id);
    },
    fetchCruises: async () => {
      return await repo.fetchCruises();
    },
    fetchShips: async (cruise_line_id: string, search?: string, page?: number, limit?: number) => {
      return await repo.fetchShips(cruise_line_id, search, page, limit);
    },
    fetchCruiseExtras: async () => {
      return await repo.fetchCruiseExtras();
    },
    fetchNotes: async (transaction_id: string) => {
      return await repo.fetchNotes(transaction_id);
    },
    fetchNoteById: async (id: string) => {
      return await repo.fetchNoteById(id);
    },
    deleteNote: async (note_id: string) => {
      return await repo.deleteNote(note_id);
    },
    fetchKanbanInquries: async (agent_id?: string, page?: number, limit?: number, search?: string) => {
      return await repo.fetchKanbanInquries(agent_id, page, limit, search);
    },
    fetchBookings: async (agent_id?: string) => {
      return await repo.fetchBookings(agent_id);
    },
    fetchTransactionSummaryByAgent: async (agent_id: string) => {
      return await repo.fetchTransactionSummaryByAgent(agent_id);
    },
    fetchFutureDealsKanban: async (agent_id?: string, page?: number, limit?: number, search?: string) => {
      return await repo.fetchFutureDealsKanban(agent_id, page, limit, search);
    },
    fetchFutureDeal: async (client_id: string) => {
      return await repo.fetchFutureDeal(client_id);
    },
    fetchAllDeals: async (client_id: string) => {
      return await repo.fetchAllDeals(client_id);
    },
    fetchDashboardSummary: async (agent_id?: string) => {
      return await repo.fetchDashboardSummary(agent_id);
    },
    updateLodge: async (lodge_id: string, data: z.infer<typeof lodgeMutateSchema>) => {
      return await repo.updateLodge(lodge_id, data);
    },
    deleteLodge: async (lodge_id: string) => {
      return await repo.deleteLodge(lodge_id);
    },
    insertLodge: async (data: z.infer<typeof lodgeMutateSchema>) => {
      return await repo.insertLodge(data);
    },
    updateLeadSource: async (transaction_id: string, lead_source: "SHOP" | "FACEBOOK" | "WHATSAPP" | "INSTAGRAM" | "PHONE_ENQUIRY") => {
      return await repo.updateLeadSource(transaction_id, lead_source);
    },
    insertDestination: async (data: z.infer<typeof destinationMutateSchema>) => {
      return await repo.insertDestination(data);
    },
    insertResort: async (data: z.infer<typeof resortMutateSchema>) => {
      return await repo.insertResort(data);
    },
    insertAccomodation: async (data: { resort_id: string, name: string, type_id: string }) => {
      return await repo.insertAccomodation(data);
    },
    insertCountry: async (name: string, code: string) => {
      return await repo.insertCountry(name, code)
    },
    // Headlines endpoints
    insertHeadline: async (data: z.infer<typeof headlinesMutationSchema>) => {
      return await repo.insertHeadline(data);
    },
    updateHeadline: async (id: string, data: z.infer<typeof headlinesMutationSchema>) => {
      return await repo.updateHeadline(id, data);
    },
    fetchAllHeadlines: async () => {
      return await repo.fetchAllHeadlines();
    },
    fetchHeadlineById: async (id: string) => {
      return await repo.fetchHeadlineById(id);
    },
    deleteHeadline: async (id: string) => {
      return await repo.deleteHeadline(id);
    },
    // Tour Operator endpoints
    fetchTourOperators: async (search?: string) => {
      return await repo.fetchTourOperators(search);
    },
    fetchTourOperatorById: async (id: string) => {
      return await repo.fetchTourOperatorById(id);
    },
    insertTourOperator: async (data: z.infer<typeof tour_operator_mutate_schema>) => {
      return await repo.insertTourOperator(data);
    },
    updateTourOperator: async (id: string, data: z.infer<typeof tour_operator_mutate_schema>) => {
      return await repo.updateTourOperator(id, data);
    },
    // Accommodation endpoints
    fetchAccomodationById: async (id: string) => {
      return await repo.fetchAccomodationById(id);
    },
    updateAccomodation: async (id: string, data: z.infer<typeof accomodation_mutate_schema>) => {
      return await repo.updateAccomodation(id, data);
    },
    // Cruise Itinerary endpoints
    insertCruiseItinerary: async (data: z.infer<typeof cruise_itinerary_mutate_schema>) => {
      return await repo.insertCruiseItinerary(data);
    },
    updateCruiseItinerary: async (id: string, data: z.infer<typeof cruise_itinerary_mutate_schema>) => {
      return await repo.updateCruiseItinerary(id, data);
    },
    fetchAllCruiseItineraries: async (search?: string, ship_id?: string, page?: number, limit?: number) => {
      return await repo.fetchAllCruiseItineraries(search, ship_id, page, limit);
    },
    fetchCruiseItineraryById: async (id: string) => {
      return await repo.fetchCruiseItineraryById(id);
    },
    deleteCruiseItinerary: async (id: string) => {
      return await repo.deleteCruiseItinerary(id);
    },
    // Cruise Voyage endpoints
    insertCruiseVoyage: async (data: z.infer<typeof cruise_voyage_mutate_schema>) => {
      return await repo.insertCruiseVoyage(data);
    },
    updateCruiseVoyage: async (id: string, data: z.infer<typeof cruise_voyage_mutate_schema>) => {
      return await repo.updateCruiseVoyage(id, data);
    },
    fetchAllCruiseVoyages: async (search?: string, itinerary_id?: string, page?: number, limit?: number) => {
      return await repo.fetchAllCruiseVoyages(search, itinerary_id, page, limit);
    },
    fetchCruiseVoyageById: async (id: string) => {
      return await repo.fetchCruiseVoyageById(id);
    },
    deleteCruiseVoyage: async (id: string) => {
      return await repo.deleteCruiseVoyage(id);
    },
    // Room Types endpoints
    fetchAllRoomTypes: async () => {
      return await repo.fetchAllRoomTypes();
    },
    insertRoomType: async (data: { name: string }) => {
      return await repo.insertRoomType(data);
    },
    updateRoomType: async (id: string, data: { name: string }) => {
      return await repo.updateRoomType(id, data);
    },
    deleteRoomType: async (id: string) => {
      return await repo.deleteRoomType(id);
    },
    // Airport endpoints
    fetchAllAirports: async (search?: string, page?: number, limit?: number) => {
      return await repo.fetchAllAirports(search, page, limit);
    },
    insertAirport: async (data: z.infer<typeof airportMutationSchema>) => {
      return await repo.insertAirport(data);
    },
    updateAirport: async (id: string, data: z.infer<typeof airportMutationSchema>) => {
      return await repo.updateAirport(id, data);
    },
    fetchAirportById: async (id: string) => {
      return await repo.fetchAirportById(id);
    },
    deleteAirport: async (id: string) => {
      return await repo.deleteAirport(id);
    },
    // Country endpoints
    fetchCountryById: async (id: string) => {
      return await repo.fetchCountryById(id);
    },
    updateCountry: async (id: string, data: z.infer<typeof countryMutateSchema>) => {
      return await repo.updateCountry(id, data);
    },
    deleteCountry: async (id: string) => {
      return await repo.deleteCountry(id);
    },
    // Lodge endpoints
    fetchAllLodges: async () => {
      return await repo.fetchAllLodges();
    },
    fetchLodgeById: async (id: string) => {
      return await repo.fetchLodgeById(id);
    },
    // Parks endpoints
    fetchAllParks: async () => {
      return await repo.fetchAllParks();
    },
    // Deletion Codes endpoints
    generateDeletionCodes: async (data: { numberOfCodes: number }) => {
      return await repo.generateDeletionCodes(data);
    },
    insertDeletionCode: async (data: { code: string }) => {
      return await repo.insertDeletionCode(data);
    },
    updateDeletionCode: async (id: string, data: { code: string; isUsed: boolean }) => {
      return await repo.updateDeletionCode(id, data);
    },
    deleteDeletionCode: async (id: string) => {
      return await repo.deleteDeletionCode(id);
    },
    fetchAllDeletionCodes: async () => {
      return await repo.fetchAllDeletionCodes();
    },
    fetchDeletionCodeById: async (id: string) => {
      return await repo.fetchDeletionCodeById(id);
    },
    // Cruise Line endpoints
    insertCruiseLine: async (data: z.infer<typeof cruise_line_mutate_schema>) => {
      return await repo.insertCruiseLine(data);
    },
    updateCruiseLine: async (id: string, data: z.infer<typeof cruise_line_mutate_schema>) => {
      return await repo.updateCruiseLine(id, data);
    },
    fetchAllCruiseLines: async (search?: string, page?: number, limit?: number) => {
      return await repo.fetchAllCruiseLines(search, page, limit);
    },
    fetchCruiseLineById: async (id: string) => {
      return await repo.fetchCruiseLineById(id);
    },
    deleteCruiseLine: async (id: string) => {
      return await repo.deleteCruiseLine(id);
    },
    // Cruise Ship endpoints
    insertCruiseShip: async (data: z.infer<typeof cruise_ship_mutate_schema>) => {
      return await repo.insertCruiseShip(data);
    },
    updateCruiseShip: async (id: string, data: z.infer<typeof cruise_ship_mutate_schema>) => {
      return await repo.updateCruiseShip(id, data);
    },
    fetchAllCruiseShips: async (search?: string, cruise_line_id?: string, page?: number, limit?: number) => {
      return await repo.fetchAllCruiseShips(search, cruise_line_id, page, limit);
    },
    fetchCruiseShipById: async (id: string) => {
      return await repo.fetchCruiseShipById(id);
    },
    deleteCruiseShip: async (id: string) => {
      return await repo.deleteCruiseShip(id);
    },
    // Cruise Destination endpoints
    insertCruiseDestination: async (data: z.infer<typeof cruise_destination_mutate_schema>) => {
      return await repo.insertCruiseDestination(data);
    },
    updateCruiseDestination: async (id: string, data: z.infer<typeof cruise_destination_mutate_schema>) => {
      return await repo.updateCruiseDestination(id, data);
    },
    fetchAllCruiseDestinations: async (search?: string, page?: number, limit?: number) => {
      return await repo.fetchAllCruiseDestinations(search, page, limit);
    },
    fetchCruiseDestinationById: async (id: string) => {
      return await repo.fetchCruiseDestinationById(id);
    },
    deleteCruiseDestination: async (id: string) => {
      return await repo.deleteCruiseDestination(id);
    },
    // Port endpoints
    insertPort: async (data: z.infer<typeof port_mutate_schema>) => {
      return await repo.insertPort(data);
    },
    updatePort: async (id: string, data: z.infer<typeof port_mutate_schema>) => {
      return await repo.updatePort(id, data);
    },
    fetchAllPorts: async (search?: string, cruise_destination_id?: string, page?: number, limit?: number) => {
      return await repo.fetchAllPorts(search, cruise_destination_id, page, limit);
    },
    fetchPortById: async (id: string) => {
      return await repo.fetchPortById(id);
    },
    deletePort: async (id: string) => {
      return await repo.deletePort(id);
    },
    // Destination endpoints
    updateDestination: async (id: string, data: z.infer<typeof destinationMutateSchema>) => {
      return await repo.updateDestination(id, data);
    },
    fetchDestinationById: async (id: string) => {
      return await repo.fetchDestinationById(id);
    },
    // Resort endpoints
    updateResort: async (id: string, data: z.infer<typeof resortMutateSchema>) => {
      return await repo.updateResort(id, data);
    },
    fetchResortById: async (id: string) => {
      return await repo.fetchResortById(id);
    },
    structuredScrapeData: async (data: z.infer<typeof StructuredScrapeDataSchema>, agentId: string, clientId: string, package_type_id: string) => {

      const parsed = parse(data.check_in_date_time, "dd-MM-yyyy'T'HH:mm:ssX", new Date());
      const parsedTravelDate = parse(data.travel_date, "dd-MM-yyyy", new Date());
      const initialData: z.infer<typeof quote_mutate_schema> = {
        travel_date: formatISO(parsedTravelDate),
        agent_id: agentId,
        client_id: clientId,
        holiday_type: package_type_id,
        sales_price: parseFloat(data.sales_price),
        adults: data.adults,
        children: data.children,
        infants: data.infants,
        transfer_type: data.transfer_type,
        country: "",
        destination: "",
        resort: "",
        no_of_nights: "",
        check_in_date_time: formatISO(parsed),
        is_future_deal: false,
        flights: [],
        hotels: [],
        main_board_basis_id: "",
        accomodation_id: "",
        deal_images: data.hotel_images

      }
      const board_basis = await repo.fetchBoardBasis();
      const airports = await repo.fetchAllAirports(undefined, undefined, 1000);
      const country = await repo.fetchCountry();
      const roomTypes = await repo.fetchRoomTypes();

      if (data.room_type) {
        const fuse = new Fuse(roomTypes, {
          keys: ['name'],
          threshold: 0.4,
        });
        const result = fuse.search(data.room_type);

        if (result.length > 0) {
          initialData.room_type = result[0].item.name;
        }
        else {
          const response = await repo.insertRoomType({ name: data.room_type });
          initialData.room_type = data.room_type;
        }
      }
      const normalize = (s: string) => (s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (data.accommodation) {
        const fetchAccomodation = await repo.fetchAccomodationByName(data.accommodation);
        if (data.board_basis) {

          const fetchBoardBasis = board_basis.find(bb => normalize(bb.type) === normalize(data.board_basis));
          if (fetchBoardBasis) {
            initialData.main_board_basis_id = fetchBoardBasis.id;
          }
        }
        if (fetchAccomodation && Array.isArray(fetchAccomodation)) {
          const fuse = new Fuse(fetchAccomodation, {
            keys: ['name'],
            threshold: 0.4, // lower = stricter matching
          });
          const result = fuse.search(data.accommodation);
          if (result.length > 0) {
            initialData.accomodation_id = result[0].item.id;
            initialData.country = result[0].item.resorts?.destination?.country_id ?? "";
            initialData.destination = result[0].item.resorts?.destination_id ?? "";
            initialData.resort = result[0].item.resorts_id ?? "";
          }
          else {
            let countryId: string | undefined = undefined;
            let destinationId: string | undefined = undefined;
            let resortId: string | undefined = undefined;


            const scrapeCountry = country.find(c => normalize(c.country_name) === normalize(data.country));
            if (scrapeCountry) {
              countryId = scrapeCountry.id;
            } else {
              const insertedCountry = await repo.insertCountry(data.country, "");
              countryId = insertedCountry.id;
            }

            const fetchDestination = await repo.fetchDestinationByName(data.destination);
            if (fetchDestination) {
              const fuseDest = new Fuse(fetchDestination, {
                keys: ['name'],
                threshold: 0.4,
              });
              const resultDest = fuseDest.search(data.destination);
              destinationId = resultDest[0].item.id;
            } else {
              const insertedDestination = await repo.insertDestination({ name: data.destination, country_id: countryId });
              destinationId = insertedDestination.id;
            }


            const fetchResort = await repo.fetchResortByName(data.resort);
            if (fetchResort) {
              const fuseResort = new Fuse(fetchResort, {
                keys: ['name'],
                threshold: 0.4,
              });
              const resultResort = fuseResort.search(data.resort);
              resortId = resultResort[0].item.id;
            } else {
              console.log("Resort not found, inserting new resort");
              const insertedResort = await repo.insertResort({ name: data.resort, destination_id: destinationId ?? "", country_id: countryId ?? "" });
              console.log('Inserted resort:', insertedResort.id);
              resortId = insertedResort.id;
            }


            const insertedAccomodation = await repo.insertAccomodation({ resort_id: resortId ?? "", name: data.accommodation, type_id: null });
            initialData.accomodation_id = insertedAccomodation.id;
            initialData.country = countryId ?? "";
            initialData.destination = destinationId ?? "";
            initialData.resort = resortId ?? "";
          }
        }
      }

      if (data.hotels && data.hotels.length > 1) {
        for (const hotel of data.hotels.slice(1)) {
          const fetchAccomodation = await repo.fetchAccomodationByName(hotel.accommodation);

          const parsed = parse(hotel.check_in_date_time, "dd-MM-yyyy'T'HH:mm:ssX", new Date());
          if (fetchAccomodation) {
            const fuse = new Fuse(fetchAccomodation, {
              keys: ['name'],
              threshold: 0.4,
            })
            const result = fuse.search(hotel.accommodation);
            if (result.length === 0) continue;
            const resortAccomodation = result[0].item;
            const hotelData = {
              country: resortAccomodation.resorts?.destination?.country_id ?? "",
              destination: resortAccomodation.resorts?.destination_id ?? "",
              resort: resortAccomodation.resorts_id ?? "",
              accomodation_id: resortAccomodation.id,
              no_of_nights: hotel.no_of_nights,
              check_in_date_time: formatISO(parsed),
              room_type: hotel.room_type,
              board_basis_id: board_basis.find(bb => bb.type.toLowerCase() === hotel.board_basis.toLowerCase())?.id || "",
              cost: 0,
              commission: 0,
              is_included_in_package: false,
            }
            initialData.hotels?.push(hotelData);
          }
        }
      }
      if (data.flights && data.flights.length > 0) {
        for (const flight of data.flights) {
          const parsedDeparture = parse(flight.departure_date_time, "dd-MM-yyyy'T'HH:mm:ssX", new Date());
          const parsedArrival = parse(flight.arrival_date_time, "dd-MM-yyyy'T'HH:mm:ssX", new Date());
          const flightData = {
            flight_number: flight.flight_number,
            departing_airport_id: airports.data.find(ap => ap.airport_code.toLowerCase() === flight.departing_airport.toLowerCase())?.id || "",
            arrival_airport_id: airports.data.find(ap => ap.airport_code.toLowerCase() === flight.arrival_airport.toLowerCase())?.id || "",
            departure_date_time: formatISO(parsedDeparture),
            arrival_date_time: formatISO(parsedArrival),
            flight_type: flight.flight_type === "Outbound" ? "Outbound" : "Inbound",
            cost: 0,
            commission: 0,
            is_included_in_package: false,
          }


          initialData.flights?.push(flightData);
        }
      }
      const returnFlight = initialData.flights?.find(f => f.flight_type === "Inbound");
      if (returnFlight) {
        const checkInDate = startOfDay(parsed)
        const departDate = startOfDay(new Date(returnFlight.departure_date_time))
        const numberOfDays = differenceInCalendarDays(departDate, checkInDate)
        initialData.no_of_nights = numberOfDays.toString()
      }
      return initialData;
    },

    insertDealImages: async (data: {
      owner_id: string;
      image_url: string;
      isPrimary: boolean;
      owner_type: 'package_holiday' | 'hot_tub_break' | 'cruise';
      s3_key?: string;

    }[]) => {
      await repo.insertDealImages(data);
    },
    fetchDealImagesByOwnerId: async (owner_id: string) => {
      return await repo.fetchDealImagesByOwnerId(owner_id);
    },
    setImageAsPrimary: async (new_primary_id: string, old_primary_id?: string) => {
      return await repo.setImageAsPrimary(new_primary_id, old_primary_id);
    }
  };



};
