import { sql } from 'drizzle-orm';
import { db } from '../src/db/db';
import { quote } from '../src/schema/quote-schema';
import { enquiry_table } from '../src/schema/enquiry-schema';

export const updateExpired = async () => {
  await db.update(quote).set({
    is_expired: sql`CASE WHEN ${quote.quote_status} = 'EXPIRED' THEN true ELSE false END`,
  });


  await db.update(enquiry_table).set({
    is_expired: sql`CASE WHEN ${enquiry_table.status} = 'EXPIRED' THEN true ELSE false END`,
  });
  
};
