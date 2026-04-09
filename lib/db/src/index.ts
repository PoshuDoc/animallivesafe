import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

function parseConnectionString(url: string): pg.PoolConfig {
  try {
    const parsed = new URL(url);
    const isSupabasePooler = parsed.hostname.includes("pooler.supabase.com");
    const sslConfig = isSupabasePooler ? { rejectUnauthorized: false } : undefined;
    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 5432,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ""),
      ssl: sslConfig,
      max: isSupabasePooler ? 1 : 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    };
  } catch {
    return { connectionString: url };
  }
}

export const pool = new Pool(parseConnectionString(process.env.DATABASE_URL));

export const db = drizzle(pool, { schema });

export * from "./schema";
