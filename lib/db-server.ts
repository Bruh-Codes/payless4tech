/**
 * Database access via Bizhub API — no pg dependency needed.
 * Works on Vercel without any Node.js module issues.
 */

const BIZHUB_URL = process.env.BIZHUB_API_URL || 'https://bizhub-production-0622.up.railway.app';

export async function query<T = any>(text: string, params?: any[]): Promise<{ data: T[] | null; error: any }> {
  try {
    const response = await fetch(`${BIZHUB_URL}/api/v1/db-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.BIZHUB_DB_KEY || 'p4t_live_sk_xyz123abc456'
      },
      body: JSON.stringify({ sql: text, params })
    });

    if (!response.ok) {
      throw new Error(`DB proxy error: ${response.status}`);
    }

    const result = await response.json();
    return { data: result.data || result.rows || [], error: null };
  } catch (error: any) {
    console.error('Database query error:', error);
    return { data: null, error };
  }
}
