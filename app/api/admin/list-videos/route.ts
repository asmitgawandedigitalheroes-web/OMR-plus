import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { requireCoachOrAdmin } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = await requireCoachOrAdmin(req);
  if (auth.error) return auth.error;

  try {
    const supabaseAdmin = createServerClient();
    const { data, error } = await supabaseAdmin
      .from('workout_videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ videos: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
