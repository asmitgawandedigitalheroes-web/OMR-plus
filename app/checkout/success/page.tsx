'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

function CheckoutSuccessContent() {
  const { isRTL } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const type = searchParams.get('type'); // 'product' for one-time purchases
  const isProductPurchase = type === 'product';
  const [countdown, setCountdown] = useState(8);
  const [verified, setVerified] = useState(false);

  // For subscription purchases, verify the session in DB
  useEffect(() => {
    if (isProductPurchase) { setVerified(true); return; }
    if (!sessionId || verified) return;
    fetch('/api/stripe/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(r => r.json())
      .then(() => { setVerified(true); })
      .catch(() => { setVerified(true); });
  }, [sessionId, verified, isProductPurchase]);

  // Auto-redirect to dashboard after countdown (full reload to pick up fresh data)
  useEffect(() => {
    if (countdown <= 0 && verified) {
      window.location.href = isProductPurchase ? '/dashboard/client?tab=orders' : '/dashboard/client';
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, verified, isProductPurchase]);

  return (
    <>
      <style>{`
        .success-page {
          min-height: 100vh;
          background: #0B0B0B;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .success-card {
          max-width: 480px;
          width: 100%;
          text-align: center;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 24px;
          padding: 3rem 2rem;
        }
        .success-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(201,168,76,0.1);
          border: 2px solid rgba(201,168,76,0.3);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.5rem;
        }
        .success-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.85rem 2rem;
          background: linear-gradient(135deg, #C9A84C, #E8C76A);
          color: #0B0B0B; font-weight: 800;
          font-size: 0.82rem; letter-spacing: 0.1em; text-transform: uppercase;
          border: none; border-radius: 12px; cursor: pointer;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .success-btn:hover { opacity: 0.9; }
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(201,168,76,0); }
        }
        .success-icon { animation: pulse-gold 2s ease-in-out infinite; }
        @media (max-width: 480px) {
          .success-card { padding: 1.75rem 1.25rem; }
        }
      `}</style>

      <div className="success-page">
        <div className="success-card">
          {/* Animated check icon */}
          <div className="success-icon">
            <svg className="w-7 h-7" fill="none" stroke="#C9A84C" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          {isProductPurchase ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                {isRTL ? 'تم الشراء بنجاح!' : 'Purchase successful!'}
              </h1>
              <p className="text-white/45 text-sm mb-6 leading-relaxed">
                {isRTL
                  ? 'شكراً لك! يمكنك الوصول إلى طلبك من لوحة التحكم.'
                  : 'Thank you for your purchase. You can access your order from the dashboard.'}
              </p>
              <a href="/dashboard/client?tab=orders" className="success-btn" style={{ marginBottom: '0.75rem' }}>
                {isRTL ? 'عرض طلباتي' : 'View My Orders'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                {isRTL ? 'تم الاشتراك بنجاح!' : 'You\'re subscribed!'}
              </h1>
              <p className="text-white/45 text-sm mb-6 leading-relaxed">
                {isRTL
                  ? 'مرحباً بك في OMR+. سيتصل بك مدربك قريباً. في غضون ذلك، أكمل تسجيل البيانات في لوحة التحكم.'
                  : 'Welcome to OMR+. Your coach will reach out shortly. In the meantime, complete your onboarding in the dashboard.'}
              </p>

              {/* What happens next */}
              <div className="text-left mb-8 space-y-3">
                {[
                  { icon: '01', en: 'Complete your onboarding questionnaire', ar: 'أكمل استبيان التأهيل' },
                  { icon: '02', en: 'Your coach gets assigned within 24 hours', ar: 'يُعيَّن مدربك خلال ٢٤ ساعة' },
                  { icon: '03', en: 'Receive your custom plan within 48 hours', ar: 'استلم خطتك المخصصة خلال ٤٨ ساعة' },
                ].map(step => (
                  <div key={step.icon} className="flex items-start gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)', flexShrink: 0 }}>
                      {step.icon}
                    </span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {isRTL ? step.ar : step.en}
                    </span>
                  </div>
                ))}
              </div>

              <a href="/dashboard/client" className="success-btn">
                {isRTL ? 'انتقل إلى لوحة التحكم' : 'Go to Dashboard'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </>
          )}

          <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {isRTL
              ? `تحويل تلقائي خلال ${countdown} ثانية…`
              : `Auto-redirecting in ${countdown}s…`}
          </p>

          {sessionId && (
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.15)' }}>
              {isRTL ? 'رقم الجلسة: ' : 'Session: '}{sessionId.slice(-8)}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0B0B0B' }} />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
