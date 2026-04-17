'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // Always show success — never reveal whether email exists
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .fp-hero {
          min-height: 100vh;
          background: #0B0B0B;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          padding: 5rem 1rem 3rem;
        }
        @media (min-width: 520px) { .fp-hero { padding: 8rem 1rem 5rem; } }
        .fp-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 45%, rgba(201,168,76,0.08) 0%, transparent 58%);
          pointer-events: none;
        }
        .fp-card {
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
        @media (min-width: 520px) { .fp-card { padding: 3rem 2.75rem; } }
        .fp-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 0.875rem 1.1rem;
          font-size: 0.9rem; color: white; outline: none;
          transition: border-color 0.25s ease, background 0.25s ease;
          box-sizing: border-box;
        }
        .fp-input::placeholder { color: rgba(255,255,255,0.22); }
        .fp-input:focus { border-color: rgba(201,168,76,0.45); background: rgba(255,255,255,0.06); }
        .fp-btn {
          width: 100%; padding: 0.95rem;
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #0B0B0B;
          background: linear-gradient(135deg, #C9A84C 0%, #E5C76B 55%, #C9A84C 100%);
          border: none; border-radius: 12px; cursor: pointer;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .fp-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-2px); }
        .fp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .fp-label {
          display: block; font-size: 0.67rem; font-weight: 600;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(255,255,255,0.38); margin-bottom: 0.55rem;
        }
        .fp-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.22);
          border-radius: 10px; padding: 0.8rem 1rem;
          font-size: 0.8rem; color: rgba(239,68,68,0.85);
          display: flex; align-items: center; gap: 0.5rem;
        }
        .fp-success {
          background: rgba(34,197,94,0.06);
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 14px; padding: 1.75rem 1.5rem;
          text-align: center;
        }
        .fp-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          margin: 1.75rem 0;
        }
      `}</style>

      <div className="flex flex-col min-h-screen bg-brand-black">
        <Navbar />

        <main className="fp-hero flex-1">
          <div className="fp-glow" />

          <div className="fp-card">
            {/* Header */}
            <div className="text-center mb-8">
              <img
                src="https://res.cloudinary.com/dqiuwzvfb/image/upload/v1775629677/69007823-DC7E-42E1-AF8E-E57E11810549-Photoroom_nluyul.png"
                alt="AthloCode"
                className="h-14 w-auto object-contain mx-auto mb-6"
              />
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 mb-5 rounded-full"
                style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A84C' }} />
                <span className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: '#C9A84C' }}>
                  Password Recovery
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                Forgot Password?
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            {submitted ? (
              <div className="fp-success">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="rgba(34,197,94,0.9)" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-white font-semibold mb-2">Check your email</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  We sent a password reset link to <span style={{ color: '#C9A84C' }}>{email}</span>.
                  Check your inbox (and spam folder).
                </p>
                <div className="fp-divider" />
                <Link href="/login" className="text-sm font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: '#C9A84C' }}>
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {error && (
                  <div className="fp-error">
                    <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="fp-email" className="fp-label">Email Address</label>
                  <input
                    id="fp-email"
                    name="email"
                    className="fp-input"
                    type="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (error) setError(''); }}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="pt-1">
                  <button type="submit" className="fp-btn" disabled={loading}>
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </div>

                <div className="fp-divider" />

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
