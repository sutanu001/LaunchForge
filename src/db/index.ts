import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Cloud SQL PostgreSQL connection pool
// Uses DATABASE_URL or standard Cloud SQL Unix Socket / TCP config
const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres";

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
