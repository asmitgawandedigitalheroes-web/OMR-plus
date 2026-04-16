import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Public route — returns all published pricing plans ordered by sort_order.
// Used by the home page PricingSection and the /pricing page.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface PublicPlan {
  id: string;
  name: string;
  description: string | null;
  tagline: string | null;
  cta_text: string | null;
  price_sar: number;
  features: string[];
  is_featured: boolean;
  sort_order: number;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .select('id, name, description, tagline, cta_text, price_sar, features, is_featured, sort_order')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[pricing-plans] DB error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plans: data ?? [] }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[pricing-plans] error:', err);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}
