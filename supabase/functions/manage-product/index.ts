/**
 * Supabase Edge Function — manage-product
 * Deployed URL: https://<project>.supabase.co/functions/v1/manage-product
 *
 * Methods:
 *   POST   — create a new product
 *   PUT    — update an existing product (requires id in body)
 *   DELETE — delete a product         (requires id in body)
 *
 * Auth: Bearer token from the logged-in admin user.
 *       The function decodes the JWT locally (no extra round-trip),
 *       then does ONE DB query to verify role = 'admin'.
 *
 * Why Edge Function instead of Next.js API?
 *   - Runs at the CDN edge — lower latency worldwide
 *   - Direct Supabase service-role access with no proxy hop
 *   - Can be called from any client (mobile app, etc.) in future
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/* ── Types ─────────────────────────────────────────────────── */
interface ProductPayload {
  id?: string;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  price_sar: number;
  type?: string;
  image_url?: string | null;
  file_url?: string | null;
  is_active?: boolean;
}

/* ── CORS headers — allow calls from your frontend ─────────── */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

/* ── Decode JWT payload without network call ────────────────── */
function decodeJwtSub(token: string): string | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    // atob works in Deno / Edge runtime
    const decoded = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decoded) as { sub?: string };
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

/* ── Admin guard ────────────────────────────────────────────── */
async function requireAdmin(
  req: Request,
  db: ReturnType<typeof createClient>,
): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return json({ error: 'Missing Authorization header' }, 401);

  const userId = decodeJwtSub(token);
  if (!userId) return json({ error: 'Invalid JWT' }, 401);

  const { data: profile, error } = await db
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) return json({ error: 'Auth DB error: ' + error.message }, 500);
  if (profile?.role !== 'admin') return json({ error: 'Forbidden — admin only' }, 403);

  return { userId };
}

/* ── Build safe DB payload ──────────────────────────────────── */
function buildPayload(body: ProductPayload) {
  return {
    name: body.name.trim(),
    name_ar: body.name_ar?.trim() || null,
    description: body.description?.trim() || null,
    description_ar: body.description_ar?.trim() || null,
    price_sar: Number(body.price_sar),
    type: body.type ?? 'supplement',
    image_url: body.image_url?.trim() || null,
    file_url: body.file_url?.trim() || null,
    is_active: body.is_active ?? false,
  };
}

/* ── Main handler ───────────────────────────────────────────── */
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  // Initialise service-role client (bypasses RLS entirely)
  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Verify admin
  const auth = await requireAdmin(req, db);
  if (auth instanceof Response) return auth;

  // Parse body
  let body: ProductPayload & { id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  /* ── POST — create ──────────────────────────────────────── */
  if (req.method === 'POST') {
    if (!body.name?.trim()) {
      return json({ error: 'Product name is required' }, 400);
    }
    if (!body.price_sar && body.price_sar !== 0) {
      return json({ error: 'price_sar is required' }, 400);
    }

    const { data, error } = await db
      .from('products')
      .insert(buildPayload(body))
      .select()
      .single();

    if (error) {
      console.error('[manage-product POST]', error.message, error.code);
      return json({ error: error.message, code: error.code }, 500);
    }
    return json({ product: data }, 201);
  }

  /* ── PUT — update ───────────────────────────────────────── */
  if (req.method === 'PUT') {
    if (!body.id) return json({ error: 'Missing product id' }, 400);
    if (!body.name?.trim()) return json({ error: 'Product name is required' }, 400);

    const { data, error } = await db
      .from('products')
      .update(buildPayload(body))
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('[manage-product PUT]', error.message, error.code);
      return json({ error: error.message, code: error.code }, 500);
    }
    return json({ product: data });
  }

  /* ── DELETE — remove ────────────────────────────────────── */
  if (req.method === 'DELETE') {
    if (!body.id) return json({ error: 'Missing product id' }, 400);

    const { error } = await db
      .from('products')
      .delete()
      .eq('id', body.id);

    if (error) {
      console.error('[manage-product DELETE]', error.message);
      return json({ error: error.message }, 500);
    }
    return json({ success: true });
  }

  return json({ error: `Method ${req.method} not allowed` }, 405);
});
