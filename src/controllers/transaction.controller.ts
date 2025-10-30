import { transactionRepo } from '../repository/transaction.repo';
import { transactionService } from '../service/transaction.service';
import { userRepo } from '../repository/user.repo';
import { clientRepo } from '../repository/client.repo';
import { notificationRepo } from '../repository/notification.repo';
import { notificationProvider } from '../provider/notification.provider';
import { Request, Response } from 'express';

const service = transactionService(transactionRepo, userRepo, clientRepo, notificationRepo, notificationProvider);

export const transactionController = {
  fetchRoomTypes: async (req: Request, res: Response) => {
    try {
      const roomTypes = await service.fetchRoomTypes();
      res.status(200).json(roomTypes);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchExpiredQuotes: async (req: Request, res: Response) => {
    try {
      const { agent_id } = req.query;
      const expiredQuotes = await service.fetchExpiredQuotes(agent_id as string);
      res.status(200).json({ expiredQuotes });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchQuotesByStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.query as { status: string };
      const { agent_id } = req.query as { agent_id: string };
      const { page, limit } = req.query as { page: string; limit: string };
      const { search } = req.query as { search: string };

      const intPage = page ? Number(page) : undefined;
      const intLimit = limit ? Number(limit) : undefined;

      const quotes = await service.fetchQuotesByStatus(
        status ?? '',
        agent_id ?? undefined,
        intPage ?? undefined,
        intLimit ?? undefined,
        search ?? undefined
      );
      res.status(200).json(quotes);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateNote: async (req: Request, res: Response) => {
    try {
      const { note_id } = req.params;
      const { content } = req.body;
      await service.updateNote(content, note_id);
      res.status(200).json({ message: 'Note updated' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  insertNote: async (req: Request, res: Response) => {
    try {
      const { content, description,transaction_id, agent_id, parent_id } = req.body;
      await service.insertNote(content || description, transaction_id, agent_id, parent_id);
      res.status(200).json({ message: 'Note inserted' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  reassignTransaction: async (req: Request, res: Response) => {
    try {
      const { transaction_id } = req.params;
      const { agentId, type, clientId, currentUserId, refId } = req.body;
      console.log(agentId, type, clientId, currentUserId, refId);
      await service.reassignTransaction(agentId, transaction_id, type, clientId, currentUserId, refId);
      res.status(200).json({ message: 'Transaction reassigned' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchDestination: async (req: Request, res: Response) => {
    try {
      const { country_ids, selected_ids, search } = req.query as { country_ids: string; selected_ids: string; search: string };

      const selectedIds = (selected_ids as string)?.split(',').filter(id => id.trim() !== '') ?? [];
      const countryIds = (country_ids as string)?.split(',').filter(id => id.trim() !== '') ?? [];

      const destination = await service.fetchDestination(countryIds ?? [], selectedIds ?? [], search ?? undefined);
      res.status(200).json(destination);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchPort: async (req: Request, res: Response) => {
    try {
      const { search, cruise_destination_id, selected_ids, page, limit } = req.query as {
        search: string;
        cruise_destination_id: string[];
        selected_ids: string[];
        page: string;
        limit: string;
      };
      const intPage = page ? Number(page) : 1;
      const intLimit = limit ? Number(limit) : 10;
      const port = await service.fetchPort(
        search ?? undefined,
        cruise_destination_id ?? [],
        selected_ids ?? [],
        intPage ?? undefined,
        intLimit ?? undefined
      );
      res.status(200).json(port);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAirport: async (req: Request, res: Response) => {
    try {
      const { search, selected_ids } = req.query as { search: string; selected_ids: string };

      const selectedIds = (selected_ids as string)?.split(',').filter(id => id.trim() !== '') ?? [];
      const airport = await service.fetchAirport(search ?? undefined, selectedIds ?? []);
      res.status(200).json(airport);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchBoardBasis: async (req: Request, res: Response) => {
    try {
      const board_basis = await service.fetchBoardBasis();
      res.status(200).json(board_basis);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCruiseLine: async (req: Request, res: Response) => {
    try {
      const { search, page, limit } = req.query as { search: string; page: string; limit: string };
      const intPage = page ? Number(page) : 1;
      const intLimit = limit ? Number(limit) : 10;
      const cruise_line = await service.fetchCruiseLine(search ?? undefined, intPage ?? undefined, intLimit ?? undefined);
      res.status(200).json(cruise_line);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCountry: async (req: Request, res: Response) => {
    try {
      const { search } = req.query as { search: string };
      const country = await service.fetchCountry(search ?? undefined);
      res.status(200).json(country);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAccomodation: async (req: Request, res: Response) => {
    try {
      const { search, resort_ids, selected_ids } = req.query as { search: string; resort_ids: string; selected_ids: string };
      const resortIds = (resort_ids as string)?.split(',').filter(id => id.trim() !== '') ?? [];
      const selectedIds = (selected_ids as string)?.split(',').filter(id => id.trim() !== '') ?? [];
      const accomodation = await service.fetchAccomodation(search ?? undefined, resortIds ?? [], selectedIds ?? []);
      res.status(200).json(accomodation);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchResorts: async (req: Request, res: Response) => {
    try {
      const { search, destination_ids, selected_ids } = req.query as { search: string; destination_ids: string; selected_ids: string };

      console.log(search, "asdasdasdassad")
      const destinationIds = (destination_ids as string)?.split(',').filter(id => id.trim() !== '') ?? [];
      const selectedIds = (selected_ids as string)?.split(',').filter(id => id.trim() !== '') ?? [];
      const resorts = await service.fetchResorts(search ?? undefined, destinationIds ?? [], selectedIds ?? []);
      res.status(200).json(resorts);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAccomodationType: async (req: Request, res: Response) => {
    try {
      const accomodation_type = await service.fetchAccomodationType();
      res.status(200).json(accomodation_type);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCruiseDestination: async (req: Request, res: Response) => {
    try {
      const { search, page, limit } = req.query as { search: string; page: string; limit: string };
      const intPage = page ? Number(page) : 1;
      const intLimit = limit ? Number(limit) : 10;
      const cruise_destination = await service.fetchCruiseDestination(search ?? undefined, intPage ?? undefined, intLimit ?? undefined);
      res.status(200).json(cruise_destination);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchTourOperator: async (req: Request, res: Response) => {
    try {
      const { search, selected_ids } = req.query as { search: string; selected_ids: string };
      const selectedIds = (selected_ids as string)?.split(',').filter(id => id.trim() !== '') ?? [];
      const tour_operator = await service.fetchTourOperator(search ?? undefined, selectedIds ?? []);
      res.status(200).json(tour_operator);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchPackageType: async (req: Request, res: Response) => {
    try {
      const package_type = await service.fetchPackageType();
      res.status(200).json(package_type);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchLodges: async (req: Request, res: Response) => {
    try {
      const { search } = req.query as { search: string };
      const lodges = await service.fetchLodges(search ?? undefined);
      res.status(200).json(lodges);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCruiseDate: async (req: Request, res: Response) => {
    try {
      const { date, ship_id } = req.query as { date: string; ship_id: string };
      const cruise_date = await service.fetchCruiseDate(date, ship_id);
      res.status(200).json(cruise_date);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCruises: async (req: Request, res: Response) => {
    try {
      const cruises = await service.fetchCruises();
      res.status(200).json(cruises);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchShips: async (req: Request, res: Response) => {
    try {
      const { cruise_line_id, search, page, limit } = req.query as { cruise_line_id: string; search: string; page: string; limit: string };
      const intPage = page ? Number(page) : 1;
      const intLimit = limit ? Number(limit) : 10;
      const ships = await service.fetchShips(cruise_line_id ?? '', search ?? undefined, intPage ?? undefined, intLimit ?? undefined);
      res.status(200).json(ships);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCruiseExtras: async (req: Request, res: Response) => {
    try {
      const cruise_extras = await service.fetchCruiseExtras();
      res.status(200).json(cruise_extras);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchNotes: async (req: Request, res: Response) => {
    try {
      const { transaction_id } = req.params;
      const notes = await service.fetchNotes(transaction_id);
      res.status(200).json(notes);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchNoteById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const note = await service.fetchNoteById(id);
      res.status(200).json(note);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deleteNote: async (req: Request, res: Response) => {
    try {
      const { note_id } = req.params;
      await service.deleteNote(note_id);
      res.status(200).json({ message: 'Note deleted' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchKanbanInquries: async (req: Request, res: Response) => {
    try {
      const { agent_id, page, limit, search } = req.query as { agent_id: string; page: string; limit: string; search: string };

      const intPage = page ? Number(page) : undefined;
      const intLimit = limit ? Number(limit) : undefined;
      const kanban_inquries = await service.fetchKanbanInquries(agent_id ?? undefined, intPage ?? undefined, intLimit ?? undefined, search ?? undefined);
      res.status(200).json(kanban_inquries);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchBookings: async (req: Request, res: Response) => {
    try {
      const { agent_id } = req.query as { agent_id: string };
      const bookings = await service.fetchBookings(agent_id ?? undefined);
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchTransactionSummaryByAgent: async (req: Request, res: Response) => {
    try {
      const { agent_id } = req.params;
      const transaction_summary = await service.fetchTransactionSummaryByAgent(agent_id);
      res.status(200).json(transaction_summary);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchFutureDealsKanban: async (req: Request, res: Response) => {
    try {
      const { agent_id, page, limit, search } = req.query as { agent_id: string; page: string; limit: string; search: string };

      const intPage = page ? Number(page) : undefined;
      const intLimit = limit ? Number(limit) : undefined;
      const future_deals_kanban = await service.fetchFutureDealsKanban(
        agent_id ?? undefined,
        intPage ?? undefined,
        intLimit ?? undefined,
        search ?? undefined
      );
      res.status(200).json(future_deals_kanban);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchFutureDeal: async (req: Request, res: Response) => {
    try {
      const { client_id } = req.params;
      const future_deal = await service.fetchFutureDeal(client_id);
      res.status(200).json(future_deal);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAllDeals: async (req: Request, res: Response) => {
    try {
      const { client_id } = req.params;
      const all_deals = await service.fetchAllDeals(client_id);
      res.status(200).json({ all_deals });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchDashboardSummary: async (req: Request, res: Response) => {
    try {
      const { agent_id } = req.query as { agent_id: string };
      const dashboard_summary = await service.fetchDashboardSummary(agent_id ?? undefined);
      res.status(200).json(dashboard_summary);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateLodge: async (req: Request, res: Response) => {
    try {
      const { lodge_id } = req.params;
      const data = req.body;
      await service.updateLodge(lodge_id, data);
      res.status(200).json({ message: 'Lodge updated' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deleteLodge: async (req: Request, res: Response) => {
    try {
      const { lodge_id } = req.params;
      await service.deleteLodge(lodge_id);
      res.status(200).json({ message: 'Lodge deleted' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  insertLodge: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.insertLodge(data);
      res.status(200).json({ message: 'Lodge inserted' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateLeadSource: async (req: Request, res: Response) => {
    try {
      const { transaction_id } = req.params;
      const { status } = req.body;
      await service.updateLeadSource(transaction_id, status);
      res.status(200).json({ message: 'Lead source updated' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  insertDestination: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.insertDestination(data);
      res.status(200).json({ message: 'Destination inserted' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  insertResort: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.insertResort(data);
      res.status(200).json({ message: 'Resort inserted' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  insertAccomodation: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      console.log(data)
      await service.insertAccomodation(data);
      res.status(200).json({ message: 'Accomodation inserted' });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  insertCountry: async (req: Request, res: Response) => {
    try {
      const { name, code } = req.body
      await service.insertCountry(name, code);
      res.status(201).json({ message: 'Country inserted' })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Headlines endpoints
  insertHeadline: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.insertHeadline(data);
      res.status(201).json({ message: 'Headline created successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateHeadline: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updateHeadline(id, data);
      res.status(200).json({ message: 'Headline updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAllHeadlines: async (req: Request, res: Response) => {
    try {
      const headlines = await service.fetchAllHeadlines();
      res.status(200).json(headlines);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchHeadlineById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const headline = await service.fetchHeadlineById(id);
      res.status(200).json(headline);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deleteHeadline: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await service.deleteHeadline(id);
      res.status(200).json({ message: 'Headline deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Tour Operator endpoints
  fetchTourOperators: async (req: Request, res: Response) => {
    try {
      const { search } = req.query as { search: string };
      const tourOperators = await service.fetchTourOperators(search);
      res.status(200).json(tourOperators);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchTourOperatorById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tourOperator = await service.fetchTourOperatorById(id);
      res.status(200).json(tourOperator);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  insertTourOperator: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.insertTourOperator(data);
      res.status(201).json({ message: 'Tour operator created successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateTourOperator: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updateTourOperator(id, data);
      res.status(200).json({ message: 'Tour operator updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Accommodation endpoints
  fetchAccomodationById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const accommodation = await service.fetchAccomodationById(id);
      res.status(200).json(accommodation);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateAccomodation: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updateAccomodation(id, data);
      res.status(200).json({ message: 'Accommodation updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Cruise Itinerary endpoints
  insertCruiseItinerary: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.insertCruiseItinerary(data);
      res.status(201).json({ message: 'Cruise itinerary created successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateCruiseItinerary: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updateCruiseItinerary(id, data);
      res.status(200).json({ message: 'Cruise itinerary updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAllCruiseItineraries: async (req: Request, res: Response) => {
    try {
      const { search, ship_id, page, limit } = req.query as { search: string; ship_id: string; page: string; limit: string };
      const intPage = page ? Number(page) : undefined;
      const intLimit = limit ? Number(limit) : undefined;
      const itineraries = await service.fetchAllCruiseItineraries(search, ship_id, intPage, intLimit);
      res.status(200).json(itineraries);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCruiseItineraryById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const itinerary = await service.fetchCruiseItineraryById(id);
      res.status(200).json(itinerary);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deleteCruiseItinerary: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await service.deleteCruiseItinerary(id);
      res.status(200).json({ message: 'Cruise itinerary deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Cruise Voyage endpoints
  insertCruiseVoyage: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.insertCruiseVoyage(data);
      res.status(201).json({ message: 'Cruise voyage created successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateCruiseVoyage: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updateCruiseVoyage(id, data);
      res.status(200).json({ message: 'Cruise voyage updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAllCruiseVoyages: async (req: Request, res: Response) => {
    try {
      const { search, itinerary_id, page, limit } = req.query as { search: string; itinerary_id: string; page: string; limit: string };
      const intPage = page ? Number(page) : undefined;
      const intLimit = limit ? Number(limit) : undefined;
      const voyages = await service.fetchAllCruiseVoyages(search, itinerary_id, intPage, intLimit);
      res.status(200).json(voyages);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCruiseVoyageById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const voyage = await service.fetchCruiseVoyageById(id);
      res.status(200).json(voyage);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deleteCruiseVoyage: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await service.deleteCruiseVoyage(id);
      res.status(200).json({ message: 'Cruise voyage deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Room Types endpoints
  fetchAllRoomTypes: async (req: Request, res: Response) => {
    try {
      const roomTypes = await service.fetchAllRoomTypes();
      res.status(200).json(roomTypes);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  insertRoomType: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.insertRoomType(data);
      res.status(201).json({ message: 'Room type created successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateRoomType: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updateRoomType(id, data);
      res.status(200).json({ message: 'Room type updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deleteRoomType: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await service.deleteRoomType(id);
      res.status(200).json({ message: 'Room type deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Airport endpoints
  fetchAllAirports: async (req: Request, res: Response) => {
    try {
      const { search, page, limit } = req.query as { search: string; page: string; limit: string };
      const intPage = page ? Number(page) : undefined;
      const intLimit = limit ? Number(limit) : undefined;
      const airports = await service.fetchAllAirports(search, intPage, intLimit);
      res.status(200).json(airports);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  insertAirport: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.insertAirport(data);
      res.status(201).json({ message: 'Airport created successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateAirport: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updateAirport(id, data);
      res.status(200).json({ message: 'Airport updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAirportById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const airport = await service.fetchAirportById(id);
      res.status(200).json(airport);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deleteAirport: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await service.deleteAirport(id);
      res.status(200).json({ message: 'Airport deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Country endpoints
  fetchCountryById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const country = await service.fetchCountryById(id);
      res.status(200).json(country);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateCountry: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updateCountry(id, data);
      res.status(200).json({ message: 'Country updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deleteCountry: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await service.deleteCountry(id);
      res.status(200).json({ message: 'Country deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Lodge endpoints
  fetchAllLodges: async (req: Request, res: Response) => {
    try {
      const lodges = await service.fetchAllLodges();
      res.status(200).json(lodges);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchLodgeById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const lodge = await service.fetchLodgeById(id);
      res.status(200).json(lodge);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Parks endpoints
  fetchAllParks: async (req: Request, res: Response) => {
    try {
      const parks = await service.fetchAllParks();
      res.status(200).json(parks);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Deletion Codes endpoints
  generateDeletionCodes: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.generateDeletionCodes(data);
      res.status(201).json({ message: 'Deletion codes generated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  insertDeletionCode: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.insertDeletionCode(data);
      res.status(201).json({ message: 'Deletion code created successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateDeletionCode: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updateDeletionCode(id, data);
      res.status(200).json({ message: 'Deletion code updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deleteDeletionCode: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await service.deleteDeletionCode(id);
      res.status(200).json({ message: 'Deletion code deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAllDeletionCodes: async (req: Request, res: Response) => {
    try {
      const deletionCodes = await service.fetchAllDeletionCodes();
      res.status(200).json(deletionCodes);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchDeletionCodeById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deletionCode = await service.fetchDeletionCodeById(id);
      res.status(200).json(deletionCode);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Cruise Line endpoints
  insertCruiseLine: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.insertCruiseLine(data);
      res.status(201).json({ message: 'Cruise line created successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateCruiseLine: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updateCruiseLine(id, data);
      res.status(200).json({ message: 'Cruise line updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAllCruiseLines: async (req: Request, res: Response) => {
    try {
      const { search, page, limit } = req.query as { search: string; page: string; limit: string };
      const intPage = page ? Number(page) : undefined;
      const intLimit = limit ? Number(limit) : undefined;
      const cruiseLines = await service.fetchAllCruiseLines(search, intPage, intLimit);
      res.status(200).json(cruiseLines);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCruiseLineById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const cruiseLine = await service.fetchCruiseLineById(id);
      res.status(200).json(cruiseLine);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deleteCruiseLine: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await service.deleteCruiseLine(id);
      res.status(200).json({ message: 'Cruise line deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Cruise Ship endpoints
  insertCruiseShip: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.insertCruiseShip(data);
      res.status(201).json({ message: 'Cruise ship created successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateCruiseShip: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updateCruiseShip(id, data);
      res.status(200).json({ message: 'Cruise ship updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAllCruiseShips: async (req: Request, res: Response) => {
    try {
      const { search, cruise_line_id, page, limit } = req.query as { search: string; cruise_line_id: string; page: string; limit: string };
      const intPage = page ? Number(page) : undefined;
      const intLimit = limit ? Number(limit) : undefined;
      const cruiseShips = await service.fetchAllCruiseShips(search, cruise_line_id, intPage, intLimit);
      res.status(200).json(cruiseShips);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCruiseShipById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const cruiseShip = await service.fetchCruiseShipById(id);
      res.status(200).json(cruiseShip);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deleteCruiseShip: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await service.deleteCruiseShip(id);
      res.status(200).json({ message: 'Cruise ship deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Cruise Destination endpoints
  insertCruiseDestination: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.insertCruiseDestination(data);
      res.status(201).json({ message: 'Cruise destination created successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateCruiseDestination: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updateCruiseDestination(id, data);
      res.status(200).json({ message: 'Cruise destination updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAllCruiseDestinations: async (req: Request, res: Response) => {
    try {
      const { search, page, limit } = req.query as { search: string; page: string; limit: string };
      const intPage = page ? Number(page) : undefined;
      const intLimit = limit ? Number(limit) : undefined;
      const cruiseDestinations = await service.fetchAllCruiseDestinations(search, intPage, intLimit);
      res.status(200).json(cruiseDestinations);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCruiseDestinationById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const cruiseDestination = await service.fetchCruiseDestinationById(id);
      res.status(200).json(cruiseDestination);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deleteCruiseDestination: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await service.deleteCruiseDestination(id);
      res.status(200).json({ message: 'Cruise destination deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Port endpoints
  insertPort: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await service.insertPort(data);
      res.status(201).json({ message: 'Port created successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updatePort: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updatePort(id, data);
      res.status(200).json({ message: 'Port updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAllPorts: async (req: Request, res: Response) => {
    try {
      const { search, cruise_destination_id, page, limit } = req.query as { search: string; cruise_destination_id: string; page: string; limit: string };
      const intPage = page ? Number(page) : undefined;
      const intLimit = limit ? Number(limit) : undefined;
      const ports = await service.fetchAllPorts(search, cruise_destination_id, intPage, intLimit);
      res.status(200).json(ports);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchPortById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const port = await service.fetchPortById(id);
      res.status(200).json(port);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deletePort: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await service.deletePort(id);
      res.status(200).json({ message: 'Port deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Destination endpoints
  updateDestination: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updateDestination(id, data);
      res.status(200).json({ message: 'Destination updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchDestinationById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const destination = await service.fetchDestinationById(id);
      res.status(200).json(destination);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  // Resort endpoints
  updateResort: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await service.updateResort(id, data);
      res.status(200).json({ message: 'Resort updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchResortById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const resort = await service.fetchResortById(id);
      res.status(200).json(resort);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  structuredScrapeData: async (req: Request, res: Response) => {
    try {
      const data = req.body;

      const { clientId, agentId, packageId } = req.query as { clientId: string, agentId: string, packageId: string };
      const result = await service.structuredScrapeData(data, agentId, clientId, packageId);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  setImageAsPrimary: async (req: Request, res: Response) => {
    try {
      const { old_primary_id, new_primary_id } = req.body;
      await service.setImageAsPrimary(new_primary_id, old_primary_id);
      res.status(200).json({ message: 'Image set as primary successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  }
};
