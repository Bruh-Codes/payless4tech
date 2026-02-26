import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-server';

export const dynamic = 'force-dynamic';

// GET /api/products - fetch products (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let sql = `SELECT * FROM products`;
    const params: any[] = [];
    let paramIndex = 1;
    const conditions: string[] = [];

    if (status !== 'all') {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (category) {
      conditions.push(`category_id = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (search) {
      conditions.push(`name ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY updated_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await query(sql, params);

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/products - import a product from Bizhub
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const sql = `
      INSERT INTO products (
        name, slug, description, short_description, price, compare_at_price,
        currency, stock_quantity, stock_status, featured_image, gallery_images,
        category_id, status, bizhub_asset_id, last_synced_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW(), NOW()
      ) RETURNING *
    `;

    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const params = [
      body.name,
      slug,
      body.description || '',
      body.short_description || '',
      body.price || 0,
      body.compare_at_price || null,
      body.currency || 'GHS',
      body.stock_quantity || 0,
      body.stock_quantity > 0 ? 'in_stock' : 'out_of_stock',
      body.featured_image || null,
      JSON.stringify(body.gallery_images || []),
      body.category_id || 1,
      body.status || 'draft',
      body.bizhub_asset_id || null
    ];

    const result = await query(sql, params);

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data?.[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH - update product
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

    const sql = `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;
    values.push(id);

    const result = await query(sql, values);

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data?.[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}