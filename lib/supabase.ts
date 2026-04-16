import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side: uses cookies so the middleware can read the session server-side.
// The custom `lock` replaces the Navigator Locks API with a simple pass-through.
// This prevents NavigatorLockAcquireTimeoutError when the page navigates away
// mid-signout (the browser releases all Web Locks on navigation, causing any
// concurrent Supabase lock acquisition to throw).
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    lock: <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => fn(),
  },
});

// Server-side only (service role — never expose to browser)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};
