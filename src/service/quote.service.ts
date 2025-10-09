import { AppError } from '../middleware/errorHandler';
import { ClientRepo } from '../repository/client.repo';
import { QuoteRepo } from '../repository/quote.repo';
import { SharedRepo } from '../repository/shared.repo';
import { UserRepo } from '../repository/user.repo';
import { NotificationRepo } from '../repository/notification.repo';
import { quote_mutate_schema } from '../types/modules/transaction/mutation';
import z from 'zod';
import { NotificationProvider } from '../provider/notification.provider';
import { AuthRepo } from '../repository/auth.repo';
import { ReferralRepo } from '../repository/referrals.repo';

export const quoteService = (
  repo: QuoteRepo,
  sharedRepo: SharedRepo,
  userRepo: UserRepo,
  clientRepo: ClientRepo,
  notificationRepo: NotificationRepo,
  notificationProvider: NotificationProvider,
  authRepo: AuthRepo,
  referralRepo: ReferralRepo
) => {
  return {
    convertQuote: async (transaction_id: string, data: z.infer<typeof quote_mutate_schema>, user_id: string) => {
      // const holiday_type = await sharedRepo.fetchHolidayTypeById(data.holiday_type);

      // console.log(holiday_type)
      // if (!data.holiday_type) throw new AppError('Holiday type is required', true, 400);

      let id: string | undefined;

      if (data.holiday_type_name === 'Cruise Package') {
        const result = await repo.convertQuoteCruise(transaction_id, data);
        id = result.id;
      } else {
        const result = await repo.convertQuote(transaction_id, data);
        id = result.id;
      }

      if (user_id === data.agent_id) return { id };

      const [user, client] = await Promise.all([userRepo.fetchUserById(user_id), clientRepo.fetchClientById(data.client_id)]);

      const type = 'quote';
      const reference_id = id;
      const due_date = null;
      const clientFullName = `${client.firstName} ${client.surename}`;
      const agentFullName = `${user.firstName} ${user.lastName}`;
      const message = `${agentFullName} has changed the status of your lead {{${clientFullName}}} to Quote in Progress!`;

      await notificationRepo.insertNotification(user_id, message, type, reference_id, data.client_id, due_date);

      const tokens = await notificationRepo.fetchUserTokenService(user_id);
      const unread_notif = await notificationRepo.countUnreadNotifications(user_id);

      if (tokens && tokens.length > 0) {
        await notificationProvider.notifyUser(
          message,
          tokens.filter((token) => token !== null),
          unread_notif
        );
      }

      return { id };
    },
    insertQuote: async (data: z.infer<typeof quote_mutate_schema>) => {

      let id: string | undefined;
      let transaction_id: string | undefined;
      const holiday_type = await sharedRepo.fetchHolidayTypeById(data.holiday_type);
      console.log(holiday_type)
      if (!data.holiday_type) throw new AppError('Holiday type is required', true, 400);

      if (holiday_type.name === 'Cruise Package'){

        const result = await repo.insertCruise(data);
        id = result.quote_id;
        transaction_id = result.transaction_id;
      } else {
        const result = await repo.insertQuote(data);
        id = result.quote_id;
        transaction_id = result.transaction_id;
      }

      const referrer = await referralRepo.fetchReferrerByClientId(data.client_id);
      if (transaction_id && referrer.referrerId) {
        const organization = await authRepo.fetchOrganizationByUserId(referrer.referrerId);
        if (organization) {
          const owner = await authRepo.fetchOwnerOrganizationByOrgId(organization.organizationId);
          if (!owner) {
            await referralRepo.insertReferral(transaction_id, referrer.referrerId, referrer.percentageCommission?.toString() ?? '0');
          }
          else {
            if (owner.userId === referrer.referrerId) {
              await referralRepo.insertReferral(transaction_id, owner.userId, ((referrer.percentageCommission ?? 0) + 5).toString());
            } else {
              await referralRepo.insertReferral(transaction_id, referrer.referrerId, referrer.percentageCommission?.toString() ?? '0');
              await referralRepo.insertReferral(transaction_id, owner.userId, '5');
            }
          }
        }
        else {
          await referralRepo.insertReferral(transaction_id, referrer.referrerId, referrer.percentageCommission?.toString() ?? '0');
        }
      } 

      return { id, transaction_id };
    },

    duplicateQuote: async (data: z.infer<typeof quote_mutate_schema>) => {
      const holiday_type = await sharedRepo.fetchHolidayTypeById(data.holiday_type);
      if (!data.holiday_type) throw new AppError('Holiday type is required', true, 400);

      if (holiday_type.name === 'Cruise Package ') return await repo.duplicateCruise(data);

      return await repo.duplicateQuote(data);
    },

    fetchQuoteSummaryByClient: async (client_id: string) => {
      return await repo.fetchQuoteSummaryByClient(client_id);
    },
    fetchQuoteSummaryByAgent: async (agent_id: string, agentIdToFetch?: string, isFetchAll?: boolean | null) => {
      return await repo.fetchQuoteSummaryByAgent(agent_id, agentIdToFetch, isFetchAll);
    },
    fetchQuoteById: async (quote_id: string) => {
      return await repo.fetchQuoteById(quote_id);
    },
    fetchPackageToUpdate: async (quote_id: string) => {
      const holiday_type = await repo.fetchHolidayTypeByQuoteId(quote_id);

      if (!holiday_type) throw new AppError('No holiday type found', true, 400);

      if (holiday_type === 'Cruise Package'){
        console.log('Cruise Package');
        return await repo.fetchCruiseToUpdate(quote_id)};

      return await repo.fetchPackageToUpdate(quote_id);
    },

    updateQuote: async (data: z.infer<typeof quote_mutate_schema>, quote_id: string) => {
      const holiday_type = await repo.fetchHolidayTypeByQuoteId(quote_id);
      if (!holiday_type) throw new AppError('No holiday type found', true, 400);

      if (holiday_type === 'Cruise Package ') return await repo.updateCruise(data, quote_id);

      return await repo.updateQuote(data, quote_id);
    },

    convertQuoteStatus: async (id: string, status: string, agent_id: string, user_id: string, client_id: string) => {
      if (agent_id === user_id && status !== 'LOST') {
        return await repo.convertQuoteStatus(id, status);
      }
      await repo.convertQuoteStatus(id, status);
      console.log(user_id)
      const [user, client] = await Promise.all([userRepo.fetchUserById(user_id), clientRepo.fetchClientById(client_id)]);

      const type = 'quote';
      const reference_id = id;
      const due_date = null;
      const clientFullName = `${client.firstName} ${client.surename}`; // make sure it’s surname, not surename

      const formatStatus = (status: string) =>
        status
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');

      const message =
        status === 'LOST'
          ? `Hey, You win some, you lose some. We lost the {{${clientFullName}}} deal, you'll get the next one!`
          : `${user.firstName} has changed the status of quote {{${clientFullName}}} to ${formatStatus(status)}!`;

      await notificationRepo.insertNotification(agent_id, message, type, reference_id, client_id, due_date);
      const tokens = await notificationRepo.fetchUserTokenService(agent_id);
      const unread_notif = await notificationRepo.countUnreadNotifications(agent_id);
      if (tokens && tokens.length > 0) {
        await notificationProvider.notifyUser(
          message,
          tokens.filter((token) => token !== null),
          unread_notif
        );
      }
    },
    fetchQuotes: async (
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
    ) => {
      return await repo.fetchQuotes(agentId, clientId, filters, page, limit);
    },
    setPrimary: async (primary_id: string, secondary_id: string, quote_status: string) => {
      return await repo.setPrimary(primary_id, secondary_id, quote_status);
    },
    fetchQuoteTitle: async (client_id: string) => {
      return await repo.fetchQuoteTitle(client_id);
    },
    deleteQuote: async (quote_id: string, deletionCode: string, deletedBy: string) => {
      return await repo.deleteQuote(quote_id, deletionCode, deletedBy);
    },
    fetchFreeQuotesInfinite: async (
      search?: string,
      country_id?: string,
      package_type_id?: string,
      min_price?: string,
      max_price?: string,
      start_date?: string,
      end_date?: string,
      cursor?: string,
      limit?: number
    ) => {
      return await repo.fetchFreeQuotesInfinite(search, country_id, package_type_id, min_price, max_price, start_date, end_date, cursor, limit);
    },
    updateQuoteExpiry: async (id: string, date_expiry: string) => {
      return await repo.updateQuoteExpiry(id, date_expiry);
    },
    getDeletedQuotes: async (page: number, limit: number) => {
      return await repo.getDeletedQuotes(page, limit);
    },
    setFutureDealDate: async (id: string, future_deal_date: string) => {
      return await repo.setFutureDealDate(id, future_deal_date);
    },
    unsetFutureDealDate: async (id: string, status?: string) => {
      return await repo.unsetFutureDealDate(id, status);
    },
  };
};
