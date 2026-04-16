/**
 * app/api/auth/email-hook/route.ts
 * ─────────────────────────────────────────────────────────────────
 * Supabase "Send Email" Auth Hook handler.
 *
 * Configure in Supabase Dashboard:
 *   Authentication → Hooks → Send Email Hook
 *   URL:    https://your-domain.com/api/auth/email-hook
 *   Secret: <any random secret> — add to .env.local as SUPABASE_AUTH_HOOK_SECRET
 *
 * Supabase calls this endpoint whenever it needs to send an auth email
 * (signup confirmation, password reset, email change, magic link).
 * We verify the request, build the action URL, and send a branded
 * email via Resend instead of Supabase's default service.
 *
 * .env.local key required:
 *   SUPABASE_AUTH_HOOK_SECRET=<secret set in Supabase dashboard>
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  sendEmailConfirmation,
  sendPasswordResetEmail,
  sendEmailChangeConfirmation,
} from '@/lib/email';

// Supabase email action types sent in the hook payload
type EmailActionType =
  | 'signup'
  | 'recovery'
  | 'magic_link'
  | 'invite'
  | 'email_change'
  | 'email_change_new';

interface HookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: { full_name?: string; [key: string]: unknown };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: EmailActionType;
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
}

export async function POST(req: NextRequest) {
  // ── 1. Verify hook secret ─────────────────────────────────────
  const hookSecret = process.env.SUPABASE_AUTH_HOOK_SECRET;
  if (!hookSecret) {
    console.error('[email-hook] SUPABASE_AUTH_HOOK_SECRET is not set');
    return NextResponse.json({ error: 'Hook not configured' }, { status: 500 });
  }

  const authHeader = req.headers.get('authorization') ?? '';
  if (authHeader !== `Bearer ${hookSecret}`) {
    console.warn('[email-hook] Unauthorized request — bad hook secret');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── 2. Parse payload ─────────────────────────────────────────
  let payload: HookPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { user, email_data } = payload;
  if (!user?.email || !email_data) {
    return NextResponse.json({ error: 'Missing user or email_data' }, { status: 400 });
  }

  const { email_action_type, token_hash, token_hash_new, redirect_to, site_url } = email_data;

  // ── 3. Build the action URL ──────────────────────────────────
  // All links go through Supabase's /auth/v1/verify endpoint so the
  // token is validated server-side before the user is redirected back
  // to the app. This keeps the existing confirm-email / reset-password
  // page flows completely intact.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? site_url ?? 'https://omrplus.com').replace(/\/$/, '');
  const name = user.user_metadata?.full_name;

  function verifyUrl(type: string, hash: string, redirectTo: string) {
    return `${supabaseUrl}/auth/v1/verify?token=${hash}&type=${type}&redirect_to=${encodeURIComponent(redirectTo)}`;
  }

  // ── 4. Dispatch to the right email function ──────────────────
  try {
    switch (email_action_type) {
      case 'signup': {
        const confirmUrl = verifyUrl('signup', token_hash, `${appUrl}/confirm-email`);
        await sendEmailConfirmation({ to: user.email, confirmUrl, name });
        break;
      }

      case 'recovery': {
        const resetUrl = verifyUrl('recovery', token_hash, `${appUrl}/reset-password`);
        await sendPasswordResetEmail({ to: user.email, resetUrl, name });
        break;
      }

      case 'magic_link': {
        // Reuse confirmation template — button label makes context clear
        const magicUrl = verifyUrl(
          'magiclink',
          token_hash,
          redirect_to || `${appUrl}/dashboard/client`,
        );
        await sendEmailConfirmation({ to: user.email, confirmUrl: magicUrl, name });
        break;
      }

      case 'invite': {
        // Coach / team invite — send the same confirm flow
        const inviteUrl = verifyUrl('invite', token_hash, redirect_to || `${appUrl}/login`);
        await sendEmailConfirmation({ to: user.email, confirmUrl: inviteUrl, name });
        break;
      }

      case 'email_change':
      case 'email_change_new': {
        // email_change_new uses token_hash_new for the new address
        const hash = email_action_type === 'email_change_new' && token_hash_new
          ? token_hash_new
          : token_hash;
        const changeUrl = verifyUrl('email_change', hash, redirect_to || appUrl);
        await sendEmailChangeConfirmation({ to: user.email, confirmUrl: changeUrl, name });
        break;
      }

      default:
        console.warn(`[email-hook] Unknown email_action_type: ${email_action_type}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Log but still return 200 so Supabase does not block the auth flow
    console.error('[email-hook] Error sending email:', err);
    return NextResponse.json({ success: true });
  }
}
