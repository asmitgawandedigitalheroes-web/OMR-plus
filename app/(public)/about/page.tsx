'use client';

import { waUrl } from '@/lib/contact';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/context/LanguageContext';

const values = [
  {
    title: 'Precision Over Guesswork',
    description: 'Every plan is built on data — your body metrics, goals, and lifestyle. Nothing generic, nothing copy-pasted.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
  },
  {
    title: 'Accountability That Works',
    description: 'Your coach checks in weekly, adjusts your plan, and keeps you moving forward — even when motivation dips.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: 'Privacy First',
    description: 'Your progress, your data, your results — never shared without your explicit permission. Always protected.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    title: 'Long-Term Results',
    description: "We're not interested in quick fixes. We build habits, systems, and bodies that last well beyond your program end date.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
  },
];

const stats = [
  { value: '500+', label: 'Active Members' },
  { value: '95%', label: 'Success Rate' },
  { value: '3+', label: 'Years Operating' },
  { value: '50K+', label: 'Check-ins Logged' },
];

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <>
      <style>{`
        .about-page { background: #0B0B0B; }
        .about-hero {
          padding: 6rem 0 3.5rem;
          position: relative; overflow: hidden;
        }
        @media (min-width: 640px) {
          .about-hero { padding: 7.5rem 0 5rem; }
        }
        @media (min-width: 1024px) {
          .about-hero { padding: 9rem 0 6rem; }
        }
        .about-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.07) 0%, transparent 58%);
          pointer-events: none;
        }
        .about-grain {
          position: absolute; inset: 0; opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px; pointer-events: none;
        }
        .about-glass {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 40px rgba(0,0,0,0.4);
          border-radius: 20px;
        }
        .about-stat {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(16px);
          border-radius: 16px;
          padding: 2rem 1.5rem;
          text-align: center;
          transition: border-color 0.3s ease;
        }
        .about-stat:hover { border-color: rgba(201,168,76,0.2); }
        .about-value-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.75rem;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .about-value-card:hover {
          border-color: rgba(201,168,76,0.18);
          transform: translateY(-4px);
        }
        .about-btn {
          display: inline-flex; align-items: center; gap: 0.6rem;
          padding: 0.9rem 2.2rem;
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: #C9A84C;
          border: 1px solid rgba(201,168,76,0.4);
          background: transparent; border-radius: 10px;
          text-decoration: none;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .about-btn:hover {
          background: rgba(201,168,76,0.07);
          border-color: rgba(201,168,76,0.7);
        }
      `}</style>

      <div className="about-page flex flex-col min-h-screen">
        <Navbar />

        {/* Hero */}
        <section className="about-hero">
          <div className="about-glow" />
          <div className="about-grain" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-7 rounded-full"
              style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A84C' }} />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#C9A84C' }}>
                {t('about.badge')}
              </span>
            </div>
            <h1 dir="auto" className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              {t('about.title')}{' '}
              <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C76A, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {t('about.titleHighlight')}
              </span>
            </h1>
            <p dir="auto" className="text-white/42 text-base leading-[1.9] max-w-2xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>
        </section>

        <main className="flex-1 pb-24" style={{ background: '#0B0B0B' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-20 max-w-3xl mx-auto">
              {stats.map((s, i) => (
                <div key={i} className="about-stat">
                  <div className="text-3xl font-black mb-1"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C76A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {s.value}
                  </div>
                  <p className="text-xs tracking-wide" style={{ color: 'rgba(255,255,255,0.38)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Mission */}
            <div className="about-glass p-6 sm:p-10 lg:p-14 mb-16 max-w-4xl mx-auto text-center">
              <p dir="auto" className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(201,168,76,0.5)' }}>
                {t('about.mission.title')}
              </p>
              <blockquote className="text-2xl lg:text-3xl font-bold text-white leading-[1.4] tracking-tight mb-6">
                "To make elite-level fitness coaching accessible, personal, and{' '}
                <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C76A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  genuinely effective
                </span>
                {' '}— for everyone."
              </blockquote>
              <p dir="auto" className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
                {t('about.mission.body')}
              </p>
            </div>

            {/* Values */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(201,168,76,0.5)' }}>
                  What We Stand For
                </p>
                <h2 className="text-3xl font-bold text-white tracking-tight">Our Core Values</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {values.map((v, i) => (
                  <div key={i} className="about-value-card">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.14)', color: '#C9A84C' }}>
                      {v.icon}
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 tracking-tight">{v.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>{v.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What makes us different */}
            <div className="about-glass p-6 sm:p-10 lg:p-14 mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(201,168,76,0.5)' }}>
                    Why AthloCode
                  </p>
                  <h2 className="text-3xl font-bold text-white mb-5 tracking-tight leading-tight">
                    Not a subscription.{' '}
                    <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C76A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      A partnership.
                    </span>
                  </h2>
                  <p className="text-sm leading-[1.9]" style={{ color: 'rgba(255,255,255,0.42)' }}>
                    Most coaching apps give you a plan and leave you to figure it out.
                    AthloCode pairs you with a dedicated coach who knows your name, tracks your progress,
                    and adjusts your plan every single week based on real results.
                    No algorithm. No automation. Real human expertise.
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    'Dedicated personal coach assigned to you',
                    'Weekly plan adjustments based on real data',
                    'Direct messaging — no ticket system',
                    'Bilingual support (English & Arabic)',
                    'No long-term contracts — cancel any time',
                    'Privacy-first — your data stays yours',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#C9A84C' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                      </svg>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <p className="text-xs tracking-[0.2em] uppercase mb-6" style={{ color: 'rgba(255,255,255,0.22)' }}>
                Ready to start your transformation?
              </p>
              <a
                href={waUrl('I want to book a free consultation for AthloCode')}
                target="_blank" rel="noopener noreferrer"
                className="about-btn"
              >
                {t('footer.freeConsultation')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
