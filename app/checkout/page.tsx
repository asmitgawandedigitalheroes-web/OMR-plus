'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

interface PublicPlan {
  id: string;
  name: string;
  description: string | null;
  tagline: string | null;
  cta_text: string | null;
  price_sar: number;
  features: string[];
  is_featured: boolean;
  sort_order: number;
}

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

function CheckoutContent() {
  const { isRTL } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get('plan');
  const cancelled = searchParams.get('cancelled') === 'true';

  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(preselected);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? '' });
      }
    });
  }, []);

  useEffect(() => {
    fetch('/api/pricing-plans')
      .then(r => r.json())
      .then(d => {
        const loaded: PublicPlan[] = d.plans ?? [];
        setPlans(loaded);
        // Auto-select: use URL param if valid, else featured, else first
        if (preselected && loaded.find(p => p.id === preselected)) {
          setSelected(preselected);
        } else {
          const featured = loaded.find(p => p.is_featured);
          setSelected(featured?.id ?? loaded[0]?.id ?? null);
        }
      })
      .catch(() => setPlans([]))
      .finally(() => setPlansLoading(false));
  }, [preselected]);

  async function handleCheckout() {
    if (!selected) return;

    if (!user) {
      router.push(`/signup?redirect=/checkout?plan=${selected}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selected }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectedPlan = plans.find(p => p.id === selected) ?? null;

  return (
    <>
      <style>{`
        .checkout-page {
          min-height: 100vh;
          background: #0B0B0B;
          padding: 5rem 1rem 4rem;
        }
        @media (max-width: 640px) {
          .checkout-page { padding: 3rem 1rem 2rem; }
        }
        .checkout-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 1.5rem;
          cursor: pointer;
          transition: border-color 0.25s ease, background 0.25s ease, transform 0.25s ease;
        }
        .checkout-card:hover { transform: translateY(-2px); border-color: rgba(201,168,76,0.25); }
        .checkout-card.selected {
          border-color: rgba(201,168,76,0.6);
          background: rgba(201,168,76,0.04);
        }
        .checkout-card.featured { border-color: rgba(201,168,76,0.2); }
        .checkout-btn {
          width: 100%; padding: 1rem;
          background: linear-gradient(135deg, #C9A84C, #E8C76A);
          color: #0B0B0B; font-weight: 800;
          font-size: 0.85rem; letter-spacing: 0.12em; text-transform: uppercase;
          border: none; border-radius: 14px; cursor: pointer;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .checkout-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .radio-dot {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: border-color 0.2s ease;
        }
        .radio-dot.active { border-color: #C9A84C; }
        .radio-dot.active::after {
          content: ''; width: 8px; height: 8px;
          border-radius: 50%; background: #C9A84C;
        }
        @media (max-width: 640px) {
          .checkout-summary-card { padding: 1.5rem 1.25rem !important; }
          .checkout-summary-wrap { max-width: 100% !important; }
        }
      `}</style>

      <div className="checkout-page">
        <div className="max-w-4xl mx-auto">

          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-white/35 hover:text-white/70 transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            {isRTL ? 'العودة للرئيسية' : 'Back to home'}
          </Link>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full"
              style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-400">
                {isRTL ? 'اختر خطتك' : 'Choose Your Plan'}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              {isRTL ? 'ابدأ تحولك اليوم' : 'Start Your Transformation'}
            </h1>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              {isRTL
                ? 'اشتراك شهري قابل للإلغاء في أي وقت. لا رسوم خفية.'
                : 'Monthly subscription. Cancel anytime. No hidden fees.'}
            </p>
          </div>

          {/* Cancelled banner */}
          {cancelled && (
            <div className="mb-6 p-4 rounded-xl text-center text-sm"
              style={{ background: 'rgba(255,80,80,0.07)', border: '1px solid rgba(255,80,80,0.2)', color: 'rgba(255,120,120,0.9)' }}>
              {isRTL ? 'تم إلغاء الدفع. يمكنك المحاولة مرة أخرى.' : 'Payment was cancelled. You can try again below.'}
            </div>
          )}

          {/* Loading state */}
          {plansLoading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
            </div>
          )}

          {/* No plans */}
          {!plansLoading && plans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/30 text-sm">
                {isRTL ? 'لا توجد خطط متاحة حالياً.' : 'No plans available right now. Please check back later.'}
              </p>
            </div>
          )}

          {/* Plan cards */}
          {!plansLoading && plans.length > 0 && (
            <>
              <div className={`grid gap-4 mb-8 ${plans.length === 1 ? 'max-w-xs mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : 'md:grid-cols-3'}`}>
                {plans.map(plan => (
                  <div
                    key={plan.id}
                    className={`checkout-card ${selected === plan.id ? 'selected' : ''} ${plan.is_featured ? 'featured' : ''}`}
                    onClick={() => setSelected(plan.id)}
                  >
                    {plan.is_featured && (
                      <div className="mb-3">
                        <span className="text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}>
                          {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        {plan.tagline && (
                          <p className="text-[10px] tracking-[0.18em] uppercase mb-1" style={{ color: 'rgba(201,168,76,0.55)' }}>
                            {plan.tagline}
                          </p>
                        )}
                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      </div>
                      <div className={`radio-dot ${selected === plan.id ? 'active' : ''}`} />
                    </div>

                    <div className="mb-4" dir="ltr">
                      <span className="text-3xl font-black text-white">{plan.price_sar}</span>
                      <span className="text-white/40 text-sm ml-1">AED{isRTL ? '/شهر' : '/mo'}</span>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                          <span style={{ color: '#C9A84C', marginTop: '1px' }}><CheckIcon /></span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Checkout summary + CTA */}
              <div className="checkout-summary-wrap max-w-sm mx-auto">
                {selectedPlan && (
                  <div className="checkout-summary-card rounded-2xl p-5 mb-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex justify-between items-center mb-3 text-sm">
                      <span className="text-white/50">{isRTL ? 'الخطة المختارة' : 'Selected plan'}</span>
                      <span className="text-white font-semibold">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="text-white/50">{isRTL ? 'الفترة' : 'Billing'}</span>
                      <span className="text-white/70">{isRTL ? 'شهري' : 'Monthly'}</span>
                    </div>
                    <div className="h-px my-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 font-medium">{isRTL ? 'الإجمالي' : 'Total today'}</span>
                      <span className="text-amber-400 font-black text-lg" dir="ltr">{selectedPlan.price_sar} AED</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 rounded-xl text-xs text-center"
                    style={{ background: 'rgba(255,80,80,0.07)', border: '1px solid rgba(255,80,80,0.2)', color: 'rgba(255,120,120,0.9)' }}>
                    {error}
                  </div>
                )}

                <button className="checkout-btn" onClick={handleCheckout} disabled={loading || !selected}>
                  {loading
                    ? (isRTL ? 'جارٍ التحويل…' : 'Redirecting…')
                    : (selectedPlan?.cta_text ?? (isRTL ? 'ابدأ الآن' : 'Get Started'))}
                </button>

                <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {isRTL
                    ? 'دفع آمن عبر Stripe • Visa • Mastercard • Apple Pay'
                    : 'Secure payment via Stripe • Visa • Mastercard • Apple Pay'}
                </p>
                <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.18)' }}>
                  {isRTL ? (
                    <>بالمتابعة، أنت توافق على <Link href="/terms" style={{ color: 'rgba(201,168,76,0.5)', textDecoration: 'none' }}>شروط الخدمة</Link> و<Link href="/privacy" style={{ color: 'rgba(201,168,76,0.5)', textDecoration: 'none' }}>سياسة الخصوصية</Link></>
                  ) : (
                    <>By continuing, you agree to our <Link href="/terms" style={{ color: 'rgba(201,168,76,0.5)', textDecoration: 'none' }}>Terms of Service</Link> and <Link href="/privacy" style={{ color: 'rgba(201,168,76,0.5)', textDecoration: 'none' }}>Privacy Policy</Link></>
                  )}
                </p>

                {!user && (
                  <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {isRTL
                      ? 'ستُطلب منك إنشاء حساب قبل الدفع'
                      : "You'll be asked to create an account before payment"}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0B0B0B' }} />}>
      <CheckoutContent />
    </Suspense>
  );
}
