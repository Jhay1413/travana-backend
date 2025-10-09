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
import { destinationMutateSchema } from '../types/modules/transaction/mutation';
import { resortMutateSchema } from '../types/modules/transaction/mutation';
import z from 'zod';

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
    }
  };
};
