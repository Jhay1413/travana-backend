import { BookingRepo } from '../repository/booking.repo';
import { SharedRepo } from '../repository/shared.repo';
import { UserRepo } from '../repository/user.repo';
import { ClientRepo } from '../repository/client.repo';
import { NotificationRepo } from '../repository/notification.repo';
import { NotificationProvider } from '../provider/notification.provider';
import z from 'zod';
import { booking_mutate_schema } from '../types/modules/booking';
import { AppError } from '../middleware/errorHandler';
import { auth } from '../lib/auth';
import { AuthService } from './auth.service';
import { AuthRepo } from '../repository/auth.repo';
import { ReferralRepo } from '../repository/referrals.repo';

export const bookingService = (
  repo: BookingRepo,
  sharedRepo: SharedRepo,
  userRepo: UserRepo,
  clientRepo: ClientRepo,
  notificationRepo: NotificationRepo,
  notificationProvider: NotificationProvider,
  authRepo: AuthRepo,
  referralRepo: ReferralRepo
) => {
  return {
    convert: async (transaction_id: string, data: z.infer<typeof booking_mutate_schema>, user_id: string) => {

      const holiday_type = await sharedRepo.fetchHolidayTypeById(data.holiday_type);
      if (!data.holiday_type) throw new AppError('Holiday type is required', true, 400);
      let id: string | undefined;
      if (holiday_type.name === 'Cruise Package ') {
        const result = await repo.convertCruise(transaction_id, data);
        id = result.id;
      } else {
        const result = await repo.convertPackage(transaction_id, data);
        id = result.id;
      }
      if (user_id === data.agent_id) return { id };
      const [user, client] = await Promise.all([userRepo.fetchUserById(user_id), clientRepo.fetchClientById(data.client_id)]);
      const type = 'booking';
      const reference_id = id;
      const due_date = null;
      const clientFullName = `${client.firstName} ${client.surename}`;
      const agentFullName = `${user.firstName} ${user.lastName}`;
      const message = `Congratulations on closing the deal on {{${clientFullName}}} let's go!!!`;
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
    insert: async (data: z.infer<typeof booking_mutate_schema>) => {
      const holiday_type = await sharedRepo.fetchHolidayTypeById(data.holiday_type);
      if (!data.holiday_type) throw new AppError('Holiday type is required', true, 400);

      let id: string | undefined;
      let transaction_id: string | undefined;
      if (holiday_type.name === 'Cruise Package') {
        console.log('Cruise Package');
        const result = await repo.insertCruise(data);
        id = result.id;
      } else {
        const result = await repo.insert(data);
        id = result.id;
        transaction_id = result.transaction_id;
      }



      const referrer = await referralRepo.fetchReferrerByClientId(data.client_id);
      if (transaction_id && referrer.referrerId) {
        const organization = await authRepo.fetchOrganizationByUserId(referrer.referrerId);
        if (organization) {
          const owner = await authRepo.fetchOwnerOrganizationByOrgId(organization.organizationId);

          if (!owner) {
            referralRepo.insertReferral(transaction_id, referrer.referrerId, referrer.percentageCommission?.toString() ?? '0');
          }

          else {
            if(owner.userId === referrer.referrerId){
              await referralRepo.insertReferral(transaction_id, owner.userId, ((referrer.percentageCommission ?? 0) + 5).toString());
            }else{
              await referralRepo.insertReferral(transaction_id, referrer.referrerId, referrer.percentageCommission?.toString() ?? '0');
              await referralRepo.insertReferral(transaction_id, owner.userId, '5');
            }
          }
        }
        else {
          await referralRepo.insertReferral(transaction_id, referrer.referrerId, referrer.percentageCommission?.toString() ?? '0');
        }
      }

      const [client] = await Promise.all([clientRepo.fetchClientById(data.client_id)]);
      const type = 'booking';
      const due_date = null;
      const clientFullName = `${client.firstName} ${client.surename}`;
      const message = `Congratulations on closing the deal on {{${clientFullName}}} let's go!!!`;
      await notificationRepo.insertNotification(data.agent_id, message, type, id, data.client_id, due_date);
      const tokens = await notificationRepo.fetchUserTokenService(data.agent_id);
      const unread_notif = await notificationRepo.countUnreadNotifications(data.agent_id);
      if (tokens && tokens.length > 0) {
        await notificationProvider.notifyUser(
          message,
          tokens.filter((token) => token !== null),
          unread_notif
        );
      }
    },
    fetchBookingSummaryByAgent: async (agent_id: string, type: string, agentIdToFetch?: string, isFetchAll?: boolean | null) => {
      return await repo.fetchBookingSummaryByAgent(agent_id, type, isFetchAll, agentIdToFetch);
    },
    fetchBookingToUpdate: async (booking_id: string) => {
      const holiday_type = await sharedRepo.fetchHolidayTypeByBookingId(booking_id);
      if (!holiday_type) throw new AppError('No holiday type found', true, 400);
      if (holiday_type === 'Cruise Package') return await repo.fetchCruiseToUpdate(booking_id);
      return await repo.fetchPackageToUpdate(booking_id);
    },
    updateBooking: async (data: z.infer<typeof booking_mutate_schema>, booking_id: string) => {
      const holiday_type = await sharedRepo.fetchHolidayTypeById(data.holiday_type);
      if (!holiday_type) throw new AppError('Holiday type is required', true, 400);
      if (holiday_type.name === 'Cruise Package') return await repo.updateCruise(data, booking_id);
      return await repo.updatePackage(data, booking_id);
    },
    fetchBookingReport: async () => {
      return await repo.fetchBookingReport();
    },
    fetchBookings: async (
      agentId?: string,
      clientId?: string,
      filters?: {
        search?: string;
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
      },
      pagination?: {
        page?: number;
        limit?: number;
      }
    ) => {
      return await repo.fetchBookings(agentId, clientId, filters, pagination);
    },
    deleteBooking: async (booking_id: string, deletionCode: string, deletedBy: string) => {
      return await repo.delete(booking_id, deletionCode, deletedBy);
    },
    fetchBookingById: async (booking_id: string) => {
      return await repo.fetchBookingById(booking_id);
    },
    restoreBooking: async (booking_id: string) => {
      return await repo.restore(booking_id);
    },
    fetchDeletedBookings: async (page: number, limit: number) => {
      return await repo.fetchDeletedBookings(page, limit);
    },
    fetchHistoricalBookings: async (id: string) => {
      const bookings = await repo.fetchHistoricalBookings(id);
      return bookings.map((booking) => ({
        ...booking,
        adults: booking.adults ? Number(booking.adults) : null,
        children: booking.children ? Number(booking.children) : null,
        infants: booking.infants ? Number(booking.infants) : null,
        seniors: booking.seniors ? Number(booking.seniors) : null,
        duration: booking.duration ? Number(booking.duration) : null,
        gross_price: booking.gross_price ? Number(booking.gross_price) : null,
        net_price: booking.net_price ? Number(booking.net_price) : null,
        gross_before_discount: booking.gross_before_discount ? Number(booking.gross_before_discount) : null,
        profit: booking.profit ? Number(booking.profit) : null,
        total_payment: booking.total_payment ? Number(booking.total_payment) : null,
        passegners: booking.passegners ? Number(booking.passegners) : null,
      }));
    },
    fetchHistoricalBookingById: async (id: string) => {
      const booking = await repo.fetchHistoricalBookingById(id);
      if (!booking) throw new Error('Historical booking not found');

      return {
        ...booking,
        adults: booking.adults ? Number(booking.adults) : null,
        children: booking.children ? Number(booking.children) : null,
        infants: booking.infants ? Number(booking.infants) : null,
        seniors: booking.seniors ? Number(booking.seniors) : null,
        duration: booking.duration ? Number(booking.duration) : null,
        gross_price: booking.gross_price ? Number(booking.gross_price) : null,
        net_price: booking.net_price ? Number(booking.net_price) : null,
        gross_before_discount: booking.gross_before_discount ? Number(booking.gross_before_discount) : null,
        profit: booking.profit ? Number(booking.profit) : null,
        total_payment: booking.total_payment ? Number(booking.total_payment) : null,
        passegners: booking.passegners ? Number(booking.passegners) : null,
      };
    },
    fetchForwardCommission: async () => {
      return await repo.fetchForwardCommission();
    },
  };
};
