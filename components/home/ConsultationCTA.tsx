'use client';

import { waUrl } from '@/lib/contact';

import AnimateOnScroll from '@/components/ui/AnimateOnScroll';
import { useLanguage } from '@/context/LanguageContext';

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function ConsultationCTA() {
  const { t } = useLanguage();
  const points = [
    t('cta.point1'),
    t('cta.point2'),
    t('cta.point3'),
    t('cta.point4'),
  ];
  return (
    <>
      <style>{`
        /* ── Section ── */
        .cta-section {
          position: relative;
          overflow: hidden;
          padding: 5rem 0 5.5rem;
          background: #0B0B0B;
        }
        @media (min-width: 640px) {
          .cta-section { padding: 7rem 0 8rem; }
        }
        @media (min-width: 1024px) {
          .cta-section { padding: 9rem 0 10rem; }
        }

        /* ── Background ── */
        .cta-bg-shift {
          position: absolute;
          inset: 0;
          background: #0B0B0B;
          pointer-events: none;
        }

        /* ── Gold radial glow ── */
        .cta-glow-center {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(201,168,76,0.09) 0%, transparent 60%);
          pointer-events: none;
        }

        /* ── Static orbs ── */
        .cta-orb-1 {
          position: absolute;
          top: 20%;
          left: 15%;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%);
          filter: blur(50px);
          pointer-events: none;
        }
        .cta-orb-2 {
          position: absolute;
          bottom: 20%;
          right: 12%;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%);
          filter: blur(44px);
          pointer-events: none;
        }

        /* ── Top gold divider ── */
        .cta-divider {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 180px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.35), transparent);
        }


        /* ── Glass container ── */
        .cta-glass {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(28px) saturate(160%);
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -1px 0 rgba(0, 0, 0, 0.15),
            0 8px 48px rgba(0, 0, 0, 0.5);
          border-radius: 24px;
          padding: 1.75rem 1.25rem;
        }
        @media (min-width: 640px) {
          .cta-glass { padding: 2.5rem 3rem; }
        }
        @media (min-width: 1024px) {
          .cta-glass { padding: 3rem 3.5rem; }
        }

        /* ── CTA button ── */
        /* ── Grain ── */
        .cta-grain {
          position: absolute;
          inset: 0;
          opacity: 0.022;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          pointer-events: none;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.1rem 3rem;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C9A84C;
          border: 1px solid rgba(201, 168, 76, 0.45);
          background: transparent;
          border-radius: 10px;
          text-decoration: none;
          transition:
            background 0.35s ease,
            border-color 0.35s ease,
            transform 0.35s ease,
            box-shadow 0.35s ease;
        }
        .cta-btn:hover {
          background: rgba(201, 168, 76, 0.08);
          border-color: rgba(201, 168, 76, 0.7);
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(201, 168, 76, 0.12);
        }
      `}</style>

      <section className="cta-section">
        {/* Backgrounds */}
        <div className="cta-bg-shift" />
        <div className="cta-glow-center" />
        <div className="cta-orb-1" />
        <div className="cta-orb-2" />
        <div className="cta-divider" />
        <div className="cta-grain" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-glass text-center">

            {/* Label */}
            <AnimateOnScroll>
              <div
                className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-8 rounded-full"
                style={{
                  background: 'rgba(201,168,76,0.06)',
                  border: '1px solid rgba(201,168,76,0.18)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A84C' }} />
                <span
                  className="text-xs font-semibold tracking-[0.2em] uppercase"
                  style={{ color: '#C9A84C' }}
                >
                  {t('cta.btn')}
                </span>
              </div>
            </AnimateOnScroll>

            {/* Headline */}
            <AnimateOnScroll delay={80}>
              <h2 dir="auto" className="text-4xl sm:text-5xl lg:text-[3.2rem] font-bold text-white leading-[1.1] tracking-tight mb-6">
                {t('cta.title')}
              </h2>
            </AnimateOnScroll>

            {/* Subtitle */}
            <AnimateOnScroll delay={150}>
              <p
                dir="auto"
                className="text-base leading-[1.9] tracking-wide mb-10 max-w-lg mx-auto"
                style={{ color: 'rgba(255,255,255,0.42)' }}
              >
                {t('cta.subtitle')}
              </p>
            </AnimateOnScroll>

            {/* Feature points */}
            <AnimateOnScroll delay={210}>
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-3.5 mb-12">
                {points.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <span style={{ color: '#C9A84C' }}>
                      <CheckIcon />
                    </span>
                    <span
                      dir="auto"
                      className="text-[13px] tracking-wide"
                      style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>

            {/* CTAs */}
            <AnimateOnScroll delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={waUrl('I want to apply for access to AthloCode')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 font-bold tracking-widest uppercase"
                  style={{
                    padding: '1.1rem 2.5rem',
                    fontSize: '0.72rem',
                    background: 'linear-gradient(135deg, #C9A84C, #E5C76B)',
                    color: '#0A0A0A',
                    borderRadius: 10,
                    textDecoration: 'none',
                    boxShadow: '0 8px 28px rgba(201,168,76,0.2)',
                  }}
                >
                  {t('cta.btn')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>
                <a
                  href={waUrl('I want to join the AthloCode waitlist')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold tracking-widest uppercase"
                  style={{
                    padding: '1.1rem 2rem',
                    fontSize: '0.72rem',
                    color: 'rgba(201,168,76,0.7)',
                    border: '1px solid rgba(201,168,76,0.25)',
                    borderRadius: 10,
                    textDecoration: 'none',
                    background: 'transparent',
                  }}
                >
                  {t('cta.secondary')}
                </a>
              </div>
            </AnimateOnScroll>

            {/* Footnote */}
            <AnimateOnScroll delay={380}>
              <p
                className="mt-8 text-xs tracking-wide"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                Questions? Reach us on{' '}
                <a
                  href={waUrl('Hi AthloCode')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'rgba(201,168,76,0.5)' }}
                  className="hover:opacity-80 transition-opacity"
                >
                  WhatsApp
                </a>
                {' '}or email{' '}
                <a
                  href="mailto:support@athlocode.com"
                  style={{ color: 'rgba(201,168,76,0.5)' }}
                  className="hover:opacity-80 transition-opacity"
                >
                  support@athlocode.com
                </a>
              </p>
            </AnimateOnScroll>

          </div>
        </div>
      </section>
    </>
  );
}
