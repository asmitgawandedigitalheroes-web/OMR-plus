'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import { PW_RULES, isPasswordValid } from '@/lib/password';

/* ─── helpers ─────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignup(form: {
  full_name: string; email: string; phone: string;
  password: string; confirm: string; agreed: boolean;
}) {
  if (!form.full_name.trim()) return 'Full name is required.';
  if (!EMAIL_RE.test(form.email)) return 'Please enter a valid email address.';
  if (form.phone && !/^[0-9+\s\-()]{7,20}$/.test(form.phone))
    return 'Phone must contain only digits, +, spaces or dashes.';
  if (!isPasswordValid(form.password))
    return 'Password must be 8–15 characters with at least 1 uppercase letter, 1 number, and 1 symbol — no spaces.';
  if (form.password !== form.confirm) return 'Passwords do not match.';
  if (!form.agreed) return 'You must agree to the Terms of Service and Privacy Policy.';
  return null;
}

/* ─── icon helpers ────────────────────────────────────── */
const EyeOpen = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
const EyeOff = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);
const CheckIcon = () => (
  <svg style={{ width: 10, height: 10 }} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
  </svg>
);

/* ─── component ───────────────────────────────────────── */
export default function SignUpPage() {
  const { signUp } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirm: '', agreed: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resentOk, setResentOk] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const update = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = field === 'agreed' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
    if (error) setError('');
  }, [error]);

  const blur = (field: string) => () => setTouched(p => ({ ...p, [field]: true }));

  /* phone: strip non-numeric input except + - () space */
  const onPhoneKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = /^[0-9+\-() ]$/;
    if (!allowed.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ full_name: true, email: true, phone: true, password: true, confirm: true, agreed: true });
    const msg = validateSignup(form);
    if (msg) { setError(msg); return; }
    setLoading(true);
    const { error: err } = await signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || undefined,
    });
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      // Show "check your email" screen
      setSentToEmail(form.email.trim().toLowerCase());
      setEmailSent(true);
    }
  };

  /* resend confirmation email */
  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setResentOk(false);
    setResendError('');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const { error: err } = await supabase.auth.resend({
      type: 'signup',
      email: sentToEmail,
      options: { emailRedirectTo: `${appUrl}/confirm-email` },
    });
    setResending(false);
    if (err) {
      setResendError(err.message);
    } else {
      setResentOk(true);
      // 60-second cooldown before user can resend again
      setResendCooldown(60);
      const tick = setInterval(() => {
        setResendCooldown(n => {
          if (n <= 1) { clearInterval(tick); return 0; }
          return n - 1;
        });
      }, 1000);
    }
  };

  /* inline field error helpers */
  const emailErr = touched.email && form.email && !EMAIL_RE.test(form.email);
  const confirmErr = touched.confirm && form.confirm && form.confirm !== form.password;

  return (
    <>
      <style>{`
        /* ── page wrapper ── */
        .su-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #0A0A0A;
        }

        /* ── layout ── */
        .su-root {
          flex: 1;
          display: flex;
          background: #0A0A0A;
          font-family: inherit;
          /* fill remaining viewport after navbar */
          min-height: 0;
        }
        @media (min-width: 900px) {
          .su-root { height: calc(100vh - 80px - 48px); overflow: hidden; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── slim footer bar ── */
        .su-footer-bar {
          height: 48px;
          background: #080808;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          flex-shrink: 0;
        }
        .su-footer-copy {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.18);
          letter-spacing: 0.02em;
        }
        .su-footer-links {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .su-footer-links a {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.22);
          text-decoration: none;
          transition: color 0.2s;
        }
        .su-footer-links a:hover { color: rgba(201,168,76,0.7); }

        /* ── left brand panel ── */
        .su-brand {
          display: none;
          position: relative;
          overflow: hidden;
          background: #0A0A0A;
        }
        @media (min-width: 900px) {
          .su-brand { display: flex; flex-direction: column; width: 42%; flex-shrink: 0; }
        }
        .su-brand-img {
          position: absolute; inset: 0;
          background-image: url('https://res.cloudinary.com/dqiuwzvfb/image/upload/v1774869469/ChatGPT_Image_Mar_30_2026_04_47_36_PM_l244wh.png');
          background-size: cover; background-position: center;
          filter: brightness(0.22) saturate(0.5);
        }
        .su-brand-ov {
          position: absolute; inset: 0;
          background: linear-gradient(105deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.82) 100%);
        }
        .su-brand-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 40% 55%, rgba(201,168,76,0.1) 0%, transparent 55%);
        }
        .su-brand-content {
          position: relative; z-index: 2;
          height: 100%; display: flex; flex-direction: column; justify-content: center;
          padding: 2.5rem 2.75rem;
        }
        .su-brand-back {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em;
          color: rgba(255,255,255,0.28); text-decoration: none;
          text-transform: uppercase; transition: color 0.2s;
          margin-bottom: 2rem;
        }
        .su-brand-back:hover { color: rgba(201,168,76,0.75); }
        .su-brand-logo { height: 54px; width: auto; object-fit: contain; margin-bottom: 2rem; display: block; }
        .su-brand-pill {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.22);
          border-radius: 999px; padding: 0.35rem 0.9rem; margin-bottom: 1.5rem;
        }
        .su-brand-dot { width: 6px; height: 6px; border-radius: 50%; background: #C9A84C; flex-shrink: 0; }
        .su-brand-pill-text {
          font-size: 0.58rem; font-weight: 700; color: #C9A84C;
          letter-spacing: 0.24em; text-transform: uppercase;
        }
        .su-brand-h1 {
          font-size: clamp(1.6rem, 2.5vw, 2.4rem); font-weight: 900;
          color: #fff; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 1rem;
        }
        .su-brand-h1 span {
          background: linear-gradient(135deg,#C9A84C 0%,#F0D878 45%,#C9A84C 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .su-brand-sub { font-size: 0.82rem; color: rgba(255,255,255,0.38); line-height: 1.75; margin-bottom: 2.5rem; max-width: 300px; }
        .su-brand-stats { display: flex; flex-direction: column; gap: 1rem; }
        .su-brand-stat { display: flex; align-items: center; gap: 0.75rem; }
        .su-brand-stat-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.18);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .su-brand-stat-num { font-size: 0.95rem; font-weight: 800; color: #C9A84C; line-height: 1; }
        .su-brand-stat-lbl { font-size: 0.68rem; color: rgba(255,255,255,0.38); margin-top: 1px; }
        .su-brand-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(201,168,76,0.25), transparent);
          margin: 2.5rem 0;
        }
        .su-brand-trust { font-size: 0.68rem; color: rgba(255,255,255,0.22); line-height: 1.6; }
        .su-brand-trust strong { color: rgba(201,168,76,0.5); font-weight: 600; }

        /* ── right form panel ── */
        .su-form-panel {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 2rem 1.25rem;
          position: relative; overflow-x: hidden; overflow-y: auto;
          background: #0B0B0B;
        }
        @media (min-width: 900px) {
          .su-form-panel {
            border-left: 1px solid rgba(255,255,255,0.05);
            overflow-y: auto;
          }
        }
        .su-form-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 40%, rgba(201,168,76,0.06) 0%, transparent 55%);
          pointer-events: none;
        }
        .su-form-grain {
          position: absolute; inset: 0; opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px; pointer-events: none;
        }

        /* ── card ── */
        .su-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 440px;
          background: rgba(255,255,255,0.035);
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.5);
          border-radius: 22px;
          padding: 1.5rem 1.25rem 1.25rem;
        }
        @media (min-width: 480px) {
          .su-card { padding: 2rem 2rem 1.75rem; }
        }

        /* ── inputs ── */
        .su-label {
          display: block; font-size: 0.62rem; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,255,255,0.4); margin-bottom: 0.4rem;
        }
        .su-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px; padding: 0.7rem 0.95rem;
          font-size: 0.875rem; color: white; outline: none;
          transition: border-color 0.22s, background 0.22s;
          box-sizing: border-box;
        }
        .su-input::placeholder { color: rgba(255,255,255,0.22); }
        .su-input:focus { border-color: rgba(201,168,76,0.4); background: rgba(255,255,255,0.055); }
        .su-input.error { border-color: rgba(239,68,68,0.5) !important; }
        .su-input.success { border-color: rgba(34,197,94,0.35); }
        .su-field-err { font-size: 0.68rem; color: rgba(239,68,68,0.8); margin-top: 0.3rem; }

        /* ── password eye btn ── */
        .su-eye {
          position: absolute; right: 0.85rem; top: 50%;
          transform: translateY(-50%); background: none;
          border: none; cursor: pointer; color: rgba(255,255,255,0.3);
          padding: 0; display: flex; align-items: center;
          transition: color 0.2s;
        }
        .su-eye:hover { color: rgba(255,255,255,0.6); }

        /* ── live password checklist ── */
        .su-pw-rules {
          margin-top: 0.45rem;
          display: flex; flex-direction: column; gap: 0.22rem;
        }
        .su-pw-rule {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.64rem; font-weight: 500;
          transition: color 0.18s ease;
        }
        .su-pw-rule-dot {
          width: 13px; height: 13px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.18s ease, border-color 0.18s ease;
        }
        .su-pw-rule.pass .su-pw-rule-dot {
          background: rgba(34,197,94,0.15);
          border: 1px solid rgba(34,197,94,0.5);
        }
        .su-pw-rule.fail .su-pw-rule-dot {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.3);
        }
        .su-pw-rule.idle .su-pw-rule-dot {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .su-pw-rule.pass { color: rgba(34,197,94,0.85); }
        .su-pw-rule.fail { color: rgba(239,68,68,0.75); }
        .su-pw-rule.idle { color: rgba(255,255,255,0.28); }

        /* ── checkbox ── */
        .su-checkbox-row {
          display: flex; align-items: flex-start; gap: 0.65rem;
          cursor: pointer; user-select: none;
        }
        .su-checkbox-box {
          width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px;
          border-radius: 4px; border: 1.5px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.04);
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s, background 0.2s;
        }
        .su-checkbox-box.checked {
          background: #C9A84C; border-color: #C9A84C;
        }
        .su-checkbox-text {
          font-size: 0.72rem; color: rgba(255,255,255,0.35); line-height: 1.55;
        }
        .su-checkbox-text a { color: rgba(201,168,76,0.7); text-decoration: none; }
        .su-checkbox-text a:hover { color: #C9A84C; }

        /* ── submit btn ── */
        .su-btn {
          width: 100%; padding: 0.82rem;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.16em;
          text-transform: uppercase; color: #0B0B0B;
          background: linear-gradient(135deg, #C9A84C 0%, #E5C76B 55%, #C9A84C 100%);
          border: none; border-radius: 10px; cursor: pointer;
          transition: opacity 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .su-btn:hover:not(:disabled) {
          opacity: 0.88; transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(201,168,76,0.22);
        }
        .su-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        /* ── error banner ── */
        .su-error-banner {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.22);
          border-radius: 9px; padding: 0.65rem 0.9rem;
          font-size: 0.78rem; color: rgba(239,68,68,0.88);
          display: flex; align-items: center; gap: 0.55rem;
        }

        /* ── divider ── */
        .su-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          margin: 1.1rem 0;
        }

        /* ── mobile logo — hidden now that Navbar is present ── */
        .su-mobile-logo { display: none; }

        /* ── two-col responsive grid (phone + password) ── */
        .su-two-col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        @media (min-width: 600px) {
          .su-two-col { grid-template-columns: 1fr 1fr; }
        }

        /* ── mobile form panel: allow scroll, prevent clipping ── */
        @media (max-width: 899px) {
          .su-form-panel {
            overflow-y: auto;
            padding: 1.5rem 1rem;
            align-items: flex-start;
            padding-top: 2rem;
          }
        }
      `}</style>

      <div className="su-page">
        <Navbar />

        <div className="su-root">

          {/* ── Brand panel (desktop only) ── */}
          <div className="su-brand">
            <div className="su-brand-img" />
            <div className="su-brand-ov" />
            <div className="su-brand-glow" />

            <div className="su-brand-content">
              <Link href="/" className="su-brand-back">
                <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back to Website
              </Link>

              <img
                src="https://res.cloudinary.com/dqiuwzvfb/image/upload/v1775629677/69007823-DC7E-42E1-AF8E-E57E11810549-Photoroom_nluyul.png"
                alt="AthloCode"
                className="su-brand-logo"
              />

              <div className="su-brand-pill">
                <span className="su-brand-dot" />
                <span className="su-brand-pill-text">Member Portal</span>
              </div>

              <h1 className="su-brand-h1">
                Start Your<br />
                <span>Transformation</span><br />
                Today.
              </h1>
              <p className="su-brand-sub">
                Join AthloCode and get a precision-engineered fitness system built around your body and goals.
              </p>

              <div className="su-brand-stats">
                {[
                  { num: '500+', lbl: 'Members Transformed', icon: <svg style={{ width: 14, height: 14, color: '#C9A84C' }} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" /></svg> },
                  { num: '95%', lbl: 'Goal Achievement Rate', icon: <svg style={{ width: 14, height: 14, color: '#C9A84C' }} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg> },
                  { num: '12+', lbl: 'Expert Coaches', icon: <svg style={{ width: 14, height: 14, color: '#C9A84C' }} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497" /></svg> },
                ].map((s, i) => (
                  <div key={i} className="su-brand-stat">
                    <div className="su-brand-stat-icon">{s.icon}</div>
                    <div>
                      <div className="su-brand-stat-num">{s.num}</div>
                      <div className="su-brand-stat-lbl">{s.lbl}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="su-brand-divider" />
              <p className="su-brand-trust">
                <strong>✓ SSL Secured</strong> &nbsp;·&nbsp; <strong>✓ Data Private</strong> &nbsp;·&nbsp; <strong>✓ Cancel Anytime</strong>
              </p>
            </div>
          </div>

          {/* ── Form panel ── */}
          <div className="su-form-panel">
            <div className="su-form-glow" />
            <div className="su-form-grain" />

            <div className="su-card">

              {/* ── Email-sent state ─────────────────────── */}
              {emailSent && (
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  {/* Envelope icon */}
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%', margin: '0 auto 1.5rem',
                    background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg style={{ width: 28, height: 28 }} fill="none" stroke="#C9A84C" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>

                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)',
                    borderRadius: 999, padding: '0.3rem 0.85rem', marginBottom: '1.1rem',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                      Check Your Inbox
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.6rem' }}>
                    Confirm your email
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                    We&apos;ve sent a confirmation link to<br />
                    <strong style={{ color: 'rgba(201,168,76,0.8)', fontWeight: 600 }}>{sentToEmail}</strong>
                  </p>

                  <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12, padding: '0.9rem 1rem', marginBottom: '1.5rem', textAlign: 'left',
                  }}>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.65 }}>
                      📬 &nbsp;Open the email from <strong style={{ color: 'rgba(255,255,255,0.5)' }}>AthloCode</strong> and click the
                      confirmation button inside to activate your account.
                    </p>
                  </div>

                  <div style={{
                    height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
                    margin: '1.25rem 0',
                  }} />

                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)', marginBottom: '0.85rem' }}>
                    Didn&apos;t receive the email?
                  </p>

                  {/* Resend success banner */}
                  {resentOk && (
                    <div style={{
                      background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)',
                      borderRadius: 10, padding: '0.65rem 0.9rem', marginBottom: '0.85rem',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                      <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="rgba(34,197,94,0.85)" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      <span style={{ fontSize: '0.76rem', color: 'rgba(34,197,94,0.85)' }}>
                        Confirmation email resent — check your inbox.
                      </span>
                    </div>
                  )}

                  {/* Resend error banner */}
                  {resendError && (
                    <div style={{
                      background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: 10, padding: '0.65rem 0.9rem', marginBottom: '0.85rem',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                      <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="rgba(239,68,68,0.8)" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                      <span style={{ fontSize: '0.76rem', color: 'rgba(239,68,68,0.85)' }}>{resendError}</span>
                    </div>
                  )}

                  {/* Resend button */}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || resendCooldown > 0}
                    style={{
                      width: '100%',
                      background: resendCooldown > 0 ? 'rgba(255,255,255,0.03)' : 'rgba(201,168,76,0.07)',
                      border: `1px solid ${resendCooldown > 0 ? 'rgba(255,255,255,0.07)' : 'rgba(201,168,76,0.25)'}`,
                      borderRadius: 10, padding: '0.72rem',
                      fontSize: '0.72rem', fontWeight: 600,
                      color: resendCooldown > 0 ? 'rgba(255,255,255,0.25)' : 'rgba(201,168,76,0.85)',
                      cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.06em', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '0.5rem',
                      transition: 'all 0.2s',
                      marginBottom: '0.6rem',
                    }}
                  >
                    {resending ? (
                      <>
                        <svg style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Sending…
                      </>
                    ) : resendCooldown > 0 ? (
                      <>Resend available in {resendCooldown}s</>
                    ) : (
                      <>
                        <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Resend Confirmation Email
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setEmailSent(false); setError(''); setResentOk(false); setResendError(''); setResendCooldown(0); }}
                    style={{
                      background: 'none', border: 'none',
                      fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)',
                      cursor: 'pointer', padding: '0.3rem',
                      textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.12)',
                    }}
                  >
                    Change email address
                  </button>
                </div>
              )}

              {/* ── Normal form ──────────────────────────── */}
              {!emailSent && <>
              {/* Mobile logo */}
              <div className="su-mobile-logo">
                <img
                  src="https://res.cloudinary.com/dqiuwzvfb/image/upload/v1775629677/69007823-DC7E-42E1-AF8E-E57E11810549-Photoroom_nluyul.png"
                  alt="AthloCode"
                  style={{ height: 44, width: 'auto', objectFit: 'contain' }}
                />
              </div>

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
                  {t('signup.title')}
                </h1>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{t('signup.subtitle')}</p>
              </div>

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                {/* Error banner */}
                {error && (
                  <div className="su-error-banner">
                    <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Full name */}
                <div>
                  <label className="su-label">{t('signup.fullName')}</label>
                  <input
                    className={`su-input${touched.full_name && !form.full_name.trim() ? ' error' : ''}`}
                    type="text"
                    placeholder={t('signup.fullNamePlaceholder')}
                    value={form.full_name}
                    onChange={update('full_name')}
                    onBlur={blur('full_name')}
                    required
                    autoComplete="name"
                  />
                  {touched.full_name && !form.full_name.trim() && (
                    <p className="su-field-err">Full name is required.</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="su-label">{t('signup.email')}</label>
                  <input
                    className={`su-input${emailErr ? ' error' : form.email && EMAIL_RE.test(form.email) ? ' success' : ''}`}
                    type="email"
                    inputMode="email"
                    placeholder={t('signup.emailPlaceholder')}
                    value={form.email}
                    onChange={update('email')}
                    onBlur={blur('email')}
                    required
                    autoComplete="email"
                  />
                  {emailErr && <p className="su-field-err">Please enter a valid email address (e.g. you@example.com).</p>}
                </div>

                {/* Phone + Password side-by-side */}
                <div className="su-two-col">
                  {/* Phone */}
                  <div>
                    <label className="su-label">
                      Phone <span style={{ color: 'rgba(255,255,255,0.18)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(opt.)</span>
                    </label>
                    <input
                      className={`su-input${touched.phone && form.phone && !/^[0-9+\s\-()]{7,20}$/.test(form.phone) ? ' error' : ''}`}
                      type="tel"
                      inputMode="tel"
                      placeholder="+971 5x xxx xxxx"
                      value={form.phone}
                      onChange={update('phone')}
                      onBlur={blur('phone')}
                      onKeyDown={onPhoneKey}
                      maxLength={20}
                      autoComplete="tel"
                    />
                    {touched.phone && form.phone && !/^[0-9+\s\-()]{7,20}$/.test(form.phone) && (
                      <p className="su-field-err">Numbers only.</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="su-label">{t('signup.password')}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="signup-password"
                        name="password"
                        className={`su-input${touched.password && form.password && !isPasswordValid(form.password) ? ' error' : touched.password && isPasswordValid(form.password) ? ' success' : ''}`}
                        type={showPw ? 'text' : 'password'}
                        placeholder="8–15 chars, A-Z, 0-9, !@#"
                        value={form.password}
                        onChange={update('password')}
                        onBlur={blur('password')}
                        required
                        autoComplete="new-password"
                        maxLength={15}
                        style={{ paddingRight: '2.5rem' }}
                        aria-describedby="pw-rules"
                      />
                      <button
                        type="button"
                        className="su-eye"
                        onClick={() => setShowPw(v => !v)}
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        {showPw ? <EyeOff /> : <EyeOpen />}
                      </button>
                    </div>

                    {/* Live checklist — shows immediately as user types */}
                    {form.password && (
                      <div id="pw-rules" className="su-pw-rules" role="list" aria-label="Password requirements">
                        {PW_RULES.map((rule) => {
                          const pass = rule.test(form.password);
                          const state = pass ? 'pass' : 'fail';
                          return (
                            <div key={rule.id} className={`su-pw-rule ${state}`} role="listitem">
                              <span className="su-pw-rule-dot">
                                {pass ? (
                                  <svg style={{ width: 7, height: 7 }} fill="none" stroke="rgba(34,197,94,0.9)" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                                  </svg>
                                ) : (
                                  <svg style={{ width: 7, height: 7 }} fill="none" stroke="rgba(239,68,68,0.7)" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                  </svg>
                                )}
                              </span>
                              {rule.label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="su-label">{t('signup.confirmPassword')}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className={`su-input${confirmErr ? ' error' : form.confirm && form.confirm === form.password ? ' success' : ''}`}
                      type={showCf ? 'text' : 'password'}
                      placeholder={t('signup.confirmPlaceholder')}
                      value={form.confirm}
                      onChange={update('confirm')}
                      onBlur={blur('confirm')}
                      required
                      autoComplete="new-password"
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button type="button" className="su-eye" onClick={() => setShowCf(v => !v)}>
                      {showCf ? <EyeOff /> : <EyeOpen />}
                    </button>
                  </div>
                  {confirmErr && <p className="su-field-err">Passwords do not match.</p>}
                </div>

                {/* Terms checkbox */}
                <label className="su-checkbox-row" style={{ marginTop: '0.1rem' }}>
                  <input
                    type="checkbox"
                    checked={form.agreed}
                    onChange={update('agreed')}
                    style={{ display: 'none' }}
                  />
                  <span className={`su-checkbox-box${form.agreed ? ' checked' : ''}`}>
                    {form.agreed && <CheckIcon />}
                  </span>
                  <span className="su-checkbox-text">
                    I agree to the{' '}
                    <Link href="/terms" onClick={e => e.stopPropagation()}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" onClick={e => e.stopPropagation()}>Privacy Policy</Link>
                    {touched.agreed && !form.agreed && (
                      <span style={{ display: 'block', color: 'rgba(239,68,68,0.8)', fontSize: '0.65rem', marginTop: '0.2rem' }}>
                        You must agree to continue.
                      </span>
                    )}
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  className="su-btn"
                  disabled={loading || !form.agreed}
                  style={{ marginTop: '0.25rem' }}
                >
                  {loading ? t('signup.creating') : t('signup.createAccount')}
                </button>
              </form>

              <div className="su-divider" />

              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                {t('signup.haveAccount')}{' '}
                <Link href="/login" style={{ color: '#C9A84C', fontWeight: 600 }}>{t('signup.signIn')}</Link>
              </p>
              </>}{/* end !emailSent */}
            </div>
          </div>
        </div>

        {/* ── Slim footer bar ── */}
        <footer className="su-footer-bar">
          <span className="su-footer-copy">© {new Date().getFullYear()} AthloCode. All rights reserved.</span>
          <div className="su-footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </footer>

      </div>{/* su-page */}
    </>
  );
}
