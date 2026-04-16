import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { sendContactFormToAdmin, sendContactFormReply } from '@/lib/email';

const ContactSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:   z.string().email('Invalid email address'),
  phone:   z.string().optional().or(z.literal('')),
  subject: z.string().min(2, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = parsed.data;

    // Save to database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from('contact_submissions').insert({
      name, email, phone: phone || null, subject, message,
    });
    // Note: if the table doesn't exist yet, this silently fails — emails still go out

    // Send emails in parallel
    await Promise.all([
      sendContactFormToAdmin({ name, email, phone, subject, message }),
      sendContactFormReply({ to: email, name }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
