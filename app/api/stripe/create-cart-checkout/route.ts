import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CartItem {
  productId: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const { items, userId, userEmail } = await req.json() as {
      items: CartItem[];
      userId: string;
      userEmail: string;
    };

    if (!items?.length || !userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate all products exist and are active
    const productIds = items.map(i => i.productId);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, price_sar, type, is_active, image_url')
      .in('id', productIds);

    if (productsError || !products?.length) {
      return NextResponse.json({ error: 'Could not fetch products' }, { status: 400 });
    }

    // Check all requested products are active
    const productMap = new Map(products.map(p => [p.id, p]));
    for (const item of items) {
      const p = productMap.get(item.productId);
      if (!p) return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 });
      if (!p.is_active) return NextResponse.json({ error: `Product "${p.name}" is not available` }, { status: 400 });
    }

    // Calculate total
    const totalSar = items.reduce((sum, item) => {
      const p = productMap.get(item.productId)!;
      return sum + p.price_sar * item.quantity;
    }, 0);

    // Create a pending order in DB before Stripe redirect
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        total_sar: totalSar,
        status: 'pending',
      })
      .select('id')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Could not create order' }, { status: 500 });
    }

    // Insert all order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_sar: productMap.get(item.productId)!.price_sar,
    }));

    await supabaseAdmin.from('order_items').insert(orderItems);

    // Build Stripe line_items
    const lineItems = items.map(item => {
      const p = productMap.get(item.productId)!;
      return {
        price_data: {
          currency: 'aed',
          product_data: {
            name: p.name,
            ...(p.image_url ? { images: [p.image_url] } : {}),
          },
          unit_amount: Math.round(p.price_sar * 100),
        },
        quantity: item.quantity,
      };
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: lineItems,
      success_url: `${appUrl}/checkout/success?type=product&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/marketplace`,
      metadata: {
        supabase_user_id: userId,
        order_id: order.id,           // webhook uses this to mark order complete
        checkout_type: 'cart',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[create-cart-checkout] error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
