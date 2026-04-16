'use client';

import { waUrl } from '@/lib/contact';

import AnimateOnScroll from '@/components/ui/AnimateOnScroll';
import { useLanguage } from '@/context/LanguageContext';

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="12" y2="16" />
  </svg>
);

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const AwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

export default function HowItWorksSection() {
  const { t } = useLanguage();

  const steps = [
    { number: '01', titleKey: 'hiw.step1.title', descKey: 'hiw.step1.desc', icon: <CalendarIcon /> },
    { number: '02', titleKey: 'hiw.step2.title', descKey: 'hiw.step2.desc', icon: <ClipboardIcon /> },
    { number: '03', titleKey: 'hiw.step3.title', descKey: 'hiw.step3.desc', icon: <TargetIcon /> },
    { number: '04', titleKey: 'hiw.step4.title', descKey: 'hiw.step4.desc', icon: <AwardIcon /> },
  ];
  return (
    <>
      <style>{`
        .hiw-card {
          background: rgba(255, 255, 255, 0.055);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.11);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.09),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2),
            0 8px 32px rgba(0, 0, 0, 0.5),
            0 2px 8px rgba(0, 0, 0, 0.3);
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                      border-color 0.4s ease,
                      box-shadow 0.4s ease,
                      background 0.4s ease;
        }
        .hiw-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.075);
          border-color: rgba(201, 168, 76, 0.28);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 0 rgba(0, 0, 0, 0.15),
            0 20px 50px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(201, 168, 76, 0.08);
        }

        .hiw-cta-btn {
          color: #C9A84C;
          border: 1px solid rgba(201, 168, 76, 0.38);
          background: transparent;
          transition: background 0.35s ease, border-color 0.35s ease, color 0.35s ease;
        }
        .hiw-cta-btn:hover {
          background: rgba(201, 168, 76, 0.07);
          border-color: rgba(201, 168, 76, 0.65);
        }
      `}</style>

      <section
        id="how-it-works"
        className="relative overflow-hidden py-16 sm:py-24 lg:py-28"
        style={{ background: '#0B0B0B' }}
      >
        {/* Radial gold atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(circle at 62% 38%, rgba(201,168,76,0.07) 0%, transparent 58%)',
          }}
        />

        {/* Secondary cool-dark gradient for depth */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(circle at 20% 80%, rgba(0,0,0,0.6) 0%, transparent 55%)',
          }}
        />

        {/* Floating gold orbs */}
        <div
          className="absolute top-[18%] left-[8%] w-72 h-72 rounded-full pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)',
            filter: 'blur(45px)',
          }}
        />
        <div
          className="absolute top-[45%] right-[10%] w-96 h-96 rounded-full pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)',
            filter: 'blur(55px)',
          }}
        />
        <div
          className="absolute bottom-[20%] left-[42%] w-56 h-56 rounded-full pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)',
            filter: 'blur(38px)',
          }}
        />

        {/* Subtle grain texture */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: '200px 200px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Section Header */}
          <AnimateOnScroll className="text-center mb-20">
            <div
              className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-7 rounded-full"
              style={{
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.18)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#C9A84C' }}
              />
              <span
                className="text-xs font-semibold tracking-[0.2em] uppercase"
                style={{ color: '#C9A84C' }}
              >
                {t('hiw.badge')}
              </span>
            </div>

            <h2 dir="auto" className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white mb-5 tracking-tight leading-[1.1]">
              {t('hiw.title')}{' '}
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #C9A84C 0%, #E8C76A 50%, #C9A84C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('hiw.titleHighlight')}
              </span>
            </h2>

            <p dir="auto" className="text-white/45 max-w-lg mx-auto text-base leading-relaxed tracking-wide">
              {t('hiw.subtitle')}
            </p>
          </AnimateOnScroll>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20 relative">
            {steps.map((step, idx) => (
              <AnimateOnScroll key={idx} delay={idx * 110} className="relative">
                <div className="hiw-card rounded-2xl p-8 h-full relative overflow-hidden group">

                  {/* Hover gradient overlay */}
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        'linear-gradient(145deg, rgba(201,168,76,0.05) 0%, transparent 55%)',
                    }}
                  />

                  {/* Ghost number — background */}
                  <div
                    className="absolute -top-1 -right-1 text-[6rem] font-black select-none pointer-events-none leading-none"
                    style={{
                      color: 'transparent',
                      WebkitTextStroke: '1px rgba(201,168,76,0.10)',
                      lineHeight: 1,
                    }}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className="relative z-10 w-10 h-10 p-2 rounded-xl mb-5"
                    style={{
                      color: '#C9A84C',
                      background: 'rgba(201,168,76,0.08)',
                      border: '1px solid rgba(201,168,76,0.14)',
                    }}
                  >
                    {step.icon}
                  </div>

                  {/* Step label */}
                  <p
                    className="relative z-10 text-[10px] font-bold tracking-[0.18em] uppercase mb-2"
                    style={{ color: 'rgba(201,168,76,0.45)' }}
                  >
                    Step {step.number}
                  </p>

                  {/* Title */}
                  <h3 dir="auto" className="relative z-10 text-[15px] font-bold text-white mb-3 leading-snug tracking-tight">
                    {t(step.titleKey)}
                  </h3>

                  {/* Description */}
                  <p dir="auto" className="relative z-10 text-white/40 text-[13px] leading-relaxed">
                    {t(step.descKey)}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          {/* CTA */}
          <AnimateOnScroll className="text-center">
            <p
              dir="auto"
              className="mb-7 text-xs tracking-[0.22em] uppercase"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              {t('cta.title')}
            </p>
            <a
              href={waUrl('I want to book a free consultation for AthloCode')}
              target="_blank"
              rel="noopener noreferrer"
              className="hiw-cta-btn inline-flex items-center gap-3 px-10 py-4 text-xs font-semibold tracking-[0.16em] uppercase rounded-lg"
            >
              {t('footer.freeConsultation')}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </a>
          </AnimateOnScroll>

        </div>
      </section>
    </>
  );
}
