import { transactionRepo } from '../repository/transaction.repo';
import { transactionService } from '../service/transaction.service';
import { userRepo } from '../repository/user.repo';
import { clientRepo } from '../repository/client.repo';
import { notificationRepo } from '../repository/notification.repo';
import { notificationProvider } from '../provider/notification.provider';
import { Request, Response } from 'express';

const service = transactionService(transactionRepo, userRepo, clientRepo, notificationRepo, notificationProvider);

export const transactionController = {
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
      res.status(200).json( quotes );
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
      const { content, transaction_id, agent_id, parent_id } = req.body;
      await service.insertNote(content, transaction_id, agent_id, parent_id);
      res.status(200).json({ message: 'Note inserted' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  reassignTransaction: async (req: Request, res: Response) => {
    try {
      const { transaction_id } = req.params;
      const { agent_id, type, client_id, current_user_id, ref_id } = req.body;
      await service.reassignTransaction(agent_id, transaction_id, type, client_id, current_user_id, ref_id);
      res.status(200).json({ message: 'Transaction reassigned' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchDestination: async (req: Request, res: Response) => {
    try {
      const { country_ids, selected_ids, search } = req.query as { country_ids: string; selected_ids: string; search: string };

      const selectedIds = (selected_ids as string)?.split(",") ?? [];
      const countryIds = (country_ids as string)?.split(',') ?? [];

        console.log(countryIds, selectedIds, search)
      const destination = await service.fetchDestination(countryIds ?? [], selectedIds ?? [], search ?? undefined);
      res.status(200).json( destination );
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
      res.status(200).json( port );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAirport: async (req: Request, res: Response) => {
    try {
      const { search, selected_ids } = req.query as { search: string; selected_ids: string[] };
      const airport = await service.fetchAirport(search ?? undefined, selected_ids ?? []);
      res.status(200).json( airport );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchBoardBasis: async (req: Request, res: Response) => {
    try {
      const board_basis = await service.fetchBoardBasis();
      res.status(200).json( board_basis );
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
      res.status(200).json( cruise_line );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCountry: async (req: Request, res: Response) => {
    try {
      const { search } = req.query as { search: string };
      const country = await service.fetchCountry(search ?? undefined);
      res.status(200).json( country );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAccomodation: async (req: Request, res: Response) => {
    try {
      const { search, resort_ids, selected_ids } = req.query as { search: string; resort_ids: string; selected_ids: string };
      const resortIds = (resort_ids as string)?.split(',') ?? [];
      const selectedIds = (selected_ids as string)?.split(',') ?? [];
      const accomodation = await service.fetchAccomodation(search ?? undefined, resortIds ?? [], selectedIds ?? []);
      res.status(200).json( accomodation );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchResorts: async (req: Request, res: Response) => {
    try {
      const { search, destination_ids, selected_ids } = req.query as { search: string; destination_ids: string; selected_ids: string };
      const destinationIds = (destination_ids as string)?.split(',') ?? [];
      const selectedIds = (selected_ids as string)?.split(',') ?? [];
      const resorts = await service.fetchResorts(search ?? undefined, destinationIds ?? [], selectedIds ?? []);
      res.status(200).json( resorts );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchAccomodationType: async (req: Request, res: Response) => {
    try {
      const accomodation_type = await service.fetchAccomodationType();
      res.status(200).json( accomodation_type );
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
      res.status(200).json( cruise_destination );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchTourOperator: async (req: Request, res: Response) => {
    try {
      const { search } = req.query as { search: string };
      const tour_operator = await service.fetchTourOperator(search ?? undefined);
      res.status(200).json( tour_operator );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchPackageType: async (req: Request, res: Response) => {
    try {
      const package_type = await service.fetchPackageType();
          res.status(200).json( package_type );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchLodges: async (req: Request, res: Response) => {
    try {
      const { search } = req.query as { search: string };
      const lodges = await service.fetchLodges(search ?? undefined);
      res.status(200).json( lodges );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCruiseDate: async (req: Request, res: Response) => {
    try {
      const { date, ship_id } = req.query as { date: string; ship_id: string };
      const cruise_date = await service.fetchCruiseDate(date, ship_id);
      res.status(200).json( cruise_date );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCruises: async (req: Request, res: Response) => {
    try {
      const cruises = await service.fetchCruises();
      res.status(200).json( cruises );
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
      res.status(200).json( ships );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchCruiseExtras: async (req: Request, res: Response) => {
    try {
      const cruise_extras = await service.fetchCruiseExtras();
      res.status(200).json( cruise_extras );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchNotes: async (req: Request, res: Response) => {
    try {
      const { transaction_id } = req.params;
      const notes = await service.fetchNotes(transaction_id);
      res.status(200).json( notes );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchNoteById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const note = await service.fetchNoteById(id);
      res.status(200).json( note );
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
      res.status(200).json( kanban_inquries );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchBookings: async (req: Request, res: Response) => {
    try {
      const { agent_id } = req.query as { agent_id: string };
      const bookings = await service.fetchBookings(agent_id ?? undefined);
      res.status(200).json( bookings );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchTransactionSummaryByAgent: async (req: Request, res: Response) => {
    try {
      const { agent_id } = req.params;
      const transaction_summary = await service.fetchTransactionSummaryByAgent(agent_id);
      res.status(200).json( transaction_summary );
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
      res.status(200).json( future_deals_kanban );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchFutureDeal: async (req: Request, res: Response) => {
    try {
      const { client_id } = req.params;
      const future_deal = await service.fetchFutureDeal(client_id);
      res.status(200).json( future_deal );
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
      res.status(200).json( dashboard_summary);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateLodge: async (req: Request, res: Response) => {
    try {
      const { lodge_id } = req.params;
      const { data } = req.body;
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
      const { data } = req.body;
      await service.insertLodge(data);
      res.status(200).json({ message: 'Lodge inserted' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
};
