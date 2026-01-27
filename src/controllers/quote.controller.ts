import { quoteRepo } from '../repository/quote.repo';
import { sharedRepo } from '../repository/shared.repo';
import { quoteService } from '../service/quote.service';
import { userRepo } from '../repository/user.repo';
import { clientRepo } from '../repository/client.repo';
import { notificationRepo } from '../repository/notification.repo';
import { notificationProvider } from '../provider/notification.provider';
import { authRepo } from '../repository/auth.repo';
import { referralRepo } from '../repository/referrals.repo';
import { Request, Response } from 'express';
import { transactionRepo } from '../repository/transaction.repo';
import { AiService } from '../service/ai.service';
import { s3Service } from '../lib/s3';
export const aiService = AiService(); // singleton instance
const service = quoteService(quoteRepo, sharedRepo, userRepo, clientRepo, notificationRepo, notificationProvider, authRepo, referralRepo, transactionRepo, aiService, s3Service);

export const quoteController = {
  fetchTodaySocialDeals: async (req: Request, res: Response) => {
    try {
      const deals = await service.fetchTodaySocialDeals();
      res.status(200).json(deals);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }

  },
  deleteTravelDeal: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { onlySocialId } = req.query;

      console.log(onlySocialId, "controller onlySocialId")
      await service.deleteTravelDeal(id, onlySocialId as string);
      res.status(200).json({ message: 'Travel deal deleted successfully' });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  convertQuote: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const { transaction_id } = req.params;
      const { user_id } = req.query;

      const quote = await service.convertQuote(transaction_id, data, user_id as string);
      res.status(201).json({ id: quote.id, message: 'Quote converted successfully' });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  insertQuote: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const quote = await service.insertQuote(data);
      res.status(201).json(quote);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  duplicateQuote: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const quote = await service.duplicateQuote(data);
      res.status(201).json(quote);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchQuoteSummaryByClient: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const quote = await service.fetchQuoteSummaryByClient(id);
      res.status(200).json(quote);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchQuoteSummaryByAgent: async (req: Request, res: Response) => {
    try {
      const { agent_id } = req.params;
      const { isFetchAll, agentIdToFetch } = req.query;

      const fetchAll = isFetchAll === 'true' ? true : false;
      const quote = await service.fetchQuoteSummaryByAgent(agent_id, agentIdToFetch as string, fetchAll);
      res.status(200).json(quote);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchQuoteById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const quote = await service.fetchQuoteById(id);
      res.status(200).json(quote);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchPackageToUpdate: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const quote = await service.fetchPackageToUpdate(id);
      res.status(200).json(quote);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateQuote: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const quote = await service.updateQuote(data, id);
      res.status(200).json({ message: 'Quote updated successfully' });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  convertQuoteStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      console.log(data)
      const quote = await service.convertQuoteStatus(id, data.status, data.agent_id, data.user_id, data.client_id);
      res.status(200).json(quote);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchQuotes: async (req: Request, res: Response) => {
    try {
      const data = req.query as {
        search?: string;
        status?: string;
        quote_status?: string;
        holiday_type?: string;
        travel_date_from?: string;
        travel_date_to?: string;
        sales_price_min?: string;
        sales_price_max?: string;
        destination?: string;
        is_future_deal?: string;
        client_name?: string;
        agent_name?: string;
        agent_id?: string;
        client_id?: string;
        page?: string;
        limit?: string;
      };

      const filters = {
        search: data?.search,
        status: data?.status,
        quote_status: data?.quote_status,
        holiday_type: data?.holiday_type,
        travel_date_from: data?.travel_date_from,
        travel_date_to: data?.travel_date_to,
        sales_price_min: data?.sales_price_min ? Number(data?.sales_price_min) : undefined,
        sales_price_max: data?.sales_price_max ? Number(data?.sales_price_max) : undefined,
        destination: data?.destination,
        is_future_deal: data?.is_future_deal === 'true' ? true : data?.is_future_deal === 'false' ? false : undefined,
        client_name: data?.client_name,
        agent_name: data?.agent_name,
      };

      const agentId = data?.agent_id;
      const clientId = data?.client_id;
      const page = data?.page ? Number(data.page) : undefined;
      const limit = data?.limit ? Number(data.limit) : undefined;

      const quotes = await service.fetchQuotes(agentId, clientId, filters, page, limit);
      res.status(200).json(quotes);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  setPrimary: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { secondary_id, quote_status } = req.body;
      const quote = await service.setPrimary(id, secondary_id, quote_status);
      res.status(200).json({ quote });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchQuoteTitle: async (req: Request, res: Response) => {
    try {
      const { client_id } = req.query;
      const quote = await service.fetchQuoteTitle(client_id as string);
      res.status(200).json({ quote });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deleteQuote: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { deletionCode, deletedBy } = req.body;
      const quote = await service.deleteQuote(id, deletionCode, deletedBy);
      res.status(200).json({ quote });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchFreeQuotesInfinite: async (req: Request, res: Response) => {
    try {
      const { search, country_id, package_type_id, min_price, schedule_filter, max_price, start_date, end_date, cursor, limit } = req.query as {
        search?: string;
        country_id?: string;
        package_type_id?: string;
        min_price?: string;
        schedule_filter?: string;
        max_price?: string;
        start_date?: string;
        end_date?: string;
        cursor?: string;
        limit?: string;
      };
      console.log(schedule_filter, "controller schedule_filter")
      const num_limit = limit ? Number(limit) : 10;
      const quote = await service.fetchFreeQuotesInfinite(
        search,
        country_id,
        package_type_id,
        min_price,
        schedule_filter,
        max_price,
        start_date,
        end_date,
        cursor,
        num_limit
      );
      res.status(200).json(quote);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateQuoteExpiry: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { date_expiry, user_id } = req.body;
      const quote = await service.updateQuoteExpiry(id, date_expiry);
      res.status(200).json({ quote });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  setFutureDealDate: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { future_deal_date } = req.body;
      const quote = await service.setFutureDealDate(id, future_deal_date);
      res.status(200).json({ quote });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  unsetFutureDealDate: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const quote = await service.unsetFutureDealDate(id, status);
      res.status(200).json({ quote });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchTravelDeals: async (req: Request, res: Response) => {
    try {
      const { search, country_id, package_type_id, min_price, max_price, start_date, end_date, cursor, limit } = req.query as {
        search?: string;
        country_id?: string;
        package_type_id?: string;
        min_price?: string;
        max_price?: string;
        start_date?: string;
        end_date?: string;
        cursor?: string;
        limit?: string;
      };
      const num_limit = limit ? Number(limit) : 10;
      const deals = await service.fetchTravelDeals(search,
        country_id,
        package_type_id,
        min_price,
        max_price,
        start_date,
        end_date,
        cursor,
        num_limit);
      res.status(200).json(deals);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  generatePostContent: async (req: Request, res: Response) => {
    try {
      const { quoteDetails } = req.body;
      const { id } = req.params;
      const postContent = await service.generatePostContent(quoteDetails, id);
      res.status(200).json({
        message: 'Post content generated successfully',
        postContent
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchTravelDealByQuoteId: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { onlySocialId } = req.query;
      const deal = await service.fetchTravelDealByQuoteId(id, onlySocialId as string);
      res.status(200).json(deal);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  scheduleTravelDeal: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { scheduledDate, onlySocialId, post, existingImages } = req.body;
      const files = req.files as Express.Multer.File[];
      const parsedExistingImages: number[] = existingImages ? JSON.parse(existingImages) : [];
      console.log(req, "controller files")

      const schedule = await service.scheduleTravelDeal(id, scheduledDate, onlySocialId, files, post, parsedExistingImages);
      res.status(200).json({
        message: 'Travel deal scheduled successfully',
        schedule
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  }


  //   restoreQuote: async (req: Request, res: Response) => {
  //     try {
  //       const { id } = req.params;
  //       const quote = await service.restoreQuote(id);
  //       res.status(200).json({ quote });
  //     } catch (error) {
  //       res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
  //     }
  //   },
};
