/**
 * POST /api/admin/subscription
 *
 * Admin-only endpoint for directly managing client subscriptions.
 * Bypasses Stripe checkout — useful for manual plan assignments,
 * offline payments, or correcting subscription state.
 *
 * Actions:
 *   assign  — create or replace a client's subscription record
 *   cancel  — mark subscription as cancelled (cancel_at_period_end = true)
 *   remove  — hard-delete the subscription record
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth-server';
import { createServerClient } from '@/lib/supabase';

const AssignSchema = z.object({
  action: z.literal('assign'),
  user_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  /** Duration in days from today. Defaults to 30. */
  duration_days: z.number().int().min(1).max(3650).optional().default(30),
  /** Override price (AED). Falls back to the plan's price_sar. */
  price_override: z.number().min(0).optional(),
});

const CancelSchema = z.object({
  action: z.literal('cancel'),
  user_id: z.string().uuid(),
  /** If true, keep access until expires_at. If false, expire immediately. */
  at_period_end: z.boolean().optional().default(true),
});

const RemoveSchema = z.object({
  action: z.literal('remove'),
  user_id: z.string().uuid(),
});

const BodySchema = z.discriminatedUnion('action', [AssignSchema, CancelSchema, RemoveSchema]);

export async function POST(req: NextRequest) {
  // ── Auth guard ─────────────────────────────────────────────────
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  // ── Parse body ─────────────────────────────────────────────────
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const db = createServerClient();

  try {
    // ── ASSIGN ────────────────────────────────────────────────────
    if (parsed.data.action === 'assign') {
      const { user_id, plan_id, duration_days, price_override } = parsed.data;

      // Fetch the plan
      const { data: plan, error: planErr } = await db
        .from('pricing_plans')
        .select('id, name, price_sar')
        .eq('id', plan_id)
        .single();

      if (planErr || !plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }

      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + duration_days);

      const subPayload = {
        user_id,
        plan_name: plan.name,
        status: 'active',
        price_sar: price_override ?? plan.price_sar,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        cancel_at_period_end: false,
        cancelled_at: null,
        stripe_subscription_id: null, // admin-assigned, no Stripe
      };

      // Delete any existing subscription for this user first
      await db.from('subscriptions').delete().eq('user_id', user_id);

      // Insert new subscription
      const { data: newSub, error: insertErr } = await db
        .from('subscriptions')
        .insert(subPayload)
        .select()
        .single();

      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, subscription: newSub });
    }

    // ── CANCEL ────────────────────────────────────────────────────
    if (parsed.data.action === 'cancel') {
      const { user_id, at_period_end } = parsed.data;

      if (at_period_end) {
        // Soft cancel — keep access until expires_at
        const { error } = await db
          .from('subscriptions')
          .update({
            cancel_at_period_end: true,
            cancelled_at: new Date().toISOString(),
          })
          .eq('user_id', user_id)
          .eq('status', 'active');

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      } else {
        // Hard cancel — expire immediately
        const { error } = await db
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancel_at_period_end: false,
            cancelled_at: new Date().toISOString(),
            expires_at: new Date().toISOString(),
          })
          .eq('user_id', user_id)
          .eq('status', 'active');

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // ── REMOVE ────────────────────────────────────────────────────
    if (parsed.data.action === 'remove') {
      const { user_id } = parsed.data;

      const { error } = await db
        .from('subscriptions')
        .delete()
        .eq('user_id', user_id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
