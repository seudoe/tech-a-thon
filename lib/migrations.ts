import pool from './db';

export async function runMigrations() {
  const client = await pool.connect();
  
  try {
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
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: '002_create_posts_table',
        sql: `
          CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            user_id INTEGER REFERENCES users(id),
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