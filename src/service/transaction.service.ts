import { ClientRepo } from '../repository/client.repo';
import { NotificationRepo } from '../repository/notification.repo';
import { TransactionRepo } from '../repository/transaction.repo';
import { UserRepo } from '../repository/user.repo';
import { NotificationProvider } from '../provider/notification.provider';
import { lodgeMutateSchema } from '../types/modules/data-management';
import z from 'zod';

export const transactionService = (repo: TransactionRepo,userRepo:UserRepo,clientRepo:ClientRepo,notificationRepo:NotificationRepo,notificationProvider:NotificationProvider) => {
  return {
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
    reassignTransaction: async (agent_id: string, transactionId: string,type: string,client_id: string,current_user_id: string,ref_id: string) => {
      await repo.reassignTransaction(transactionId, agent_id);

      if(current_user_id === agent_id) return

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
  };
};
