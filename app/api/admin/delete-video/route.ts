import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-server';

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const { id, public_id } = await req.json();

    if (!id || !public_id) {
      return NextResponse.json({ error: 'id and public_id are required' }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const apiKey = process.env.CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;

    // Delete from Cloudinary
    if (apiKey && apiSecret) {
      const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
      await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/video/upload?public_ids[]=${encodeURIComponent(public_id)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Basic ${credentials}` },
        }
      );
    }

    // Delete from Supabase using service role (bypasses RLS)
    const supabaseAdmin = createServerClient();
    const { error } = await supabaseAdmin.from('workout_videos').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
