'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { AuthUser, UserProfile, SignUpData, LoginData } from '@/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: string | null }>;
  signIn: (data: LoginData) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async (userId: string, email: string): Promise<AuthUser> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return { id: userId, email, profile: (error ? null : profile) as UserProfile | null };
    } catch {
      return { id: userId, email, profile: null };
    }
  };

  useEffect(() => {
    // Get initial session and verify user — set loading false immediately after check,
    // then fetch profile in background so the navbar renders without waiting.
    Promise.all([
      supabase.auth.getSession(),
      supabase.auth.getUser()
    ]).then(async ([{ data: { session } }, { data: { user } }]) => {
      setSession(session);
      if (user) {
        // Show logged-in state immediately with basic info
        setUser({ id: user.id, email: user.email!, profile: null });
        setLoading(false);
        // Then load full profile in background
        const authUser = await fetchProfile(user.id, user.email!);
        setUser(authUser);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // On intentional sign-out: signOut() already cleared state + navigated away.
      // Returning immediately avoids any async lock acquisitions while the page
      // is mid-navigation (which would throw NavigatorLockAcquireTimeoutError).
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        return;
      }
      setSession(session);
      if (session?.user) {
        const authUser = await fetchProfile(session.user.id, session.user.email!);
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signUp = async ({ email, password, full_name, phone }: SignUpData) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone },
        // After Supabase verifies the link it redirects here with the session hash
        emailRedirectTo: `${appUrl}/confirm-email`,
      },
    });

    if (error) return { error: error.message };

    // Profile is created automatically via DB trigger (handle_new_user).
    // Do NOT redirect here — the signup page shows the "check your email" screen.
    return { error: null };
  };

  const signIn = async ({ email, password }: LoginData) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { error: error.message };

    // Redirect based on role
    if (data.user) {
      const authUser = await fetchProfile(data.user.id, data.user.email!);
      const role = authUser.profile?.role ?? 'client';
      const redirectMap = {
        client: '/dashboard/client',
        coach: '/dashboard/coach',
        admin: '/dashboard/admin',
      };
      router.push(redirectMap[role]);
    }

    return { error: null };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore Supabase errors — still sign out locally
    } finally {
      setUser(null);
      setSession(null);
      // Hard redirect — bypasses React's render pipeline so concurrent
      // state-change re-renders can't race against and cancel the navigation.
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
