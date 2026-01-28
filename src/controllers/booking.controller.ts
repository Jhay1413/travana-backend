import { bookingService } from '../service/booking.service';
import { bookingRepo } from '../repository/booking.repo';
import { sharedRepo } from '../repository/shared.repo';
import { userRepo } from '../repository/user.repo';
import { clientRepo } from '../repository/client.repo';
import { notificationRepo } from '../repository/notification.repo';
import { notificationProvider } from '../provider/notification.provider';
import { Request, Response } from 'express';
import { authRepo } from '../repository/auth.repo';
import { referralRepo } from '../repository/referrals.repo';
import { transactionRepo } from '../repository/transaction.repo';
import { booking } from '@/types/modules/dashboard/query';

const service = bookingService(bookingRepo, sharedRepo, userRepo, clientRepo, notificationRepo, notificationProvider, authRepo, referralRepo, transactionRepo);

export const bookingController = {
  convertBooking: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const { transaction_id } = req.params;
      const { user_id } = req.query;
      const booking = await service.convert(transaction_id, data, user_id as string);

      res.status(200).json(booking);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  createBooking: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const booking = await service.insert(data);
      res.status(201).json({
        bookingId: booking.id,
        message: 'Booking created successfully',
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchBookingSummaryByAgent: async (req: Request, res: Response) => {
    try {
      const { agent_id } = req.params;
      const { type } = req.query;
      const booking = await service.fetchBookingSummaryByAgent(agent_id, type as string);
      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchBookingToUpdate: async (req: Request, res: Response) => {
    try {

      const { id } = req.params;
      const { holiday_type_id } = req.query;
      const booking = await service.fetchBookingToUpdate(id);
      res.status(200).json(booking);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateBooking: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const booking = await service.updateBooking(data, id);
      res.status(200).json({
        message: "Booking updated successfully",
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },

  fetchBookingReport: async (req: Request, res: Response) => {
    try {
      const booking = await service.fetchBookingReport();
      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchBookings: async (req: Request, res: Response) => {
    try {
      const data = req.query as {
        search?: string;
        status?: string;
        booking_status?: string;
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
        booking_status: data?.booking_status,
        holiday_type: data?.holiday_type,
        travel_date_from: data?.travel_date_from,
        travel_date_to: data?.travel_date_to,
        sales_price_min: data?.sales_price_min ? data?.sales_price_min : undefined,
        sales_price_max: data?.sales_price_max ? data?.sales_price_max : undefined,
        destination: data?.destination,
        is_future_deal: data?.is_future_deal ? data?.is_future_deal : undefined,
        client_name: data?.client_name,
        agent_name: data?.agent_name,
      };

      const agentId = data?.agent_id;
      const clientId = data?.client_id;
      const page = data?.page ? data.page : undefined;
      const limit = data?.limit ? data.limit : undefined;

      const pagination = {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      };

      const bookings = await service.fetchBookings(agentId, clientId, filters, pagination);
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  deleteBooking: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { deletionCode, deletedBy } = req.body;
      const booking = await service.deleteBooking(id, deletionCode, deletedBy);
      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchBookingById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const booking = await service.fetchBookingById(id);
      res.status(200).json(booking);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  restoreBooking: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const booking = await service.restoreBooking(id);
      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchDeletedBookings: async (req: Request, res: Response) => {
    try {
      const { page, limit } = req.query;
      const bookings = await service.fetchDeletedBookings(Number(page), Number(limit));
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchHistoricalBookings: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const bookings = await service.fetchHistoricalBookings(id);
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchHistoricalBookingById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const booking = await service.fetchHistoricalBookingById(id);
      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchForwardCommission: async (req: Request, res: Response) => {
    try {
      const {selectedYear} = req.query;
      const year = selectedYear ? Number(selectedYear) : undefined;
      const booking = await service.fetchForwardCommission(year);
      res.status(200).json(booking);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  generateForwardsReport: async (req: Request, res: Response) => {
    try {
      const {year} = req.body;
      const parsedYear = year ? year: undefined;

      await service.generateForwardsReport(parsedYear);
      res.status(200).json({ message: 'Forwards report generated successfully' });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateForwardAdjustment: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { adjustment } = req.body;
      await service.updateForwardAdjustment(id, adjustment);
      res.status(200).json({ message: 'Forward adjustment updated successfully' });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  getBookingByPeriod: async (req: Request, res: Response) => {
    try {
      const { periodId } = req.params;
      const bookings = await service.getBookingByPeriod(periodId);
      res.status(200).json(bookings);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  }
}
