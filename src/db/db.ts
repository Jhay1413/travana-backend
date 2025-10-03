import { drizzle } from 'drizzle-orm/neon-serverless';
import { config } from 'dotenv';
import { schema } from '../schema';
config({ path: '.env' }); // or .env.local

const database_url = process.env.ENVIRONMENT === 'DEV' || process.env.ENVIRONMENT === 'LOCAL' ? process.env.DATABASE_URL_DEV : process.env.DATABASE_URL_PROD;
export const db = drizzle(database_url as string, { schema });
