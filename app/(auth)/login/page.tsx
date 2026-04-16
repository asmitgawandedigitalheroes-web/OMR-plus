'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/context/LanguageContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched]   = useState({ email: false, password: false });

  // Instant feedback helpers — evaluate on every keystroke
  const emailErr    = touched.email    && email    && !EMAIL_RE.test(email);
  const pwTooShort  = password.length > 0 && password.length < 8;
  const pwTooLong   = password.length > 15;
  const pwHasSpace  = /\s/.test(password);
  const passwordErr = touched.password && password && (pwTooShort || pwTooLong || pwHasSpace);

  // Inline hint shown instantly while typing (no blur required)
  const passwordHint = !password
    ? null
    : pwHasSpace
    ? 'Password cannot contain spaces.'
    : pwTooLong
    ? 'Password must be 15 characters or fewer.'
    : pwTooShort
    ? 'Password must be at least 8 characters.'
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!EMAIL_RE.test(email)) { setError('Please enter a valid email address.'); return; }
    if (password.length < 8)   { setError('Password must be at least 8 characters.'); return; }
    if (password.length > 15)  { setError('Password must be 15 characters or fewer.'); return; }
    if (/\s/.test(password))   { setError('Password cannot contain spaces.'); return; }
    setError('');
    setLoading(true);
    const { error } = await signIn({ email: email.trim().toLowerCase(), password });
    if (error) { setError(error); }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        .login-hero {
          min-height: 100vh;
          background: #0B0B0B;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 5rem 1rem 3rem;
        }
        @media (min-width: 520px) {
          .login-hero { padding: 8rem 1rem 5rem; }
        }

        /* Radial gold glow */
        .login-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 45%, rgba(201,168,76,0.08) 0%, transparent 58%);
          pointer-events: none;
        }

        /* Floating orbs */
        @keyframes loginOrb1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          40%       { transform: translate(20px,-18px) scale(1.05); }
          70%       { transform: translate(-14px,12px) scale(0.95); }
        }
        @keyframes loginOrb2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%       { transform: translate(-18px,20px) scale(1.06); }
        }
        .login-orb-1 {
          position: absolute; top: 20%; left: 10%;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
          filter: blur(48px); pointer-events: none;
          animation: loginOrb1 20s ease-in-out infinite;
        }
        .login-orb-2 {
          position: absolute; bottom: 20%; right: 10%;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%);
          filter: blur(44px); pointer-events: none;
          animation: loginOrb2 24s ease-in-out infinite;
        }

        /* Top gold hairline */
        .login-hairline {
          position: absolute; top: 0; left: 50%;
          transform: translateX(-50%);
          width: 200px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent);
          pointer-events: none;
        }

        /* Grain */
        .login-grain {
          position: absolute; inset: 0; opacity: 0.022;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px; pointer-events: none;
        }

        /* Glass card */
        .login-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 460px;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(28px) saturate(160%);
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.08),
            inset 0 -1px 0 rgba(0,0,0,0.15),
            0 32px 80px rgba(0,0,0,0.6);
          border-radius: 28px;
          padding: 1.75rem 1.25rem;
        }
        @media (min-width: 520px) {
          .login-card { padding: 3rem 2.75rem; }
        }

        /* Input */
        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 0.875rem 1.1rem;
          font-size: 0.9rem;
          color: white;
          outline: none;
          transition: border-color 0.25s ease, background 0.25s ease;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.22); }
        .login-input:focus {
          border-color: rgba(201,168,76,0.45);
          background: rgba(255,255,255,0.06);
        }

        /* Submit button */
        .login-btn {
          width: 100%; padding: 0.95rem;
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #0B0B0B;
          background: linear-gradient(135deg, #C9A84C 0%, #E5C76B 55%, #C9A84C 100%);
          border: none; border-radius: 12px; cursor: pointer;
          transition: opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }
        .login-btn:hover:not(:disabled) {
          opacity: 0.88; transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(201,168,76,0.22);
        }
        .login-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* Label */
        .login-label {
          display: block; font-size: 0.67rem; font-weight: 600;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(255,255,255,0.38); margin-bottom: 0.55rem;
        }

        /* Error */
        .login-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.22);
          border-radius: 10px; padding: 0.8rem 1rem;
          font-size: 0.8rem; color: rgba(239,68,68,0.85);
        }

        /* Divider */
        .login-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          margin: 1.75rem 0;
        }
      `}</style>

      <div className="flex flex-col min-h-screen bg-brand-black">
        <Navbar />

        {/* Hero login section */}
        <main className="login-hero flex-1">
          <div className="login-glow" />
          <div className="login-orb-1" />
          <div className="login-orb-2" />
          <div className="login-hairline" />
          <div className="login-grain" />

          <div className="login-card">

            {/* Header */}
            <div className="text-center mb-9">
              <img
                src="https://res.cloudinary.com/dqiuwzvfb/image/upload/v1775629677/69007823-DC7E-42E1-AF8E-E57E11810549-Photoroom_nluyul.png"
                alt="AthloCode"
                className="h-14 w-auto object-contain mx-auto mb-6"
              />

              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 mb-5 rounded-full"
                style={{
                  background: 'rgba(201,168,76,0.06)',
                  border: '1px solid rgba(201,168,76,0.18)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A84C' }} />
                <span className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: '#C9A84C' }}>
                  {t('login.memberPortal')}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                {t('login.title')}
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {t('login.subtitle')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div className="login-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label className="login-label">{t('login.email')}</label>
                <input
                  id="login-email"
                  name="email"
                  className="login-input"
                  type="email"
                  inputMode="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (error) setError(''); }}
                  onBlur={() => setTouched(p => ({ ...p, email: true }))}
                  required
                  autoComplete="email"
                  style={{ borderColor: emailErr ? 'rgba(239,68,68,0.5)' : email && EMAIL_RE.test(email) ? 'rgba(34,197,94,0.35)' : undefined }}
                />
                {emailErr && (
                  <p style={{ fontSize: '0.68rem', color: 'rgba(239,68,68,0.8)', marginTop: '0.3rem' }}>
                    Please enter a valid email address.
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="login-label" style={{ marginBottom: 0 }}>{t('login.password')}</label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] transition-colors hover:opacity-80"
                    style={{ color: 'rgba(201,168,76,0.55)' }}
                  >
                    {t('login.forgotPassword')}
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    name="password"
                    className="login-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                    onBlur={() => setTouched(p => ({ ...p, password: true }))}
                    required
                    autoComplete="current-password"
                    maxLength={15}
                    style={{
                      paddingRight: '3rem',
                      borderColor: passwordHint
                        ? 'rgba(239,68,68,0.5)'
                        : password && !passwordHint
                        ? 'rgba(34,197,94,0.35)'
                        : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: '1rem', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.28)', padding: 0,
                    }}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Instant hint — shown as soon as user types, no blur needed */}
                {passwordHint && (
                  <p style={{ fontSize: '0.68rem', color: 'rgba(239,68,68,0.8)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <svg style={{ width: 10, height: 10, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    {passwordHint}
                  </p>
                )}
              </div>

              <div className="pt-1">
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? t('login.signingIn') : t('login.signIn')}
                </button>
              </div>
            </form>

            <div className="login-divider" />

            <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>
              {t('login.noAccount')}{' '}
              <Link
                href="/signup"
                className="font-semibold hover:opacity-80 transition-opacity"
                style={{ color: '#C9A84C' }}
              >
                {t('login.createOne')}
              </Link>
            </p>

            {/* Trust line */}
            <p
              className="text-center text-[11px] mt-5 tracking-wide"
              style={{ color: 'rgba(255,255,255,0.15)' }}
            >
              <span style={{ color: 'rgba(201,168,76,0.35)' }}>✓</span> {t('login.secureLogin')} &nbsp;·&nbsp;
              <span style={{ color: 'rgba(201,168,76,0.35)' }}>✓</span> {t('login.dataPrivate')}
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
