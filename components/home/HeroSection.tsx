'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="relative w-full min-h-screen bg-brand-black overflow-hidden flex items-center justify-center">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%230A0A0A' width='1920' height='1080'/%3E%3C/svg%3E"
        >
          <source
            src="https://res.cloudinary.com/dqiuwzvfb/video/upload/q_auto/f_auto/v1775464474/Video_Project_1_njin8k.mp4"
            type="video/mp4"
          />
        </video>

        {/* Heavy centered overlay for desktop — cinematic dark vignette */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.82) 60%, rgba(0,0,0,0.96) 100%)',
        }} />
        {/* Top & bottom fades */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 70%, rgba(0,0,0,0.9) 100%)',
        }} />
      </div>

      {/* Content — fully centered, same on mobile & desktop */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 flex flex-col items-center text-center pt-36 sm:pt-44 pb-16 sm:pb-32" style={{ gap: '1.5rem' }}>

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A84C' }} />
          <span className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: '#C9A84C' }}>
            {t('hero.badge')}
          </span>
        </div>

        {/* Headline */}
        <div style={{ lineHeight: 1.05 }}>
          <h1
            dir="auto"
            className="font-black uppercase tracking-tight text-white"
            style={{
              fontSize: 'clamp(2.6rem, 5vw, 5.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
            }}
          >
            {t('hero.headline1')}
          </h1>
          <h2
            dir="auto"
            className="font-black uppercase"
            style={{
              fontSize: 'clamp(2.6rem, 5vw, 5.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
              background: 'linear-gradient(135deg, #C9A84C 0%, #F0D878 45%, #C9A84C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('hero.headline2')}
          </h2>
        </div>

        {/* Gold divider */}
        <div className="flex items-center gap-4 w-full justify-center max-w-xs mx-auto">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.45))' }} />
          <span className="text-[9px] font-bold tracking-[0.35em] uppercase" style={{ color: 'rgba(201,168,76,0.45)' }}>AthloCode</span>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.45), transparent)' }} />
        </div>

        {/* Subtext */}
        <p
          dir="auto"
          className="leading-relaxed max-w-lg"
          style={{ fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)', color: 'rgba(255,255,255,0.45)', fontWeight: 300, letterSpacing: '0.04em', maxWidth: '56rem' }}
        >
          {t('hero.subtext')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <a
            href="/pricing"
            className="inline-flex items-center gap-3 rounded-xl font-bold tracking-widest uppercase transition-all"
            style={{
              padding: '1rem 2.5rem',
              fontSize: '0.72rem',
              background: 'linear-gradient(135deg, #C9A84C, #E5C76B)',
              color: '#0A0A0A',
              boxShadow: '0 8px 32px rgba(201,168,76,0.3)',
            }}
          >
            {t('hero.cta')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 font-semibold tracking-widest uppercase transition-all"
            style={{
              padding: '1rem 2rem',
              fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
            }}
          >
            {t('hero.secondary')}
          </a>
        </div>

        {/* Trust / scarcity line */}
        <p dir="auto" className="text-[10px] tracking-[0.22em] uppercase" style={{ color: 'rgba(255,255,255,0.18)' }}>
          {t('hero.trust')}
        </p>

      </div>

      {/* Bottom fade into page */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-black to-transparent z-20" />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(201,168,76,0.4)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
