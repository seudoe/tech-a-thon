import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/phone and password are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Check if identifier is email or phone
      const isEmail = identifier.includes('@');
      const query = isEmail 
        ? 'SELECT * FROM users WHERE email = $1'
        : 'SELECT * FROM users WHERE phone_number = $1';
      
      const result = await client.query(query, [identifier]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        );
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        );
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        message: 'Login successful',
        user: userWithoutPassword
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}