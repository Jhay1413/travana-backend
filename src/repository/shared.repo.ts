import { quote } from '../schema/quote-schema';
import { db } from '../db/db';
import { AppError } from '../middleware/errorHandler';
import { package_type } from '../schema/transactions-schema';
import { eq } from 'drizzle-orm';
import { booking } from '../schema/booking-schema';

export type SharedRepo = {
  fetchHolidayTypeById: (id: string) => Promise<{ name: string; id: string }>;
  fetchHolidayTypeByBookingId: (booking_id: string) => Promise<string>;
};

export const sharedRepo: SharedRepo = {
  fetchHolidayTypeById: async (id) => {
    try {
      const response = await db.query.package_type.findFirst({
        where: eq(package_type.id, id),
        columns: {
          id: true,
          name: true,
        },
      });
      console.log(response)
      if (!response) throw new AppError('Holiday type not found', true, 404);
      return response;
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong fetching holiday type', true, 500);
    }
  },
  fetchHolidayTypeByBookingId: async (booking_id) => {
    const response = await db.query.booking.findFirst({
      where: eq(booking.id, booking_id),
      columns: {
        holiday_type_id: true,
       
      },
      with:{
        holiday_type: true,
      }
    });
    if (!response) throw new AppError('Booking not found', true, 404);
    return response?.holiday_type?.name;
  },
  
};
