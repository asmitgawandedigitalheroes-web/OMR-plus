'use client';

import { useLanguage } from '@/context/LanguageContext';

interface PublicPlan {
  id: string;
  name: string;
  description: string | null;
  tagline: string | null;
  cta_text: string | null;
  price_sar: number;
  billing_type: 'monthly' | 'one_time';
  features: string[];
  is_featured: boolean;
  sort_order: number;
}

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function PricingSection({ plans }: { plans: PublicPlan[] }) {
  const { t } = useLanguage();

  if (plans.length === 0) return null;

  return (
    <>
      <style>{`
        .pricing-section {
          background: #0B0B0B;
          position: relative;
          overflow: hidden;
          padding: 7rem 0;
        }
        .pricing-grain {
          position: absolute; inset: 0; opacity: 0.022; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }
        .pricing-card {
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.45);
          border-radius: 20px;
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .pricing-card:hover {
          transform: translateY(-6px);
          border-color: rgba(201,168,76,0.18);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 16px 48px rgba(0,0,0,0.55);
        }
        .pricing-card-featured {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px) saturate(160%); -webkit-backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(201,168,76,0.22);
          box-shadow: inset 0 1px 0 rgba(201,168,76,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 12px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,168,76,0.05);
          border-radius: 24px;
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.4s ease, box-shadow 0.4s ease;
        }
        @media (min-width: 768px) {
          .pricing-card-featured { transform: scale(1.04); }
          .pricing-card-featured:hover { transform: scale(1.04) translateY(-7px); }
        }
        .pricing-card-featured:hover {
          border-color: rgba(201,168,76,0.35);
          box-shadow: inset 0 1px 0 rgba(201,168,76,0.12), 0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(201,168,76,0.08);
        }
        .pricing-card-inner-glow {
          position: absolute; inset: 0; border-radius: inherit;
          background: linear-gradient(145deg, rgba(201,168,76,0.04) 0%, transparent 50%);
          pointer-events: none;
        }
        .pricing-btn-default {
          display: block; width: 100%; padding: 0.875rem 1.5rem;
          text-align: center; font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #C9A84C; border: 1px solid rgba(201,168,76,0.35);
          background: transparent; border-radius: 10px; text-decoration: none;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .pricing-btn-default:hover { background: rgba(201,168,76,0.07); border-color: rgba(201,168,76,0.6); }
        .pricing-btn-featured {
          display: block; width: 100%; padding: 0.9rem 1.5rem;
          text-align: center; font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #0B0B0B; background: linear-gradient(135deg, #C9A84C 0%, #E5C76B 55%, #C9A84C 100%);
          border: none; border-radius: 10px; text-decoration: none;
          transition: opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }
        .pricing-btn-featured:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(201,168,76,0.22); }
      `}</style>

      <section className="pricing-section">
        <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(201,168,76,0.06) 0%, transparent 55%)' }} />
        <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)' }} />
        <div className="pricing-grain" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-7 rounded-full"
              style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A84C' }} />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#C9A84C' }}>
                {t('pricing.badge')}
              </span>
            </div>

            <h2 dir="auto" className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white mb-5 tracking-tight leading-[1.1]">
              {t('pricing.title')}{' '}
              <span style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #E8C76A 50%, #C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {t('pricing.titleHighlight')}
              </span>
            </h2>

            <p dir="auto" className="text-white/40 max-w-md mx-auto text-base leading-relaxed tracking-wide">
              {t('pricing.subtitle')}
            </p>

            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3))' }} />
              <span className="text-[10px] tracking-[0.22em] uppercase" style={{ color: 'rgba(201,168,76,0.45)' }}>
                {t('pricing.consultation')}
              </span>
              <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.3), transparent)' }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center mb-20" style={{ rowGap: '3.5rem', columnGap: '1.5rem' }}>
            {(() => {
              // Always put featured plan in the middle slot
              const featured = plans.filter(p => p.is_featured);
              const nonFeatured = plans.filter(p => !p.is_featured);
              const mid = Math.floor(nonFeatured.length / 2);
              const ordered = [...nonFeatured.slice(0, mid), ...featured, ...nonFeatured.slice(mid)];
              return ordered;
            })().map(plan => (
              <div key={plan.id} className={`relative p-8 flex flex-col h-full ${plan.is_featured ? 'pricing-card-featured' : 'pricing-card'}`}>
                <div className="pricing-card-inner-glow" />

                {plan.is_featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase rounded-full"
                      style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', backdropFilter: 'blur(8px)' }}>
                      <span className="w-1 h-1 rounded-full bg-current" />
                      {t('pricing.popular')}
                    </span>
                  </div>
                )}

                <div className="relative z-10 mb-6">
                  {plan.tagline && (
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(201,168,76,0.5)' }}>
                      {plan.tagline}
                    </p>
                  )}
                  <h3 dir="auto" className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                </div>

                <div className="relative z-10 mb-6 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-start gap-1.5">
                    <span className="text-sm font-medium mt-3" style={{ color: 'rgba(201,168,76,0.6)' }}>AED</span>
                    <span className="text-6xl font-black leading-none tracking-tight"
                      style={{
                        background: plan.is_featured ? 'linear-gradient(135deg, #C9A84C, #E8C76A)' : 'rgba(255,255,255,0.85)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      }}>
                      {plan.price_sar}
                    </span>
                    {plan.billing_type !== 'one_time' && (
                      <span className="text-sm font-medium mt-auto mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {t('pricing.perMonth')}
                      </span>
                    )}
                    {plan.billing_type === 'one_time' && (
                      <span className="text-sm font-medium mt-auto mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {t('pricing.oneTime')}
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p dir="auto" className="text-[13px] leading-relaxed mt-3" style={{ color: 'rgba(255,255,255,0.38)' }}>{plan.description}</p>
                  )}
                </div>

                <ul className="relative z-10 space-y-3.5 flex-grow mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <span style={{ color: '#C9A84C', marginTop: '1px' }}><CheckIcon /></span>
                      <span className="text-[13px] leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="relative z-10">
                  <a href={`/checkout?plan=${plan.id}`} className={plan.is_featured ? 'pricing-btn-featured' : 'pricing-btn-default'}>
                    {plan.cta_text ?? t('pricing.plan1.cta')}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p dir="auto" className="text-xs tracking-wide" style={{ color: 'rgba(255,255,255,0.22)' }}>
              {t('pricing.footer1')}
              <br className="hidden sm:block" />
              <span dir="auto" className="mt-1 inline-block" style={{ color: 'rgba(201,168,76,0.4)' }}>
                {t('pricing.footer2')}
              </span>
            </p>
          </div>

        </div>
      </section>
    </>
  );
}
