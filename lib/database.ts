/**
 * Safe database interface for client and server components.
 * Does NOT import pg — all database access goes through API routes.
 * 
 * For actual database queries in API routes, use: import { query } from '@/lib/db-server'
 */

// Supabase-compatible mock for any remaining legacy imports
export const db = {
  from(table: string) {
    return {
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
            single: () => Promise.resolve({ data: null, error: null }),
          }),
          single: () => Promise.resolve({ data: null, error: null }),
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
        limit: () => Promise.resolve({ data: [], error: null }),
        neq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
        ilike: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
    };
  }
};

// Legacy export for any remaining imports
export async function query(text: string, params?: any[]) {
  console.warn('Direct database query called from client - use API routes instead');
  return { data: null, error: new Error('Use API routes for database access') };
}

export async function healthCheck() { return false; }
export async function closePool() {}
