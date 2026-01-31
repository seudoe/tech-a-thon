import pool from './db';

export async function runMigrations() {
  const client = await pool.connect();
  
  try {
    // Create public schema if it doesn't exist
    await client.query('CREATE SCHEMA IF NOT EXISTS public');
    
    // Set search path to public schema
    await client.query('SET search_path TO public');
    
    // Create migrations table to track what's been run
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // List of migrations to run
    const migrations = [
      {
        name: '001_create_users_table',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone_number VARCHAR(20) UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL CHECK (role IN ('farmer', 'buyer')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: '002_create_products_table',
        sql: `
          CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            quantity INTEGER NOT NULL,
            seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            price_single DECIMAL(10,2) NOT NULL,
            price_multiple DECIMAL(10,2),
            location VARCHAR(255),
            description TEXT,
            photos TEXT[], -- Array of photo URLs/paths
            status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      }
      // Add more migrations here as needed
    ];

    // Run each migration if it hasn't been run before
    for (const migration of migrations) {
      const result = await client.query(
        'SELECT * FROM migrations WHERE name = $1',
        [migration.name]
      );

      if (result.rows.length === 0) {
        console.log(`Running migration: ${migration.name}`);
        await client.query(migration.sql);
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migration.name]
        );
        console.log(`✅ Migration ${migration.name} completed`);
      } else {
        console.log(`⏭️  Migration ${migration.name} already run`);
      }
    }

  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    client.release();
  }
}