/**
 * GET /api/admin/upload-ebook?filename=<name>
 *
 * Returns a short-lived signed upload URL so the browser can POST
 * the PDF file DIRECTLY to Supabase Storage — no double-hop through
 * the Next.js server.  Admin-only.
 *
 * Flow:
 *   1. Client calls GET /api/admin/upload-ebook?filename=mybook.pdf
 *   2. Server creates the bucket if missing, then returns a signed URL
 *      + the final public URL the file will have once uploaded.
 *   3. Client PUTs the raw File to the signed URL (no auth header needed —
 *      it is already embedded in the signed URL token).
 *   4. Client sets form.file_url = publicUrl.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { createServerClient } from '@/lib/supabase';

const BUCKET = 'product-files';
const EXPIRES_IN = 300; // signed URL valid for 5 minutes

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const filename = req.nextUrl.searchParams.get('filename') ?? 'ebook.pdf';
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `ebooks/${Date.now()}_${safeName}`;

  const db = createServerClient();

  // ── Ensure bucket exists ──────────────────────────────────────
  const { data: buckets } = await db.storage.listBuckets();
  const bucketExists = (buckets ?? []).some(b => b.name === BUCKET);

  if (!bucketExists) {
    const { error: createErr } = await db.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 52_428_800,
      allowedMimeTypes: ['application/pdf'],
    });
    if (createErr) {
      console.error('[upload-ebook] create bucket error:', createErr.message);
      return NextResponse.json({ error: 'Failed to create storage bucket' }, { status: 500 });
    }
  }

  // ── Create signed upload URL ──────────────────────────────────
  const { data: signed, error: signErr } = await db.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (signErr || !signed) {
    console.error('[upload-ebook] sign error:', signErr?.message);
    return NextResponse.json({ error: signErr?.message ?? 'Could not create upload URL' }, { status: 500 });
  }

  // Public URL the file will be accessible at after upload
  const { data: urlData } = db.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({
    uploadUrl: signed.signedUrl,
    token: signed.token,
    path,
    publicUrl: urlData.publicUrl,
  });
}
