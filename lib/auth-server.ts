/**
 * Server-side auth helpers for API routes.
 *
 * Strategy (in priority order):
 *   1. Authorization: Bearer <jwt>  header  — sent explicitly by client code
 *   2. Session cookies               — fallback for same-origin requests
 *
 * All admin / user-scoped API routes must call these guards before executing
 * any business logic.
 */
import { createServerClient as createSSRClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// ─── Types ──────────────────────────────────────────────────────

interface AuthSuccess {
  userId: string;
  error: null;
}
interface AuthFailure {
  userId: null;
  error: NextResponse;
}
type AuthResult = AuthSuccess | AuthFailure;

// ─── Shared service-role client ──────────────────────────────────

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Core: resolve user from request ────────────────────────────

async function getUserIdFromRequest(req?: NextRequest): Promise<string | null> {
  // 1. Try Authorization header first (most reliable — explicit from client)
  if (req) {
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      const serviceClient = getServiceClient();
      const { data: { user } } = await serviceClient.auth.getUser(token);
      if (user?.id) return user.id;
    }
  }

  // 2. Fall back to session cookies (same-origin requests)
  try {
    const cookieStore = await cookies();
    const supabase = createSSRClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() { /* API routes are read-only */ },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ─── Role lookup (via service-role client — bypasses RLS) ────────

async function getUserRole(userId: string): Promise<string | null> {
  const serviceClient = getServiceClient();
  const { data } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  return data?.role ?? null;
}

// ─── Public helpers ──────────────────────────────────────────────

/**
 * Require any authenticated user.
 * Accepts an optional `req` to read the Authorization header.
 */
export async function requireAuth(req?: NextRequest): Promise<AuthResult> {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return { userId: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { userId, error: null };
}

/**
 * Require an authenticated user whose role is 'admin'.
 * Accepts an optional `req` to read the Authorization header.
 */
export async function requireAdmin(req?: NextRequest): Promise<AuthResult> {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return { userId: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const role = await getUserRole(userId);
  if (role !== 'admin') {
    return { userId: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { userId, error: null };
}

/**
 * Require an authenticated user whose role is 'admin' or 'coach'.
 * Accepts an optional `req` to read the Authorization header.
 */
export async function requireCoachOrAdmin(req?: NextRequest): Promise<AuthResult> {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return { userId: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const role = await getUserRole(userId);
  if (role !== 'admin' && role !== 'coach') {
    return { userId: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { userId, error: null };
}
