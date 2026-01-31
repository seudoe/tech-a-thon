import { NextResponse } from 'next/server';
import { runMigrations } from '@/lib/migrations';
import { seedDatabase } from '@/lib/seed';

export async function POST() {
  try {
    console.log('🚀 Starting database setup...');
    
    // Run migrations first
    await runMigrations();
    
    // Then seed the database
    await seedDatabase();
    
    return NextResponse.json({ 
      success: true,
      message: 'Database setup completed successfully!',
      note: 'Check server logs for user credentials'
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Database setup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}