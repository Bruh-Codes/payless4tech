/**
 * Database Client - Compatibility layer
 * Drop-in replacement for Supabase client
 */

import { db } from './database';

// Export the database client as 'supabase' for backward compatibility
export const supabase = db;

// Re-export for convenience
export { db as database };