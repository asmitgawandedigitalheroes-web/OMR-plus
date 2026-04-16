import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const { title, cloudinary_url, public_id, thumbnail_url, bytes, duration } = body;

    if (!cloudinary_url || !public_id) {
      return NextResponse.json({ error: 'cloudinary_url and public_id are required' }, { status: 400 });
    }

    const supabaseAdmin = createServerClient();

    const { data, error } = await supabaseAdmin.from('workout_videos').insert({
      title: title ?? 'Untitled',
      cloudinary_url,
      public_id,
      thumbnail_url: thumbnail_url ?? null,
      bytes: bytes ?? null,
      duration: duration ?? null,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, video: data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
