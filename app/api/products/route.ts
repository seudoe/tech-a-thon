import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('seller_id');
    const category = searchParams.get('category');

    const client = await pool.connect();
    
    try {
      let query = `
        SELECT p.*, u.name as seller_name, u.phone_number as seller_phone 
        FROM products p 
        JOIN users u ON p.seller_id = u.id 
        WHERE p.status = 'active'
      `;
      const params: any[] = [];
      let paramCount = 0;

      if (sellerId) {
        paramCount++;
        query += ` AND p.seller_id = $${paramCount}`;
        params.push(sellerId);
      }

      if (category) {
        paramCount++;
        query += ` AND p.category = $${paramCount}`;
        params.push(category);
      }

      query += ' ORDER BY p.created_at DESC';

      const result = await client.query(query, params);

      return NextResponse.json({
        products: result.rows
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, category, quantity, seller_id, price_single, price_multiple, location, description } = await request.json();

    if (!name || !category || !quantity || !seller_id || !price_single) {
      return NextResponse.json(
        { error: 'Name, category, quantity, seller_id, and price_single are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'INSERT INTO products (name, category, quantity, seller_id, price_single, price_multiple, location, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [name, category, quantity, seller_id, price_single, price_multiple, location, description]
      );

      return NextResponse.json({
        message: 'Product created successfully',
        product: result.rows[0]
      }, { status: 201 });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}