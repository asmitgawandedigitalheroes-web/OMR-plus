'use client';

import AnimateOnScroll from '@/components/ui/AnimateOnScroll';
import { useLanguage } from '@/context/LanguageContext';

const programImages = [
  'https://res.cloudinary.com/dqiuwzvfb/image/upload/v1774869469/ChatGPT_Image_Mar_30_2026_04_47_36_PM_l244wh.png',
  'https://res.cloudinary.com/dqiuwzvfb/image/upload/v1774870969/ChatGPT_Image_Mar_30_2026_05_12_21_PM_jufpsc.png',
  'https://res.cloudinary.com/dqiuwzvfb/image/upload/v1774871156/ChatGPT_Image_Mar_30_2026_05_15_20_PM_dmlvkg.png',
  'https://res.cloudinary.com/dqiuwzvfb/image/upload/v1774871223/ChatGPT_Image_Mar_30_2026_05_16_44_PM_qz2cet.png',
  'https://res.cloudinary.com/dqiuwzvfb/image/upload/v1774871297/ChatGPT_Image_Mar_30_2026_05_17_57_PM_gnjys3.png',
];

export default function ProgramsSection() {
  const { t } = useLanguage();

  const programs = [
    {
      id: 1,
      nameKey: 'home.programs.muscleBuilding',
      descKey: 'home.programs.muscleBuilding.desc',
      image: programImages[0],
    },
    {
      id: 2,
      nameKey: 'home.programs.fatLoss',
      descKey: 'home.programs.fatLoss.desc',
      image: programImages[1],
    },
    {
      id: 3,
      nameKey: 'home.programs.summerBody',
      descKey: 'home.programs.summerBody.desc',
      image: programImages[2],
    },
    {
      id: 4,
      nameKey: 'home.programs.workoutPlan',
      descKey: 'home.programs.workoutPlan.desc',
      image: programImages[3],
    },
    {
      id: 5,
      nameKey: 'home.programs.mealPlan',
      descKey: 'home.programs.mealPlan.desc',
      image: programImages[4],
    },
  ];

  return (
    <section id="programs" className="py-24 bg-brand-black relative overflow-hidden">
      {/* Subtle background orb — gold, very faint */}
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full -z-10"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }}
      />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

        {/* Section Header */}
        <AnimateOnScroll className="text-center mb-16">
          <h2 dir="auto" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            {t('home.programs.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-brand-gold-light to-brand-gold font-black">
              {t('home.programs.titleHighlight')}
            </span>
          </h2>
          <p dir="auto" className="text-base text-white/40 max-w-xl mx-auto font-light tracking-wide">
            {t('home.programs.subtitle')}
          </p>
        </AnimateOnScroll>

        {/* Row 1 — 3 Vertical Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {programs.slice(0, 3).map((program, idx) => (
            <AnimateOnScroll key={program.id} delay={idx * 80}>
              <a
                href="/programs"
                className="group block rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  transition: 'transform 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.3)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {/* Image */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={program.image}
                    alt={t(program.nameKey)}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
                  />
                  {/* Cinematic gradient overlay */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)' }} />
                </div>

                {/* Details */}
                <div className="p-6 pt-5">
                  <div className="mb-4">
                    <h3 dir="auto" className="text-xl font-semibold text-white tracking-wide group-hover:text-brand-gold transition-colors duration-300">
                      {t(program.nameKey)}
                    </h3>
                  </div>
                  <p dir="auto" className="text-sm text-white/45 leading-relaxed mb-6 font-light">
                    {t(program.descKey)}
                  </p>
                  <button
                    className="text-sm font-medium tracking-wide transition-all duration-300 px-5 py-2 rounded-lg"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(201,168,76,0.6)',
                      color: '#C9A84C',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.08)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.9)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.6)';
                    }}
                  >
                    {t('home.programs.getStarted')}
                  </button>
                </div>
              </a>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Row 2 — 2 Horizontal Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-14">
          {programs.slice(3).map((program, idx) => (
            <AnimateOnScroll key={program.id} delay={(idx + 3) * 80}>
              <a
                href="/programs"
                className="group flex flex-col sm:flex-row rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  transition: 'transform 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.3)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {/* Image - Left */}
                <div className="relative w-full sm:w-2/5 h-48 sm:h-auto overflow-hidden flex-shrink-0">
                  <img
                    src={program.image}
                    alt={t(program.nameKey)}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.5) 100%)' }} />
                </div>

                {/* Content - Right */}
                <div className="flex-1 p-7 flex flex-col justify-center">
                  <h3 dir="auto" className="text-xl font-semibold text-white tracking-wide mb-3 group-hover:text-brand-gold transition-colors duration-300">
                    {t(program.nameKey)}
                  </h3>
                  <p dir="auto" className="text-sm text-white/45 leading-relaxed mb-6 font-light">
                    {t(program.descKey)}
                  </p>
                  <button
                    className="text-sm font-medium tracking-wide transition-all duration-300 px-5 py-2 rounded-lg w-fit"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(201,168,76,0.6)',
                      color: '#C9A84C',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.08)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.9)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.6)';
                    }}
                  >
                    {t('home.programs.getStarted')}
                  </button>
                </div>
              </a>
            </AnimateOnScroll>
          ))}
        </div>

        {/* CTA */}
        <AnimateOnScroll className="text-center">
          <p dir="auto" className="text-white/30 text-sm mb-5 font-light tracking-wide">{t('home.programs.viewAllSub')}</p>
          <a
            href="/programs"
            className="inline-flex items-center gap-2.5 text-sm font-medium tracking-wide px-7 py-3 rounded-lg transition-all duration-300"
            style={{
              background: 'transparent',
              border: '1px solid rgba(201,168,76,0.5)',
              color: '#C9A84C',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.07)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.8)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.5)';
            }}
          >
            {t('home.programs.viewAll')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </AnimateOnScroll>

      </div>
    </section>
  );
}
