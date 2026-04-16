import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { productId, userId, userEmail } = await req.json() as {
      productId: string;
      userId: string;
      userEmail: string;
    };

    if (!productId || !userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name, price_sar, type, is_active')
      .eq('id', productId)
      .maybeSingle();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!product.is_active) {
      return NextResponse.json({ error: 'Product is not available' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: { name: product.name },
            unit_amount: Math.round(product.price_sar * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/checkout/success?type=product&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/marketplace`,
      metadata: {
        supabase_user_id: userId,
        product_id: product.id,
        product_type: product.type ?? 'supplement',
        product_price: String(product.price_sar),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[create-product-checkout] error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
