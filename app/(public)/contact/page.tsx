'use client';

import { waUrl } from '@/lib/contact';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Select from '@/components/ui/Select';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? 'Failed to send');
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <style>{`
        .contact-page { background: #0B0B0B; }
        .contact-hero {
          padding: 6rem 0 3rem;
          position: relative; overflow: hidden;
        }
        @media (min-width: 640px) {
          .contact-hero { padding: 7.5rem 0 4rem; }
        }
        @media (min-width: 1024px) {
          .contact-hero { padding: 9rem 0 5rem; }
        }
        .contact-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.07) 0%, transparent 55%);
          pointer-events: none;
        }
        .contact-grain {
          position: absolute; inset: 0; opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px; pointer-events: none;
        }
        .contact-glass {
          background: rgba(255,255,255,0.035);
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 16px 60px rgba(0,0,0,0.5);
          border-radius: 24px;
        }
        .contact-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 0.875rem 1.1rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
          transition: border-color 0.25s ease, background 0.25s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .contact-input::placeholder { color: rgba(255,255,255,0.22); }
        .contact-input:focus {
          border-color: rgba(201,168,76,0.45);
          background: rgba(255,255,255,0.06);
        }
        select.contact-input {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          padding-right: 2.5rem;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1L6 6.5L11 1' stroke='%23C9A84C' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.9rem center;
          background-size: 12px 8px;
          cursor: pointer;
        }
        select.contact-input option { background: #111; color: rgba(255,255,255,0.82); }
        .contact-label {
          display: block; font-size: 0.67rem; font-weight: 600;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(255,255,255,0.38); margin-bottom: 0.55rem;
        }
        .contact-btn {
          display: inline-flex; align-items: center; gap: 0.6rem;
          padding: 0.9rem 2.2rem; width: 100%; justify-content: center;
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: #0B0B0B;
          background: linear-gradient(135deg, #C9A84C 0%, #E5C76B 55%, #C9A84C 100%);
          border: none; border-radius: 12px; cursor: pointer;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .contact-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-2px); }
        .contact-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .contact-info-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex; align-items: flex-start; gap: 1rem;
          transition: border-color 0.3s ease;
        }
        .contact-info-card:hover { border-color: rgba(201,168,76,0.18); }
        .contact-icon-box {
          width: 40px; height: 40px; flex-shrink: 0;
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.14);
          color: #C9A84C;
        }
        .wa-btn {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(37,211,102,0.08);
          border: 1px solid rgba(37,211,102,0.25);
          border-radius: 14px; text-decoration: none;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .wa-btn:hover {
          background: rgba(37,211,102,0.14);
          border-color: rgba(37,211,102,0.45);
        }
      `}</style>

      <div className="contact-page flex flex-col min-h-screen">
        <Navbar />

        {/* Hero */}
        <section className="contact-hero">
          <div className="contact-glow" />
          <div className="contact-grain" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-7 rounded-full"
              style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A84C' }} />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#C9A84C' }}>
                {t('contact.badge')}
              </span>
            </div>
            <h1 dir="auto" className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight leading-[1.1]">
              {t('contact.title')}{' '}
              <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C76A, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {t('contact.titleHighlight')}
              </span>
            </h1>
            <p dir="auto" className="text-white/40 text-base leading-relaxed">
              {t('contact.subtitle')}
            </p>
          </div>
        </section>

        <main className="flex-1 pb-24" style={{ background: '#0B0B0B' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

              {/* Contact info — left */}
              <div className="lg:col-span-2 space-y-5">

                {/* WhatsApp CTA */}
                <a
                  href={waUrl('Hi AthloCode, I have a question')}
                  target="_blank" rel="noopener noreferrer"
                  className="wa-btn block"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(37,211,102,0.15)', color: '#25D366' }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.854L.057 23.535a.5.5 0 0 0 .608.608l5.765-1.506A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.799 9.799 0 0 1-5.003-1.373l-.357-.214-3.713.97.997-3.624-.234-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                    </svg>
                  </div>
                  <div>
                    <p dir="auto" className="text-sm font-semibold text-white">{t('contact.whatsapp.btn')}</p>
                    <p dir="auto" className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{t('contact.whatsapp.desc')}</p>
                  </div>
                </a>

                {/* Info cards */}
                {[
                  {
                    label: 'Email',
                    value: 'support@athlocode.com',
                    sub: 'We reply within 24 hours',
                    href: 'mailto:support@athlocode.com',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Free Consultation',
                    value: 'Book a call',
                    sub: 'No commitment required',
                    href: waUrl('I want to book a free consultation for AthloCode'),
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                    ),
                  },
                ].map((item, i) => (
                  <a key={i} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="contact-info-card" style={{ textDecoration: 'none' }}>
                    <div className="contact-icon-box">{item.icon}</div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>{item.label}</p>
                      <p className="text-sm font-semibold text-white">{item.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.sub}</p>
                    </div>
                  </a>
                ))}

                {/* Response time note */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)' }}>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <span style={{ color: 'rgba(201,168,76,0.6)' }}>✓</span> All messages are read personally.
                    We don&apos;t use bots or automated responses.
                  </p>
                </div>
              </div>

              {/* Form — right */}
              <div className="lg:col-span-3">
                <div className="contact-glass p-5 sm:p-8 lg:p-10">
                  {status === 'sent' ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                        style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
                        <svg className="w-8 h-8" style={{ color: '#C9A84C' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Message Sent</h3>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="mb-6">
                        <h2 dir="auto" className="text-xl font-bold text-white mb-1">{t('contact.form.title')}</h2>
                        <p dir="auto" className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {t('contact.subtitle')}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label dir="auto" className="contact-label">{t('contact.form.name')}</label>
                          <input className="contact-input" type="text" placeholder={t('contact.form.namePlaceholder')} value={form.name} onChange={update('name')} required />
                        </div>
                        <div>
                          <label dir="auto" className="contact-label">{t('contact.form.email')}</label>
                          <input className="contact-input" type="email" placeholder={t('contact.form.emailPlaceholder')} value={form.email} onChange={update('email')} required />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="contact-label">Phone <span style={{ color: 'rgba(255,255,255,0.2)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                          <input className="contact-input" type="tel" placeholder="+966 5x xxx xxxx" value={form.phone} onChange={update('phone')} />
                        </div>
                        <div>
                          <label className="contact-label">Subject</label>
                          <Select
                            value={form.subject}
                            onChange={v => setForm(prev => ({ ...prev, subject: v }))}
                            placeholder="Select a topic"
                            options={[
                              { value: 'program', label: 'Program Inquiry' },
                              { value: 'consultation', label: 'Free Consultation' },
                              { value: 'pricing', label: 'Pricing Question' },
                              { value: 'technical', label: 'Technical Support' },
                              { value: 'other', label: 'Other' },
                            ]}
                          />
                        </div>
                      </div>

                      <div>
                        <label dir="auto" className="contact-label">{t('contact.form.message')}</label>
                        <textarea
                          className="contact-input"
                          placeholder={t('contact.form.messagePlaceholder')}
                          value={form.message}
                          onChange={update('message')}
                          required
                          rows={5}
                          style={{ resize: 'none' }}
                        />
                      </div>

                      <button type="submit" className="contact-btn" disabled={status === 'sending'}>
                        {status === 'sending' ? t('contact.form.sending') : t('contact.form.submit')}
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
