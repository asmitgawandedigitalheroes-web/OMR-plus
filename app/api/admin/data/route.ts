/**
 * GET /api/admin/data
 *
 * Returns all profiles, subscriptions, and trainer_client_assignments
 * using the service-role client so RLS is bypassed.
 * Only accessible by authenticated users whose role is 'admin'.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const db = createServerClient();

    const [profilesRes, subsRes, assignmentsRes] = await Promise.all([
      db
        .from('profiles')
        .select('id, full_name, email, role, onboarding_completed, created_at, phone, bio, specialization')
        .order('created_at', { ascending: false }),
      db
        .from('subscriptions')
        .select('id, user_id, plan_name, status, price_sar, started_at, expires_at')
        .order('created_at', { ascending: false }),
      db.from('trainer_client_assignments').select('client_id, trainer_id'),
    ]);

    if (profilesRes.error) {
      console.error('[admin/data] profiles error:', profilesRes.error.message);
    }

    return NextResponse.json({
      profiles: profilesRes.data ?? [],
      subscriptions: subsRes.data ?? [],
      assignments: assignmentsRes.data ?? [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
