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
import { TransactionRepo } from '../repository/transaction.repo';
import { AiService } from './ai.service';
import { parsedInput } from '../lib/parsedInput';
import { travelDealSchema } from '../types/modules/transaction';
import { formatPost } from '../lib/formatPost';
import { generateNextDealId } from '../lib/generateId';

export const quoteService = (
  repo: QuoteRepo,
  sharedRepo: SharedRepo,
  userRepo: UserRepo,
  clientRepo: ClientRepo,
  notificationRepo: NotificationRepo,
  notificationProvider: NotificationProvider,
  authRepo: AuthRepo,
  referralRepo: ReferralRepo,
  transactionRepo: TransactionRepo,
  aiService: ReturnType<typeof AiService> // ✅ inject here

) => {
  return {
    convertQuote: async (transaction_id: string, data: z.infer<typeof quote_mutate_schema>, user_id: string) => {
      // const holiday_type = await sharedRepo.fetchHolidayTypeById(data.holiday_type);

      // if (!data.holiday_type) throw new AppError('Holiday type is required', true, 400);
      console.log(transaction_id)
      let id: string | undefined;
      if (!data.client_id) throw new AppError('Client ID is required', true, 400);


      const lastId = await repo.getLastId();

      const nextDealId = generateNextDealId(lastId || '');



      if (data.holiday_type_name === 'Cruise Package') {
        const result = await repo.convertQuoteCruise(transaction_id, { ...data, deal_id: nextDealId });
        id = result.id;
      } else {
        const result = await repo.convertQuote(transaction_id, { ...data, deal_id: nextDealId });
        id = result.id;
      }
      if (data.travelDeal) {
        await repo.insertTravelDeal(data.travelDeal, id!);
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
      if (!data.holiday_type) throw new AppError('Holiday type is required', true, 400);


      const lastId = await repo.getLastId();
      const nextDealId = generateNextDealId(lastId || '');
      if (holiday_type.name === 'Cruise Package') {

        const result = await repo.insertCruise({ ...data, deal_id: nextDealId });
        id = result.quote_id;
        transaction_id = result.transaction_id;
      } else {
        const result = await repo.insertQuote({ ...data, deal_id: nextDealId });
        id = result.quote_id;
        transaction_id = result.transaction_id;
      }

      if (data.deal_images && data.deal_images.length > 0) {

        if (data.holiday_type_name === 'Package Holiday' && data.accomodation_id) {
          const imagesToInsert = data.deal_images.map(image => ({
            owner_id: data.accomodation_id ?? " ",
            image_url: image,
            isPrimary: false,
            owner_type: 'package_holiday' as const,


          }))
          await transactionRepo.insertDealImages(imagesToInsert);
        }

      }
      if (data.travelDeal) {
        await repo.insertTravelDeal(data.travelDeal, id!);
      }
      if (!data.client_id) return { id, transaction_id };

      const referrer = await referralRepo.fetchReferrerByClientId(data.client_id);
      if (transaction_id && referrer && referrer.referrerId) {
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
      const holiday_types = await sharedRepo.fetchHolidayTypeById(data.holiday_type);
      if (!data.holiday_type) throw new AppError('Holiday type is required', true, 400);
      let quote_id: string | undefined;
      let transaction_id: string | undefined;
      let quote_status: string = ""
      let holiday_type = ""



      const lastId = await repo.getLastId();

      const nextDealId = generateNextDealId(lastId || '');
      if (holiday_types.name === 'Cruise Package ') {
        const response = await repo.duplicateCruise({ ...data, deal_id: nextDealId });

        quote_id = response.quote_id;
        transaction_id = response.transaction_id;
        quote_status = response.quote_status
        holiday_type = response.holiday_type
      }
      else {
        const response = await repo.duplicateQuote({ ...data, deal_id: nextDealId });
        quote_id = response.quote_id;
        transaction_id = response.transaction_id;
        quote_status = response.quote_status
        holiday_type = response.holiday_type
      }

      if (data.deal_images && data.deal_images.length > 0) {

        if (data.holiday_type_name === 'Package Holiday' && data.accomodation_id) {
          const imagesToInsert = data.deal_images.map(image => ({
            owner_id: data.accomodation_id ?? " ",
            image_url: image,
            isPrimary: false,
            owner_type: 'package_holiday' as const,
          }))
          await transactionRepo.insertDealImages(imagesToInsert);
        }
      }
      if (data.travelDeal) {
        await repo.insertTravelDeal(data.travelDeal, quote_id!);
      }
      return { quote_id, transaction_id, quote_status, holiday_type };
    },

    fetchQuoteSummaryByClient: async (client_id: string) => {
      return await repo.fetchQuoteSummaryByClient(client_id);
    },
    fetchQuoteSummaryByAgent: async (agent_id: string, agentIdToFetch?: string, isFetchAll?: boolean | null) => {
      return await repo.fetchQuoteSummaryByAgent(agent_id, agentIdToFetch, isFetchAll);
    },
    fetchQuoteById: async (quote_id: string) => {

      const response = await repo.fetchQuoteById(quote_id);

      if (response.holiday_type === 'Package Holiday' && response.hotels && response.hotels.length > 0) {
        console.log('Fetching deal images for accomodation id:', response.hotels[0]?.accomodation_id);
        const dealImages = await transactionRepo.fetchDealImagesByOwnerId(response.hotels[0]?.accomodation_id || '');

        return { ...response, deal_images: dealImages };
      }
      return response;
    },
    fetchPackageToUpdate: async (quote_id: string) => {
      const holiday_type = await repo.fetchHolidayTypeByQuoteId(quote_id);

      if (!holiday_type) throw new AppError('No holiday type found', true, 400);

      if (holiday_type === 'Cruise Package') {
        return await repo.fetchCruiseToUpdate(quote_id)
      };

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
    fetchTravelDeals: async (search?: string,
      country_id?: string,
      package_type_id?: string,
      min_price?: string,
      max_price?: string,
      start_date?: string,
      end_date?: string,
      cursor?: string,
      limit?: number) => {
      return await repo.fetchTravelDeals(search, country_id, package_type_id, min_price, max_price, start_date, end_date, cursor, limit);
    },

    generatePostContent: async (quoteDetails: string, quote_id: string) => {
      if (!quoteDetails || typeof quoteDetails !== 'string') {
        throw new AppError('Invalid quote details provided.', true, 400);
      }
      const parsedData = parsedInput(quoteDetails);

      const validationResult = travelDealSchema.safeParse(parsedData);
      if (!validationResult.success) {
        const errors = validationResult.error
        throw new AppError(`Invalid quote details: ${errors.message}`, true, 400);
      }

      const result = validationResult.data;
      // Extract destination from title (everything before common separators like -, |, :)
      const destination = result.title.split(/[-|:]/)[0].trim() || result.title;

      // Generate subtitle if it's empty, and generate resort summary and hashtags in parallel
      let subtitle = result.subtitle || "";

      // Run AI calls in parallel for better performance
      const [generatedSubtitle, resortSummary, hashtags] = await Promise.all([
        subtitle ? Promise.resolve(subtitle) : aiService.generateSubtitle(result.title),
        aiService.generateResortSummary(result.title),
        aiService.generateHashtags(result.title, destination)
      ]);

      subtitle = generatedSubtitle;

      // Format the post
      const post = formatPost(result, subtitle, resortSummary, hashtags);

      const dealToInsert = {
        post,
        subtitle,
        resortSummary,
        hashtags,
        deal: result
      }
      return await repo.insertTravelDeal(dealToInsert, quote_id)
    }
  };
}
