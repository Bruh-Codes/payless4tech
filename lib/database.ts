/**
 * Railway PostgreSQL Database Client
 * Server-side only — never import this in client components!
 * Client components should use fetch('/api/...') instead.
 */

// Lazy load pg only on server side
let pool: any = null;

function getPool() {
  if (typeof window !== 'undefined') {
    throw new Error('Database client can only be used on server side');
  }
  
  if (!pool) {
    const { Pool } = require('pg');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  
  return pool;
}

// Database query helper
export async function query<T = any>(text: string, params?: any[]): Promise<{ data: T[] | null; error: any }> {
  if (typeof window !== 'undefined') {
    return { data: null, error: new Error('Database queries can only be run on server side') };
  }

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
    if (client) {
      client.release();
    }
  }
}

// Supabase-compatible query builder (server-side only)
export class QueryBuilder<T> {
  private tableName: string;
  private selectFields = '*';
  private whereConditions: string[] = [];
  private orderByClause = '';
  private limitValue?: number;
  private queryParams: any[] = [];
  private paramIndex = 1;

  constructor(table: string) {
    this.tableName = table;
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.whereConditions.push(`${column} = $${this.paramIndex}`);
    this.queryParams.push(value);
    this.paramIndex++;
    return this;
  }

  neq(column: string, value: any) {
    this.whereConditions.push(`${column} != $${this.paramIndex}`);
    this.queryParams.push(value);
    this.paramIndex++;
    return this;
  }

  ilike(column: string, pattern: string) {
    this.whereConditions.push(`${column} ILIKE $${this.paramIndex}`);
    this.queryParams.push(pattern);
    this.paramIndex++;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const direction = options?.ascending === false ? 'DESC' : 'ASC';
    this.orderByClause = `ORDER BY ${column} ${direction}`;
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  async execute(): Promise<{ data: T[] | null; error: any }> {
    let sql = `SELECT ${this.selectFields} FROM ${this.tableName}`;
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    if (this.orderByClause) sql += ` ${this.orderByClause}`;
    if (this.limitValue) sql += ` LIMIT ${this.limitValue}`;
    return query<T>(sql, this.queryParams);
  }

  async single(): Promise<{ data: T | null; error: any }> {
    const result = await this.limit(1).execute();
    if (result.error) return { data: null, error: result.error };
    return { data: result.data && result.data.length > 0 ? result.data[0] : null, error: null };
  }
}

// Supabase-compatible interface (server-side only)
export const db = {
  from<T = any>(table: string) {
    return {
      select: (fields?: string) => new QueryBuilder<T>(table).select(fields),
      insert: async (data: any) => {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const result = await query(sql, values);
        return { data: result.data?.[0] || null, error: result.error };
      },
      update: (data: any) => ({
        eq: async (column: string, value: any) => {
          const keys = Object.keys(data);
          const values = Object.values(data);
          const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
          const sql = `UPDATE ${table} SET ${setClause} WHERE ${column} = $${keys.length + 1} RETURNING *`;
          const result = await query(sql, [...values, value]);
          return { data: result.data || null, error: result.error };
        }
      }),
      delete: () => ({
        eq: async (column: string, value: any) => {
          const sql = `DELETE FROM ${table} WHERE ${column} = $1 RETURNING *`;
          const result = await query(sql, [value]);
          return { data: result.data || null, error: result.error };
        }
      })
    };
  }
};

export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as health');
    return result.data !== null;
  } catch { return false; }
}

export async function closePool(): Promise<void> {
  if (pool) await pool.end();
}