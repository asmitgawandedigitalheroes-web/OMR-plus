'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PW_RULES, isPasswordValid } from '@/lib/password';

const CheckSVG = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6l3 3 5-5" />
  </svg>
);

const XSvg = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3l6 6M9 3l-6 6" />
  </svg>
);

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t && t.length > 0) {
      setToken(t);
    } else {
      setTokenMissing(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid(password)) {
      setError('Password does not meet the requirements below.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pwValid = isPasswordValid(password);
  const confirmMatch = confirm.length > 0 && confirm === password;
  const confirmMismatch = confirm.length > 0 && confirm !== password;

  return (
    <>
      <style>{`
        .rp-hero {
          min-height: 100vh;
          background: #0B0B0B;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          padding: 5rem 1rem 3rem;
        }
        @media (min-width: 520px) { .rp-hero { padding: 8rem 1rem 5rem; } }
        .rp-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 45%, rgba(201,168,76,0.08) 0%, transparent 58%);
          pointer-events: none;
        }
        .rp-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 460px;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(28px) saturate(160%);
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 32px 80px rgba(0,0,0,0.6);
          border-radius: 28px;
          padding: 1.75rem 1.25rem;
        }
        @media (min-width: 520px) { .rp-card { padding: 3rem 2.75rem; } }
        .rp-input-wrap { position: relative; }
        .rp-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 0.875rem 3rem 0.875rem 1.1rem;
          font-size: 0.9rem; color: white; outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
          box-sizing: border-box;
        }
        .rp-input::placeholder { color: rgba(255,255,255,0.22); }
        .rp-input:focus { border-color: rgba(201,168,76,0.45); background: rgba(255,255,255,0.06); }
        .rp-input.valid { border-color: rgba(34,197,94,0.5); }
        .rp-input.invalid { border-color: rgba(239,68,68,0.5); }
        .rp-eye {
          position: absolute; right: 0.9rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 0.25rem;
          color: rgba(255,255,255,0.3); transition: color 0.2s ease;
          display: flex; align-items: center;
        }
        .rp-eye:hover { color: rgba(255,255,255,0.7); }
        .rp-btn {
          width: 100%; padding: 0.95rem;
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #0B0B0B;
          background: linear-gradient(135deg, #C9A84C 0%, #E5C76B 55%, #C9A84C 100%);
          border: none; border-radius: 12px; cursor: pointer;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .rp-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-2px); }
        .rp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .rp-label {
          display: block; font-size: 0.67rem; font-weight: 600;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(255,255,255,0.38); margin-bottom: 0.55rem;
        }
        .rp-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.22);
          border-radius: 10px; padding: 0.8rem 1rem;
          font-size: 0.8rem; color: rgba(239,68,68,0.85);
          display: flex; align-items: center; gap: 0.5rem;
        }
        .rp-success {
          background: rgba(34,197,94,0.06);
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 14px; padding: 1.75rem 1.5rem;
          text-align: center;
        }
        .rp-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          margin: 1.75rem 0;
        }
        .rp-pw-rules {
          display: flex; flex-direction: column; gap: 0.4rem;
          margin-top: 0.6rem;
          font-size: 0.75rem;
        }
        .rp-pw-rule {
          display: flex; align-items: center; gap: 0.5rem;
          color: rgba(255,255,255,0.35);
          transition: color 0.2s ease;
        }
        .rp-pw-rule.pass { color: rgba(34,197,94,0.85); }
        .rp-pw-rule.fail { color: rgba(239,68,68,0.75); }
        .rp-pw-rule-dot {
          width: 16px; height: 16px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: rgba(255,255,255,0.06);
          transition: background 0.2s ease;
        }
        .rp-pw-rule.pass .rp-pw-rule-dot { background: rgba(34,197,94,0.15); }
        .rp-pw-rule.fail .rp-pw-rule-dot { background: rgba(239,68,68,0.12); }
        .rp-info {
          background: rgba(201,168,76,0.06);
          border: 1px solid rgba(201,168,76,0.18);
          border-radius: 10px; padding: 0.8rem 1rem;
          font-size: 0.8rem; color: rgba(255,255,255,0.5);
          text-align: center;
        }
      `}</style>

      <div className="flex flex-col min-h-screen bg-brand-black">
        <Navbar />

        <main className="rp-hero flex-1">
          <div className="rp-glow" />

          <div className="rp-card">
            {/* Header */}
            <div className="text-center mb-8">
              <img
                src="https://res.cloudinary.com/dqiuwzvfb/image/upload/v1775629677/69007823-DC7E-42E1-AF8E-E57E11810549-Photoroom_nluyul.png"
                alt="OMR+"
                className="h-14 w-auto object-contain mx-auto mb-6"
              />
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 mb-5 rounded-full"
                style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A84C' }} />
                <span className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: '#C9A84C' }}>
                  Set New Password
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                Reset Password
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Choose a strong new password for your account.
              </p>
            </div>

            {/* Invalid / missing token */}
            {tokenMissing && !done && (
              <div className="space-y-5">
                <div className="rp-error">
                  <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  This reset link has expired or is invalid. Please request a new one.
                </div>
                <div className="rp-divider" />
                <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  <Link href="/forgot-password" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: '#C9A84C' }}>
                    Request a new reset link
                  </Link>
                </p>
              </div>
            )}

            {/* Success state */}
            {done && (
              <div className="rp-success">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="rgba(34,197,94,0.9)" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-white font-semibold mb-2">Password updated!</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Your password has been changed successfully. Redirecting you to sign in…
                </p>
                <div className="rp-divider" />
                <Link href="/login" className="text-sm font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: '#C9A84C' }}>
                  Sign in now
                </Link>
              </div>
            )}

            {/* Form */}
            {token && !tokenMissing && !done && (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {error && (
                  <div className="rp-error">
                    <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* New password */}
                <div>
                  <label htmlFor="rp-password" className="rp-label">New Password</label>
                  <div className="rp-input-wrap">
                    <input
                      id="rp-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`rp-input ${password.length > 0 ? (pwValid ? 'valid' : 'invalid') : ''}`}
                      placeholder="Enter new password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                      maxLength={15}
                      autoComplete="new-password"
                      aria-describedby="rp-pw-rules"
                    />
                    <button
                      type="button"
                      className="rp-eye"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Live rules checklist */}
                  {password.length > 0 && (
                    <div id="rp-pw-rules" className="rp-pw-rules" role="list">
                      {PW_RULES.map((rule) => {
                        const pass = rule.test(password);
                        return (
                          <div key={rule.id} className={`rp-pw-rule ${pass ? 'pass' : 'fail'}`} role="listitem">
                            <span className="rp-pw-rule-dot">
                              {pass ? <CheckSVG /> : <XSvg />}
                            </span>
                            {rule.label}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="rp-confirm" className="rp-label">Confirm Password</label>
                  <div className="rp-input-wrap">
                    <input
                      id="rp-confirm"
                      name="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      className={`rp-input ${confirmMatch ? 'valid' : confirmMismatch ? 'invalid' : ''}`}
                      placeholder="Repeat new password"
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); if (error) setError(''); }}
                      maxLength={15}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="rp-eye"
                      onClick={() => setShowConfirm(v => !v)}
                      aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirm ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {confirmMismatch && (
                    <p className="mt-1.5 text-xs" style={{ color: 'rgba(239,68,68,0.75)' }}>
                      Passwords do not match.
                    </p>
                  )}
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="rp-btn"
                    disabled={loading || !pwValid || !confirmMatch}
                  >
                    {loading ? 'Updating…' : 'Set New Password'}
                  </button>
                </div>

                <div className="rp-divider" />

                <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  Remember your password?{' '}
                  <Link href="/login" className="font-semibold hover:opacity-80 transition-opacity"
                    style={{ color: '#C9A84C' }}>
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
