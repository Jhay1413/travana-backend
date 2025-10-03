import { db } from '../src/db/db';
import { transaction } from '../src/schema/transactions-schema';
import { quote } from '../src/schema/quote-schema';
import { booking } from '../src/schema/booking-schema';
import { enquiry_table } from '../src/schema/enquiry-schema';
import { eq, isNull, sql } from 'drizzle-orm';

async function updatePackageTypes() {
  try {
    console.log('Starting package type update...');

    // First, let's check if the columns exist
    console.log('Checking table structures...');
    
    try {
      const quoteCheck = await db.select().from(quote).limit(1);
      console.log('Quote table accessible');
    } catch (error) {
      console.error('Error accessing quote table:', error);
    }

    try {
      const bookingCheck = await db.select().from(booking).limit(1);
      console.log('Booking table accessible');
    } catch (error) {
      console.error('Error accessing booking table:', error);
    }

    try {
      const enquiryCheck = await db.select().from(enquiry_table).limit(1);
      console.log('Enquiry table accessible');
    } catch (error) {
      console.error('Error accessing enquiry table:', error);
    }

    // Update quotes
    console.log('Updating quotes...');
    const quoteResult = await db
      .update(quote)
      .set({
        holiday_type_id: sql`(
          SELECT t.holiday_type_id 
          FROM transaction t 
          WHERE t.id = quote_table.transaction_id
        )`
      })
      .where(isNull(quote.holiday_type_id));

    console.log(`Updated ${quoteResult.rowCount} quotes`);

    // Update bookings
    console.log('Updating bookings...');
    const bookingResult = await db
      .update(booking)
      .set({
        holiday_type_id: sql`(
          SELECT t.holiday_type_id 
          FROM transaction t 
          WHERE t.id = booking_table.transaction_id
        )`
      })
      .where(isNull(booking.holiday_type_id));

    console.log(`Updated ${bookingResult.rowCount} bookings`);

    // Update enquiries
    console.log('Updating enquiries...');
    const enquiryResult = await db
      .update(enquiry_table)
      .set({
        holiday_type_id: sql`(
          SELECT t.holiday_type_id 
          FROM transaction t 
          WHERE t.id = enquiry_table.transaction_id
        )`
      })
      .where(isNull(enquiry_table.holiday_type_id));

    console.log(`Updated ${enquiryResult.rowCount} enquiries`);

    console.log('Package type update completed successfully!');
  } catch (error) {
    console.error('Error updating package types:', error);
    throw error;
  }
}

// Run the script
updatePackageTypes()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 