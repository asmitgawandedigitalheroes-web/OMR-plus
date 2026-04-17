/**
 * GET /api/admin/debug-products
 * Diagnostic endpoint — checks if the products table is accessible.
 * Returns exactly what's going wrong so the admin knows what to fix.
 * Admin-only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

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

export async function GET(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '').trim();
  const results: Record<string, unknown> = {};

  // 1. Token check
  results.hasToken = !!token;
  if (!token) return NextResponse.json({ ...results, error: 'No Bearer token' }, { status: 401 });

  // 2. JWT decode
  const payload = decodeJwtPayload(token);
  results.jwtDecoded = !!payload?.sub;
  results.userId = payload?.sub ?? null;

  const db = createServerClient();

  // 3. Profile check
  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('role, email')
    .eq('id', payload?.sub ?? '')
    .maybeSingle();

  results.profileError = profileError?.message ?? null;
  results.profileRole = profile?.role ?? null;
  results.profileEmail = profile?.email ?? null;
  results.isAdmin = profile?.role === 'admin';

  // 4. Products table check
  const { data: products, error: tableError, count } = await db
    .from('products')
    .select('id', { count: 'exact', head: true });

  results.productsTableError = tableError?.message ?? null;
  results.productsTableCode = tableError?.code ?? null;
  results.productsCount = count ?? 0;
  results.productsTableExists = !tableError;

  // 5. Try a test insert (only if admin + table exists)
  if (profile?.role === 'admin' && !tableError) {
    const testName = `__debug_test_${Date.now()}`;
    const { data: inserted, error: insertError } = await db
      .from('products')
      .insert({ name: testName, price_sar: 1, type: 'supplement', is_active: false })
      .select()
      .single();

    results.insertError = insertError?.message ?? null;
    results.insertCode = insertError?.code ?? null;
    results.insertSuccess = !!inserted?.id;

    // Clean up test row
    if (inserted?.id) {
      await db.from('products').delete().eq('id', inserted.id);
      results.cleanupDone = true;
    }
  }

  return NextResponse.json(results);
}
