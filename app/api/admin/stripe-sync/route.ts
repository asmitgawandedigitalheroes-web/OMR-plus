import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { requireAdmin } from '@/lib/auth-server';

const CreateSchema = z.object({
  name: z.string().min(1).max(100),
  price_sar: z.number().min(0).max(100000),
  description: z.string().max(500).optional(),
});

const DeleteSchema = z.object({
  stripe_price_id: z.string().min(1),
});

// POST — create Stripe product + monthly recurring price
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, price_sar, description } = parsed.data;

    const product = await stripe.products.create({
      name,
      description: description || undefined,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price_sar * 100),
      currency: 'aed',
      recurring: { interval: 'month' },
    });

    return NextResponse.json({ price_id: price.id, product_id: product.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — archive a Stripe price (and its parent product)
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const parsed = DeleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: true }); // no-op if missing
    }

    const { stripe_price_id } = parsed.data;
    const price = await stripe.prices.retrieve(stripe_price_id);
    await stripe.prices.update(stripe_price_id, { active: false });

    if (price.product && typeof price.product === 'string') {
      await stripe.products.update(price.product, { active: false });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Stripe archive error:', message);
    return NextResponse.json({ success: true, warning: message });
  }
}
