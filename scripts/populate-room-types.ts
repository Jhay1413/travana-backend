import { db } from '../src/db/db';
import { room_type } from '../src/schema/transactions-schema';

const roomTypes = [
  'Standard Double',
  'Twin Room',
  'Deluxe Room',
  'Superior Room',
  'Garden View',
  'Pool View',
  'Partial Sea View',
  'Sea View',
  'King Room',
  'Junior Suite',
  'Suite',
  'Executive Suite',
  'Superior Suite',
  'Studio Apartment',
  'One Bedroom Apartment',
  'Two Bedroom Apartment'
];

async function populateRoomTypes() {
  try {
    
    for (const roomTypeName of roomTypes) {
      // Check if room type already exists
      const existing = await db.query.room_type.findFirst({
        where: (room_type, { eq }) => eq(room_type.name, roomTypeName)
      });
      
      if (!existing) {
        await db.insert(room_type).values({
          name: roomTypeName
        });
      } else {
      }
    }
    
  } catch (error) {
    console.error('❌ Error populating room types:', error);
    throw error;
  }
}

// Run the script
populateRoomTypes()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 