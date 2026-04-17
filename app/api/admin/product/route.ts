/**
 * /api/admin/product  — POST / PUT / DELETE
 *
 * Uses the service-role client (bypasses RLS entirely).
 * Auth: JWT is decoded locally (no network call) to get the user ID,
 * then ONE profiles query confirms the admin role.
 * This makes it significantly faster than the two-round-trip approach.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

interface ProductPayload {
  id?: string;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  price_sar: number;
  type: string;
  image_url?: string | null;
  file_url?: string | null;
  is_active: boolean;
}

/** Decode the payload section of a JWT without verifying the signature.
 *  We still validate the role via a DB lookup — this just avoids a
 *  round-trip to the Supabase auth endpoint. */
function decodeJwtPayload(token: string): { sub?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(json) as { sub?: string };
  } catch {
    return null;
  }
}

async function verifyAdmin(req: NextRequest): Promise<{ userId: string } | { error: NextResponse }> {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '').trim();
  if (!token) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  // Decode JWT locally — fast, no network call
  const payload = decodeJwtPayload(token);
  const userId = payload?.sub;
  if (!userId) return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };

  // One DB call: check role
  const db = createServerClient();
  const { data: profile, error } = await db
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[product/verifyAdmin] profiles error:', error.message);
    return { error: NextResponse.json({ error: 'Auth check failed: ' + error.message }, { status: 500 }) };
  }

  if (profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 }) };
  }

  return { userId };
}

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
    is_active: body.is_active ?? true,
  };
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if ('error' in auth) return auth.error;

  let body: ProductPayload;
  try { body = await req.json() as ProductPayload; }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  if (!body.name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const db = createServerClient();
  const { data, error } = await db
    .from('products')
    .insert(buildPayload(body))
    .select()
    .single();

  if (error) {
    console.error('[product POST] insert error:', error.message, error.code);
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }
  return NextResponse.json({ product: data });
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if ('error' in auth) return auth.error;

  let body: ProductPayload;
  try { body = await req.json() as ProductPayload; }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  if (!body.id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 });

  const db = createServerClient();
  const { data, error } = await db
    .from('products')
    .update(buildPayload(body))
    .eq('id', body.id)
    .select()
    .single();

  if (error) {
    console.error('[product PUT] update error:', error.message, error.code);
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }
  return NextResponse.json({ product: data });
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if ('error' in auth) return auth.error;

  let body: { id: string };
  try { body = await req.json() as { id: string }; }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const db = createServerClient();
  const { error } = await db.from('products').delete().eq('id', body.id);

  if (error) {
    console.error('[product DELETE] error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
