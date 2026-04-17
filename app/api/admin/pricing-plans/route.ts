import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { requireAdmin } from '@/lib/auth-server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PlanBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  name_ar: z.string().max(100).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  description_ar: z.string().max(500).nullable().optional(),
  tagline: z.string().max(200).nullable().optional(),
  tagline_ar: z.string().max(200).nullable().optional(),
  cta_text: z.string().max(50).nullable().optional(),
  cta_text_ar: z.string().max(50).nullable().optional(),
  price_sar: z.number().min(0).max(100000).optional(),
  billing_type: z.enum(['monthly', 'one_time']).optional(),
  stripe_price_id: z.string().nullable().optional(),
  features: z.array(z.string()).nullable().optional(),
  features_ar: z.array(z.string()).nullable().optional(),
  is_published: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});

// GET — all plans (including unpublished) for admin panel
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { data, error } = await supabaseAdmin
    .from('pricing_plans')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plans: data ?? [] });
}

// POST — create new plan
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const parsed = PlanBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .insert(parsed.data)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ plan: data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT — update existing plan
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const { id, ...rest } = await req.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid id' }, { status: 400 });
    }

    const parsed = PlanBodySchema.safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ plan: data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — archive on Stripe then remove from DB
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const { id } = await req.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid id' }, { status: 400 });
    }

    // Fetch the plan to get its Stripe price ID
    const { data: plan } = await supabaseAdmin
      .from('pricing_plans')
      .select('stripe_price_id')
      .eq('id', id)
      .single();

    // Archive on Stripe if a price ID exists
    if (plan?.stripe_price_id) {
      try {
        const price = await stripe.prices.retrieve(plan.stripe_price_id);
        await stripe.prices.update(plan.stripe_price_id, { active: false });
        if (price.product && typeof price.product === 'string') {
          await stripe.products.update(price.product, { active: false });
        }
      } catch (stripeErr) {
        console.error('Stripe archive failed:', stripeErr);
      }
    }

    const { error } = await supabaseAdmin
      .from('pricing_plans')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
