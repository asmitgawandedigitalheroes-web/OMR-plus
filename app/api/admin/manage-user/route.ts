/**
 * PATCH /api/admin/manage-user
 *
 * Updates a user's profile fields (role, full_name, phone, bio, specialization).
 * Uses the service-role client so RLS is bypassed — admin only.
 *
 * DELETE /api/admin/manage-user
 *
 * Removes a coach: deletes their trainer_client_assignments and downgrades
 * their role to 'client'.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// PATCH — update profile fields
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const { user_id, ...fields } = await req.json() as {
      user_id: string;
      role?: string;
      full_name?: string;
      phone?: string | null;
      bio?: string | null;
      specialization?: string | null;
    };

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const db = getServiceClient();
    const { error } = await db.from('profiles').update(fields).eq('id', user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — deactivate a coach (remove assignments + downgrade role)
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const { user_id } = await req.json() as { user_id: string };

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const db = getServiceClient();

    // Remove all trainer assignments first
    const { error: assignError } = await db
      .from('trainer_client_assignments')
      .delete()
      .eq('trainer_id', user_id);

    if (assignError) {
      return NextResponse.json({ error: assignError.message }, { status: 500 });
    }

    // Downgrade role to client
    const { error: profileError } = await db
      .from('profiles')
      .update({ role: 'client' })
      .eq('id', user_id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — assign a coach to a client (replaces any existing assignment)
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const { client_id, trainer_id } = await req.json() as {
      client_id: string;
      trainer_id: string;
    };

    if (!client_id || !trainer_id) {
      return NextResponse.json({ error: 'client_id and trainer_id are required' }, { status: 400 });
    }

    const db = getServiceClient();

    // Remove any existing assignment for this client
    const { error: delError } = await db
      .from('trainer_client_assignments')
      .delete()
      .eq('client_id', client_id);

    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }

    // Create the new assignment
    const { error: insError } = await db
      .from('trainer_client_assignments')
      .insert({ client_id, trainer_id });

    if (insError) {
      return NextResponse.json({ error: insError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
