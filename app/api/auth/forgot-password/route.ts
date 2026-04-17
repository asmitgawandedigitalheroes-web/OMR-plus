/**
 * POST /api/auth/forgot-password
 *
 * Custom password reset request — completely independent of Supabase Auth emails.
 * Generates a secure token, stores it in password_reset_tokens table,
 * sends a branded reset email via our Nodemailer/Resend setup.
 *
 * Always returns { success: true } — never reveals whether email exists.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  let email = '';
  try {
    const body = await req.json();
    email = (body.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ success: true }); // silent
  }

  // Validate format — still return success to not reveal anything
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ success: true });
  }

  const db = getServiceClient();

  // Look up user by email in our profiles table
  const { data: profile } = await db
    .from('profiles')
    .select('id, full_name')
    .eq('email', email)
    .maybeSingle();

  if (!profile) {
    // Silent success — never reveal whether email exists in the system
    return NextResponse.json({ success: true });
  }

  // Delete any existing unused tokens for this user (clean slate)
  await db
    .from('password_reset_tokens')
    .delete()
    .eq('user_id', profile.id)
    .eq('used', false);

  // Generate a cryptographically secure token (64 hex chars = 256 bits)
  const token = randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  const { error: insertError } = await db.from('password_reset_tokens').insert({
    user_id: profile.id,
    email,
    token,
    expires_at,
  });

  if (insertError) {
    console.error('[forgot-password] Failed to insert token:', insertError.message);
    return NextResponse.json({ success: true }); // silent fail
  }

  // Build the reset URL — points to our reset-password page with the token in query
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://omrplus.com').replace(/\/$/, '');
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  // Send branded email via our Nodemailer/Resend setup
  await sendPasswordResetEmail({
    to: email,
    resetUrl,
    name: profile.full_name ?? undefined,
  });

  return NextResponse.json({ success: true });
}
