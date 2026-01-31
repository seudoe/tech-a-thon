import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
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

    // Check if identifier is email or phone
    const isEmail = identifier.includes('@');
    
    let query = supabase.from('users').select('*');
    
    if (isEmail) {
      query = query.eq('email', identifier);
    } else {
      query = query.eq('phone_number', identifier);
    }
    
    const { data: users, error } = await query.single();
    
    if (error || !users) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, users.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = users;

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}