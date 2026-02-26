/**
 * Server-only database module.
 * ONLY import this in files under app/api/ (API routes).
 */

let pool: any = null;

function getPool() {
  if (!pool) {
    // Use eval to prevent webpack from statically analyzing this require
    const pg = eval('require')('pg');
    pool = new pg.Pool({
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
    const p = getPool();
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
