#!/usr/bin/env node

/**
 * Populate Railway Database from Bizhub Inventory
 * Run this script to bulk import products from Bizhub into the new PostgreSQL database
 */

const { Pool } = require('pg');
const https = require('https');

// Configuration
const DATABASE_URL = process.env.DATABASE_URL;
const BIZHUB_API_URL = process.env.NEXT_PUBLIC_BIZHUB_API_URL || 'https://bizhub-production-0622.up.railway.app/api/v1/storefront';
const BIZHUB_API_KEY = process.env.NEXT_PUBLIC_BIZHUB_API_KEY;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable not set');
  console.log('Please set your Railway PostgreSQL connection string:');
  console.log('export DATABASE_URL="postgresql://username:password@host:port/database"');
  process.exit(1);
}

if (!BIZHUB_API_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_BIZHUB_API_KEY environment variable not set');
  process.exit(1);
}

// Database connection
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper function to make API requests
function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BIZHUB_API_URL);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'x-api-key': BIZHUB_API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function populateDatabase() {
  console.log('🚀 Starting Bizhub → Railway Database Population\n');
  console.log(`Database: ${DATABASE_URL.split('@')[1]}`);
  console.log(`Bizhub API: ${BIZHUB_API_URL}`);
  console.log('');

  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful\n');

    // Fetch products from Bizhub
    console.log('📥 Fetching products from Bizhub...');
    const response = await makeRequest('/products?limit=1000&inStock=true');
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error(`Bizhub API error: ${JSON.stringify(response.data)}`);
    }

    const products = response.data.data;
    console.log(`✅ Found ${products.length} products in Bizhub\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Import each product
    for (const product of products) {
      try {
        console.log(`📦 Processing: ${product.name}`);

        // Check if product already exists
        const existingQuery = 'SELECT id FROM products WHERE bizhub_id = $1';
        const existing = await pool.query(existingQuery, [product.id]);

        if (existing.rows.length > 0) {
          console.log(`   ⏭️  Skipped (already exists)`);
          skipped++;
          continue;
        }

        // Insert product
        const insertQuery = `
          INSERT INTO products (
            bizhub_id, name, description, price, original_price, currency,
            condition, category, make, model, asset_tag, bizhub_quantity,
            detailed_specs, status, image_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id
        `;

        const values = [
          product.id,
          product.name,
          product.description || null,
          product.price,
          product.price, // original_price same as current price initially
          product.currency || 'GHS',
          product.condition,
          product.category.toLowerCase(),
          product.make,
          product.model,
          product.asset_tag,
          product.quantity,
          JSON.stringify(product.specs),
          'draft', // Import as draft initially
          product.images && product.images.length > 0 ? product.images[0] : null
        ];

        const result = await pool.query(insertQuery, values);
        const newProductId = result.rows[0].id;

        // Insert additional images
        if (product.images && product.images.length > 1) {
          for (let i = 1; i < product.images.length; i++) {
            const imageQuery = `
              INSERT INTO product_images (product_id, image_url, display_order)
              VALUES ($1, $2, $3)
            `;
            await pool.query(imageQuery, [newProductId, product.images[i], i]);
          }
        }

        console.log(`   ✅ Imported successfully (ID: ${newProductId})`);
        imported++;

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        errors++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`✅ Imported: ${imported} products`);
    console.log(`⏭️  Skipped: ${skipped} products (already existed)`);
    console.log(`❌ Errors: ${errors} products`);
    console.log(`📈 Success Rate: ${Math.round((imported / (imported + errors)) * 100)}%`);

    if (imported > 0) {
      console.log('\n🎉 Products imported as DRAFTS. Next steps:');
      console.log('1. Go to /admin/products/manage to review imported products');
      console.log('2. Add photos and enhance descriptions');
      console.log('3. Change status from "draft" to "active" to publish');
      console.log('4. Products will then appear on your website!');
    }

  } catch (error) {
    console.error('\n💥 Fatal Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the population script
populateDatabase().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});