'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasActiveProducts, setHasActiveProducts] = useState(false);
  const { user, loading } = useAuth();
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    async function checkProducts() {
      try {
        const { count, error } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true);
        
        if (error) throw error;
        if ((count ?? 0) > 0) setHasActiveProducts(true);
      } catch (err) {
        // Silent catch
      }
    }
    checkProducts();
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? 'bg-brand-black/95 backdrop-blur-md shadow-lg shadow-brand-gold/5'
        : 'bg-transparent'
        }`}
      style={{ borderBottom: isScrolled ? '1px solid rgba(201,168,76,0.1)' : '1px solid transparent' }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center h-20 gap-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dqiuwzvfb/image/upload/v1775629677/69007823-DC7E-42E1-AF8E-E57E11810549-Photoroom_nluyul.png"
                alt="AthloCode Logo"
                className="h-16 w-auto object-contain group-hover:opacity-80 transition-opacity"
              />
            </div>
          </a>

          {/* Desktop Nav Links — centered */}
          <div className="hidden md:flex items-center justify-center gap-7 flex-1">
            <Link href="/programs" className="text-white/70 hover:text-brand-gold transition-colors underline-gold">
              {t('nav.programs')}
            </Link>
            <Link href="/how-it-works" className="text-white/70 hover:text-brand-gold transition-colors underline-gold">
              {t('nav.howItWorks')}
            </Link>
            <Link href="/transformations" className="text-white/70 hover:text-brand-gold transition-colors underline-gold">
              {t('nav.transformations')}
            </Link>
            {/* <Link href="/consultation" className="text-white/70 hover:text-brand-gold transition-colors underline-gold">
              {t('nav.consultation')}
            </Link> */}
            <Link href="/marketplace" className="relative text-white/70 hover:text-brand-gold transition-colors underline-gold flex items-center gap-1.5">
              {t('nav.marketplace')}
              {!hasActiveProducts && (
                <span style={{
                  fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '0.18rem 0.45rem',
                  borderRadius: 999, background: 'rgba(201,168,76,0.12)',
                  color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)',
                  lineHeight: 1, flexShrink: 0,
                }}>
                  Soon
                </span>
              )}
            </Link>
            <Link href="/pricing" className="text-white/70 hover:text-brand-gold transition-colors underline-gold">
              {t('nav.pricing')}
            </Link>
            <Link href="/about" className="text-white/70 hover:text-brand-gold transition-colors underline-gold">
              {t('nav.about')}
            </Link>
            <Link href="/contact" className="text-white/70 hover:text-brand-gold transition-colors underline-gold">
              {t('nav.contact')}
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
            {/* Language Toggle */}
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-sm font-medium transition-colors ${lang === 'en' ? 'text-brand-gold' : 'text-white/50 hover:text-brand-gold'}`}
              >EN</button>
              <span className="text-white/30">|</span>
              <button
                onClick={() => setLang('ar')}
                className={`px-3 py-1 text-sm font-medium transition-colors ${lang === 'ar' ? 'text-brand-gold' : 'text-white/50 hover:text-brand-gold'}`}
              >AR</button>
            </div>

            {/* Account / Dashboard Button — always visible, swaps once session resolves */}
            <Link
              href={user ? `/dashboard/${user.profile?.role ?? 'client'}` : '/login'}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300"
              style={{ color: '#C9A84C', border: '1px solid rgba(201,168,76,0.38)', background: 'transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(201,168,76,0.08)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(201,168,76,0.65)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(201,168,76,0.38)'; }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              {user ? t('nav.dashboard') : t('nav.account')}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white/70 hover:text-brand-gold transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden absolute left-0 right-0 top-[80px] z-50"
            style={{
              background: 'rgba(10,10,10,0.96)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              borderBottom: '1px solid rgba(201,168,76,0.12)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
            }}
          >
            {/* Nav links */}
            <div className="flex flex-col">
              {[
                { href: '/programs', label: t('nav.programs') },
                { href: '/how-it-works', label: t('nav.howItWorks') },
                { href: '/transformations', label: t('nav.transformations') },
                { href: '/consultation', label: t('nav.consultation') },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  className="flex items-center justify-between px-7 py-4 text-[15px] font-medium tracking-wide transition-colors group"
                  style={{ color: 'rgba(255,255,255,0.65)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <span className="group-hover:text-white transition-colors">{label}</span>
                  <svg className="w-4 h-4 opacity-20 group-hover:opacity-50 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}

              <Link href="/marketplace"
                className="flex items-center justify-between px-7 py-4 text-[15px] font-medium tracking-wide group transition-colors"
                style={{ color: 'rgba(255,255,255,0.65)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <span className="flex items-center gap-2.5 group-hover:text-white transition-colors">
                  {t('nav.marketplace')}
                  {!hasActiveProducts && (
                    <span style={{
                      fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', padding: '0.18rem 0.45rem',
                      borderRadius: 999, background: 'rgba(201,168,76,0.12)',
                      color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)',
                      lineHeight: 1, flexShrink: 0,
                    }}>
                      Soon
                    </span>
                  )}
                </span>
                <svg className="w-4 h-4 opacity-20 group-hover:opacity-50 transition-all" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>

              {[
                { href: '/pricing', label: t('nav.pricing') },
                { href: '/about', label: t('nav.about') },
                { href: '/contact', label: t('nav.contact') },
              ].map(({ href, label }, i, arr) => (
                <Link key={href} href={href}
                  className="flex items-center justify-between px-7 py-4 text-[15px] font-medium tracking-wide group transition-colors"
                  style={{ color: 'rgba(255,255,255,0.65)', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                >
                  <span className="group-hover:text-white transition-colors">{label}</span>
                  <svg className="w-4 h-4 opacity-20 group-hover:opacity-50 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>

            {/* Bottom bar — lang + CTA */}
            <div className="flex items-center gap-3 px-7 py-5" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
              <div className="flex items-center gap-0 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <button onClick={() => setLang('en')}
                  className={`px-3.5 py-2 text-xs font-semibold transition-all ${lang === 'en' ? 'text-[#C9A84C]' : 'text-white/35'}`}
                  style={lang === 'en' ? { background: 'rgba(201,168,76,0.1)' } : {}}
                >EN</button>
                <span className="w-px h-4 bg-white/10" />
                <button onClick={() => setLang('ar')}
                  className={`px-3.5 py-2 text-xs font-semibold transition-all ${lang === 'ar' ? 'text-[#C9A84C]' : 'text-white/35'}`}
                  style={lang === 'ar' ? { background: 'rgba(201,168,76,0.1)' } : {}}
                >AR</button>
              </div>
              <Link href={user ? `/dashboard/${user.profile?.role ?? 'client'}` : '/login'}
                className="flex-1 text-center text-xs font-bold py-3 rounded-lg tracking-widest uppercase transition-all"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #E5C76B)', color: '#0A0A0A' }}
              >{user ? t('nav.dashboard') : t('nav.account')}</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
