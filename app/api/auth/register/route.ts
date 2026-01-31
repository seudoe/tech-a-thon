import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone_number, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    if (!['farmer', 'buyer'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either farmer or buyer' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1 OR phone_number = $2',
        [email, phone_number]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'User with this email or phone number already exists' },
          { status: 409 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const result = await client.query(
        'INSERT INTO users (name, email, phone_number, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone_number, role, created_at',
        [name, email, phone_number, hashedPassword, role]
      );

      const newUser = result.rows[0];

      return NextResponse.json({
        message: 'User registered successfully',
        user: newUser
      }, { status: 201 });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}