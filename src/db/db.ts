import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { schema } from '../schema';
config({ path: '.env' }); // or .env.local

const database_url = process.env.ENVIRONMENT === 'DEV' || process.env.ENVIRONMENT === 'LOCAL' ? process.env.DATABASE_URL_DEV : process.env.DATABASE_URL_PROD;
const sql = neon(database_url as string);
export const db = drizzle(sql, { schema });
