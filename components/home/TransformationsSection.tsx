'use client';

import AnimateOnScroll from '@/components/ui/AnimateOnScroll';
import { useLanguage } from '@/context/LanguageContext';

const BG_IMAGE =
  'https://res.cloudinary.com/dqiuwzvfb/image/upload/v1774889959/pexels-dogu-tuncer-339534179-17210043_ogbko1.jpg';
const BG_IMAGE_MOBILE =
  'https://res.cloudinary.com/dqiuwzvfb/image/upload/v1775200853/make_the_samke_202604031249_yos6q3.jpg';

export default function TransformationsSection() {
  const { t } = useLanguage();
  const transformations = [
    {
      id: 1,
      metric: '15 kg',
      metricLabel: t('trans.t1.label'),
      duration: t('trans.t1.duration'),
      program: t('trans.t1.program'),
      change: t('trans.t1.change'),
    },
    {
      id: 2,
      metric: '12 kg',
      metricLabel: t('trans.t2.label'),
      duration: t('trans.t2.duration'),
      program: t('trans.t2.program'),
      change: t('trans.t2.change'),
    },
    {
      id: 3,
      metric: '100%',
      metricLabel: t('trans.t3.label'),
      duration: t('trans.t3.duration'),
      program: t('trans.t3.program'),
      change: t('trans.t3.change'),
    },
  ];
  const stats = [
    { label: '500+', description: t('trans.stat1') },
    { label: '95%',  description: t('trans.stat2') },
    { label: '12+',  description: t('trans.stat3') },
    { label: '50K+', description: t('trans.stat4') },
  ];

  return (
    <>
      <style>{`
        .tf-section {
          position: relative;
          overflow: hidden;
          padding: 4rem 0;
        }
        @media (min-width: 640px) {
          .tf-section { padding: 5.5rem 0; }
        }
        @media (min-width: 1024px) {
          .tf-section { padding: 7rem 0; }
        }

        /* Background photo layer */
        .tf-bg {
          position: absolute;
          inset: 0;
          background-image: url('${BG_IMAGE}');
          background-size: cover;
          background-position: center 30%;
          filter: brightness(0.28) saturate(0.6) blur(1px);
        }
        @media (max-width: 640px) {
          .tf-bg {
            background-image: url('${BG_IMAGE_MOBILE}');
            background-position: center top;
            background-size: cover;
            filter: brightness(0.38) saturate(0.7) blur(0.5px);
          }
          .tf-overlay-left {
            background: linear-gradient(
              to bottom,
              rgba(0,0,0,0.55) 0%,
              rgba(0,0,0,0.2) 40%,
              rgba(0,0,0,0.2) 60%,
              rgba(0,0,0,0.75) 100%
            );
          }
          .tf-overlay-bottom {
            background: none;
          }
        }

        /* Cinematic gradient overlays */
        .tf-overlay-left {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            rgba(0,0,0,0.92) 0%,
            rgba(0,0,0,0.55) 35%,
            rgba(0,0,0,0.25) 65%,
            rgba(0,0,0,0.6) 100%
          );
          pointer-events: none;
        }
        .tf-overlay-bottom {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.55) 0%,
            transparent 30%,
            transparent 60%,
            rgba(0,0,0,0.85) 100%
          );
          pointer-events: none;
        }

        /* Vignette */
        .tf-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%);
          pointer-events: none;
        }


        /* Grain */
        .tf-grain {
          position: absolute;
          inset: 0;
          opacity: 0.028;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          pointer-events: none;
        }

        /* Gold radial atmosphere */
        .tf-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.06) 0%, transparent 55%);
          pointer-events: none;
        }

        /* Stat cards */
        .tf-stat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.4);
          border-radius: 14px;
          padding: 1.5rem 1rem;
          text-align: center;
          transition: border-color 0.3s ease, background 0.3s ease;
        }
        .tf-stat:hover {
          border-color: rgba(201,168,76,0.2);
          background: rgba(255,255,255,0.06);
        }

        /* Transformation cards */
        .tf-card {
          background: rgba(0,0,0,0.12);
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          border: 1px solid rgba(255,255,255,0.09);
          border-top: 1px solid rgba(201,168,76,0.25);
          box-shadow:
            inset 0 1px 0 rgba(201,168,76,0.08),
            0 8px 40px rgba(0,0,0,0.55),
            0 2px 8px rgba(0,0,0,0.3);
          border-radius: 20px;
          overflow: hidden;
          transition:
            transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.4s ease,
            box-shadow 0.4s ease;
          position: relative;
        }
        .tf-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent);
        }
        .tf-card:hover {
          transform: translateY(-10px);
          border-color: rgba(201,168,76,0.22);
          box-shadow:
            inset 0 1px 0 rgba(201,168,76,0.1),
            0 24px 60px rgba(0,0,0,0.7),
            0 0 0 1px rgba(201,168,76,0.06),
            0 0 30px rgba(201,168,76,0.04);
        }

        /* Light sweep on card hover */
        .tf-card-sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
          border-radius: 20px;
        }
        .tf-card:hover .tf-card-sweep {
          opacity: 1;
        }

        /* CTA button */
        .tf-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2.5rem;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #C9A84C;
          border: 1px solid rgba(201,168,76,0.38);
          background: transparent;
          border-radius: 8px;
          transition: background 0.35s ease, border-color 0.35s ease;
          text-decoration: none;
        }
        .tf-btn:hover {
          background: rgba(201,168,76,0.07);
          border-color: rgba(201,168,76,0.65);
        }
      `}</style>

      <section id="transformations" className="tf-section">
        {/* Background layers */}
        <div className="tf-bg" />
        <div className="tf-overlay-left" />
        <div className="tf-overlay-bottom" />
        <div className="tf-vignette" />
        <div className="tf-glow" />
        <div className="tf-grain" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <AnimateOnScroll className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-7 rounded-full"
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
                {t('trans.badge')}
              </span>
            </div>

            <h2
              dir="auto"
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white mb-5 tracking-tight leading-[1.1]"
            >
              {t('trans.title')}{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #C9A84C 0%, #E8C76A 50%, #C9A84C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('trans.titleHighlight')}
              </span>
            </h2>

            <p dir="auto" className="text-white/40 max-w-md mx-auto text-base leading-relaxed tracking-wide">
              {t('trans.subtitle')}
            </p>
          </AnimateOnScroll>

          {/* Stats row */}
          <AnimateOnScroll className="mb-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {stats.map((stat, idx) => (
                <div key={idx} className="tf-stat">
                  <div
                    className="text-3xl font-bold mb-1"
                    style={{
                      background: 'linear-gradient(135deg, #C9A84C, #E8C76A)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.label}
                  </div>
                  <p dir="auto" className="text-xs text-white/40 tracking-wide">{stat.description}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Transformation cards — staggered layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 items-start">
            {transformations.map((item, idx) => (
              <AnimateOnScroll
                key={item.id}
                delay={idx * 130}
                className={idx === 1 ? 'md:mt-10' : idx === 2 ? 'md:mt-5' : ''}
              >
                <div className="tf-card p-7 flex flex-col gap-5">
                  <div className="tf-card-sweep" />

                  {/* Privacy badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(201,168,76,0.6)' }}
                    />
                    <span
                      className="text-[10px] font-medium tracking-[0.14em] uppercase"
                      style={{ color: 'rgba(201,168,76,0.5)' }}
                    >
                      {t('trans.disclaimer')}
                    </span>
                  </div>

                  {/* Metric */}
                  <div>
                    <div className="flex items-baseline gap-2 mb-1" dir="ltr">
                      <span
                        className="text-5xl font-black leading-none tracking-tight"
                        style={{
                          background: 'linear-gradient(135deg, #C9A84C, #E8C76A)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {item.metric}
                      </span>
                      <span className="text-white/50 text-sm font-medium">{item.metricLabel}</span>
                    </div>
                    <p dir="auto" className="text-xs text-white/35 tracking-wide">
                      {item.program} &nbsp;·&nbsp; {item.duration}
                    </p>
                  </div>

                  {/* Divider */}
                  <div
                    className="h-px w-full"
                    style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.2), rgba(255,255,255,0.06), transparent)' }}
                  />

                  {/* Description */}
                  <p dir="auto" className="text-white/45 text-sm leading-relaxed flex-grow">
                    {item.change}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span className="text-[11px] text-white/30 tracking-wide">{t('trans.verified')}</span>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          {/* CTA */}
          <AnimateOnScroll className="text-center">
            <p
              dir="auto"
              className="mb-6 text-xs tracking-[0.22em] uppercase"
              style={{ color: 'rgba(255,255,255,0.28)' }}
            >
              {t('trans.more')}
            </p>
            <a href="/transformations" className="tf-btn">
              {t('trans.viewAll')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </AnimateOnScroll>

        </div>
      </section>
    </>
  );
}
