/**
 * Railway PostgreSQL Database Client
 * Replaces Supabase with direct PostgreSQL connection
 */

import type { Pool, PoolClient } from 'pg';

// Lazy load pg only on server side
let pg: typeof import('pg') | null = null;
let pool: Pool | null = null;

const getPool = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Database client can only be used on server side');
  }
  
  if (!pool) {
    if (!pg) {
      pg = require('pg');
    }
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  
  return pool;
};

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Database query helper with automatic connection management
export async function query<T = any>(text: string, params?: any[]): Promise<{ data: T[] | null; error: any }> {
  if (typeof window !== 'undefined') {
    return { data: null, error: new Error('Database queries can only be run on server side') };
  }

  let client: PoolClient | null = null;
  
  try {
    const pool = getPool();
    client = await pool.connect();
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

// Supabase-compatible query builder
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

  // Execute SELECT query
  async execute(): Promise<{ data: T[] | null; error: any }> {
    let sql = `SELECT ${this.selectFields} FROM ${this.tableName}`;
    
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    
    if (this.orderByClause) {
      sql += ` ${this.orderByClause}`;
    }
    
    if (this.limitValue) {
      sql += ` LIMIT ${this.limitValue}`;
    }

    return query<T>(sql, this.queryParams);
  }

  // Get single record
  async single(): Promise<{ data: T | null; error: any }> {
    const result = await this.limit(1).execute();
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { 
      data: result.data && result.data.length > 0 ? result.data[0] : null, 
      error: null 
    };
  }
}

// Supabase-compatible database interface
export const db = {
  from<T = any>(table: string) {
    return {
      select: (fields?: string) => new QueryBuilder<T>(table).select(fields),
      
      insert: async (data: any) => {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        
        const sql = `
          INSERT INTO ${table} (${keys.join(', ')}) 
          VALUES (${placeholders}) 
          RETURNING *
        `;
        
        const result = await query(sql, values);
        return {
          data: result.data?.[0] || null,
          error: result.error
        };
      },
      
      update: (data: any) => ({
        eq: async (column: string, value: any) => {
          const keys = Object.keys(data);
          const values = Object.values(data);
          const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
          
          const sql = `
            UPDATE ${table} 
            SET ${setClause} 
            WHERE ${column} = $${keys.length + 1} 
            RETURNING *
          `;
          
          const result = await query(sql, [...values, value]);
          return {
            data: result.data || null,
            error: result.error
          };
        }
      }),
      
      delete: () => ({
        eq: async (column: string, value: any) => {
          const sql = `DELETE FROM ${table} WHERE ${column} = $1 RETURNING *`;
          const result = await query(sql, [value]);
          return {
            data: result.data || null,
            error: result.error
          };
        }
      })
    };
  }
};

// Connection health check
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as health');
    return result.data !== null;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Close connection pool (for cleanup)
export async function closePool(): Promise<void> {
  await pool.end();
}