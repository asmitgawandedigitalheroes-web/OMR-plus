'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';

type Stage =
  | 'waiting'   // Watching for Supabase SIGNED_IN event
  | 'ready'     // Auth event received — show the "Confirm Email" button
  | 'confirming'// Button clicked — brief processing animation
  | 'confirmed' // Success state — auto-redirect timer running
  | 'timeout'   // 5 s elapsed with no auth event — no valid token in URL
  | 'error';    // verifyOtp / signOut threw

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ConfirmEmailPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('waiting');
  const [userEmail, setUserEmail] = useState('');
  const [countdown, setCountdown] = useState(4);

  // Resend state (used in timeout stage)
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resentOk, setResentOk] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Supabase puts the session into the URL hash after verifying the confirmation link.
    // createBrowserClient picks it up and fires onAuthStateChange → SIGNED_IN.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUserEmail(session.user.email ?? '');
          // Sign out immediately — we want the user to log in manually.
          // The email is already confirmed in Supabase; we just need them
          // to click the button before we show the success screen.
          await supabase.auth.signOut();
          setStage('ready');
        }
      }
    );

    // Fallback: if no auth event fires within 5 s the URL didn't contain a
    // valid confirmation token (e.g. user navigated here directly).
    const fallback = setTimeout(() => {
      setStage(prev => (prev === 'waiting' ? 'timeout' : prev));
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, []);

  // Countdown ticker — starts once we enter the 'confirmed' stage
  useEffect(() => {
    if (stage !== 'confirmed') return;
    const tick = setInterval(() => {
      setCountdown(n => {
        if (n <= 1) {
          clearInterval(tick);
          router.push('/login');
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [stage, router]);

  const handleResend = async () => {
    if (!EMAIL_RE.test(resendEmail) || resending || resendCooldown > 0) return;
    setResending(true);
    setResentOk(false);
    setResendError('');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: resendEmail.trim().toLowerCase(),
      options: { emailRedirectTo: `${appUrl}/confirm-email` },
    });
    setResending(false);
    if (error) {
      setResendError(error.message);
    } else {
      setResentOk(true);
      setResendCooldown(60);
      const tick = setInterval(() => {
        setResendCooldown(n => {
          if (n <= 1) { clearInterval(tick); return 0; }
          return n - 1;
        });
      }, 1000);
    }
  };

  const handleConfirm = async () => {
    setStage('confirming');
    // Short artificial delay for a smooth UX transition
    await new Promise(r => setTimeout(r, 700));
    setStage('confirmed');
  };

  /* ─────────────────────────────────────────────────────── */

  return (
    <>
      <style>{`
        .ce-wrap {
          min-height: 100vh;
          background: #0B0B0B;
          display: flex;
          flex-direction: column;
        }
        .ce-main {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          padding: 5rem 1.25rem 3rem;
        }
        @media (min-width: 520px) { .ce-main { padding: 8rem 1.25rem 5rem; } }
        .ce-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 45%, rgba(201,168,76,0.07) 0%, transparent 60%);
          pointer-events: none;
        }
        .ce-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 460px;
          background: rgba(255,255,255,0.035);
          backdrop-filter: blur(28px) saturate(160%);
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), 0 32px 80px rgba(0,0,0,0.6);
          border-radius: 28px;
          padding: 2.5rem 1.75rem;
          text-align: center;
        }
        @media (min-width: 520px) { .ce-card { padding: 3rem 2.75rem; } }

        /* icon ring */
        .ce-icon-ring {
          width: 72px; height: 72px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.6rem;
          border: 1px solid rgba(201,168,76,0.22);
          background: rgba(201,168,76,0.07);
        }
        .ce-icon-ring.green {
          border-color: rgba(34,197,94,0.25);
          background: rgba(34,197,94,0.08);
        }
        .ce-icon-ring.red {
          border-color: rgba(239,68,68,0.22);
          background: rgba(239,68,68,0.07);
        }

        /* pill badge */
        .ce-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(201,168,76,0.06); border: 1px solid rgba(201,168,76,0.18);
          border-radius: 999px; padding: 0.28rem 0.8rem; margin-bottom: 1rem;
        }
        .ce-pill-dot { width: 6px; height: 6px; border-radius: 50%; background: #C9A84C; }
        .ce-pill-txt { font-size: 0.57rem; font-weight: 700; color: #C9A84C; letter-spacing: 0.22em; text-transform: uppercase; }

        /* confirm button */
        .ce-btn {
          width: 100%; padding: 0.95rem;
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #0B0B0B;
          background: linear-gradient(135deg, #C9A84C 0%, #E5C76B 55%, #C9A84C 100%);
          border: none; border-radius: 12px; cursor: pointer;
          transition: opacity 0.3s, transform 0.3s, box-shadow 0.3s;
          margin-top: 1.5rem;
        }
        .ce-btn:hover:not(:disabled) {
          opacity: 0.88; transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(201,168,76,0.22);
        }
        .ce-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* spinner */
        @keyframes ce-spin { to { transform: rotate(360deg); } }
        .ce-spinner {
          width: 22px; height: 22px; border-radius: 50%;
          border: 2.5px solid rgba(201,168,76,0.2);
          border-top-color: #C9A84C;
          animation: ce-spin 0.75s linear infinite;
          margin: 1.2rem auto 0;
        }

        /* divider */
        .ce-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          margin: 1.6rem 0;
        }

        /* countdown ring */
        @keyframes ce-ring { from { stroke-dashoffset: 113; } to { stroke-dashoffset: 0; } }
        .ce-ring-svg circle.track { stroke: rgba(255,255,255,0.07); }
        .ce-ring-svg circle.fill {
          stroke: #C9A84C;
          stroke-dasharray: 113;
          stroke-dashoffset: 113;
          animation: ce-ring 4s linear forwards;
          transform-origin: center;
          transform: rotate(-90deg);
        }

        /* waiting dots */
        @keyframes ce-dot { 0%,80%,100% { opacity: 0.2; } 40% { opacity: 1; } }
        .ce-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: rgba(201,168,76,0.5); margin: 0 2px; }
        .ce-dot:nth-child(1) { animation: ce-dot 1.2s 0s infinite; }
        .ce-dot:nth-child(2) { animation: ce-dot 1.2s 0.2s infinite; }
        .ce-dot:nth-child(3) { animation: ce-dot 1.2s 0.4s infinite; }
      `}</style>

      <div className="ce-wrap">
        <Navbar />

        <main className="ce-main">
          <div className="ce-glow" />

          <div className="ce-card">
            {/* ── Logo ── */}
            <img
              src="https://res.cloudinary.com/dqiuwzvfb/image/upload/v1775629677/69007823-DC7E-42E1-AF8E-E57E11810549-Photoroom_nluyul.png"
              alt="AthloCode"
              style={{ height: 48, width: 'auto', objectFit: 'contain', margin: '0 auto 2rem', display: 'block' }}
            />

            {/* ── WAITING: Supabase session not yet detected ── */}
            {stage === 'waiting' && (
              <>
                <div className="ce-icon-ring">
                  <svg style={{ width: 30, height: 30 }} fill="none" stroke="#C9A84C" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="ce-pill">
                  <span className="ce-pill-dot" />
                  <span className="ce-pill-txt">Verifying Link</span>
                </div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.6rem' }}>
                  Processing…
                </h1>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.7 }}>
                  Please wait while we verify your confirmation link.
                </p>
                <div style={{ marginTop: '1.5rem' }}>
                  <span className="ce-dot" />
                  <span className="ce-dot" />
                  <span className="ce-dot" />
                </div>
              </>
            )}

            {/* ── READY: Session detected, show the confirm button ── */}
            {stage === 'ready' && (
              <>
                <div className="ce-icon-ring">
                  <svg style={{ width: 30, height: 30 }} fill="none" stroke="#C9A84C" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="ce-pill">
                  <span className="ce-pill-dot" />
                  <span className="ce-pill-txt">One Step Left</span>
                </div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.6rem' }}>
                  Confirm Your Email
                </h1>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7 }}>
                  {userEmail && (
                    <>
                      Your confirmation link is valid for{' '}
                      <strong style={{ color: 'rgba(201,168,76,0.8)', fontWeight: 600 }}>{userEmail}</strong>.
                      <br />
                    </>
                  )}
                  Click the button below to activate your account.
                </p>

                <button type="button" className="ce-btn" onClick={handleConfirm}>
                  Confirm Email Address
                </button>

                <div className="ce-divider" />
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.22)' }}>
                  Wrong email?{' '}
                  <Link href="/signup" style={{ color: '#C9A84C', fontWeight: 600 }}>
                    Sign up again
                  </Link>
                </p>
              </>
            )}

            {/* ── CONFIRMING: Button clicked, brief spinner ── */}
            {stage === 'confirming' && (
              <>
                <div className="ce-icon-ring">
                  <svg style={{ width: 30, height: 30 }} fill="none" stroke="#C9A84C" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.6rem' }}>
                  Confirming…
                </h1>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.7 }}>
                  Activating your account, just a moment.
                </p>
                <div className="ce-spinner" />
              </>
            )}

            {/* ── CONFIRMED: Success ── */}
            {stage === 'confirmed' && (
              <>
                <div className="ce-icon-ring green">
                  <svg style={{ width: 32, height: 32 }} fill="none" stroke="rgba(34,197,94,0.85)" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: 999, padding: '0.28rem 0.8rem', marginBottom: '1rem',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(34,197,94,0.8)', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.57rem', fontWeight: 700, color: 'rgba(34,197,94,0.85)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                    Account Activated
                  </span>
                </div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.6rem' }}>
                  Email Confirmed!
                </h1>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Your account is now active. You&apos;re being redirected
                  to the sign-in page.
                </p>

                {/* Countdown ring */}
                <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 1rem' }}>
                  <svg className="ce-ring-svg" viewBox="0 0 40 40" style={{ width: 72, height: 72, transform: 'rotate(-90deg)' }}>
                    <circle className="track" cx="20" cy="20" r="18" fill="none" strokeWidth="2.5" />
                    <circle className="fill" cx="20" cy="20" r="18" fill="none" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', fontWeight: 800, color: '#C9A84C',
                    transform: 'rotate(90deg)',
                  }}>
                    {countdown}
                  </span>
                </div>

                <div className="ce-divider" />
                <Link
                  href="/login"
                  style={{
                    fontSize: '0.78rem', fontWeight: 600, color: '#C9A84C',
                    textDecoration: 'none', letterSpacing: '0.04em',
                  }}
                >
                  Go to Sign In now →
                </Link>
              </>
            )}

            {/* ── TIMEOUT: No valid token found ── */}
            {stage === 'timeout' && (
              <>
                <div className="ce-icon-ring red">
                  <svg style={{ width: 30, height: 30 }} fill="none" stroke="rgba(239,68,68,0.8)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 999, padding: '0.28rem 0.8rem', marginBottom: '1rem',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(239,68,68,0.7)', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.57rem', fontWeight: 700, color: 'rgba(239,68,68,0.8)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                    Link Invalid
                  </span>
                </div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.6rem' }}>
                  Link Expired or Invalid
                </h1>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  This confirmation link has expired or has already been used.
                  Enter your email below to receive a fresh one.
                </p>

                {/* ── Resend form ── */}
                {!resentOk ? (
                  <div style={{ textAlign: 'left' }}>
                    <label style={{
                      display: 'block', fontSize: '0.62rem', fontWeight: 700,
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.38)', marginBottom: '0.45rem',
                    }}>
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      value={resendEmail}
                      onChange={e => { setResendEmail(e.target.value); setResendError(''); }}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        borderRadius: 10, padding: '0.75rem 0.95rem',
                        fontSize: '0.875rem', color: '#fff', outline: 'none',
                        boxSizing: 'border-box', marginBottom: '0.6rem',
                      }}
                    />

                    {resendError && (
                      <div style={{
                        background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 9, padding: '0.6rem 0.85rem', marginBottom: '0.6rem',
                        fontSize: '0.75rem', color: 'rgba(239,68,68,0.85)',
                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                      }}>
                        <svg style={{ width: 13, height: 13, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        {resendError}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending || resendCooldown > 0 || !EMAIL_RE.test(resendEmail)}
                      style={{
                        width: '100%', padding: '0.82rem',
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                        color: '#0B0B0B',
                        background: (resending || resendCooldown > 0 || !EMAIL_RE.test(resendEmail))
                          ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #C9A84C 0%, #E5C76B 55%, #C9A84C 100%)',
                        border: 'none', borderRadius: 12, cursor:
                          (resending || resendCooldown > 0 || !EMAIL_RE.test(resendEmail)) ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {resending ? (
                        <>
                          <svg style={{ width: 13, height: 13, animation: 'ce-spin 1s linear infinite' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                          Sending…
                        </>
                      ) : resendCooldown > 0 ? (
                        `Resend in ${resendCooldown}s`
                      ) : (
                        <>
                          <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                          Resend Confirmation Email
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* ── Resent success ── */
                  <div style={{
                    background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: 12, padding: '1rem 1.1rem', textAlign: 'left',
                    display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                    }}>
                      <svg style={{ width: 14, height: 14 }} fill="none" stroke="rgba(34,197,94,0.85)" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(34,197,94,0.9)', marginBottom: '0.2rem' }}>
                        Confirmation email sent!
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6, margin: 0 }}>
                        We&apos;ve sent a new confirmation link to{' '}
                        <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{resendEmail}</strong>.
                        Check your inbox and click the link to activate your account.
                      </p>
                    </div>
                  </div>
                )}

                <div className="ce-divider" />
                <Link
                  href="/login"
                  style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}
                >
                  Already confirmed?{' '}
                  <span style={{ color: '#C9A84C', fontWeight: 600 }}>Sign in</span>
                </Link>
              </>
            )}

            {/* ── ERROR ── */}
            {stage === 'error' && (
              <>
                <div className="ce-icon-ring red">
                  <svg style={{ width: 30, height: 30 }} fill="none" stroke="rgba(239,68,68,0.8)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.6rem' }}>
                  Something Went Wrong
                </h1>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  We couldn&apos;t confirm your email. Please try again or contact support.
                </p>
                <div className="ce-divider" />
                <Link href="/signup" style={{ fontSize: '0.78rem', color: '#C9A84C', fontWeight: 600, textDecoration: 'none' }}>
                  Start over →
                </Link>
              </>
            )}

          </div>
        </main>

        {/* Slim footer */}
        <footer style={{
          height: 48, background: '#080808', borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2rem', flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.02em' }}>
            © {new Date().getFullYear()} AthloCode. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {(['Privacy', 'Terms', 'Contact'] as const).map(l => (
              <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.22)', textDecoration: 'none' }}>
                {l}
              </Link>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
