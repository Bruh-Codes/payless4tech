#!/usr/bin/env node

/**
 * Setup Railway PostgreSQL Database Schema
 * Initializes the database with all required tables for the Railway migration
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:mjmziKnbfeqIlLLNDhIBbzTqRCnOFkSU@nozomi.proxy.rlwy.net:35930/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  console.log('🚀 Setting up Railway PostgreSQL Database\n');

  try {
    // Test connection
    console.log('🔍 Testing database connection...');
    const testResult = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Database connection successful');
    console.log(`   Time: ${testResult.rows[0].current_time}`);
    console.log(`   PostgreSQL: ${testResult.rows[0].postgres_version.split(' ')[0]} ${testResult.rows[0].postgres_version.split(' ')[1]}\n`);

    // Read and execute schema
    console.log('📋 Setting up database schema...');
    const schemaPath = path.join(__dirname, '..', 'railway', 'setup-database.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema in a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Split schema into individual statements and execute
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement) {
          console.log(`   Executing statement ${i + 1}/${statements.length}...`);
          await client.query(statement);
        }
      }
      
      await client.query('COMMIT');
      console.log('✅ Database schema setup complete\n');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    // Verify tables were created
    console.log('🔍 Verifying table creation...');
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    const tables = tablesResult.rows.map(row => row.tablename);
    console.log('✅ Tables created:');
    tables.forEach(table => console.log(`   - ${table}`));

    console.log('\n🎉 Railway PostgreSQL database setup complete!');
    console.log('📍 Database ready at:', DATABASE_URL.split('@')[1]);
    
    console.log('\n🔑 Next steps:');
    console.log('1. Deploy updated website code');
    console.log('2. Create initial admin user');
    console.log('3. Import products from Bizhub');

  } catch (error) {
    console.error('\n💥 Database setup failed:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});