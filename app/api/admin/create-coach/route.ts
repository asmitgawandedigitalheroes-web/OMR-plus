import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { sendCoachWelcome } from '@/lib/email';

const CreateCoachSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z
    .string()
    .regex(/^[0-9+\s\-()]{7,20}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
});

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      `Supabase env vars missing — URL: ${url ? 'ok' : 'MISSING'}, SERVICE_KEY: ${key ? 'ok' : 'MISSING'}`
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function verifyAdmin(req: NextRequest) {
  // Prefer the explicit Authorization header sent by the admin page
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const serviceClient = getServiceClient();

  if (token) {
    // Verify the JWT and get the user — uses the service role client so it bypasses RLS
    const { data: { user }, error } = await serviceClient.auth.getUser(token);
    if (error || !user) return null;

    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin' ? user.id : null;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    // ── Admin guard ──────────────────────────────────────────────
    const adminId = await verifyAdmin(req);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized — admin session required' }, { status: 401 });
    }

    // ── Body validation ──────────────────────────────────────────
    const body = await req.json();
    const parsed = CreateCoachSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, full_name, phone } = parsed.data;
    const serviceClient = getServiceClient();

    // ── Create auth user ─────────────────────────────────────────
    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, phone: phone ?? '' },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message ?? 'Failed to create auth user' },
        { status: 400 }
      );
    }

    // ── Upsert profile with coach role ───────────────────────────
    const { error: profileError } = await serviceClient.from('profiles').upsert({
      id: authData.user.id,
      email,
      full_name,
      phone: phone || null,
      role: 'coach',
      onboarding_completed: true,
    });

    if (profileError) {
      // Roll back the auth user so we don't leave orphaned accounts
      await serviceClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Send welcome email with login credentials
    await sendCoachWelcome({ to: email, name: full_name, tempPassword: password });

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
