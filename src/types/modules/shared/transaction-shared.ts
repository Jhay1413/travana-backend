import { z } from 'zod';
import { bookingCruiseQuerySchema, bookingHotTubQuerySchema, bookingQuerySchema } from '../booking';
import { quote_mutate_schema } from '../transaction';
import { quoteCruiseQuerySchema, quoteHotTubQuerySchema, quotePackageHolidayQuerySchema } from '../quote';

export const sharedHolidaysSchema = z.lazy(() =>
  bookingQuerySchema
    .extend({
      quote_type: z.string().optional(),
      quote_ref: z.string().optional(),
      quote_status: z.string().optional(),
      hays_ref: z.string().optional(),
      supplier_ref: z.string().optional(),
    })
    .or(quotePackageHolidayQuerySchema)
);

export const sharedHotTubSchema = z.lazy(() =>
  bookingHotTubQuerySchema
    .extend({
      quote_type: z.string().optional(),
      quote_ref: z.string().optional(),
      quote_status: z.string().optional(),
      hays_ref: z.string().optional(),
      supplier_ref: z.string().optional(),
    })
    .or(quoteHotTubQuerySchema)
);

export const sharedCruiseSchema = z.lazy(() =>
  bookingCruiseQuerySchema
    .extend({
      quote_type: z.string().optional(),
      quote_ref: z.string().optional(),
      quote_status: z.string().optional(),
      hays_ref: z.string().optional(),
      supplier_ref: z.string().optional(),
    })
    .or(quoteCruiseQuerySchema)
);

export const sharedBookingTypes = z.lazy(() =>
  bookingQuerySchema
    .extend({ quote_type: z.string().optional(), quote_status: z.string().optional() })
    .or(bookingHotTubQuerySchema)
    .or(bookingCruiseQuerySchema)
);

export const sharedMutateSchema = z.lazy(() =>
  quote_mutate_schema
    .omit({
      is_future_deal: true,
      future_deal_date: true,
      date_expiry: true,
    })
    .extend({ hays_ref: z.string().optional(), supplier_ref: z.string().optional(), booking_cruise_extra: z.array(z.string()).optional() })
);
