/**
 * POST /api/auth/reset-password
 *
 * Verifies our custom reset token and updates the user's password
 * via Supabase Admin API (service role). No Supabase Auth session required.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isPasswordValid } from '@/lib/password';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  let token = '';
  let password = '';
  try {
    const body = await req.json();
    token = (body.token ?? '').trim();
    password = body.password ?? '';
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (!token || !password) {
    return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 });
  }

  if (!isPasswordValid(password)) {
    return NextResponse.json({ error: 'Password does not meet the requirements.' }, { status: 400 });
  }

  const db = getServiceClient();

  // Fetch the token record
  const { data: record, error: fetchError } = await db
    .from('password_reset_tokens')
    .select('id, user_id, expires_at, used')
    .eq('token', token)
    .maybeSingle();

  if (fetchError || !record) {
    return NextResponse.json(
      { error: 'Invalid or expired reset link. Please request a new one.' },
      { status: 400 }
    );
  }

  if (record.used) {
    return NextResponse.json(
      { error: 'This reset link has already been used. Please request a new one.' },
      { status: 400 }
    );
  }

  if (new Date(record.expires_at) < new Date()) {
    return NextResponse.json(
      { error: 'This reset link has expired (1-hour limit). Please request a new one.' },
      { status: 400 }
    );
  }

  // Update the user's password via Supabase Admin API
  const { error: updateError } = await db.auth.admin.updateUserById(record.user_id, { password });

  if (updateError) {
    console.error('[reset-password] Admin update failed:', updateError.message);
    return NextResponse.json({ error: 'Failed to update password. Please try again.' }, { status: 500 });
  }

  // Mark token as used immediately after successful update
  await db.from('password_reset_tokens').update({ used: true }).eq('id', record.id);

  return NextResponse.json({ success: true });
}
