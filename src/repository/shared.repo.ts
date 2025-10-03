import { db } from '../db/db';
import { AppError } from '../middleware/errorHandler';
import { package_type } from '../schema/transactions-schema';
import { eq } from 'drizzle-orm';

export type SharedRepo = {
  fetchHolidayTypeById: (id: string) => Promise<{ name: string; id: string }>;
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

};
