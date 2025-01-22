import dotenv from 'dotenv'; dotenv.config();
import { Client } from 'pg';
import pg from 'pg';

export interface PostgresContext {
  db: Client;
}

/**
 * AWS RDS Postgres database client.
 */
export const rds = new pg.Client({
  user: process.env.NODE_DB_USER!,
  password: process.env.NODE_DB_PASSWORD!,
  database: process.env.NODE_DB_DATABASE!,
  host: process.env.NODE_DB_HOST!,
  port: parseInt(process.env.NODE_DB_PORT!),
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Must be called before any database operations are performed.
 */
export async function initializeDB() {
  try {
    console.log("Initializing database connection to AWS RDS Postgres.");
    await rds.connect();
    return rds;
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
}
