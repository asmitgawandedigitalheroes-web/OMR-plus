'use client';

import { waUrl } from '@/lib/contact';

import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { lang, setLang, t } = useLanguage();

  return (
    <>
      <style>{`
        .footer-root {
          position: relative;
          overflow: hidden;
          background: #0B0B0B;
        }

        /* top gold hairline */
        .footer-root::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 320px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.35), transparent);
        }

        /* grain */
        .footer-grain {
          position: absolute;
          inset: 0;
          opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          pointer-events: none;
        }

        /* radial gold atmosphere */
        .footer-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 55%);
          pointer-events: none;
        }

        /* full-width content wrapper */
        .footer-glass {
          position: relative;
          z-index: 10;
          padding: 2rem 0 1.5rem;
        }
        @media (min-width: 640px) {
          .footer-glass { padding: 2.5rem 0 2rem; }
        }
        @media (min-width: 1024px) {
          .footer-glass { padding: 3rem 0 2rem; }
        }

        /* column headings */
        .footer-heading {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(201,168,76,0.6);
          margin-bottom: 1.4rem;
        }

        /* links */
        .footer-link {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.42);
          text-decoration: none;
          transition: color 0.25s ease;
          display: block;
        }
        .footer-link:hover { color: #C9A84C; }

        /* divider */
        .footer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent);
          margin: 2rem 0;
        }

        /* consultation btn */
        .footer-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.4rem;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #C9A84C;
          border: 1px solid rgba(201,168,76,0.38);
          background: transparent;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .footer-btn:hover {
          background: rgba(201,168,76,0.07);
          border-color: rgba(201,168,76,0.6);
        }

        /* social icon */
        .footer-social {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.35);
          transition: border-color 0.3s ease, color 0.3s ease, background 0.3s ease;
        }
        .footer-social:hover {
          border-color: rgba(201,168,76,0.35);
          color: #C9A84C;
          background: rgba(201,168,76,0.06);
        }
      `}</style>

      <footer className="footer-root">
        <div className="footer-glow" />
        <div className="footer-grain" />

        <div className="footer-glass">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-10">

            {/* Main grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-0">

              {/* Brand column */}
              <div className="space-y-5">
                <img
                  src="https://res.cloudinary.com/dqiuwzvfb/image/upload/v1775629677/69007823-DC7E-42E1-AF8E-E57E11810549-Photoroom_nluyul.png"
                  alt="AthloCode Logo"
                  className="h-20 w-auto object-contain"
                />
                <p dir="auto" className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {t('footer.tagline')}
                </p>
                {/* Socials */}
                <div className="flex gap-2.5 pt-1">
                  {/* Instagram — update href when account is ready */}
                  <span className="footer-social" style={{ cursor: 'default', opacity: 0.4 }} aria-label="Instagram (coming soon)">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                    </svg>
                  </span>
                  {/* Twitter / X — update href when account is ready */}
                  <span className="footer-social" style={{ cursor: 'default', opacity: 0.4 }} aria-label="X / Twitter (coming soon)">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </span>
                  {/* WhatsApp */}
                  <a href={waUrl('Hi AthloCode')} target="_blank" rel="noopener noreferrer" className="footer-social">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.854L.057 23.535a.5.5 0 0 0 .608.608l5.765-1.506A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.799 9.799 0 0 1-5.003-1.373l-.357-.214-3.713.97.997-3.624-.234-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <p dir="auto" className="footer-heading">{t('footer.quickLinks')}</p>
                <ul className="space-y-3">
                  {[
                    { labelKey: 'nav.programs', href: '/programs' },
                    { labelKey: 'nav.howItWorks', href: '/#how-it-works' },
                    { labelKey: 'nav.transformations', href: '/#transformations' },
                    { labelKey: 'footer.aboutUs', href: '/about' },
                    { labelKey: 'nav.contact', href: '/contact' },
                  ].map((link) => (
                    <li key={link.labelKey}>
                      <a href={link.href} className="footer-link">{t(link.labelKey)}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Programs */}
              <div>
                <p dir="auto" className="footer-heading">{t('footer.ourPrograms')}</p>
                <ul className="space-y-3">
                  {[
                    'footer.muscleBuilding',
                    'footer.fatLoss',
                    'footer.summerBody',
                    'footer.workoutPlan',
                    'footer.mealPlan',
                  ].map((key) => (
                    <li key={key}>
                      <a href="/programs" className="footer-link">{t(key)}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <p dir="auto" className="footer-heading">{t('footer.getInTouch')}</p>
                <div className="space-y-4 mb-5">
                  <div>
                    <p dir="auto" className="text-[10px] tracking-[0.14em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{t('footer.email')}</p>
                    <a href="mailto:support@athlocode.com" className="footer-link text-[13px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      support@athlocode.com
                    </a>
                  </div>
                  <div>
                    <p dir="auto" className="text-[10px] tracking-[0.14em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{t('footer.whatsapp')}</p>
                    <a
                      href={waUrl('I want to book a free consultation for AthloCode')}
                      target="_blank" rel="noopener noreferrer"
                      className="footer-link text-[13px]"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                    >
                      {t('footer.messageUs')}
                    </a>
                  </div>
                </div>
                <a
                  href={waUrl('I want to book a free consultation for AthloCode')}
                  target="_blank" rel="noopener noreferrer"
                  className="footer-btn"
                >
                  {t('footer.freeConsultation')}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="footer-divider" />

            {/* Bottom bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-5">
              <div className="flex flex-wrap items-center gap-5">
                <p dir="auto" className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  © {currentYear} AthloCode. {t('footer.allRightsReserved')}
                </p>
                {[
                  { key: 'footer.privacyPolicy', href: '/privacy' },
                  { key: 'footer.termsOfService', href: '/terms' },
                ].map((item) => (
                  <a key={item.key} href={item.href} className="text-[11px] transition-colors duration-200"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
                  >{t(item.key)}</a>
                ))}
              </div>

              {/* Language toggle */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] tracking-[0.14em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>{t('footer.language')}</span>
                <button
                  onClick={() => setLang('en')}
                  className="text-[11px] font-semibold tracking-wide transition-colors duration-200"
                  style={{ color: lang === 'en' ? '#C9A84C' : 'rgba(255,255,255,0.3)' }}
                >EN</button>
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                <button
                  onClick={() => setLang('ar')}
                  className="text-[11px] font-semibold tracking-wide transition-colors duration-200"
                  style={{ color: lang === 'ar' ? '#C9A84C' : 'rgba(255,255,255,0.3)' }}
                >AR</button>
              </div>
            </div>

            {/* Premium tagline */}
            <div className="mt-5 text-center">
              <p dir="auto" className="text-[10px] tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.15)' }}>
                <span style={{ color: 'rgba(201,168,76,0.4)' }}>✓</span> {t('footer.premiumCoaching')} &nbsp;·&nbsp;
                <span style={{ color: 'rgba(201,168,76,0.4)' }}>✓</span> {t('footer.noFreeTrials')} &nbsp;·&nbsp;
                <span style={{ color: 'rgba(201,168,76,0.4)' }}>✓</span> {t('footer.transparentPricing')} &nbsp;·&nbsp;
                <span style={{ color: 'rgba(201,168,76,0.4)' }}>✓</span> {t('footer.realResults')}
              </p>
            </div>

          </div>
        </div>
      </footer>
    </>
  );
}
