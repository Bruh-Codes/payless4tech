/**
 * Server-only database module using dynamic import.
 * ONLY import this in files under app/api/ (API routes).
 */

let pool: any = null;

async function getPool() {
  if (!pool) {
    const pg = await import(/* webpackIgnore: true */ 'pg');
    pool = new pg.default.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<{ data: T[] | null; error: any }> {
  let client: any = null;
  try {
    const p = await getPool();
    client = await p.connect();
    const result = await client.query(text, params);
    return { data: result.rows, error: null };
  } catch (error) {
    console.error('Database query error:', error);
    return { data: null, error };
  } finally {
    if (client) client.release();
  }
}
