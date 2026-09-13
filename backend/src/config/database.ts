import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';

// Determine SSL config based on environment, setting, or Supabase connection
const useSsl =
  env.DATABASE_SSL ||
  env.DATABASE_URL.includes('supabase.co') ||
  env.DATABASE_URL.includes('pooler.supabase.com') ||
  env.DATABASE_URL.includes('sslmode=require');

const sslConfig = useSsl ? { rejectUnauthorized: false } : false;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: sslConfig,
  min: env.DATABASE_POOL_MIN,
  max: env.DATABASE_POOL_MAX,
  connectionTimeoutMillis: env.DATABASE_TIMEOUT_MS,
  idleTimeoutMillis: 30000,
});

// Resilient pool error listener to prevent process crashing on idle client errors
pool.on('error', (err: Error) => {
  console.error('⚠️ [Database Pool Error]: Unexpected client error', err.message);
});

/**
 * Execute a single query with standard error handling
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (env.NODE_ENV === 'development' && duration > 200) {
      console.warn(`⚡ [Slow Query] (${duration}ms): ${text}`);
    }
    return res;
  } catch (error: any) {
    console.error('❌ [Database Query Error]:', {
      query: text,
      params,
      message: error.message,
      code: error.code,
    });
    throw error;
  }
}

/**
 * Helper to run code within an isolated database transaction
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Database health check function
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const res = await pool.query('SELECT 1 as healthy');
    return res.rows[0]?.healthy === 1;
  } catch (err: any) {
    console.error('❌ Database health check failed:', err.message);
    return false;
  }
}
