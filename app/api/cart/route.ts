import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch user's cart
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's cart
    const { data: cart, error } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', parseInt(userId))
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Cart fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cart' },
        { status: 500 }
      );
    }

    // If no cart exists, return empty cart
    if (!cart) {
      return NextResponse.json({
        cart: {
          user_id: parseInt(userId),
          product_ids: []
        }
      });
    }

    // Get product details for items in cart
    if (cart.product_ids && cart.product_ids.length > 0) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          users!products_seller_id_fkey (
            name,
            phone_number
          )
        `)
        .in('id', cart.product_ids)
        .eq('status', 'active');

      if (productsError) {
        console.error('Products fetch error:', productsError);
      } else {
        // Transform products data
        const transformedProducts = products?.map(product => ({
          ...product,
          seller_name: product.users?.name,
          seller_phone: product.users?.phone_number,
          photos: product.photos || []
        })) || [];

        return NextResponse.json({
          cart: {
            ...cart,
            products: transformedProducts
          }
        });
      }
    }

    return NextResponse.json({
      cart: {
        ...cart,
        products: []
      }
    });

  } catch (error) {
    console.error('Cart GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { userId, productId } = await request.json();

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }

    // Check if cart exists for user
    const { data: existingCart, error: fetchError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Cart fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch cart' },
        { status: 500 }
      );
    }

    let updatedProductIds = [];

    if (existingCart) {
      // Cart exists, add product if not already in cart
      updatedProductIds = existingCart.product_ids || [];
      if (!updatedProductIds.includes(productId)) {
        updatedProductIds.push(productId);
      } else {
        return NextResponse.json(
          { message: 'Product already in cart' },
          { status: 200 }
        );
      }

      // Update existing cart
      const { data: updatedCart, error: updateError } = await supabase
        .from('cart')
        .update({ product_ids: updatedProductIds })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Cart update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update cart' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        cart: updatedCart,
        message: 'Product added to cart'
      });

    } else {
      // Create new cart
      const { data: newCart, error: createError } = await supabase
        .from('cart')
        .insert({
          user_id: userId,
          product_ids: [productId]
        })
        .select()
        .single();

      if (createError) {
        console.error('Cart creation error:', createError);
        return NextResponse.json(
          { error: 'Failed to create cart' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        cart: newCart,
        message: 'Product added to cart'
      });
    }

  } catch (error) {
    console.error('Cart POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const { userId, productId } = await request.json();

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }

    // Get user's cart
    const { data: cart, error: fetchError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Cart fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Remove product from cart
    const updatedProductIds = (cart.product_ids || []).filter(id => id !== productId);

    const { data: updatedCart, error: updateError } = await supabase
      .from('cart')
      .update({ product_ids: updatedProductIds })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Cart update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update cart' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cart: updatedCart,
      message: 'Product removed from cart'
    });

  } catch (error) {
    console.error('Cart DELETE API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}