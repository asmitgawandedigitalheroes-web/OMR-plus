import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/auth-server';

// Fallback: called from the success page to ensure the subscription
// row is written even if the webhook hasn't fired yet.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // Must be authenticated — prevents unauthenticated abuse of Stripe API
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.mode !== 'subscription' || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Session is not a paid subscription' }, { status: 400 });
    }

    const userId = session.metadata?.supabase_user_id;
    const planName = session.metadata?.plan_name ?? 'Unknown';
    const stripeSubId = session.subscription as string;

    if (!userId || !stripeSubId) {
      return NextResponse.json({ error: 'Missing metadata in session' }, { status: 400 });
    }

    // Verify the session belongs to the authenticated user
    if (userId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if subscription row already exists and is active
    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ status: 'already_active' });
    }

    // Retrieve subscription details from Stripe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = await stripe.subscriptions.retrieve(stripeSubId) as any;
    const priceAmount = sub.items?.data?.[0]?.price?.unit_amount
      ? sub.items.data[0].price.unit_amount / 100
      : 0;
    const periodEnd = sub.current_period_end as number | undefined;
    const startDate = sub.start_date as number | undefined;

    const expiresAt = periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const startedAt = startDate
      ? new Date(startDate * 1000).toISOString()
      : new Date().toISOString();

    // Check if ANY row exists for this user
    const { data: anyRow } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (anyRow) {
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          plan_name: planName,
          status: 'active',
          price_sar: priceAmount,
          stripe_subscription_id: stripeSubId,
          started_at: startedAt,
          expires_at: expiresAt,
          cancel_at_period_end: false,
          cancelled_at: null,
        })
        .eq('id', anyRow.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_name: planName,
          status: 'active',
          price_sar: priceAmount,
          stripe_subscription_id: stripeSubId,
          started_at: startedAt,
          expires_at: expiresAt,
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ status: 'activated' });
  } catch (err) {
    console.error('[verify-session] error:', err);
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 });
  }
}
