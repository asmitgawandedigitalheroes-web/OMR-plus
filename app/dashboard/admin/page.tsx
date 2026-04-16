'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell, { NavItem } from '@/components/dashboard/DashboardShell';
import Select from '@/components/ui/Select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';
import { SkProductGrid, SkOrderRows, SkPricingPlans, SkAnalytics, SkVideos, SkCMS, SkDashboardInit, SkInline } from '@/components/ui/Skeleton';

/* ─── Nav icons (labels built inside component for i18n) ── */
const AdminNavIcons = {
  overview: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>,
  users: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>,
  trainers: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>,
  subscriptions: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>,
  marketplace: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" /></svg>,
  pricing: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>,
  analytics: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>,
  messages: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>,
  videos: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>,
  cms: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>,
  billing: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>,
  orders: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>,
};

/* ─── Types ───────────────────────────────────────────── */
interface AdminUser {
  id: string;
  full_name: string | null;
  email?: string | null;
  role: string;
  onboarding_completed: boolean;
  created_at: string;
  subscription_status?: string;
  assigned_coach?: string | null;
}

interface AdminCoach {
  id: string;
  full_name: string | null;
  created_at: string;
  client_count: number;
  role: string;
  phone: string | null;
  bio: string | null;
  specialization: string | null;
}

interface AdminSubscription {
  id: string;
  user_id: string;
  plan_name: string;
  status: string;
  price_sar: number;
  started_at: string;
  expires_at: string | null;
  user_name?: string | null;
}

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price_sar: number;
  type: string | null;
  is_active: boolean;
  image_url: string | null;
  file_url: string | null;
  created_at: string;
}

interface PricingPlan {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  tagline: string | null;
  tagline_ar: string | null;
  cta_text: string | null;
  cta_text_ar: string | null;
  price_sar: number;
  stripe_price_id: string | null;
  features: string[] | null;
  features_ar: string[] | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
}

/* ─── Overview ────────────────────────────────────────── */
function AdminOverview({
  users, coaches, subscriptions,
  onNavigate,
}: {
  users: AdminUser[];
  coaches: AdminCoach[];
  subscriptions: AdminSubscription[];
  onNavigate: (tab: string) => void;
}) {
  const { t } = useLanguage();
  const activeSubs = subscriptions.filter(s => s.status === 'active').length;
  const revenue = subscriptions.filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.price_sar ?? 0), 0);
  const clients = users.filter(u => u.role === 'client');

  const stats = [
    {
      label: t('admin.totalMembers'), value: String(clients.length), sub: t('admin.registeredClients'),
      bg: 'rgba(201,168,76,0.06)', border: 'rgba(201,168,76,0.2)',
      icon: <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" /></svg>,
    },
    {
      label: t('admin.activeCoaches'), value: String(coaches.length), sub: t('admin.platformTrainers'),
      bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)',
      icon: <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>,
    },
    {
      label: t('admin.activeSubscriptions'), value: String(activeSubs), sub: t('admin.payingMembers'),
      bg: 'rgba(74,222,128,0.04)', border: 'rgba(74,222,128,0.18)',
      icon: <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>,
    },
    {
      label: t('admin.monthlyRevenue'), value: `AED ${revenue.toLocaleString()}`, sub: t('admin.activeSubscriptionsLabel'),
      bg: 'rgba(255,200,80,0.04)', border: 'rgba(255,200,80,0.18)',
      icon: <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
    },
  ];

  return (
    <div>
      <div className="mb-7">
        <div className="ds-gold-pill mb-3">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', flexShrink: 0, display: 'inline-block' }} />
          {t('dash.adminPanel')}
        </div>
        <h2 dir="auto" className="admin-overview-h2" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'white', marginBottom: '0.35rem' }}>{t('admin.platformOverview')}</h2>
        <p dir="auto" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>{t('admin.platformSubtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map(s => (
          <div key={s.label} className="ds-stat" style={{ background: s.bg, borderColor: s.border }}>
            <div className="ds-stat-icon" style={{ background: s.bg, borderColor: s.border }}>{s.icon}</div>
            <div className="ds-stat-value">{s.value}</div>
            <div className="ds-stat-label">{s.label}</div>
            <div className="ds-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.25rem' }}>
        {/* Recent users */}
        <div className="ds-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <p dir="auto" className="ds-section-title">{t('admin.recentMembers')}</p>
            <button className="ds-btn-gold" style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem' }} onClick={() => onNavigate('users')}>{t('admin.viewAll')}</button>
          </div>
          {clients.slice(0, 4).map(u => (
            <div key={u.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.55rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', fontSize: 10, fontWeight: 700, color: '#C9A84C' }}>
                {u.full_name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <p style={{ flex: 1, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name ?? t('admin.unnamed')}</p>
              <span className={u.subscription_status === 'active' ? 'ds-badge-green' : 'ds-badge-gray'} style={{ fontSize: '0.6rem' }}>
                {u.subscription_status === 'active' ? t('admin.statusActive') : t('admin.statusFree')}
              </span>
            </div>
          ))}
        </div>

        {/* Coaches */}
        <div className="ds-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <p dir="auto" className="ds-section-title">{t('admin.coaches')}</p>
            <button className="ds-btn-gold" style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem' }} onClick={() => onNavigate('trainers')}>{t('admin.manage')}</button>
          </div>
          {coaches.length === 0 ? (
            <p dir="auto" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>{t('admin.noCoaches')}</p>
          ) : coaches.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.55rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', fontSize: 10, fontWeight: 700, color: '#C9A84C' }}>
                {c.full_name?.[0]?.toUpperCase() ?? 'C'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>{c.full_name ?? t('admin.unnamed')}</p>
                <p dir="ltr" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>{c.client_count} {t('admin.clients')}</p>
              </div>
              <span className="ds-badge-green" style={{ fontSize: '0.6rem' }}>{t('admin.statusActive')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Shared AdminModal ───────────────────────────────── */
function AdminModal({ open, onClose, title, maxWidth = 560, children }: {
  open: boolean; onClose: () => void; title: string; maxWidth?: number; children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="ds-no-scroll"
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth, maxHeight: '96vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.4rem 1.75rem 0' }}>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>{title}</p>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {/* Top gold hairline */}
        <div style={{ height: 1, margin: '1rem 1.75rem 0', background: 'linear-gradient(90deg, rgba(201,168,76,0.4), transparent)' }} />
        {/* Body */}
        <div style={{ padding: '1.5rem 1.75rem 1.75rem', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Users Tab ───────────────────────────────────────── */
function UsersTab({ users, coaches, onRefresh }: { users: AdminUser[]; coaches: AdminCoach[]; onRefresh: () => void }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  // Assign Coach modal
  const [assigning, setAssigning] = useState<AdminUser | null>(null);
  const [assignCoachId, setAssignCoachId] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState('');

  // Edit Client modal
  const [editingClient, setEditingClient] = useState<AdminUser | null>(null);

  const filtered = users.filter(u =>
    u.role === 'client' &&
    (!search || (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) || (u.email ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  const assignCoach = async () => {
    if (!assignCoachId || !assigning) return;
    setAssignSaving(true);
    setAssignError('');
    try {
      const { error: delError } = await supabase
        .from('trainer_client_assignments')
        .delete()
        .eq('client_id', assigning.id);
      if (delError) throw new Error(delError.message);

      const { error: insError } = await supabase
        .from('trainer_client_assignments')
        .insert({ client_id: assigning.id, trainer_id: assignCoachId });
      if (insError) throw new Error(insError.message);

      setAssigning(null);
      setAssignCoachId('');
      onRefresh();
    } catch (err: unknown) {
      setAssignError(err instanceof Error ? err.message : 'Failed to assign coach');
    } finally {
      setAssignSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-tab-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p dir="auto" className="ds-section-title">{t('admin.usersTab')}</p>
          <p dir="ltr" className="ds-section-sub">{filtered.length} {t('admin.clients')}</p>
        </div>
        <input className="ds-input admin-search-input" style={{ width: 220 }} placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="ds-empty">
          <div className="ds-empty-icon">
            <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" /></svg>
          </div>
          <p>No members found</p>
        </div>
      ) : (
        <div className="ds-card ds-table-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="ds-table">
            <thead>
              <tr>
                <th>{t('admin.member')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.onboarded')}</th>
                <th>{t('admin.coach')}</th>
                <th>{t('admin.joined')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <React.Fragment key={u.id}>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', fontSize: 11, fontWeight: 700, color: '#C9A84C' }}>
                          {u.full_name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>{u.full_name ?? t('admin.unnamed')}</p>
                          {u.email && <p style={{ fontSize: '0.71rem', color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{u.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td><span className={u.subscription_status === 'active' ? 'ds-badge-green' : 'ds-badge-gray'} style={{ whiteSpace: 'nowrap' }}>{u.subscription_status === 'active' ? t('admin.statusActive') : (u.subscription_status ?? t('admin.statusFree'))}</span></td>
                    <td><span className={u.onboarding_completed ? 'ds-badge-green' : 'ds-badge-gray'}>{u.onboarding_completed ? t('admin.yes') : t('admin.no')}</span></td>
                    <td style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>{u.assigned_coach ?? t('admin.noCoachAssigned')}</td>
                    <td style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.75rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          className="ds-btn-gold"
                          style={{ padding: '0.38rem 0.75rem', fontSize: '0.72rem' }}
                          onClick={() => setEditingClient(u)}
                        >
                          Edit Client
                        </button>
                        <button
                          className="ds-btn-outline"
                          style={{ padding: '0.38rem 0.75rem', fontSize: '0.72rem' }}
                          onClick={() => { setAssigning(u); setAssignCoachId(u.assigned_coach ? (coaches.find(c => c.full_name === u.assigned_coach)?.id ?? '') : ''); setAssignError(''); }}
                        >
                          {t('admin.assignCoach')}
                        </button>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Assign Coach Modal ── */}
      <AdminModal open={!!assigning} onClose={() => { setAssigning(null); setAssignError(''); setAssignCoachId(''); }} title="Assign Coach" maxWidth={460}>
        {assigning && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', fontSize: 13, fontWeight: 700, color: '#C9A84C', flexShrink: 0 }}>
                {assigning.full_name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{assigning.full_name ?? 'Unnamed'}</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                  {assigning.assigned_coach ? `Currently: ${assigning.assigned_coach}` : 'No coach assigned'}
                </p>
              </div>
            </div>
            <label className="ds-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Select Coach</label>
            <Select
              value={assignCoachId}
              onChange={setAssignCoachId}
              placeholder="— choose a coach —"
              options={coaches.map(c => ({ value: c.id, label: `${c.full_name ?? c.id} (${c.client_count} clients)` }))}
            />
            {assignError && (
              <div style={{ marginTop: '0.85rem', padding: '0.65rem 0.9rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 9, fontSize: '0.78rem', color: 'rgba(239,68,68,0.88)' }}>{assignError}</div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="ds-btn-gold" style={{ flex: 1 }} disabled={assignSaving || !assignCoachId} onClick={assignCoach}>
                {assignSaving ? t('admin.saving') : 'Confirm Assignment'}
              </button>
              <button className="ds-btn-outline" onClick={() => { setAssigning(null); setAssignError(''); setAssignCoachId(''); }}>{t('admin.cancel')}</button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* ── Edit Client Modal ── */}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}

/* ─── Edit Client Modal ───────────────────────────────── */
interface ClientSubscription {
  id: string;
  plan_name: string;
  status: string;
  price_sar: number;
  started_at: string;
  expires_at: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  stripe_subscription_id: string | null;
}

function EditClientModal({ client, onClose, onRefresh }: {
  client: AdminUser;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<'subscription' | 'info'>('subscription');

  // Subscription state
  const [subLoading, setSubLoading] = useState(true);
  const [currentSub, setCurrentSub] = useState<ClientSubscription | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [assignLoading, setAssignLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const [subError, setSubError] = useState('');
  const [subSuccess, setSubSuccess] = useState('');
  const [showPlanPicker, setShowPlanPicker] = useState(false);

  // Load subscription + plans
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setSubLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

        // Fetch plans via admin pricing-plans API
        const plansRes = await fetch('/api/admin/pricing-plans', { headers });
        const plansJson = await plansRes.json() as { plans?: PricingPlan[] };
        if (mounted) setPlans((plansJson.plans ?? []).filter((p: PricingPlan) => p.is_published));

        // Fetch current subscription directly (service-role via admin data or direct query)
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('id, plan_name, status, price_sar, started_at, expires_at, cancel_at_period_end, cancelled_at, stripe_subscription_id')
          .eq('user_id', client.id)
          .in('status', ['active', 'trialing'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (mounted) setCurrentSub(subData ?? null);
      } catch (err) {
        console.error('[EditClientModal] load error', err);
      } finally {
        if (mounted) setSubLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [client.id]);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const { data: { session } } = await supabase.auth.getSession();
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) h['Authorization'] = `Bearer ${session.access_token}`;
    return h;
  };

  const handleAssign = async () => {
    if (!selectedPlanId) return;
    setAssignLoading(true);
    setSubError('');
    setSubSuccess('');
    try {
      const res = await fetch('/api/admin/subscription', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ action: 'assign', user_id: client.id, plan_id: selectedPlanId, duration_days: durationDays }),
      });
      const json = await res.json() as { success?: boolean; subscription?: ClientSubscription; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? 'Failed to assign plan');
      setCurrentSub(json.subscription ?? null);
      setShowPlanPicker(false);
      setSelectedPlanId('');
      setSubSuccess('Subscription assigned successfully.');
      onRefresh();
    } catch (err: unknown) {
      setSubError(err instanceof Error ? err.message : 'Failed to assign plan');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleCancel = async (immediately: boolean) => {
    setCancelLoading(true);
    setSubError('');
    setSubSuccess('');
    try {
      const res = await fetch('/api/admin/subscription', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ action: 'cancel', user_id: client.id, at_period_end: !immediately }),
      });
      const json = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? 'Failed to cancel');
      setCancelConfirm(false);
      setSubSuccess(immediately ? 'Subscription cancelled immediately.' : 'Cancellation scheduled at period end.');
      // Refresh local sub state
      const { data } = await supabase
        .from('subscriptions')
        .select('id, plan_name, status, price_sar, started_at, expires_at, cancel_at_period_end, cancelled_at, stripe_subscription_id')
        .eq('user_id', client.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setCurrentSub(data ?? null);
      onRefresh();
    } catch (err: unknown) {
      setSubError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleRemove = async () => {
    setRemoveLoading(true);
    setSubError('');
    setSubSuccess('');
    try {
      const res = await fetch('/api/admin/subscription', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ action: 'remove', user_id: client.id }),
      });
      const json = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? 'Failed to remove');
      setRemoveConfirm(false);
      setCurrentSub(null);
      setSubSuccess('Subscription record removed.');
      onRefresh();
    } catch (err: unknown) {
      setSubError(err instanceof Error ? err.message : 'Failed to remove subscription');
    } finally {
      setRemoveLoading(false);
    }
  };

  const isActive = currentSub?.status === 'active' || currentSub?.status === 'trialing';
  const isPendingCancel = isActive && currentSub?.cancel_at_period_end;

  // Style tokens
  const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.15rem 1.25rem', marginBottom: '1rem' };
  const sectionLbl: React.CSSProperties = { fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '0.6rem' };
  const fieldLbl: React.CSSProperties = { fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.3rem' };
  const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '0.58rem 0.8rem', fontSize: '0.83rem', color: '#fff', outline: 'none', boxSizing: 'border-box' };

  return (
    <AdminModal open onClose={onClose} title="Edit Client" maxWidth={580}>
      {/* ── Client identity header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1rem', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 14, marginBottom: '1.25rem' }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', fontSize: 15, fontWeight: 700, color: '#C9A84C' }}>
          {client.full_name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.full_name ?? 'Unnamed Client'}</p>
          <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.38)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.email ?? '—'}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span className={isActive ? 'ds-badge-green' : 'ds-badge-gray'} style={{ whiteSpace: 'nowrap' }}>
            {isActive ? (isPendingCancel ? 'Cancels Soon' : 'Active') : 'No Sub'}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>
            Joined {new Date(client.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4 }}>
        {(['subscription', 'info'] as const).map(t2 => (
          <button
            key={t2}
            onClick={() => setTab(t2)}
            style={{ flex: 1, padding: '0.55rem 0', borderRadius: 7, fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.18s', background: tab === t2 ? 'rgba(201,168,76,0.18)' : 'transparent', color: tab === t2 ? '#C9A84C' : 'rgba(255,255,255,0.38)', letterSpacing: '0.02em' }}
          >
            {t2 === 'subscription' ? 'Subscription' : 'Client Info'}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════ SUBSCRIPTION TAB ═══ */}
      {tab === 'subscription' && (
        <div>
          {subLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[85, 65, 45].map(w => (
                <div key={w} style={{ height: 14, borderRadius: 6, background: 'rgba(255,255,255,0.05)', width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <>
              {/* ── Current Subscription Card ── */}
              {isActive ? (
                <div style={{ ...card, borderColor: isPendingCancel ? 'rgba(251,191,36,0.2)' : 'rgba(74,222,128,0.18)' }}>
                  <p style={sectionLbl}>Current Subscription</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: isPendingCancel ? 'rgba(251,191,36,0.9)' : 'rgba(74,222,128,0.9)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isPendingCancel ? 'rgba(251,191,36,0.7)' : 'rgba(74,222,128,0.7)' }}>
                          {isPendingCancel ? 'Cancels at period end' : currentSub!.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 3 }}>{currentSub!.plan_name}</p>
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                          Started: {new Date(currentSub!.started_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {currentSub!.expires_at && (
                          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                            {isPendingCancel ? 'Access until' : 'Renews'}: {new Date(currentSub!.expires_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {currentSub!.stripe_subscription_id && (
                        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.22)', marginTop: 4, fontFamily: 'monospace' }}>
                          Stripe: {currentSub!.stripe_subscription_id}
                        </p>
                      )}
                    </div>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#C9A84C', letterSpacing: '-0.02em' }} dir="ltr">
                      AED {currentSub!.price_sar}<span style={{ fontSize: '0.62rem', fontWeight: 500, color: 'rgba(255,255,255,0.3)', marginLeft: 3 }}>/mo</span>
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { setShowPlanPicker(v => !v); setSubError(''); setSubSuccess(''); }}
                      style={{ padding: '0.42rem 0.9rem', borderRadius: 8, fontSize: '0.73rem', fontWeight: 700, border: '1px solid rgba(201,168,76,0.35)', background: 'transparent', color: '#C9A84C', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.04em' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {showPlanPicker ? 'Hide Plans' : 'Change Plan'}
                    </button>
                    {!isPendingCancel && (
                      <button
                        onClick={() => { setCancelConfirm(true); setSubError(''); setSubSuccess(''); }}
                        style={{ padding: '0.42rem 0.9rem', borderRadius: 8, fontSize: '0.73rem', fontWeight: 600, border: '1px solid rgba(248,113,113,0.25)', background: 'transparent', color: 'rgba(248,113,113,0.7)', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.07)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        Cancel Subscription
                      </button>
                    )}
                    <button
                      onClick={() => { setRemoveConfirm(true); setSubError(''); setSubSuccess(''); }}
                      style={{ padding: '0.42rem 0.9rem', borderRadius: 8, fontSize: '0.73rem', fontWeight: 600, border: '1px solid rgba(248,113,113,0.15)', background: 'transparent', color: 'rgba(248,113,113,0.45)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      Remove Record
                    </button>
                  </div>
                </div>
              ) : (
                /* No active subscription */
                <div style={{ ...card, textAlign: 'center', padding: '1.5rem 1rem' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.85rem' }}>
                    <svg style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.25)' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>
                  </div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}>No active subscription</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.22)', marginBottom: '1rem' }}>Assign a plan from the list below</p>
                  <button
                    onClick={() => setShowPlanPicker(true)}
                    className="ds-btn-gold"
                    style={{ fontSize: '0.78rem', padding: '0.5rem 1.2rem' }}
                  >
                    Assign Plan
                  </button>
                </div>
              )}

              {/* ── Plan Picker ── */}
              {showPlanPicker && (
                <div style={{ marginTop: 4, marginBottom: 4 }}>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: '1rem' }} />
                  <p style={sectionLbl}>Select a Plan to Assign</p>

                  {/* Duration selector */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {[30, 60, 90, 180, 365].map(d => (
                      <button
                        key={d}
                        onClick={() => setDurationDays(d)}
                        style={{ padding: '0.35rem 0.75rem', borderRadius: 7, fontSize: '0.72rem', fontWeight: 600, border: `1px solid ${durationDays === d ? 'rgba(201,168,76,0.45)' : 'rgba(255,255,255,0.1)'}`, background: durationDays === d ? 'rgba(201,168,76,0.12)' : 'transparent', color: durationDays === d ? '#C9A84C' : 'rgba(255,255,255,0.38)', cursor: 'pointer', transition: 'all 0.15s' }}
                      >
                        {d === 365 ? '1 year' : `${d}d`}
                      </button>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 110 }}>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>Custom:</span>
                      <input
                        type="number"
                        min={1} max={3650}
                        value={durationDays}
                        onChange={e => setDurationDays(Math.max(1, Math.min(3650, Number(e.target.value))))}
                        style={{ ...inp, width: 72, padding: '0.32rem 0.6rem', fontSize: '0.78rem' }}
                      />
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>days</span>
                    </div>
                  </div>

                  {/* Plan cards */}
                  {plans.length === 0 ? (
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.28)', textAlign: 'center', padding: '1rem 0' }}>No published plans available.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1rem' }}>
                      {plans.map(plan => {
                        const isCurrent = isActive && currentSub?.plan_name === plan.name;
                        const isSelected = selectedPlanId === plan.id;
                        return (
                          <div
                            key={plan.id}
                            onClick={() => setSelectedPlanId(isSelected ? '' : plan.id)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: 12, background: isSelected ? 'rgba(201,168,76,0.07)' : 'rgba(255,255,255,0.025)', border: `1px solid ${isSelected ? 'rgba(201,168,76,0.4)' : isCurrent ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', transition: 'all 0.18s', flexWrap: 'wrap', gap: 8 }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {/* Radio dot */}
                              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${isSelected ? '#C9A84C' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {isSelected && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#C9A84C' }} />}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <p style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? '#C9A84C' : '#fff' }}>{plan.name}</p>
                                  {isCurrent && <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.12rem 0.45rem', borderRadius: 999, background: 'rgba(74,222,128,0.1)', color: 'rgba(74,222,128,0.8)', border: '1px solid rgba(74,222,128,0.2)' }}>Current</span>}
                                </div>
                                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                                  Access for {durationDays === 365 ? '1 year' : `${durationDays} days`}
                                </p>
                              </div>
                            </div>
                            <p style={{ fontSize: '1.05rem', fontWeight: 800, color: isSelected ? '#C9A84C' : 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }} dir="ltr">
                              AED {plan.price_sar}<span style={{ fontSize: '0.62rem', fontWeight: 400, color: 'rgba(255,255,255,0.25)', marginLeft: 3 }}>/mo</span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    className="ds-btn-gold"
                    style={{ width: '100%', opacity: !selectedPlanId || assignLoading ? 0.55 : 1 }}
                    disabled={!selectedPlanId || assignLoading}
                    onClick={handleAssign}
                  >
                    {assignLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                        <svg style={{ animation: 'spin 0.8s linear infinite', width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                        Assigning…
                      </span>
                    ) : (
                      isActive ? `Switch to ${plans.find(p => p.id === selectedPlanId)?.name ?? 'plan'}` : `Assign ${plans.find(p => p.id === selectedPlanId)?.name ?? 'Plan'}`
                    )}
                  </button>
                </div>
              )}

              {/* Feedback messages */}
              {subError && (
                <div style={{ marginTop: 10, padding: '0.65rem 0.9rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 9, fontSize: '0.78rem', color: 'rgba(239,68,68,0.88)' }}>{subError}</div>
              )}
              {subSuccess && (
                <div style={{ marginTop: 10, padding: '0.65rem 0.9rem', background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 9, fontSize: '0.78rem', color: 'rgba(74,222,128,0.85)' }}>{subSuccess}</div>
              )}

              {/* ── Cancel Confirmation ── */}
              {cancelConfirm && (
                <div style={{ marginTop: 10, padding: '1rem 1.15rem', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12 }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(251,191,36,0.85)', marginBottom: 6 }}>Cancel this subscription?</p>
                  <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.9rem', lineHeight: 1.55 }}>
                    Choose <strong style={{ color: 'rgba(255,255,255,0.65)' }}>At Period End</strong> to keep access until {currentSub?.expires_at ? new Date(currentSub.expires_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : 'expiry'}, or <strong style={{ color: 'rgba(255,255,255,0.65)' }}>Immediately</strong> to revoke access now.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleCancel(false)}
                      disabled={cancelLoading}
                      style={{ padding: '0.5rem 1rem', borderRadius: 9, fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.1)', color: 'rgba(251,191,36,0.9)', cursor: cancelLoading ? 'not-allowed' : 'pointer', opacity: cancelLoading ? 0.7 : 1 }}
                    >
                      {cancelLoading ? 'Processing…' : 'At Period End'}
                    </button>
                    <button
                      onClick={() => handleCancel(true)}
                      disabled={cancelLoading}
                      style={{ padding: '0.5rem 1rem', borderRadius: 9, fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.1)', color: 'rgba(248,113,113,0.9)', cursor: cancelLoading ? 'not-allowed' : 'pointer', opacity: cancelLoading ? 0.7 : 1 }}
                    >
                      {cancelLoading ? 'Processing…' : 'Immediately'}
                    </button>
                    <button
                      onClick={() => setCancelConfirm(false)}
                      style={{ padding: '0.5rem 0.85rem', borderRadius: 9, fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                    >
                      Keep
                    </button>
                  </div>
                </div>
              )}

              {/* ── Remove Confirmation ── */}
              {removeConfirm && (
                <div style={{ marginTop: 10, padding: '1rem 1.15rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12 }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(239,68,68,0.85)', marginBottom: 6 }}>Remove subscription record?</p>
                  <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.9rem', lineHeight: 1.55 }}>
                    This permanently deletes the database record. This action cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={handleRemove}
                      disabled={removeLoading}
                      style={{ padding: '0.5rem 1rem', borderRadius: 9, fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.9)', cursor: removeLoading ? 'not-allowed' : 'pointer', opacity: removeLoading ? 0.7 : 1 }}
                    >
                      {removeLoading ? 'Removing…' : 'Yes, Remove'}
                    </button>
                    <button
                      onClick={() => setRemoveConfirm(false)}
                      style={{ padding: '0.5rem 0.85rem', borderRadius: 9, fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════ CLIENT INFO TAB ═══ */}
      {tab === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={card}>
            <p style={sectionLbl}>Account</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <div>
                <span style={fieldLbl}>Full Name</span>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>{client.full_name ?? '—'}</p>
              </div>
              <div>
                <span style={fieldLbl}>Email</span>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', wordBreak: 'break-all' }}>{client.email ?? '—'}</p>
              </div>
              <div>
                <span style={fieldLbl}>Role</span>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', textTransform: 'capitalize' }}>{client.role}</p>
              </div>
              <div>
                <span style={fieldLbl}>Onboarding</span>
                <span className={client.onboarding_completed ? 'ds-badge-green' : 'ds-badge-gray'}>
                  {client.onboarding_completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
          <div style={card}>
            <p style={sectionLbl}>Assignment</p>
            <div>
              <span style={fieldLbl}>Assigned Coach</span>
              <p style={{ fontSize: '0.85rem', color: client.assigned_coach ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.28)' }}>
                {client.assigned_coach ?? 'No coach assigned'}
              </p>
            </div>
          </div>
          <div style={{ padding: '0.75rem 0 0.25rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.25)' }}>
              To edit profile details or assign a coach, use the respective admin controls.
            </p>
          </div>
        </div>
      )}
    </AdminModal>
  );
}

/* ─── Coaches Tab ─────────────────────────────────────── */
function CoachesTab({ coaches, onRefresh }: { coaches: AdminCoach[]; onRefresh: () => void }) {
  const { t } = useLanguage();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [touched, setTouched] = useState({ full_name: false, email: false, password: false, phone: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCoach, setEditCoach] = useState<AdminCoach | null>(null);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', bio: '', specialization: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [suspending, setSuspending] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'full_name':
        if (!value.trim()) return 'Full name is required.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        if (/\d/.test(value)) return 'Name should not contain numbers.';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
        return '';
      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 6) return 'Password must be at least 6 characters.';
        return '';
      case 'phone':
        if (value && !/^[+\d\s\-().]{7,20}$/.test(value)) return 'Enter a valid phone number.';
        return '';
      default: return '';
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setForm(p => ({ ...p, [name]: value }));
    if ((touched as Record<string, boolean>)[name]) {
      setFieldErrors(p => ({ ...p, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name: string, value: string) => {
    setTouched(p => ({ ...p, [name]: true }));
    setFieldErrors(p => ({ ...p, [name]: validateField(name, value) }));
  };

  const createCoach = async () => {
    const newErrors = {
      full_name: validateField('full_name', form.full_name),
      email: validateField('email', form.email),
      password: validateField('password', form.password),
      phone: validateField('phone', form.phone),
    };
    setFieldErrors(newErrors);
    setTouched({ full_name: true, email: true, password: true, phone: true });
    if (Object.values(newErrors).some(e => e)) return;
    setSaving(true); setError(''); setSuccess('');
    // Include the current session token so the API route can verify admin role reliably
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/admin/create-coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.error) { setError(json.error); setSaving(false); return; }
    setSuccess('Coach account created successfully.');
    setForm({ full_name: '', email: '', password: '', phone: '' });
    setFieldErrors({ full_name: '', email: '', password: '', phone: '' });
    setTouched({ full_name: false, email: false, password: false, phone: false });
    setShowCreate(false);
    onRefresh();
    setSaving(false);
  };

  const startEdit = (c: AdminCoach) => {
    setEditingId(c.id);
    setEditCoach(c);
    setResetSent(false);
    setEditForm({ full_name: c.full_name ?? '', phone: c.phone ?? '', bio: c.bio ?? '', specialization: c.specialization ?? '' });
  };

  const saveEdit = async (coachId: string) => {
    setEditSaving(true);
    const payload = {
      full_name: editForm.full_name.trim(),
      phone: editForm.phone.trim() || null,
      bio: editForm.bio.trim() || null,
      specialization: editForm.specialization.trim() || null,
    };
    await supabase.from('profiles').update(payload).eq('id', coachId);
    setEditingId(null);
    setEditCoach(null);
    setEditSaving(false);
    onRefresh();
  };

  const toggleSuspend = async (coach: AdminCoach) => {
    const isSuspended = coach.role === 'suspended';
    const newRole = isSuspended ? 'coach' : 'suspended';
    const msg = isSuspended
      ? 'Restore this coach? They will regain access to their dashboard.'
      : 'Suspend this coach? They will lose access until restored.';
    if (!confirm(msg)) return;
    setSuspending(coach.id);
    await supabase.from('profiles').update({ role: newRole }).eq('id', coach.id);
    setSuspending(null);
    setEditCoach(prev => prev ? { ...prev, role: newRole } : prev);
    onRefresh();
  };

  const deactivateCoach = async (coachId: string) => {
    if (!confirm('Remove this coach permanently? Their clients will be unassigned. This cannot be undone easily.')) return;
    setDeactivating(coachId);
    await supabase.from('trainer_client_assignments').delete().eq('trainer_id', coachId);
    await supabase.from('profiles').update({ role: 'client' }).eq('id', coachId);
    setDeactivating(null);
    onRefresh();
  };

  const sendPasswordReset = async (coachId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ user_id: coachId }),
    });
    if (res.ok) setResetSent(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <p dir="auto" className="ds-section-title">{t('admin.coaches')}</p>
          <p dir="ltr" className="ds-section-sub">{coaches.length} coaches on platform</p>
        </div>
        <button className="ds-btn-gold" onClick={() => { setShowCreate(!showCreate); setError(''); setSuccess(''); }}>
          <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          {t('admin.createCoach')}
        </button>
      </div>

      {/* ── Create Coach Modal ── */}
      <AdminModal open={showCreate} onClose={() => { setShowCreate(false); setError(''); setForm({ full_name: '', email: '', password: '', phone: '' }); setFieldErrors({ full_name: '', email: '', password: '', phone: '' }); setTouched({ full_name: false, email: false, password: false, phone: false }); }} title="Create Coach Account" maxWidth={500}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 10, fontSize: '0.8rem', color: 'rgba(239,68,68,0.85)' }}>{error}</div>
          )}
          {success && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, fontSize: '0.82rem', color: 'rgba(74,222,128,0.9)' }}>{success}</div>
          )}
          <div>
            <label className="ds-label">Full Name *</label>
            <input
              className="ds-input"
              placeholder="Coach name"
              value={form.full_name}
              onChange={e => handleFieldChange('full_name', e.target.value)}
              onBlur={e => handleBlur('full_name', e.target.value)}
              style={fieldErrors.full_name ? { borderColor: 'rgba(239,68,68,0.6)' } : {}}
            />
            {fieldErrors.full_name && <p style={{ marginTop: '0.3rem', fontSize: '0.72rem', color: 'rgba(239,68,68,0.85)' }}>{fieldErrors.full_name}</p>}
          </div>
          <div>
            <label className="ds-label">Email *</label>
            <input
              className="ds-input"
              type="email"
              placeholder="coach@omrplus.com"
              value={form.email}
              onChange={e => handleFieldChange('email', e.target.value)}
              onBlur={e => handleBlur('email', e.target.value)}
              style={fieldErrors.email ? { borderColor: 'rgba(239,68,68,0.6)' } : {}}
            />
            {fieldErrors.email && <p style={{ marginTop: '0.3rem', fontSize: '0.72rem', color: 'rgba(239,68,68,0.85)' }}>{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="ds-label">Password *</label>
            <input
              className="ds-input"
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => handleFieldChange('password', e.target.value)}
              onBlur={e => handleBlur('password', e.target.value)}
              style={fieldErrors.password ? { borderColor: 'rgba(239,68,68,0.6)' } : {}}
            />
            {fieldErrors.password && <p style={{ marginTop: '0.3rem', fontSize: '0.72rem', color: 'rgba(239,68,68,0.85)' }}>{fieldErrors.password}</p>}
            {!fieldErrors.password && form.password && (
              <div style={{ marginTop: '0.4rem', display: 'flex', gap: 4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: form.password.length >= i * 3 ? (form.password.length < 6 ? '#ef4444' : form.password.length < 10 ? '#f59e0b' : '#22c55e') : 'rgba(255,255,255,0.1)' }} />
                ))}
                <span style={{ fontSize: '0.65rem', color: form.password.length < 6 ? '#ef4444' : form.password.length < 10 ? '#f59e0b' : '#22c55e', marginLeft: 6, whiteSpace: 'nowrap' }}>
                  {form.password.length < 6 ? 'Too short' : form.password.length < 10 ? 'Fair' : 'Strong'}
                </span>
              </div>
            )}
          </div>
          <div>
            <label className="ds-label">Phone <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(optional)</span></label>
            <input
              className="ds-input"
              type="tel"
              placeholder="+966 5x xxx xxxx"
              value={form.phone}
              onChange={e => {
                const val = e.target.value.replace(/[^\d+\s\-().]/g, '');
                handleFieldChange('phone', val);
              }}
              onBlur={e => handleBlur('phone', e.target.value)}
              style={fieldErrors.phone ? { borderColor: 'rgba(239,68,68,0.6)' } : {}}
            />
            {fieldErrors.phone && <p style={{ marginTop: '0.3rem', fontSize: '0.72rem', color: 'rgba(239,68,68,0.85)' }}>{fieldErrors.phone}</p>}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="ds-btn-gold" style={{ flex: 1 }} disabled={saving} onClick={createCoach}>{saving ? t('admin.saving') : t('admin.createCoach')}</button>
            <button className="ds-btn-outline" onClick={() => { setShowCreate(false); setError(''); }}>{t('admin.cancel')}</button>
          </div>
        </div>
      </AdminModal>

      {coaches.length === 0 ? (
        <div className="ds-empty">
          <div className="ds-empty-icon">
            <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
          </div>
          <p dir="auto">{t('admin.noCoaches')}</p>
        </div>
      ) : (
        <div className="ds-card ds-table-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="ds-table">
            <thead>
              <tr><th>{t('admin.coach')}</th><th>Status</th><th>{t('admin.clients')}</th><th>{t('admin.joined')}</th><th></th></tr>
            </thead>
            <tbody>
              {coaches.map(c => (
                <React.Fragment key={c.id}>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', fontSize: 11, fontWeight: 700, color: '#C9A84C' }}>
                          {c.full_name?.[0]?.toUpperCase() ?? 'C'}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>{c.full_name ?? t('admin.unnamed')}</p>
                      </div>
                    </td>
                    <td>
                      {c.role === 'suspended'
                        ? <span className="ds-badge-red" style={{ fontSize: '0.65rem' }}>Suspended</span>
                        : <span className="ds-badge-green" style={{ fontSize: '0.65rem' }}>Active</span>}
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.55)' }}>{c.client_count}</td>
                    <td style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.75rem' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="ds-btn-outline" style={{ padding: '0.35rem 0.7rem', fontSize: '0.72rem' }}
                          onClick={() => startEdit(c)}>
                          Edit
                        </button>
                        <button
                          disabled={deactivating === c.id}
                          onClick={() => deactivateCoach(c.id)}
                          style={{ background: 'none', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 7, padding: '0.35rem 0.7rem', fontSize: '0.72rem', color: 'rgba(248,113,113,0.7)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {deactivating === c.id ? '…' : 'Remove'}
                        </button>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Edit Coach Modal ── */}
      <AdminModal open={!!editingId} onClose={() => { setEditingId(null); setEditCoach(null); }} title="Edit Coach" maxWidth={520}>
        {editCoach && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Coach summary card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1rem 1.1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', fontSize: 16, fontWeight: 700, color: '#C9A84C' }}>
                {editCoach.full_name?.[0]?.toUpperCase() ?? 'C'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '0.15rem' }}>{editCoach.full_name ?? 'Unnamed Coach'}</p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {editCoach.role === 'suspended'
                    ? <span className="ds-badge-red" style={{ fontSize: '0.6rem' }}>Suspended</span>
                    : <span className="ds-badge-green" style={{ fontSize: '0.6rem' }}>Active</span>}
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)' }}>{editCoach.client_count} client{editCoach.client_count !== 1 ? 's' : ''} · Joined {new Date(editCoach.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* ── Section: Profile Info ── */}
            <div>
              <p style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Profile Information</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="ds-label">Full Name *</label>
                  <input className="ds-input" value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Coach full name" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label className="ds-label">Phone</label>
                    <input className="ds-input" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="+966 5x xxx xxxx" />
                  </div>
                  <div>
                    <label className="ds-label">Specialization</label>
                    <input className="ds-input" value={editForm.specialization} onChange={e => setEditForm(p => ({ ...p, specialization: e.target.value }))} placeholder="e.g. Weight Loss, Strength" />
                  </div>
                </div>
                <div>
                  <label className="ds-label">Bio / About</label>
                  <textarea className="ds-input" value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} placeholder="Brief coach bio shown to clients…" style={{ minHeight: 80, resize: 'vertical', lineHeight: 1.55 }} />
                </div>
              </div>
            </div>

            {/* ── Section: Account Actions ── */}
            <div>
              <p style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Account Actions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {/* Reset Password */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '0.8rem 1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.1rem' }}>Password Reset</p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)' }}>Send a password reset email to the coach</p>
                  </div>
                  {resetSent ? (
                    <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 600 }}>✓ Sent</span>
                  ) : (
                    <button
                      className="ds-btn-outline"
                      style={{ padding: '0.38rem 0.85rem', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                      onClick={() => editingId && sendPasswordReset(editingId)}
                    >Send Reset</button>
                  )}
                </div>

                {/* Suspend / Restore */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: editCoach.role === 'suspended' ? 'rgba(74,222,128,0.04)' : 'rgba(248,113,113,0.04)', border: `1px solid ${editCoach.role === 'suspended' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'}`, borderRadius: 10, padding: '0.8rem 1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: editCoach.role === 'suspended' ? 'rgba(74,222,128,0.8)' : 'rgba(248,113,113,0.8)', marginBottom: '0.1rem' }}>
                      {editCoach.role === 'suspended' ? 'Restore Coach Access' : 'Suspend Coach'}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)' }}>
                      {editCoach.role === 'suspended' ? 'Coach will regain dashboard access immediately' : 'Coach loses dashboard access until restored'}
                    </p>
                  </div>
                  <button
                    disabled={suspending === editCoach.id}
                    onClick={() => toggleSuspend(editCoach)}
                    style={{
                      padding: '0.38rem 0.85rem', fontSize: '0.72rem', fontWeight: 600, borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
                      background: editCoach.role === 'suspended' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                      color: editCoach.role === 'suspended' ? '#4ade80' : 'rgba(248,113,113,0.85)',
                      border: `1px solid ${editCoach.role === 'suspended' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                    }}
                  >
                    {suspending === editCoach.id ? '…' : editCoach.role === 'suspended' ? 'Restore' : 'Suspend'}
                  </button>
                </div>

                {/* Remove Coach */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '0.8rem 1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '0.1rem' }}>Remove Coach</p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>Permanently removes coach role and unassigns all clients</p>
                  </div>
                  <button
                    disabled={deactivating === editCoach.id}
                    onClick={() => { deactivateCoach(editCoach.id); setEditingId(null); setEditCoach(null); }}
                    style={{ padding: '0.38rem 0.85rem', fontSize: '0.72rem', fontWeight: 600, borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', background: 'none', color: 'rgba(248,113,113,0.5)', border: '1px solid rgba(248,113,113,0.2)' }}
                  >
                    {deactivating === editCoach.id ? '…' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                disabled={editSaving || !editForm.full_name.trim()}
                onClick={() => editingId && saveEdit(editingId)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.72rem 1.5rem', borderRadius: 10, border: 'none', cursor: editSaving ? 'not-allowed' : 'pointer',
                  background: editSaving || !editForm.full_name.trim() ? 'rgba(201,168,76,0.25)' : 'linear-gradient(135deg, #C9A84C 0%, #E8CC6E 50%, #C9A84C 100%)',
                  color: '#0B0B0B', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.03em', transition: 'opacity 0.2s',
                }}
              >
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
              <button className="ds-btn-outline" style={{ minWidth: 100 }} onClick={() => { setEditingId(null); setEditCoach(null); }}>{t('admin.cancel')}</button>
            </div>

          </div>
        )}
      </AdminModal>
    </div>
  );
}

/* ─── Subscriptions Tab ───────────────────────────────── */
function SubscriptionsTab({ subscriptions }: { subscriptions: AdminSubscription[] }) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? subscriptions : subscriptions.filter(s => s.status === filter);

  return (
    <div>
      <div className="admin-tab-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="ds-section-title">{t('admin.subscriptionsTitle')}</p>
          <p className="ds-section-sub">{subscriptions.length} {t('admin.totalSubscriptions')}</p>
        </div>
        <Select
          style={{ width: 160 }}
          value={filter}
          onChange={setFilter}
          placeholder=""
          options={[
            { value: 'all', label: t('admin.filterAll') },
            { value: 'active', label: t('admin.filterActive') },
            { value: 'cancelled', label: t('admin.filterCancelled') },
            { value: 'expired', label: t('admin.filterExpired') },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="ds-empty">
          <div className="ds-empty-icon">
            <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>
          </div>
          <p>{t('admin.noSubscriptions')}</p>
        </div>
      ) : (
        <div className="ds-card ds-table-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="ds-table">
            <thead>
              <tr><th>{t('admin.member')}</th><th>{t('admin.colPlan')}</th><th>{t('admin.colAmount')}</th><th>{t('admin.status')}</th><th>{t('admin.colStart')}</th><th>{t('admin.colExpires')}</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem' }}>{s.user_name ?? s.user_id.slice(0, 8)}</td>
                  <td style={{ color: 'rgba(255,255,255,0.65)' }}>{s.plan_name}</td>
                  <td style={{ color: '#C9A84C', fontWeight: 600 }}>AED {s.price_sar ?? '—'}</td>
                  <td>
                    <span className={s.status === 'active' ? 'ds-badge-green' : s.status === 'cancelled' ? 'ds-badge-red' : 'ds-badge-gray'}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.75rem' }}>{new Date(s.started_at).toLocaleDateString()}</td>
                  <td style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.75rem' }}>{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Billing Tab ─────────────────────────────────────── */
interface BillingOrder { id: string; status: string; total_sar: number; created_at: string; user_name: string | null; item_count: number; }

function BillingTab({ subscriptions }: { subscriptions: AdminSubscription[] }) {
  const [orders, setOrders] = useState<BillingOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('orders')
          .select('id, status, total_sar, created_at, user_id, order_items(id)')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!data || data.length === 0) { setOrdersLoading(false); return; }
        const ids = [...new Set(data.map((o: { user_id: string }) => o.user_id))];
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', ids);
        const nameMap: Record<string, string> = {};
        (profiles ?? []).forEach((p: { id: string; full_name: string | null }) => { nameMap[p.id] = p.full_name ?? 'Unknown'; });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setOrders(data.map((o: any) => ({
          id: o.id, status: o.status, total_sar: o.total_sar, created_at: o.created_at,
          user_name: nameMap[o.user_id] ?? null,
          item_count: o.order_items?.length ?? 0,
        })));
      } catch { /* silent */ } finally {
        setOrdersLoading(false);
      }
    })();
  }, []);

  // Aggregate subscription stats
  const active = subscriptions.filter(s => s.status === 'active');
  const totalRevenue = active.reduce((sum, s) => sum + (s.price_sar ?? 0), 0);
  const byPlan: Record<string, { count: number; revenue: number }> = {};
  active.forEach(s => {
    const key = s.plan_name ?? 'Unknown';
    if (!byPlan[key]) byPlan[key] = { count: 0, revenue: 0 };
    byPlan[key].count++;
    byPlan[key].revenue += s.price_sar ?? 0;
  });

  const orderRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total_sar ?? 0), 0);

  const statusColor = (s: string) => s === 'completed' ? '#4ade80' : s === 'pending' ? '#facc15' : s === 'processing' ? '#60a5fa' : 'rgba(255,255,255,0.4)';

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <p className="ds-section-title">Billing & Revenue</p>
        <p className="ds-section-sub">Subscription revenue and marketplace order totals</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Active Subscriptions', value: String(active.length), sub: 'Paying members', color: 'rgba(201,168,76,0.06)', border: 'rgba(201,168,76,0.2)' },
          { label: 'Subscription MRR', value: `AED ${totalRevenue.toLocaleString()}`, sub: 'Monthly recurring', color: 'rgba(74,222,128,0.05)', border: 'rgba(74,222,128,0.18)' },
          { label: 'Marketplace Revenue', value: `AED ${orderRevenue.toLocaleString()}`, sub: 'Completed orders', color: 'rgba(100,180,255,0.05)', border: 'rgba(100,180,255,0.18)' },
          { label: 'Total Orders', value: String(orders.length), sub: 'All time', color: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)' },
        ].map(k => (
          <div key={k.label} className="ds-stat" style={{ background: k.color, borderColor: k.border }}>
            <div className="ds-stat-value">{k.value}</div>
            <div className="ds-stat-label">{k.label}</div>
            <div className="ds-stat-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Revenue by plan */}
        <div className="ds-card" style={{ padding: '1.5rem' }}>
          <p className="ds-section-title" style={{ marginBottom: '1.25rem' }}>Revenue by Plan</p>
          {Object.keys(byPlan).length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>No active subscriptions</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(byPlan).sort(([,a],[,b]) => b.revenue - a.revenue).map(([plan, data]) => (
                <div key={plan}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{plan}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#C9A84C' }}>AED {data.revenue.toLocaleString()} <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>· {data.count} subs</span></span>
                  </div>
                  <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#C9A84C,#E8C76A)', width: `${Math.round((data.revenue / totalRevenue) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent subscriptions */}
        <div className="ds-card" style={{ padding: '1.5rem' }}>
          <p className="ds-section-title" style={{ marginBottom: '1.25rem' }}>Recent Subscriptions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {subscriptions.slice(0, 6).map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{s.user_name ?? s.user_id.slice(0,8)}</p>
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>{s.plan_name}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#C9A84C' }}>AED {s.price_sar}</p>
                  <span className={s.status === 'active' ? 'ds-badge-green' : 'ds-badge-gray'} style={{ fontSize: '0.58rem' }}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marketplace Orders */}
      <div className="ds-card" style={{ padding: '1.5rem' }}>
        <p className="ds-section-title" style={{ marginBottom: '1.25rem' }}>Marketplace Orders</p>
        {ordersLoading ? (
          <SkOrderRows rows={3} />
        ) : orders.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '1.5rem 0' }}>No orders yet</p>
        ) : (
          <div className="ds-table-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="ds-table">
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>#{o.id.slice(0,8).toUpperCase()}</td>
                    <td style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem' }}>{o.user_name ?? '—'}</td>
                    <td style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>{o.item_count} item{o.item_count !== 1 ? 's' : ''}</td>
                    <td style={{ color: '#C9A84C', fontWeight: 600 }}>AED {o.total_sar}</td>
                    <td><span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 5, background: `${statusColor(o.status)}18`, color: statusColor(o.status), border: `1px solid ${statusColor(o.status)}33` }}>{o.status}</span></td>
                    <td style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Marketplace Tab ─────────────────────────────────── */
function MarketplaceTab() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', name_ar: '', description: '', description_ar: '', price_sar: '', type: 'supplement', image_url: '', file_url: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const imgInputRef = React.useRef<HTMLInputElement>(null);
  const [translating, setTranslating] = useState<'name'|'desc'|null>(null);
  const translateTimers = React.useRef<{ name?: ReturnType<typeof setTimeout>; desc?: ReturnType<typeof setTimeout> }>({});

  const autoTranslate = (field: 'name'|'desc', text: string) => {
    clearTimeout(translateTimers.current[field]);
    if (!text.trim()) return;
    translateTimers.current[field] = setTimeout(async () => {
      setTranslating(field);
      try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`);
        const json = await res.json();
        const translated: string = json?.responseData?.translatedText ?? '';
        if (translated && !translated.toLowerCase().includes('mymemory')) {
          setForm(p => field === 'name'
            ? { ...p, name_ar: translated }
            : { ...p, description_ar: translated }
          );
        }
      } catch { /* silent */ } finally {
        setTranslating(null);
      }
    }, 700);
  };

  const categories = ['supplement', 'snack', 'ebook', 'equipment', 'other'];

  // Safety net — if Supabase hangs, stop spinning after 5s
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      setProducts(data ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, name_ar: p.name_ar ?? '', description: p.description ?? '', description_ar: p.description_ar ?? '', price_sar: String(p.price_sar), type: p.type ?? 'supplement', image_url: p.image_url ?? '', file_url: p.file_url ?? '', is_active: p.is_active });
    setShowForm(true);
  };

  const saveProduct = async () => {
    if (!form.name.trim() || !form.price_sar) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      name_ar: form.name_ar.trim() || null,
      description: form.description.trim() || null,
      description_ar: form.description_ar.trim() || null,
      price_sar: Number(form.price_sar),
      type: form.type,
      image_url: form.image_url.trim() || null,
      file_url: form.file_url.trim() || null,
      is_active: form.is_active,
    };
    if (editProduct) {
      await supabase.from('products').update(payload).eq('id', editProduct.id);
    } else {
      await supabase.from('products').insert(payload);
    }
    await load();
    setShowForm(false); setEditProduct(null); setForm({ name: '', name_ar: '', description: '', description_ar: '', price_sar: '', type: 'supplement', image_url: '', file_url: '', is_active: true });
    setSaving(false);
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setImgUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `products/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
      if (upErr) { setImgUploading(false); return; }
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      setForm(p => ({ ...p, image_url: data.publicUrl }));
    } finally {
      setImgUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="ds-section-title">{t('admin.marketplaceTitle')}</p>
          <p className="ds-section-sub">{t('admin.marketplaceSub')}</p>
        </div>
        <button className="ds-btn-gold" onClick={() => { setShowForm(!showForm); setEditProduct(null); setForm({ name: '', name_ar: '', description: '', description_ar: '', price_sar: '', type: 'supplement', image_url: '', file_url: '', is_active: true }); }}>
          <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          {t('admin.addProduct')}
        </button>
      </div>

      {/* ── Product Form Modal ── */}
      {showForm && (
        <AdminModal open={showForm} onClose={() => { setShowForm(false); setEditProduct(null); }} title={editProduct ? 'Edit Product' : 'Add New Product'} maxWidth={680}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── Section 1: Product Name ── */}
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Product Name</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label className="ds-label">Name (EN)</label>
                  <input className="ds-input" placeholder="e.g. Whey Protein" value={form.name}
                    onChange={e => { setForm(p => ({ ...p, name: e.target.value })); autoTranslate('name', e.target.value); }}
                    disabled={translating === 'name'}
                    style={{ opacity: translating === 'name' ? 0.5 : 1, cursor: translating === 'name' ? 'not-allowed' : undefined }} />
                </div>
                <div>
                  <label className="ds-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Name (AR) <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>اختياري</span>
                    {translating === 'name' && <span style={{ fontSize: '0.58rem', color: '#C9A84C', fontWeight: 600 }}>✦ translating…</span>}
                  </label>
                  <input className="ds-input" dir="rtl" placeholder="اسم المنتج" value={form.name_ar}
                    onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))}
                    style={{ borderColor: translating === 'name' ? 'rgba(201,168,76,0.5)' : '' }} />
                </div>
              </div>
            </div>

            {/* ── Section 2: Pricing & Category ── */}
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Pricing & Category</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label className="ds-label">Price (AED)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', fontWeight: 600 }}>AED</span>
                    <input className="ds-input" type="number" min="0" step="0.01" placeholder="0.00" value={form.price_sar}
                      onChange={e => setForm(p => ({ ...p, price_sar: e.target.value }))}
                      style={{ paddingLeft: '3rem' }} />
                  </div>
                </div>
                <div>
                  <label className="ds-label">Category</label>
                  <Select
                    value={form.type}
                    onChange={v => setForm(p => ({ ...p, type: v }))}
                    placeholder=""
                    options={categories.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
                  />
                </div>
              </div>
            </div>

            {/* ── Section 3: Product Image ── */}
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Product Image</p>
              <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
              <div
                onClick={() => imgInputRef.current?.click()}
                style={{
                  border: `1.5px dashed ${form.image_url ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.25)'}`,
                  borderRadius: 12,
                  cursor: imgUploading ? 'wait' : 'pointer',
                  background: 'rgba(201,168,76,0.03)',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'border-color 0.2s, background 0.2s',
                  minHeight: form.image_url ? 180 : 110,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.7)'; e.currentTarget.style.background = 'rgba(201,168,76,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = form.image_url ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.25)'; e.currentTarget.style.background = 'rgba(201,168,76,0.03)'; }}
              >
                {imgUploading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', padding: '2rem' }}>
                    <div className="ds-loading" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.75rem', color: '#C9A84C', fontWeight: 600 }}>Uploading image…</span>
                  </div>
                ) : form.image_url ? (
                  <>
                    <img src={form.image_url} alt="preview" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', opacity: 0, transition: 'opacity 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                      <svg style={{ width: 22, height: 22, color: '#fff' }} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                      <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>Click to replace</span>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg style={{ width: 22, height: 22, color: '#C9A84C' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: '0.2rem' }}>Click to upload product image</p>
                      <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)' }}>PNG, JPG, WEBP · Recommended 800×800px</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Section 4: Description ── */}
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Description</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label className="ds-label">Description (EN)</label>
                  <textarea className="ds-input" placeholder="Describe the product, benefits, usage…" value={form.description}
                    onChange={e => { setForm(p => ({ ...p, description: e.target.value })); autoTranslate('desc', e.target.value); }}
                    disabled={translating === 'desc'}
                    style={{ minHeight: 90, resize: 'vertical', lineHeight: 1.55, opacity: translating === 'desc' ? 0.5 : 1, cursor: translating === 'desc' ? 'not-allowed' : undefined }} />
                </div>
                <div>
                  <label className="ds-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Description (AR) <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>اختياري</span>
                    {translating === 'desc' && <span style={{ fontSize: '0.58rem', color: '#C9A84C', fontWeight: 600 }}>✦ translating…</span>}
                  </label>
                  <textarea className="ds-input" dir="rtl" placeholder="وصف المنتج…" value={form.description_ar}
                    onChange={e => setForm(p => ({ ...p, description_ar: e.target.value }))}
                    style={{ minHeight: 90, resize: 'vertical', lineHeight: 1.55, borderColor: translating === 'desc' ? 'rgba(201,168,76,0.5)' : '' }} />
                </div>
              </div>
            </div>

            {/* ── Section 5: Ebook Download URL (conditional) ── */}
            {form.type === 'ebook' && (
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Ebook File</p>
                <label className="ds-label">Download URL</label>
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
                  <input className="ds-input" placeholder="https://… (PDF, EPUB, or download link)" value={form.file_url}
                    onChange={e => setForm(p => ({ ...p, file_url: e.target.value }))}
                    style={{ paddingLeft: '2.4rem' }} />
                </div>
              </div>
            )}

            {/* ── Section 6: Visibility ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '0.85rem 1rem' }}>
              <div>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: '0.15rem' }}>Active in Store</p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Visible to customers on the marketplace</p>
              </div>
              <button
                className="ds-toggle"
                style={{ background: form.is_active ? '#C9A84C' : 'rgba(255,255,255,0.1)', flexShrink: 0 }}
                onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
              >
                <span className="ds-toggle-knob" style={{ left: form.is_active ? '23px' : '3px' }} />
              </button>
            </div>

            {/* ── Footer Buttons ── */}
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
              <button
                disabled={saving}
                onClick={saveProduct}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.5rem', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  background: saving ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg, #C9A84C 0%, #E8CC6E 50%, #C9A84C 100%)',
                  color: '#0B0B0B', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.04em',
                  transition: 'opacity 0.2s', opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <>
                    <div className="ds-loading" style={{ width: 14, height: 14, borderRadius: '50%', borderColor: 'rgba(0,0,0,0.3)', borderTopColor: '#0B0B0B' }} />
                    Saving…
                  </>
                ) : (editProduct ? 'Save Changes' : 'Add Product')}
              </button>
              <button className="ds-btn-outline" style={{ minWidth: 110 }} onClick={() => { setShowForm(false); setEditProduct(null); }}>{t('admin.cancel')}</button>
            </div>

          </div>
        </AdminModal>
      )}

      {loading ? (
        <SkProductGrid />
      ) : products.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '5rem 2rem', textAlign: 'center',
        }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 20, marginBottom: '1.75rem',
            background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg style={{ width: 32, height: 32, color: 'rgba(201,168,76,0.7)' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
          </div>

          {/* Heading */}
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>
            Your marketplace is empty
          </h3>

          {/* Description */}
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', maxWidth: 380, lineHeight: 1.65, marginBottom: '2rem' }}>
            Start building your store by adding supplements, healthy snacks, ebooks, or equipment. Products you add here will appear on the public marketplace once activated.
          </p>

          {/* CTA button */}
          <button
            className="ds-btn-gold"
            style={{ padding: '0.7rem 1.5rem', fontSize: '0.88rem', gap: '0.5rem' }}
            onClick={() => {
              setShowForm(true);
              setEditProduct(null);
              setForm({ name: '', name_ar: '', description: '', description_ar: '', price_sar: '', type: 'supplement', image_url: '', file_url: '', is_active: true });
            }}
          >
            <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Your First Product
          </button>

          {/* Hint chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1.75rem' }}>
            {['Supplements', 'Healthy Snacks', 'Ebooks', 'Equipment'].map(cat => (
              <span key={cat} style={{
                padding: '0.3rem 0.75rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 500,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.3)',
              }}>{cat}</span>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
          {products.map(p => (
            <div key={p.id} className="ds-card" style={{ padding: '1.25rem' }}>
              {p.image_url && (
                <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: '0.9rem' }} />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{p.name}</p>
                <span className="ds-badge-gold" style={{ whiteSpace: 'nowrap' }}>${p.price_sar}</span>
              </div>
              {p.description && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.75rem', lineHeight: 1.4 }}>{p.description}</p>}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="ds-badge-gray" style={{ textTransform: 'capitalize' }}>{p.type}</span>
                  <button
                    className="ds-toggle"
                    style={{ width: 36, height: 20, background: p.is_active ? '#C9A84C' : 'rgba(255,255,255,0.1)' }}
                    onClick={() => toggleActive(p.id, p.is_active)}
                  >
                    <span className="ds-toggle-knob" style={{ width: 14, height: 14, left: p.is_active ? '19px' : '3px' }} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="ds-btn-outline" style={{ padding: '0.35rem 0.7rem', fontSize: '0.72rem' }} onClick={() => openEdit(p)}>Edit</button>
                  <button style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', padding: 4 }} onClick={() => deleteProduct(p.id)}>
                    <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

/* ─── Orders Tab ──────────────────────────────────────── */
interface AdminOrder { id: string; status: string; total_sar: number; created_at: string; user_name: string | null; items: string[]; }

const ORDER_STATUS_OPTIONS = ['pending', 'processing', 'completed', 'cancelled'] as const;
const orderStatusColor = (s: string) => s === 'completed' ? '#4ade80' : s === 'pending' ? '#facc15' : s === 'processing' ? '#60a5fa' : 'rgba(248,113,113,0.7)';

function OrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('id, status, total_sar, created_at, user_id, order_items(products(name))')
      .order('created_at', { ascending: false });
    if (!data) { setLoading(false); return; }
    const ids = [...new Set(data.map((o: { user_id: string }) => o.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', ids);
    const nameMap: Record<string, string> = {};
    (profiles ?? []).forEach((p: { id: string; full_name: string | null }) => { nameMap[p.id] = p.full_name ?? 'Unknown'; });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOrders(data.map((o: any) => ({
      id: o.id, status: o.status, total_sar: o.total_sar, created_at: o.created_at,
      user_name: nameMap[o.user_id] ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: (o.order_items ?? []).map((i: any) => {
        const p = i.products;
        return Array.isArray(p) ? p[0]?.name : p?.name ?? 'Item';
      }).filter(Boolean),
    })));
    setLoading(false);
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setUpdatingId(null);
  };

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch = !search || (o.user_name ?? '').toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total_sar ?? 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const processingCount = orders.filter(o => o.status === 'processing').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  const statCards = [
    { label: 'Total Orders', value: String(orders.length), color: 'rgba(201,168,76,0.15)', border: 'rgba(201,168,76,0.3)', icon: <svg style={{ width: 16, height: 16 }} fill="none" stroke="#C9A84C" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" /></svg> },
    { label: 'Pending', value: String(pendingCount), color: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.25)', icon: <svg style={{ width: 16, height: 16 }} fill="none" stroke="#facc15" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> },
    { label: 'Processing', value: String(processingCount), color: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)', icon: <svg style={{ width: 16, height: 16 }} fill="none" stroke="#60a5fa" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg> },
    { label: 'Completed', value: String(completedCount), color: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)', icon: <svg style={{ width: 16, height: 16 }} fill="none" stroke="#4ade80" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> },
    { label: 'Total Revenue', value: `AED ${totalRevenue.toLocaleString()}`, color: 'rgba(201,168,76,0.06)', border: 'rgba(201,168,76,0.2)', icon: <svg style={{ width: 16, height: 16 }} fill="none" stroke="#C9A84C" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div className="ds-gold-pill" style={{ marginBottom: '0.6rem' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', flexShrink: 0, display: 'inline-block' }} />
          Orders
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>Order Management</h2>
        <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.35)' }}>View and manage all marketplace orders and fulfillment status</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.9rem', marginBottom: '1.75rem' }}>
        {statCards.map(s => (
          <div key={s.label} className="ds-card" style={{ padding: '1rem 1.1rem', background: s.color, borderColor: s.border }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>{s.icon}<span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</span></div>
            <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
          <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
          <input
            className="ds-input"
            style={{ paddingLeft: '2.2rem', fontSize: '0.82rem' }}
            placeholder="Search by customer or order ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['all', ...ORDER_STATUS_OPTIONS] as string[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '0.38rem 0.85rem', fontSize: '0.72rem', fontWeight: 600, borderRadius: 8, cursor: 'pointer',
                textTransform: 'capitalize', letterSpacing: '0.04em',
                background: statusFilter === s ? (s === 'all' ? '#C9A84C' : `${orderStatusColor(s)}22`) : 'rgba(255,255,255,0.05)',
                color: statusFilter === s ? (s === 'all' ? '#0B0B0B' : orderStatusColor(s)) : 'rgba(255,255,255,0.45)',
                border: statusFilter === s ? `1px solid ${s === 'all' ? '#C9A84C' : orderStatusColor(s)}` : '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.15s',
              }}
            >{s === 'all' ? 'All Orders' : s}</button>
          ))}
        </div>
        <button className="ds-btn-outline" style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem', flexShrink: 0 }} onClick={loadOrders}>
          <svg style={{ width: 13, height: 13, marginRight: 4 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <SkOrderRows rows={6} />
      ) : filtered.length === 0 ? (
        <div className="ds-empty">
          <div className="ds-empty-icon">
            <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" /></svg>
          </div>
          <p>{orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}</p>
          <small>{orders.length === 0 ? 'Orders will appear here once customers place them.' : 'Try adjusting your search or status filter.'}</small>
        </div>
      ) : (
        <div className="ds-card ds-table-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{filtered.length} order{filtered.length !== 1 ? 's' : ''} {statusFilter !== 'all' ? `· ${statusFilter}` : ''}</span>
          </div>
          <table className="ds-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>#{o.id.slice(0, 8).toUpperCase()}</td>
                  <td style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{o.user_name ?? '—'}</td>
                  <td style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', maxWidth: 200 }}>
                    <span title={o.items.join(', ')}>{o.items.slice(0, 2).join(', ')}{o.items.length > 2 ? ` +${o.items.length - 2} more` : ''}</span>
                  </td>
                  <td style={{ color: '#C9A84C', fontWeight: 700, whiteSpace: 'nowrap' }}>AED {o.total_sar.toLocaleString()}</td>
                  <td>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.22rem 0.6rem', borderRadius: 6, background: `${orderStatusColor(o.status)}18`, color: orderStatusColor(o.status), border: `1px solid ${orderStatusColor(o.status)}33`, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <select
                      disabled={updatingId === o.id}
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, padding: '0.3rem 0.6rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', cursor: updatingId === o.id ? 'wait' : 'pointer', outline: 'none', opacity: updatingId === o.id ? 0.5 : 1 }}>
                      {ORDER_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Pricing Tab ─────────────────────────────────────── */
const BLANK_PLAN: Partial<PricingPlan> = {
  name: '', name_ar: '', description: '', description_ar: '', tagline: '', tagline_ar: '',
  cta_text: 'Get Started', cta_text_ar: '', features: [], features_ar: [],
  price_sar: 0, stripe_price_id: '', is_published: false, is_featured: false,
};

function PricingTab() {
  const { t } = useLanguage();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PricingPlan>>({});
  const [saving, setSaving] = useState(false);
  const [savingStep, setSavingStep] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [featuresText, setFeaturesText] = useState('');
  const [featuresArText, setFeaturesArText] = useState('');
  const originalPrice = useRef<number>(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pricing-plans');
      const json = await res.json();
      setPlans(json.plans ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (plan: PricingPlan) => {
    setEditId(plan.id);
    setFeaturesText((plan.features ?? []).join('\n'));
    setFeaturesArText((plan.features_ar ?? []).join('\n'));
    originalPrice.current = plan.price_sar;
    setEditForm({
      name: plan.name,
      name_ar: plan.name_ar ?? '',
      description: plan.description ?? '',
      description_ar: plan.description_ar ?? '',
      tagline: plan.tagline ?? '',
      tagline_ar: plan.tagline_ar ?? '',
      cta_text: plan.cta_text ?? 'Get Started',
      cta_text_ar: plan.cta_text_ar ?? '',
      price_sar: plan.price_sar,
      stripe_price_id: plan.stripe_price_id ?? '',
      features: plan.features ?? [],
      features_ar: plan.features_ar ?? [],
      is_published: plan.is_published,
      is_featured: plan.is_featured,
      sort_order: plan.sort_order,
    });
  };

  const startNew = () => {
    setEditId('new');
    setFeaturesText('');
    setFeaturesArText('');
    setEditForm({ ...BLANK_PLAN, sort_order: plans.length + 1 });
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    setSaveError(null);
    setSavingStep('');
    const isNew = editId === 'new';
    const priceChanged = !isNew && editForm.price_sar !== originalPrice.current;

    let stripe_price_id = editForm.stripe_price_id || null;

    // Auto-create on Stripe when: new plan, OR price changed on existing plan
    if (isNew || priceChanged) {
      try {
        setSavingStep(isNew ? 'Creating on Stripe...' : 'Updating Stripe price...');

        // If price changed and old price exists, archive the old one first
        if (priceChanged && stripe_price_id) {
          await fetch('/api/admin/stripe-sync', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stripe_price_id }),
          });
        }

        const stripeRes = await fetch('/api/admin/stripe-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editForm.name,
            price_sar: editForm.price_sar,
            description: editForm.description,
          }),
        });
        const stripeJson = await stripeRes.json();
        if (!stripeRes.ok) {
          setSaveError(`Stripe error: ${stripeJson.error}`);
          setSaving(false);
          setSavingStep('');
          return;
        }
        stripe_price_id = stripeJson.price_id;
      } catch (err) {
        setSaveError('Failed to sync with Stripe. Check your Stripe key.');
        setSaving(false);
        setSavingStep('');
        return;
      }
    }

    setSavingStep('Saving plan...');
    const features = featuresText.split('\n').map(s => s.trim()).filter(Boolean);
    const features_ar = featuresArText.split('\n').map(s => s.trim()).filter(Boolean);
    const payload = {
      name: editForm.name,
      name_ar: editForm.name_ar || null,
      description: editForm.description || null,
      description_ar: editForm.description_ar || null,
      tagline: editForm.tagline || null,
      tagline_ar: editForm.tagline_ar || null,
      cta_text: editForm.cta_text || 'Get Started',
      cta_text_ar: editForm.cta_text_ar || null,
      price_sar: editForm.price_sar ?? 0,
      stripe_price_id,
      features,
      features_ar: features_ar.length > 0 ? features_ar : null,
      is_published: editForm.is_published ?? false,
      is_featured: editForm.is_featured ?? false,
      sort_order: editForm.sort_order ?? plans.length + 1,
    };

    try {
      const res = await fetch('/api/admin/pricing-plans', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNew ? payload : { id: editId, ...payload }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveError(json.error ?? 'Save failed');
        return;
      }
      setEditId(null);
      window.location.href = window.location.pathname + '?tab=pricing';
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setSaving(false);
      setSavingStep('');
    }
  };

  const deletePlan = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will also archive it on Stripe and cannot be undone.`)) return;
    setDeleting(id);
    try {
      await fetch('/api/admin/pricing-plans', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } finally {
      setPlans(prev => prev.filter(p => p.id !== id));
      setDeleting(null);
    }
  };

  const togglePublish = async (plan: PricingPlan) => {
    const updated = !plan.is_published;
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_published: updated } : p));
    await fetch('/api/admin/pricing-plans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: plan.id, is_published: updated }),
    });
  };

  const planFormJsx = (
    <AdminModal open={!!editId} onClose={() => { setEditId(null); setSaveError(null); setSavingStep(''); }} title={editId === 'new' ? t('admin.newPlan') : t('admin.editPlan')} maxWidth={580}>
      <div>
      <div style={{ display: 'grid', gap: '0.85rem' }}>

        {/* Row 1: Name EN + Name AR */}
        <div className="admin-2col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label className="ds-label">Plan Name * (EN)</label>
            <input className="ds-input" placeholder="e.g. Full Coaching" value={editForm.name ?? ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="ds-label">Plan Name (AR) اختياري</label>
            <input className="ds-input" dir="rtl" placeholder="مثال: تدريب كامل" value={editForm.name_ar ?? ''} onChange={e => setEditForm(p => ({ ...p, name_ar: e.target.value }))} />
          </div>
        </div>

        {/* Row 1b: Tagline EN + Tagline AR */}
        <div className="admin-2col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label className="ds-label">Tagline (EN)</label>
            <input className="ds-input" placeholder="e.g. MOST POPULAR" value={editForm.tagline ?? ''} onChange={e => setEditForm(p => ({ ...p, tagline: e.target.value }))} />
          </div>
          <div>
            <label className="ds-label">Tagline (AR) اختياري</label>
            <input className="ds-input" dir="rtl" placeholder="مثال: الأكثر شعبية" value={editForm.tagline_ar ?? ''} onChange={e => setEditForm(p => ({ ...p, tagline_ar: e.target.value }))} />
          </div>
        </div>

        {/* Row 2: Description EN + AR */}
        <div className="admin-2col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label className="ds-label">Description (EN)</label>
            <input className="ds-input" placeholder="Short description shown on the card" value={editForm.description ?? ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="ds-label">Description (AR) اختياري</label>
            <input className="ds-input" dir="rtl" placeholder="وصف قصير على البطاقة" value={editForm.description_ar ?? ''} onChange={e => setEditForm(p => ({ ...p, description_ar: e.target.value }))} />
          </div>
        </div>

        {/* Row 2b: CTA EN + AR */}
        <div className="admin-2col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label className="ds-label">Button Text (EN)</label>
            <input className="ds-input" placeholder="Get Started" value={editForm.cta_text ?? ''} onChange={e => setEditForm(p => ({ ...p, cta_text: e.target.value }))} />
          </div>
          <div>
            <label className="ds-label">Button Text (AR) اختياري</label>
            <input className="ds-input" dir="rtl" placeholder="ابدأ الآن" value={editForm.cta_text_ar ?? ''} onChange={e => setEditForm(p => ({ ...p, cta_text_ar: e.target.value }))} />
          </div>
        </div>

        {/* Row 3: Price */}
        <div className="admin-2col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
          <div>
            <label className="ds-label">Price (AED/mo) *</label>
            <input className="ds-input" type="number" min="0" placeholder="349" value={editForm.price_sar ?? ''} onChange={e => setEditForm(p => ({ ...p, price_sar: Number(e.target.value) }))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
            <div style={{ padding: '0.55rem 0.85rem', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 10, width: '100%' }}>
              <p style={{ fontSize: '0.6rem', color: 'rgba(201,168,76,0.45)', marginBottom: 3, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Stripe Price ID</p>
              <p style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: editForm.stripe_price_id ? 'rgba(201,168,76,0.8)' : 'rgba(255,255,255,0.25)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {editForm.stripe_price_id || (editId === 'new' ? 'Auto-generated on save' : 'Will be updated on save')}
              </p>
            </div>
          </div>
        </div>

        {/* Stripe auto-sync note */}
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)', marginTop: -4, lineHeight: 1.5 }}>
          ✦ Stripe product &amp; price are created automatically when you save. If you change the price, a new Stripe price is created and the old one archived.
        </p>

        {/* Features EN + AR */}
        <div className="admin-2col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label className="ds-label">Features EN (one per line)</label>
            <textarea
              className="ds-input"
              value={featuresText}
              onChange={e => setFeaturesText(e.target.value)}
              placeholder="Custom meal plan&#10;Weekly check-ins&#10;Real-time messaging"
              style={{ minHeight: 110, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <label className="ds-label">Features AR اختياري (سطر لكل ميزة)</label>
            <textarea
              className="ds-input"
              dir="rtl"
              value={featuresArText}
              onChange={e => setFeaturesArText(e.target.value)}
              placeholder="خطة وجبات مخصصة&#10;متابعة أسبوعية&#10;تواصل مباشر"
              style={{ minHeight: 110, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              className="ds-toggle"
              style={{ background: editForm.is_published ? '#C9A84C' : 'rgba(255,255,255,0.1)' }}
              onClick={() => setEditForm(p => ({ ...p, is_published: !p.is_published }))}
            >
              <span className="ds-toggle-knob" style={{ left: editForm.is_published ? '23px' : '3px' }} />
            </button>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Published</p>
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>Visible on site</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              className="ds-toggle"
              style={{ background: editForm.is_featured ? '#C9A84C' : 'rgba(255,255,255,0.1)' }}
              onClick={() => setEditForm(p => ({ ...p, is_featured: !p.is_featured }))}
            >
              <span className="ds-toggle-knob" style={{ left: editForm.is_featured ? '23px' : '3px' }} />
            </button>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Featured</p>
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)'}}>&ldquo;Most Popular&rdquo; badge</p>
            </div>
          </div>
        </div>
      </div>

      {saveError && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, fontSize: '0.78rem', color: 'rgba(248,113,113,0.9)' }}>
          Error: {saveError}
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="ds-btn-gold" style={{ flex: 1 }} disabled={saving || !editForm.name || !editForm.price_sar} onClick={saveEdit}>
          {saving ? (savingStep || t('admin.saving')) : editId === 'new' ? t('admin.addPlan') : t('admin.save')}
        </button>
        <button className="ds-btn-outline" disabled={saving} onClick={() => { setEditId(null); setSaveError(null); setSavingStep(''); }}>{t('admin.cancel')}</button>
      </div>
      </div>
    </AdminModal>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <p className="ds-section-title">{t('admin.pricingTitle')}</p>
          <p className="ds-section-sub">{t('admin.pricingSubtitle')}</p>
        </div>
        {!editId && (
          <button className="ds-btn-gold" onClick={startNew}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t('admin.addPlan')}
          </button>
        )}
      </div>

      {planFormJsx}

      {loading ? (
        <SkPricingPlans />
      ) : plans.length === 0 ? (
        <div className="ds-empty">
          <div className="ds-empty-icon">
            <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /></svg>
          </div>
          <p>No pricing plans yet</p>
          <small>Click &ldquo;Add Plan&rdquo; to create your first plan, then publish it.</small>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
          {plans.map(plan => (
            <div
              key={plan.id}
              className={plan.is_published ? 'ds-card-gold' : 'ds-card'}
              style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', opacity: plan.is_published ? 1 : 0.7 }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                <div>
                  {plan.tagline && (
                    <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', marginBottom: '0.25rem' }}>
                      {plan.tagline}
                    </p>
                  )}
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{plan.name}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                  <span className={plan.is_published ? 'ds-badge-green' : 'ds-badge-gray'}>{plan.is_published ? 'published' : 'draft'}</span>
                  {plan.is_featured && <span className="ds-badge-green" style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', borderColor: 'rgba(201,168,76,0.25)' }}>featured</span>}
                </div>
              </div>

              {/* Description */}
              {plan.description && (
                <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.38)', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                  {plan.description}
                </p>
              )}

              {/* Price */}
              <div style={{ marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#C9A84C' }}>{plan.price_sar}</span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>AED/mo</span>
              </div>

              {/* Stripe Price ID */}
              <div style={{ marginBottom: '0.85rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 }}>
                <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)', marginBottom: 2 }}>STRIPE PRICE ID</p>
                <p style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: plan.stripe_price_id ? 'rgba(201,168,76,0.7)' : 'rgba(255,100,100,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {plan.stripe_price_id || '⚠ Not set — checkout will fail'}
                </p>
              </div>

              {/* Features */}
              <ul style={{ flex: 1, marginBottom: '1.25rem', paddingLeft: 0, listStyle: 'none', display: 'grid', gap: '0.3rem' }}>
                {(plan.features ?? []).slice(0, 4).map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.77rem', color: 'rgba(255,255,255,0.5)' }}>
                    <span style={{ color: '#C9A84C', flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
                {(plan.features ?? []).length > 4 && (
                  <li style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>+{(plan.features ?? []).length - 4} more</li>
                )}
              </ul>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button
                  className={plan.is_published ? 'ds-btn-outline' : 'ds-btn-gold'}
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.74rem' }}
                  onClick={() => togglePublish(plan)}
                >
                  {plan.is_published ? t('admin.unpublish') : t('admin.publish')}
                </button>
                <button className="ds-btn-outline" style={{ padding: '0 0.75rem' }} onClick={() => startEdit(plan)} title="Edit">
                  <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
                </button>
                <button
                  style={{ background: 'none', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, color: 'rgba(248,113,113,0.55)', cursor: 'pointer', padding: '0 0.65rem' }}
                  disabled={deleting === plan.id}
                  onClick={() => deletePlan(plan.id, plan.name)}
                  title="Delete"
                >
                  <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Chat Threads Tab ────────────────────────────────── */
interface ChatThread {
  id: string;
  client_id: string;
  coach_id: string;
  created_at: string;
  client_name: string | null;
  coach_name: string | null;
  last_message?: string | null;
  last_message_at?: string | null;
  message_count?: number;
}

type ChatMsg = { id: string; sender_id: string; content: string; created_at: string };

function initials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function ChatThreadsTab() {
  const { t } = useLanguage();
  const [threads, setThreads]         = useState<ChatThread[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState<string | null>(null);
  const [selected, setSelected]       = useState<ChatThread | null>(null);
  const [messages, setMessages]       = useState<ChatMsg[]>([]);
  const [profileNames, setProfileNames] = useState<Record<string, string>>({});
  const [msgLoading, setMsgLoading]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef     = useRef<ReturnType<typeof supabase.channel> | null>(null);

  /* ── Load all threads with last-message preview ── */
  const loadThreads = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data: rawThreads, error } = await supabase
        .from('message_threads')
        .select('id, client_id, coach_id, created_at')
        .order('created_at', { ascending: false });

      if (error) { setLoadError(error.message); setLoading(false); return; }
      if (!rawThreads || rawThreads.length === 0) { setThreads([]); setLoading(false); return; }

      // Fetch profile names
      const allIds = [...new Set([
        ...rawThreads.map(r => r.client_id),
        ...rawThreads.map(r => r.coach_id),
      ])];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', allIds);
      const nameMap: Record<string, string> = {};
      (profiles ?? []).forEach(p => { nameMap[p.id] = p.full_name ?? 'Unknown'; });

      // Fetch last message + count for each thread in parallel
      const threadDetails = await Promise.all(
        rawThreads.map(async r => {
          const { data: lastMsgs, count } = await supabase
            .from('messages')
            .select('content, created_at', { count: 'exact' })
            .eq('thread_id', r.id)
            .order('created_at', { ascending: false })
            .limit(1);
          const last = lastMsgs?.[0] ?? null;
          return {
            id: r.id,
            client_id: r.client_id,
            coach_id: r.coach_id,
            created_at: r.created_at,
            client_name: nameMap[r.client_id] ?? null,
            coach_name:  nameMap[r.coach_id]  ?? null,
            last_message:    last?.content    ?? null,
            last_message_at: last?.created_at ?? null,
            message_count: count ?? 0,
          };
        })
      );

      // Sort by most recent message activity
      threadDetails.sort((a, b) => {
        const at = a.last_message_at ?? a.created_at;
        const bt = b.last_message_at ?? b.created_at;
        return new Date(bt).getTime() - new Date(at).getTime();
      });

      setThreads(threadDetails);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unknown error');
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  /* ── Open a thread — load messages + subscribe realtime ── */
  const openThread = async (thread: ChatThread) => {
    // Cleanup previous channel
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setSelected(thread);
    setMsgLoading(true);
    setMessages([]);

    const { data: msgs } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true });

    const msgList = (msgs ?? []) as ChatMsg[];
    setMessages(msgList);

    // Build profile name map
    const ids = [...new Set([thread.client_id, thread.coach_id, ...msgList.map(m => m.sender_id)])];
    const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', ids);
    const map: Record<string, string> = {};
    (profs ?? []).forEach(p => { map[p.id] = p.full_name ?? 'Unknown'; });
    setProfileNames(map);
    setMsgLoading(false);

    // Subscribe realtime — admin reads live
    channelRef.current = supabase
      .channel(`admin-thread-${thread.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${thread.id}` },
        (payload) => {
          const incoming = payload.new as ChatMsg;
          setMessages(prev => {
            if (prev.find(m => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
          // If sender not in name map, fetch their name
          setProfileNames(prev => {
            if (prev[incoming.sender_id]) return prev;
            supabase.from('profiles').select('id, full_name').eq('id', incoming.sender_id).single()
              .then(({ data }) => {
                if (data) setProfileNames(p => ({ ...p, [data.id]: data.full_name ?? 'Unknown' }));
              });
            return prev;
          });
        }
      )
      .subscribe();
  };

  /* ── Back to thread list ── */
  const backToList = useCallback(async () => {
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setSelected(null);
    setMessages([]);
    setProfileNames({});
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { if (channelRef.current) supabase.removeChannel(channelRef.current); }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Thread detail view ── */
  if (selected) {
    const clientInitials = initials(selected.client_name);
    const coachInitials  = initials(selected.coach_name);

    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button className="ds-btn-outline" style={{ flexShrink: 0 }} onClick={backToList}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            All Threads
          </button>
          {/* Live badge */}
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 20, padding: '0.2rem 0.65rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', animation: 'pulse 1.5s ease infinite' }} />
            LIVE
          </span>
          {/* Read-only badge */}
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '0.2rem 0.65rem' }}>
            Read-only · Admin view
          </span>
        </div>

        {/* Thread info card */}
        <div className="ds-card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Client avatar */}
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
            {clientInitials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
              {selected.client_name ?? 'Client'} <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400, margin: '0 0.35rem' }}>↔</span> {selected.coach_name ?? 'Coach'}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
              {messages.length} message{messages.length !== 1 ? 's' : ''} · Started {new Date(selected.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          {/* Coach avatar */}
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#C9A84C', flexShrink: 0 }}>
            {coachInitials}
          </div>
        </div>

        {/* Messages */}
        <div className="ds-card" style={{ padding: '1.25rem', height: 460, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {msgLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.3)' }}>Loading messages…</p>
            </div>
          )}
          {!msgLoading && messages.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <div style={{ textAlign: 'center' }}>
                <svg style={{ width: 32, height: 32, color: 'rgba(255,255,255,0.1)', margin: '0 auto 0.75rem' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.25)' }}>No messages yet in this thread.</p>
              </div>
            </div>
          )}
          {messages.map((msg, idx) => {
            const isClient = msg.sender_id === selected.client_id;
            const isCoach  = msg.sender_id === selected.coach_id;
            const name     = profileNames[msg.sender_id] ?? (isClient ? 'Client' : isCoach ? 'Coach' : 'Unknown');
            const prevMsg  = messages[idx - 1];
            const showDate = !prevMsg || new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: '0.2rem 0.75rem' }}>
                      {new Date(msg.created_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: isClient ? 'flex-start' : 'flex-end' }}>
                  <div style={{ maxWidth: '72%' }}>
                    <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', marginBottom: 3, textAlign: isClient ? 'left' : 'right' }}>
                      {name}
                      {isClient && (
                        <span style={{ marginLeft: 6, fontSize: '0.58rem', color: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '0 4px' }}>Client</span>
                      )}
                      {isCoach && (
                        <span style={{ marginLeft: 6, fontSize: '0.58rem', color: 'rgba(201,168,76,0.5)', background: 'rgba(201,168,76,0.06)', borderRadius: 4, padding: '0 4px' }}>Coach</span>
                      )}
                    </p>
                    <div style={{
                      padding: '0.65rem 1rem',
                      borderRadius: isClient ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                      background: isClient ? 'rgba(255,255,255,0.05)' : 'rgba(201,168,76,0.1)',
                      border: isClient ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(201,168,76,0.2)',
                      fontSize: '0.84rem',
                      color: 'rgba(255,255,255,0.82)',
                      lineHeight: 1.55,
                    }}>
                      {msg.content}
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: 5, textAlign: 'right' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Read-only notice */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
          <svg style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)' }}>
            You are viewing this conversation as an admin. New messages appear automatically in real time.
          </p>
        </div>

        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }

  /* ── Thread list view ── */
  const filteredThreads = threads.filter(th => {
    const q = searchQuery.toLowerCase();
    return !q || (th.client_name ?? '').toLowerCase().includes(q) || (th.coach_name ?? '').toLowerCase().includes(q);
  });

  return (
    <div>
      {/* Page header */}
      <div className="admin-tab-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="ds-section-title">{t('admin.chatTitle')}</p>
          <p className="ds-section-sub">{t('admin.chatSubtitle')}</p>
        </div>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            className="ds-input admin-search-input"
            style={{ width: 220, paddingLeft: 30 }}
            placeholder="Search by name…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <SkAnalytics />
      ) : loadError ? (
        <div className="ds-empty">
          <div className="ds-empty-icon" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <svg style={{ width: 22, height: 22, color: '#ef4444' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <p style={{ color: '#ef4444', fontWeight: 600 }}>Failed to load threads</p>
          <small style={{ color: 'rgba(255,255,255,0.35)', wordBreak: 'break-all', maxWidth: 400, textAlign: 'center' }}>{loadError}</small>
          <button className="ds-btn-outline" style={{ marginTop: '1rem', fontSize: '0.75rem' }} onClick={loadThreads}>Retry</button>
        </div>
      ) : threads.length === 0 ? (
        <div className="ds-empty">
          <div className="ds-empty-icon">
            <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <p>{t('admin.noConversations')}</p>
          <small>{t('admin.noConversationsSub')}</small>
        </div>
      ) : filteredThreads.length === 0 ? (
        <div className="ds-empty">
          <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.3)' }}>No threads match "{searchQuery}"</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredThreads.map(thread => {
            const ci = initials(thread.client_name);
            const ti = initials(thread.coach_name);
            return (
              <div
                key={thread.id}
                onClick={() => openThread(thread)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14,
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.045)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.2)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
                }}
              >
                {/* Stacked avatars */}
                <div style={{ position: 'relative', width: 44, height: 38, flexShrink: 0 }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(14,14,14,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{ci}</div>
                  <div style={{ position: 'absolute', left: 14, top: 6, width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '1.5px solid rgba(14,14,14,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#C9A84C' }}>{ti}</div>
                </div>

                {/* Names + last message */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.84rem', fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: 3 }}>
                    {thread.client_name ?? 'Unknown Client'}
                    <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 0.4rem', fontWeight: 400 }}>↔</span>
                    {thread.coach_name ?? 'Unknown Coach'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {thread.last_message ?? 'No messages yet'}
                  </p>
                </div>

                {/* Right side: time + count */}
                <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                  {thread.last_message_at && (
                    <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)' }}>
                      {relativeTime(thread.last_message_at)}
                    </p>
                  )}
                  {(thread.message_count ?? 0) > 0 && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: '0.15rem 0.55rem' }}>
                      {thread.message_count} msg{(thread.message_count ?? 0) !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Chevron */}
                <svg style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.15)', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Videos Tab (Cloudinary) ─────────────────────────── */
interface WorkoutVideo {
  id: string;
  title: string;
  cloudinary_url: string;
  public_id: string;
  thumbnail_url: string | null;
  bytes: number | null;
  duration: number | null;
  created_at: string;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

function getThumbUrl(public_id: string) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_400,h_225,c_fill,so_2/${public_id}.jpg`;
}

function VideosTab() {
  const { t } = useLanguage();
  const [videos, setVideos] = useState<WorkoutVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/list-videos');
      const json = await res.json();
      setVideos(json.videos ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadVideos(); }, [loadVideos]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    // Simulate progress since fetch doesn't support real progress events
    setUploadProgress(5);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + Math.floor(Math.random() * 8) + 3;
      });
    }, 600);

    let json: Record<string, unknown> | null = null;
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
        { method: 'POST', body: formData }
      );
      clearInterval(interval);
      if (!res.ok) throw new Error('Cloudinary upload failed');
      setUploadProgress(100);
      json = await res.json() as Record<string, unknown>;
    } catch {
      clearInterval(interval);
    } finally {
      // Always reset UI — never leave the user stuck
      setUploading(false);
      setUploadProgress(0);
      if (fileRef.current) fileRef.current.value = '';
    }

    // Save metadata to DB via server API (bypasses RLS) and refresh list
    if (json?.secure_url) {
      const saveRes = await fetch('/api/admin/upload-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          cloudinary_url: json.secure_url,
          public_id: json.public_id,
          thumbnail_url: getThumbUrl(json.public_id as string),
          bytes: json.bytes ?? null,
          duration: json.duration ?? null,
        }),
      });
      if (!saveRes.ok) {
        const errJson = await saveRes.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Video uploaded to Cloudinary but failed to save to database: ${errJson.error}`);
      } else {
        await loadVideos();
      }
    }
  };

  const deleteVideo = async (id: string, public_id: string) => {
    try {
      const res = await fetch('/api/admin/delete-video', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, public_id }),
      });
      // on failure, video stays in list (will re-appear after next load)
    } catch {
      // silent
    } finally {
      setVideos(prev => prev.filter(v => v.id !== id));
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (sec: number | null) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <p className="ds-section-title">{t('admin.videosTitle')}</p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleUpload} />
            <button className="ds-btn-gold" disabled={uploading} onClick={() => fileRef.current?.click()}>
              <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              {uploading ? (uploadProgress < 100 ? `${t('admin.uploading')} ${uploadProgress}%` : t('admin.processing')) : t('admin.uploadVideo')}
            </button>
          </div>
        </div>
        {uploading && (
          <div style={{ marginTop: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.35rem' }}>
              <span>{uploadProgress < 100 ? t('admin.uploadingVideo') : t('admin.processingCloudinary')}</span>
              <span>{uploadProgress < 100 ? `${uploadProgress}%` : ''}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: uploadProgress < 100 ? `${uploadProgress}%` : '100%',
                background: uploadProgress < 100 ? 'linear-gradient(90deg, #C9A84C, #e8c96b)' : 'linear-gradient(90deg, #C9A84C, #e8c96b, #C9A84C)',
                backgroundSize: uploadProgress < 100 ? 'auto' : '200% 100%',
                animation: uploadProgress >= 100 ? 'shimmer 1.2s infinite linear' : 'none',
                borderRadius: 999,
                transition: 'width 0.2s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <SkVideos />
      ) : videos.length === 0 ? (
        <div className="ds-empty">
          <div className="ds-empty-icon">
            <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <p>No videos uploaded yet</p>
          <small>Upload workout demonstration videos to use in client plans.</small>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
          {videos.map(v => (
            <div key={v.id} className="ds-card" style={{ padding: '1.25rem' }}>
              {/* Cloudinary auto-generated thumbnail */}
              <div style={{ position: 'relative', marginBottom: '0.9rem' }}>
                {v.thumbnail_url ? (
                  <img
                    src={v.thumbnail_url}
                    alt={v.title}
                    style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: 140, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: 28, height: 28, color: 'rgba(255,255,255,0.2)' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                    </svg>
                  </div>
                )}
                {v.duration && (
                  <span style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.72)', color: 'white', fontSize: '0.62rem', fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}>
                    {formatDuration(v.duration)}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {v.title}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', marginBottom: '0.9rem' }}>
                {formatSize(v.bytes)}{v.created_at ? ` · ${new Date(v.created_at).toLocaleDateString()}` : ''}
              </p>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  className="ds-btn-outline"
                  style={{ flex: 1, justifyContent: 'center', padding: '0.45rem 0.75rem', fontSize: '0.73rem' }}
                  onClick={() => copyUrl(v.cloudinary_url, v.id)}
                >
                  {copied === v.id ? 'Copied!' : 'Copy URL'}
                </button>
                <a
                  href={v.cloudinary_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.65rem', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
                  title="Preview video"
                >
                  <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </a>
                <button
                  style={{ background: 'none', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, color: 'rgba(248,113,113,0.55)', cursor: 'pointer', padding: '0 0.65rem' }}
                  onClick={() => deleteVideo(v.id, v.public_id)}
                  title="Remove from list"
                >
                  <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Analytics Tab ───────────────────────────────────── */
function AnalyticsTab({ users, subscriptions }: { users: AdminUser[]; subscriptions: AdminSubscription[] }) {
  const { t } = useLanguage();
  const clients = users.filter(u => u.role === 'client');
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled');
  const onboarded = clients.filter(u => u.onboarding_completed);
  const totalRevenue = activeSubs.reduce((sum, s) => sum + (s.price_sar ?? 0), 0);

  // Build last-6-months chart data
  const getLast6Months = () => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      result.push({
        month: d.toLocaleDateString('en', { month: 'short' }),
        prefix: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      });
    }
    return result;
  };
  const months = getLast6Months();
  const signupData = months.map(m => ({
    month: m.month,
    signups: clients.filter(u => u.created_at.startsWith(m.prefix)).length,
  }));
  const revenueData = months.map(m => ({
    month: m.month,
    revenue: subscriptions
      .filter(s => s.started_at?.startsWith(m.prefix))
      .reduce((sum, s) => sum + (s.price_sar ?? 0), 0),
  }));

  const metrics = [
    { label: t('admin.totalRegistered'), value: String(clients.length), sub: t('admin.allTimeSignups') },
    { label: t('admin.activeSubscribers'), value: String(activeSubs.length), sub: t('admin.currentlyPaying') },
    { label: t('admin.churned'), value: String(cancelledSubs.length), sub: t('admin.cancelledSubscriptions') },
    { label: t('admin.onboardingRate'), value: clients.length ? `${Math.round((onboarded.length / clients.length) * 100)}%` : '—', sub: t('admin.completedQuestionnaire') },
    { label: t('admin.monthlyRevenue'), value: `AED ${totalRevenue.toLocaleString()}`, sub: t('admin.fromActivePlans') },
    { label: t('admin.avgRevenueUser'), value: clients.length ? `AED ${Math.round(totalRevenue / clients.length)}` : '—', sub: t('admin.perRegisteredClient') },
  ];

  const tooltipStyle = { background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, fontSize: 12, color: '#fff' };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <p className="ds-section-title">{t('admin.analyticsTitle')}</p>
        <p className="ds-section-sub">{t('admin.analyticsSub')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {metrics.map(m => (
          <div key={m.label} className="ds-stat">
            <div className="ds-stat-value">{m.value}</div>
            <div className="ds-stat-label">{m.label}</div>
            <div className="ds-stat-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="ds-card" style={{ padding: '1.75rem' }}>
          <p className="ds-section-title" style={{ marginBottom: '0.25rem' }}>{t('admin.newMembers')}</p>
          <p className="ds-section-sub" style={{ marginBottom: '1.25rem' }}>{t('admin.last6Months')}</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={signupData}>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="signups" stroke="#C9A84C" fill="url(#signupGrad)" strokeWidth={2} dot={{ r: 3, fill: '#C9A84C' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="ds-card" style={{ padding: '1.75rem' }}>
          <p className="ds-section-title" style={{ marginBottom: '0.25rem' }}>{t('admin.revenueSAR')}</p>
          <p className="ds-section-sub" style={{ marginBottom: '1.25rem' }}>{t('admin.last6Months')}</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData}>
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} width={38} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ds-card" style={{ padding: '1.75rem' }}>
        <p className="ds-section-title" style={{ marginBottom: '0.5rem' }}>{t('admin.subscriptionBreakdown')}</p>
        <p className="ds-section-sub" style={{ marginBottom: '1.5rem' }}>{t('admin.statusDistribution')}</p>
        {['active', 'cancelled', 'expired', 'past_due'].map(status => {
          const count = subscriptions.filter(s => s.status === status).length;
          const pct = subscriptions.length ? (count / subscriptions.length) * 100 : 0;
          const statusLabel: Record<string, string> = {
            active: t('admin.filterActive'),
            cancelled: t('admin.statusCancelled'),
            expired: t('admin.statusExpired'),
            past_due: t('admin.statusPastDue'),
          };
          return (
            <div key={status} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{statusLabel[status] ?? status}</span>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)' }}>{count}</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: status === 'active' ? '#C9A84C' : 'rgba(255,255,255,0.15)', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Content CMS Tab ────────────────────────────────── */
interface ContentBlock { id: string; key: string; value_en: string; value_ar: string | null; section: string; }

/* Inline field pair shown inside a visual section card */
interface CmsFieldProps {
  label: string; fieldKey: string; isTitle?: boolean;
  drafts: Record<string, { en: string; ar: string }>;
  saving: string | null; saved: string | null;
  onUpdate: (key: string, lang: 'en' | 'ar', v: string) => void;
  onSave: (key: string) => void;
}
function CmsField({ label, fieldKey, isTitle, drafts, saving, saved, onUpdate, onSave }: CmsFieldProps) {
  const en = drafts[fieldKey]?.en ?? '';
  const ar = drafts[fieldKey]?.ar ?? '';
  const isDone = saved === fieldKey;
  const isSaving = saving === fieldKey;
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '0.75rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
        <button onClick={() => onSave(fieldKey)} style={{ padding: '0.18rem 0.55rem', borderRadius: 5, fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer', border: '1px solid', borderColor: isDone ? '#4CAF50' : 'rgba(201,168,76,0.35)', background: isDone ? 'rgba(76,175,80,0.1)' : 'rgba(201,168,76,0.06)', color: isDone ? '#4CAF50' : '#C9A84C' }}>
          {isSaving ? '…' : isDone ? '✓ Saved' : 'Save'}
        </button>
      </div>
      <div className="admin-2col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
        <div>
          <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.22)', fontWeight: 600, marginBottom: '0.18rem' }}>🌐 EN</div>
          <textarea className="ds-input" style={{ minHeight: isTitle ? 38 : 34, resize: 'vertical', fontSize: '0.76rem', padding: '0.3rem 0.5rem', fontWeight: isTitle ? 700 : 400 }}
            value={en} onChange={e => onUpdate(fieldKey, 'en', e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.22)', fontWeight: 600, marginBottom: '0.18rem' }}>🇸🇦 AR</div>
          <textarea className="ds-input" dir="rtl" style={{ minHeight: isTitle ? 38 : 34, resize: 'vertical', fontSize: '0.76rem', padding: '0.3rem 0.5rem', fontWeight: isTitle ? 700 : 400 }}
            value={ar} onChange={e => onUpdate(fieldKey, 'ar', e.target.value)} />
        </div>
      </div>
    </div>
  );
}

const CMS_SECTION_LIST = [
  { id: 'hero',            label: 'Hero / Banner',     keys: ['hero.badge','hero.headline1','hero.headline2','hero.subtext','hero.cta','hero.secondary','hero.trust'] },
  { id: 'programs',        label: 'Programs',           keys: ['home.programs.title','home.programs.titleHighlight','home.programs.subtitle','home.programs.viewAll','home.programs.viewAllSub'] },
  { id: 'howitworks',      label: 'How It Works',       keys: ['hiw.badge','hiw.title','hiw.titleHighlight','hiw.subtitle','hiw.step1.title','hiw.step1.desc','hiw.step2.title','hiw.step2.desc','hiw.step3.title','hiw.step3.desc','hiw.step4.title','hiw.step4.desc'] },
  { id: 'transformations', label: 'Transformations',    keys: ['trans.badge','trans.title','trans.titleHighlight','trans.subtitle','trans.disclaimer','trans.more','trans.viewAll'] },
  { id: 'pricing',         label: 'Pricing',            keys: ['pricing.badge','pricing.title','pricing.titleHighlight','pricing.subtitle','pricing.popular','pricing.perMonth','pricing.plan1.cta','pricing.footer1','pricing.footer2','pricing.consultation'] },
  { id: 'testimonials',    label: 'Testimonials',       keys: ['testimonials.badge','testimonials.title','testimonials.titleHighlight','testimonials.subtitle','testimonials.m1.quote','testimonials.m2.quote','testimonials.m3.quote','testimonials.m4.quote'] },
  { id: 'cta',             label: 'CTA Banner',         keys: ['cta.title','cta.subtitle','cta.btn','cta.secondary','cta.point1','cta.point2','cta.point3','cta.point4'] },
  { id: 'footer',          label: 'Footer',             keys: ['footer.tagline','footer.allRightsReserved','footer.quickLinks','footer.ourPrograms'] },
];

/* Default EN values shown in sidebar when no DB row exists yet */
const CMS_DEFAULTS: Record<string, { en: string; ar: string }> = {
  'hero.badge':              { en: 'AthloCode Performance System', ar: 'نظام أثلو كود للأداء' },
  'hero.headline1':          { en: 'This is not fitness.', ar: 'هذا ليس مجرد لياقة.' },
  'hero.headline2':          { en: 'Performance Engineering.', ar: 'هندسة الأداء.' },
  'hero.subtext':            { en: 'Precision training. Built for elite results. A private system designed for high-performance individuals in the UAE.', ar: 'تدريب دقيق. مصمم لنتائج النخبة. نظام خاص للأفراد عالي الأداء في الإمارات.' },
  'hero.cta':                { en: 'Apply for Access', ar: 'قدّم طلبك للوصول' },
  'hero.secondary':          { en: 'See The System', ar: 'اكتشف النظام' },
  'hiw.badge':               { en: 'The System', ar: 'النظام' },
  'hiw.title':               { en: 'How The', ar: 'كيف يعمل' },
  'hiw.titleHighlight':      { en: 'System Works', ar: 'النظام' },
  'hiw.subtitle':            { en: 'Four precise steps. No randomness. No guesswork. A controlled system engineered for measurable elite results.', ar: 'أربع خطوات دقيقة. لا عشوائية. لا تخمين. نظام محكوم مصمم لنتائج قابلة للقياس.' },
  'hiw.step1.title':         { en: 'Apply for Access', ar: 'قدّم طلبك للوصول' },
  'hiw.step1.desc':          { en: 'Submit your application. We review your profile, goals, and lifestyle to determine if AthloCode is the right fit.', ar: 'أرسل طلبك. نراجع ملفك وأهدافك ونمط حياتك لتحديد مدى الملاءمة.' },
  'hiw.step2.title':         { en: 'Receive Your System', ar: 'استلم نظامك' },
  'hiw.step2.desc':          { en: 'Get your fully personalized nutrition and training system — engineered precisely for your body and goals.', ar: 'احصل على نظامك الغذائي والتدريبي المخصص — مصمم بدقة لجسمك وأهدافك.' },
  'hiw.step3.title':         { en: 'Execute Daily', ar: 'نفّذ يومياً' },
  'hiw.step3.desc':          { en: 'Follow your daily plan with precision. Every meal, every session — structured, clear, and optimized for results.', ar: 'اتّبع خطتك اليومية بدقة. كل وجبة وكل جلسة — منظمة وواضحة ومحسّنة.' },
  'hiw.step4.title':         { en: 'Weekly Optimization', ar: 'تحسين أسبوعي' },
  'hiw.step4.desc':          { en: 'Your coach reviews your data every week and refines your system. Continuous improvement, not static plans.', ar: 'يراجع مدربك بياناتك أسبوعياً ويحسّن نظامك. تحسين مستمر لا خطط ثابتة.' },
  'home.programs.title':          { en: 'Choose Your', ar: 'اختر' },
  'home.programs.titleHighlight': { en: 'Training Path', ar: 'مسار تدريبك' },
  'home.programs.subtitle':       { en: 'Every program is precision-engineered for your specific goal.', ar: 'كل برنامج مصمم بدقة لهدفك المحدد.' },
  'home.programs.viewAll':        { en: 'View All Programs', ar: 'عرض جميع البرامج' },
  'home.programs.viewAllSub':     { en: 'Custom programs available upon consultation.', ar: 'برامج مخصصة متاحة عند الاستشارة.' },
  'trans.badge':                  { en: 'Real Results', ar: 'نتائج حقيقية' },
  'trans.title':                  { en: 'Real', ar: 'تحولات' },
  'trans.titleHighlight':         { en: 'Transformations', ar: 'حقيقية' },
  'trans.subtitle':               { en: 'Privacy-protected client results from real members who committed to the process.', ar: 'نتائج أعضاء حقيقيين محمية بالخصوصية.' },
  'trans.disclaimer':             { en: 'Results shown are from real clients. Individual results may vary.', ar: 'النتائج من عملاء حقيقيين. قد تختلف النتائج الفردية.' },
  'trans.more':                   { en: 'See More Results', ar: 'شاهد المزيد' },
  'trans.viewAll':                { en: 'View All Transformations', ar: 'عرض جميع التحولات' },
  'pricing.badge':                { en: 'Membership', ar: 'العضوية' },
  'pricing.title':                { en: 'Choose Your', ar: 'اختر' },
  'pricing.titleHighlight':       { en: 'Membership', ar: 'عضويتك' },
  'pricing.subtitle':             { en: 'Transparent pricing. No hidden fees. Cancel anytime.', ar: 'أسعار شفافة. لا رسوم خفية. إلغاء في أي وقت.' },
  'pricing.popular':              { en: 'Most Popular', ar: 'الأكثر شعبية' },
  'pricing.perMonth':             { en: '/mo', ar: '/شهر' },
  'pricing.plan1.cta':            { en: 'Get Started', ar: 'ابدأ الآن' },
  'pricing.footer1':              { en: 'All prices in AED. Includes 1-month free consultation session.', ar: 'جميع الأسعار بالدرهم الإماراتي. تشمل جلسة استشارة مجانية لمدة شهر.' },
  'pricing.footer2':              { en: 'No long-term contracts required.', ar: 'لا عقود طويلة الأمد مطلوبة.' },
  'pricing.consultation':         { en: 'Start with a free consultation', ar: 'ابدأ باستشارة مجانية' },
  'testimonials.badge':           { en: 'Member Stories', ar: 'قصص الأعضاء' },
  'testimonials.title':           { en: 'What Our', ar: 'ما يقوله' },
  'testimonials.titleHighlight':  { en: 'Members Say', ar: 'أعضاؤنا' },
  'testimonials.subtitle':        { en: 'Real feedback from members who committed to the process and came out the other side transformed.', ar: 'تقييمات حقيقية من أعضاء التزموا بالمسار وخرجوا متحولين.' },
  'testimonials.m1.quote':        { en: 'This program changed everything. I lost 15kg in 12 weeks and gained confidence I never had.', ar: 'غيّر هذا البرنامج كل شيء. خسرت 15 كيلو في 12 أسبوعًا.' },
  'testimonials.m2.quote':        { en: 'The meal plans are exactly what I needed. Detailed, practical, and actually enjoyable to follow.', ar: 'خطط الوجبات كانت ما احتجته تمامًا. مفصّلة وعملية وممتعة.' },
  'testimonials.m3.quote':        { en: "Best investment I've made in my health. The coaches are responsive and genuinely care.", ar: 'أفضل استثمار قدمته في صحتي. المدربون متجاوبون ومهتمون حقاً.' },
  'testimonials.m4.quote':        { en: 'I achieved my summer body goal ahead of schedule. The tracking system kept me accountable.', ar: 'حققت هدف جسم الصيف قبل الموعد. نظام التتبع حافظ على التزامي.' },
  'cta.title':               { en: 'Apply for Access.', ar: 'قدّم طلبك للوصول.' },
  'cta.subtitle':            { en: 'AthloCode accepts a limited number of members per cycle. If you are serious about elite results, submit your application today.', ar: 'يقبل أثلو كود عدداً محدوداً من الأعضاء في كل دورة. إذا كنت جاداً في تحقيق نتائج النخبة، قدّم طلبك اليوم.' },
  'cta.btn':                 { en: 'Apply for Access', ar: 'قدّم طلبك للوصول' },
  'cta.secondary':           { en: 'Join the Waitlist', ar: 'انضم لقائمة الانتظار' },
  'cta.point1':              { en: 'Limited onboarding slots', ar: 'أماكن محدودة للانضمام' },
  'cta.point2':              { en: 'Application-based access only', ar: 'وصول قائم على الطلب فقط' },
  'cta.point3':              { en: 'Private system for selected members', ar: 'نظام خاص للأعضاء المختارين' },
  'cta.point4':              { en: 'Built for UAE high-performers', ar: 'مصمم لأصحاب الأداء العالي في الإمارات' },
  'footer.tagline':          { en: 'Premium fitness coaching with personalized meal plans. Transform your body, elevate your life.', ar: 'تدريب لياقة بدنية متميز مع خطط وجبات مخصصة. حوّل جسمك وارتقِ بحياتك.' },
  'footer.allRightsReserved':{ en: 'All rights reserved.', ar: 'جميع الحقوق محفوظة.' },
};

const DEVICE_WIDTHS = { desktop: '100%', tablet: '768px', mobile: '390px' };

function ContentTab() {
  const [blocks,  setBlocks]  = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState<string | null>(null);
  const [saved,   setSaved]   = useState<string | null>(null);
  const [drafts,  setDrafts]  = useState<Record<string, { en: string; ar: string }>>({});
  const [activeSection, setActiveSection] = useState('hero');
  const [device, setDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [publishing, setPublishing] = useState(false);
  const [pubDone,    setPubDone]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('content_blocks').select('*').order('section').order('key');
      setBlocks(data ?? []);
      // Start with defaults so fields show content even before first publish
      const d: Record<string, { en: string; ar: string }> = { ...CMS_DEFAULTS };
      (data ?? []).forEach(b => { d[b.key] = { en: b.value_en, ar: b.value_ar ?? '' }; });
      setDrafts(d);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const ev  = (key: string) => drafts[key]?.en ?? '';
  const av  = (key: string) => drafts[key]?.ar ?? '';
  const upd = (key: string, lang: 'en'|'ar', v: string) =>
    setDrafts(prev => ({ ...prev, [key]: { ...prev[key], [lang]: v } }));

  const saveBlock = async (key: string) => {
    setSaving(key);
    const d = drafts[key];
    const block = blocks.find(b => b.key === key);
    // Determine section from CMS_SECTION_LIST
    const section = CMS_SECTION_LIST.find(s => s.keys.includes(key))?.id ?? key.split('.')[0];
    const payload: Record<string, unknown> = {
      key,
      section,
      value_en: d?.en ?? block?.value_en ?? '',
      value_ar: d?.ar || null,
      updated_at: new Date().toISOString(),
    };
    if (block?.id) payload.id = block.id;
    const { data: upserted } = await supabase.from('content_blocks').upsert(payload, { onConflict: 'key' }).select('id, key, section, value_en, value_ar').single();
    if (upserted && !block) {
      setBlocks(prev => [...prev, upserted as ContentBlock]);
    }
    setSaving(null); setSaved(key); setTimeout(() => setSaved(null), 2000);
  };

  const publishSection = async () => {
    const sec = CMS_SECTION_LIST.find(s => s.id === activeSection);
    if (!sec) return;
    setPublishing(true);
    for (const k of sec.keys) await saveBlock(k);
    setPublishing(false); setPubDone(true); setTimeout(() => setPubDone(false), 2500);
  };

  const restoreDefaults = () => {
    const sec = CMS_SECTION_LIST.find(s => s.id === activeSection);
    if (!sec) return;
    const reset: Record<string, { en: string; ar: string }> = { ...drafts };
    sec.keys.forEach(k => {
      const orig = blocks.find(b => b.key === k);
      if (orig) reset[k] = { en: orig.value_en, ar: orig.value_ar ?? '' };
    });
    setDrafts(reset);
  };

  /* ── Sidebar field row — called as a function, NOT rendered as <SField/>
       to prevent React from treating it as a new component type on each render
       which would unmount/remount the inputs and lose focus after every keystroke ── */
  const renderField = (label: string, fkey: string) => {
    const isDone = saved === fkey; const isSav = saving === fkey;
    return (
      <div key={fkey} style={{ marginBottom: '1.1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
          <button onClick={() => saveBlock(fkey)} style={{ fontSize: '0.58rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: 4, cursor: 'pointer', border: '1px solid', borderColor: isDone ? '#4CAF50' : 'rgba(201,168,76,0.3)', background: isDone ? 'rgba(76,175,80,0.1)' : 'transparent', color: isDone ? '#4CAF50' : '#C9A84C' }}>
            {isSav ? '…' : isDone ? '✓' : 'Save'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.58rem', fontWeight: 700, background: '#C9A84C', color: '#0B0B0B', borderRadius: 3, padding: '0.1rem 0.3rem', flexShrink: 0 }}>EN</span>
          <input style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '0.4rem 0.6rem', fontSize: '0.78rem', color: '#fff', outline: 'none' }}
            value={ev(fkey)} onChange={e => upd(fkey, 'en', e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ fontSize: '0.58rem', fontWeight: 700, background: 'rgba(76,130,255,0.7)', color: '#fff', borderRadius: 3, padding: '0.1rem 0.3rem', flexShrink: 0 }}>AR</span>
          <input dir="rtl" style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '0.4rem 0.6rem', fontSize: '0.78rem', color: '#fff', outline: 'none' }}
            value={av(fkey)} onChange={e => upd(fkey, 'ar', e.target.value)} />
        </div>
      </div>
    );
  };

  /* ── Scroll to active section when dropdown changes ── */
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = previewRef.current?.querySelector(`[data-section="${activeSection}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeSection]);

  /* ── Full homepage preview — all sections stacked ── */
  const renderPreview = () => {
    const e = ev;
    const highlight = (id: string) => ({
      outline: activeSection === id ? '2px solid rgba(201,168,76,0.5)' : 'none',
      outlineOffset: '-2px',
      cursor: 'pointer',
      transition: 'outline 0.2s',
    } as React.CSSProperties);
    return (
      <div style={{ background: '#0B0B0B', minHeight: '100%' }} onClick={e => {
        const sec = (e.target as HTMLElement).closest('[data-section]');
        if (sec) setActiveSection(sec.getAttribute('data-section') ?? activeSection);
      }}>

        {/* ── Navbar (exact replica of live Navbar component) ── */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,168,76,0.15)', boxShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2.5rem', display: 'flex', alignItems: 'center', height: 76, gap: '2rem' }}>
            {/* Logo — actual AthloCode logo */}
            <div style={{ flexShrink: 0 }}>
              <img
                src="https://res.cloudinary.com/dqiuwzvfb/image/upload/v1775629677/69007823-DC7E-42E1-AF8E-E57E11810549-Photoroom_nluyul.png"
                alt="AthloCode Logo"
                style={{ height: 56, width: 'auto', objectFit: 'contain', display: 'block' }}
              />
            </div>
            {/* Nav links — all 7 links centered */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.6rem' }}>
              {['Programs','How It Works','Transformations','Marketplace','Pricing','About','Contact'].map(n => (
                <span key={n} style={{ color: 'rgba(255,255,255,0.68)', fontSize: '0.8rem', fontWeight: 400, letterSpacing: '0.01em', cursor: 'default' }}>{n}</span>
              ))}
            </div>
            {/* Right side: EN | AR toggle + Dashboard button */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {/* Language toggle — pill with pipe divider */}
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, padding: '0.3rem 0.85rem', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>EN</span>
                <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)', display: 'block' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>AR</span>
              </div>
              {/* Dashboard button — outlined gold with user icon */}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid rgba(201,168,76,0.5)', color: '#C9A84C', padding: '0.42rem 1.1rem', borderRadius: 999, fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.02em', cursor: 'default', whiteSpace: 'nowrap' }}>
                <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* ── Hero (with real video background) ── */}
        <div data-section="hero" style={{ ...highlight('hero'), position: 'relative', minHeight: 620, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '7rem 3rem 6rem', overflow: 'hidden', background: '#0A0A0A' }}>
          {/* Real video background */}
          <video autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.38) saturate(0.7)', pointerEvents: 'none' }}>
            <source src="https://res.cloudinary.com/dqiuwzvfb/video/upload/q_auto/f_auto/v1775464474/Video_Project_1_njin8k.mp4" type="video/mp4" />
          </video>
          {/* Cinematic overlays */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,rgba(20,16,4,0.55) 0%,rgba(0,0,0,0.82) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,0.45) 0%,transparent 28%,transparent 62%,rgba(0,0,0,0.95) 100%)', pointerEvents: 'none' }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: 999, padding: '0.4rem 1.1rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', flexShrink: 0 }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.28em', textTransform: 'uppercase' }}>{e('hero.badge') || 'AthloCode Performance System'}</span>
            </div>

            {/* Headlines */}
            <div style={{ lineHeight: 1.0 }}>
              <div style={{ fontSize: 'clamp(2.2rem,5vw,4.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.0, textTransform: 'uppercase' }}>{e('hero.headline1') || 'This Is Fitness.'}</div>
              <div style={{ fontSize: 'clamp(2.2rem,5vw,4.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.0, textTransform: 'uppercase', background: 'linear-gradient(135deg,#C9A84C 0%,#F0D878 45%,#C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{e('hero.headline2') || 'Performance Engineering.'}</div>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 280, justifyContent: 'center' }}>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.45))' }} />
              <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.35em', color: 'rgba(201,168,76,0.45)', textTransform: 'uppercase' }}>AthloCode</span>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg,rgba(201,168,76,0.45),transparent)' }} />
            </div>

            {/* Subtext */}
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.42)', maxWidth: 500, fontWeight: 300, letterSpacing: '0.03em', lineHeight: 1.75 }}>{e('hero.subtext') || 'Precision training. Built for elite results. A private system designed for high-performance individuals in the UAE.'}</p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#C9A84C,#E5C76B)', color: '#0A0A0A', padding: '0.9rem 2.25rem', borderRadius: 12, fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', boxShadow: '0 8px 32px rgba(201,168,76,0.3)' }}>
                {e('hero.cta') || 'Apply for Access'}
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.9rem 1.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.55)', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{e('hero.secondary') || 'See The System'}</span>
            </div>
          </div>
          {activeSection === 'hero' && <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: '#C9A84C', color: '#0B0B0B', fontSize: '0.55rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 4, letterSpacing: '0.06em' }}>EDITING</div>}
        </div>

        {/* ── Programs (with real images) ── */}
        <div data-section="programs" style={{ ...highlight('programs'), position: 'relative', background: '#0A0A0A', padding: '5rem 2.5rem', overflow: 'hidden' }}>
          {/* Gold atmosphere orb */}
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 60%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 999, padding: '0.35rem 1rem', marginBottom: '1.25rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C' }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#C9A84C', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Programs</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,3rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
              Choose Your{' '}
              <span style={{ background: 'linear-gradient(135deg,#C9A84C 0%,#E8C76A 50%,#C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Training Path</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>Every program is precision-engineered for your specific goal.</p>
          </div>

          {/* Row 1 — 3 vertical cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '1.25rem', position: 'relative', zIndex: 2 }}>
            {[
              { label: 'Muscle Building', img: 'https://res.cloudinary.com/dqiuwzvfb/image/upload/v1774869469/ChatGPT_Image_Mar_30_2026_04_47_36_PM_l244wh.png' },
              { label: 'Fat Loss',        img: 'https://res.cloudinary.com/dqiuwzvfb/image/upload/v1774870969/ChatGPT_Image_Mar_30_2026_05_12_21_PM_jufpsc.png' },
              { label: 'Summer Body',     img: 'https://res.cloudinary.com/dqiuwzvfb/image/upload/v1774871156/ChatGPT_Image_Mar_30_2026_05_15_20_PM_dmlvkg.png' },
            ].map((p,i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', height: 280 }}>
                <img src={p.img} alt={p.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.0) 35%,rgba(0,0,0,0.7) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem 1.5rem' }}>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>{p.label}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#C9A84C', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                    Get Started
                    <svg style={{ width: 11, height: 11 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2 — 2 horizontal cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.25rem', position: 'relative', zIndex: 2 }}>
            {[
              { label: 'Workout Plan Only', desc: 'Full day-by-day structured workout plan tailored to your goals.', img: 'https://res.cloudinary.com/dqiuwzvfb/image/upload/v1774871223/ChatGPT_Image_Mar_30_2026_05_16_44_PM_qz2cet.png' },
              { label: 'Meal Plan Only',    desc: 'Custom nutrition plan with meals, macros, and timing guidance.', img: 'https://res.cloudinary.com/dqiuwzvfb/image/upload/v1774871297/ChatGPT_Image_Mar_30_2026_05_17_57_PM_gnjys3.png' },
            ].map((p,i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', display: 'flex', height: 180 }}>
                <div style={{ position: 'relative', width: '40%', flexShrink: 0 }}>
                  <img src={p.img} alt={p.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '40%', width: 60, background: 'linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(15,15,15,0.95) 100%)', pointerEvents: 'none' }} />
                <div style={{ flex: 1, padding: '1.5rem 1.5rem 1.5rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.45rem' }}>{p.label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.72rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>{p.desc}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#C9A84C', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                    Get Started
                    <svg style={{ width: 11, height: 11 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {activeSection === 'programs' && <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: '#C9A84C', color: '#0B0B0B', fontSize: '0.55rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 4, letterSpacing: '0.06em' }}>EDITING</div>}
        </div>

        {/* ── How It Works ── */}
        <div data-section="howitworks" style={{ ...highlight('howitworks'), background: '#0B0B0B', padding: '5rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
          {/* Atmosphere orbs */}
          <div style={{ position: 'absolute', top: '30%', right: '8%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 60%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '60%', left: '5%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.04) 0%,transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 999, padding: '0.35rem 1rem', marginBottom: '1.25rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C' }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#C9A84C', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{e('hiw.badge') || 'The System'}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,3rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '1rem' }}>
              {e('hiw.title') || 'How The'}{' '}
              <span style={{ background: 'linear-gradient(135deg,#C9A84C 0%,#E8C76A 50%,#C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{e('hiw.titleHighlight') || 'System Works'}</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>{e('hiw.subtitle') || 'Four precise steps from application to transformation.'}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', position: 'relative', zIndex: 2 }}>
            {[
              { n: 1, icon: <svg style={{ width: 18, height: 18, color: '#C9A84C' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg> },
              { n: 2, icon: <svg style={{ width: 18, height: 18, color: '#C9A84C' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg> },
              { n: 3, icon: <svg style={{ width: 18, height: 18, color: '#C9A84C' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg> },
              { n: 4, icon: <svg style={{ width: 18, height: 18, color: '#C9A84C' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m4.992 0c-.317-.059-.634-.123-.951-.19m4.992.189c.317-.059.634-.123.951-.19M19.5 12a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" /></svg> },
            ].map(({ n, icon }) => (
              <div key={n} style={{ position: 'relative', background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(24px) saturate(160%)', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 20, padding: '2rem 1.5rem', overflow: 'hidden' }}>
                {/* Ghost number */}
                <div style={{ position: 'absolute', top: -8, right: -6, fontSize: '6rem', fontWeight: 900, lineHeight: 1, color: 'transparent', WebkitTextStroke: '1px rgba(201,168,76,0.07)', pointerEvents: 'none', userSelect: 'none' }}>0{n}</div>
                {/* Icon box */}
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>{icon}</div>
                <p style={{ fontSize: '0.58rem', fontWeight: 700, color: 'rgba(201,168,76,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Step 0{n}</p>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.6rem', lineHeight: 1.3 }}>{e(`hiw.step${n}.title`) || ['Apply & Consult','Get Your Plan','Start Training','Track & Improve'][n-1]}</p>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.72rem', lineHeight: 1.65 }}>{e(`hiw.step${n}.desc`) || ''}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Transformations (with real background image) ── */}
        <div data-section="transformations" style={{ ...highlight('transformations'), position: 'relative', background: '#0A0A0A', padding: '5.5rem 2.5rem', overflow: 'hidden' }}>
          {/* Real background photo */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://res.cloudinary.com/dqiuwzvfb/image/upload/v1774889959/pexels-dogu-tuncer-339534179-17210043_ogbko1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.28) saturate(0.6) blur(1px)', transform: 'scale(1.03)' }} />
          {/* Overlays */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.45) 55%,rgba(0,0,0,0.7) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,0.6) 0%,transparent 20%,transparent 80%,rgba(0,0,0,0.75) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 55% 50%,rgba(201,168,76,0.04) 0%,transparent 55%)', pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 999, padding: '0.35rem 1rem', marginBottom: '1.25rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C' }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#C9A84C', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{e('trans.badge') || 'Real Results'}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,3rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
              {e('trans.title') || 'Real'}{' '}
              <span style={{ background: 'linear-gradient(135deg,#C9A84C 0%,#E8C76A 50%,#C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{e('trans.titleHighlight') || 'Transformations'}</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>{e('trans.subtitle') || 'Privacy-protected client results from real members.'}</p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '3rem', position: 'relative', zIndex: 2 }}>
            {[
              { label: '500+', desc: 'Members Transformed' },
              { label: '95%',  desc: 'Goal Achievement Rate' },
              { label: '12+',  desc: 'Program Variants' },
              { label: '50K+', desc: 'Community Members' },
            ].map((s,i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.25rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#C9A84C', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>{s.label}</p>
                <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Transformation cards (3 with stagger) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', position: 'relative', zIndex: 2 }}>
            {[
              { metric: '15 kg', label: 'Fat Lost', duration: '12 Weeks', program: 'Fat Loss Program', change: 'From 92kg → 77kg — full body recomposition' },
              { metric: '12 kg', label: 'Muscle Gained', duration: '16 Weeks', program: 'Muscle Building', change: 'Increased lean mass and strength significantly' },
              { metric: '100%', label: 'Goal Achieved', duration: '20 Weeks', program: 'Summer Body', change: 'Complete physique transformation for summer' },
            ].map((t,i) => (
              <div key={i} style={{ position: 'relative', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.09)', borderTop: '2px solid rgba(201,168,76,0.25)', borderRadius: 20, padding: '1.75rem 1.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', marginTop: i === 1 ? 36 : i === 2 ? 18 : 0 }}>
                {/* Privacy badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '0.2rem 0.6rem', marginBottom: '1.25rem' }}>
                  <svg style={{ width: 9, height: 9, color: 'rgba(255,255,255,0.35)' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                  <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Privacy Protected</span>
                </div>
                {/* Metric */}
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '2.8rem', fontWeight: 900, color: '#C9A84C', letterSpacing: '-0.03em', lineHeight: 1 }}>{t.metric}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t.label}</p>
                </div>
                {/* Divider */}
                <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(201,168,76,0.25),transparent)', marginBottom: '1rem' }} />
                {/* Details */}
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.65, marginBottom: '0.85rem' }}>{t.change}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '0.2rem 0.6rem' }}>{t.program}</span>
                  <span style={{ fontSize: '0.6rem', color: 'rgba(201,168,76,0.55)', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 999, padding: '0.2rem 0.6rem' }}>{t.duration}</span>
                </div>
              </div>
            ))}
          </div>
          {activeSection === 'transformations' && <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: '#C9A84C', color: '#0B0B0B', fontSize: '0.55rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 4, letterSpacing: '0.06em' }}>EDITING</div>}
        </div>

        {/* ── Pricing ── */}
        <div data-section="pricing" style={{ ...highlight('pricing'), position: 'relative', background: '#0B0B0B', padding: '5.5rem 2.5rem', overflow: 'hidden' }}>
          {/* Atmosphere */}
          <div style={{ position: 'absolute', left: '50%', top: '60%', transform: 'translate(-50%,-50%)', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,rgba(0,0,0,0) 0%,rgba(0,0,0,0.55) 100%)', pointerEvents: 'none' }} />
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 999, padding: '0.35rem 1rem', marginBottom: '1.25rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C' }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#C9A84C', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{e('pricing.badge') || 'Membership'}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,3rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
              {e('pricing.title') || 'Choose Your'}{' '}
              <span style={{ background: 'linear-gradient(135deg,#C9A84C 0%,#E8C76A 50%,#C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{e('pricing.titleHighlight') || 'Membership'}</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>{e('pricing.subtitle') || 'Transparent pricing. No hidden fees. Cancel anytime.'}</p>
          </div>
          {/* 3 plan cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', position: 'relative', zIndex: 2, alignItems: 'start' }}>
            {[
              { name: 'Meal Plan', tagline: 'Nutrition Only', price: 299, featured: false, features: ['Custom weekly meal plan','Macro breakdown','Dietary restrictions support','Monthly update','WhatsApp support'] },
              { name: 'Full Coaching', tagline: 'Most Popular', price: 799, featured: true, features: ['Everything in Meal Plan','Full workout program','Weekly check-ins','Progress tracking','Priority coach access','InBody analysis review'] },
              { name: 'Workout Plan', tagline: 'Training Only', price: 399, featured: false, features: ['Day-by-day workout plan','Exercise library access','Sets, reps & rest times','Monthly program update','WhatsApp support'] },
            ].map((plan, i) => (
              <div key={i} style={{ position: 'relative', background: plan.featured ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)', backdropFilter: `blur(${plan.featured ? 24 : 20}px)`, border: `1px solid ${plan.featured ? 'rgba(201,168,76,0.22)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 20, padding: '2rem 1.75rem', boxShadow: plan.featured ? '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.08)' : '0 4px 24px rgba(0,0,0,0.35)', transform: plan.featured ? 'scale(1.04)' : 'scale(1)', marginTop: plan.featured ? 0 : 14 }}>
                {/* Popular badge */}
                {plan.featured && (
                  <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#C9A84C,#E5C76B)', color: '#0A0A0A', fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.3rem 1rem', borderRadius: 999, whiteSpace: 'nowrap' }}>
                    ⭐ {e('pricing.popular') || 'Most Popular'}
                  </div>
                )}
                {/* Inner glow */}
                {plan.featured && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg,rgba(201,168,76,0.04) 0%,transparent 50%)', borderRadius: 20, pointerEvents: 'none' }} />}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{ fontSize: '0.62rem', fontWeight: 600, color: 'rgba(201,168,76,0.55)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{plan.tagline}</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>{plan.name}</p>
                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: '1.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>AED</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{plan.price}</span>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>/mo</span>
                  </div>
                  {/* Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.75rem' }}>
                    {plan.features.map((f, fi) => (
                      <div key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <svg style={{ width: 13, height: 13, color: '#C9A84C', flexShrink: 0, marginTop: 2 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" /></svg>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  {/* CTA */}
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.85rem', borderRadius: 10, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', ...(plan.featured ? { background: 'linear-gradient(135deg,#C9A84C,#E5C76B)', color: '#0A0A0A', boxShadow: '0 6px 24px rgba(201,168,76,0.25)' } : { background: 'transparent', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.35)' }) }}>
                    {e('pricing.plan1.cta') || 'Get Started'}
                    <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.68rem', marginTop: '2.5rem', position: 'relative', zIndex: 2 }}>{e('pricing.footer1') || 'All prices in AED. Includes 1-month free consultation session.'}</p>
          {activeSection === 'pricing' && <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: '#C9A84C', color: '#0B0B0B', fontSize: '0.55rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 4, letterSpacing: '0.06em' }}>EDITING</div>}
        </div>

        {/* ── Testimonials (with real video background) ── */}
        <div data-section="testimonials" style={{ ...highlight('testimonials'), position: 'relative', background: '#080808', padding: '5.5rem 2.5rem', overflow: 'hidden' }}>
          {/* Real background video */}
          <video autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45) saturate(0.6)', pointerEvents: 'none' }}>
            <source src="https://res.cloudinary.com/dqiuwzvfb/video/upload/v1774890621/Video_Project_d73r7c.mp4" type="video/mp4" />
          </video>
          {/* Cinematic overlays */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.18) 28%,rgba(0,0,0,0.18) 72%,rgba(0,0,0,0.78) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 55% 50%,rgba(201,168,76,0.05) 0%,transparent 55%)', pointerEvents: 'none' }} />
          {/* Grain */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: '200px 200px', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 999, padding: '0.35rem 1rem', marginBottom: '1.25rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C' }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#C9A84C', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{e('testimonials.badge') || 'Member Stories'}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,3rem)', fontWeight: 700, color: '#fff', marginBottom: '0.6rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {e('testimonials.title') || 'What Our'}{' '}
              <span style={{ background: 'linear-gradient(135deg,#C9A84C 0%,#E8C76A 50%,#C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{e('testimonials.titleHighlight') || 'Members Say'}</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>{e('testimonials.subtitle') || 'Real feedback from members who committed to the process.'}</p>
          </div>

          {/* 2-column card grid */}
          <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.1rem' }}>
            {[
              { n: '01', quote: `"${e('testimonials.m1.quote') || 'This program changed everything. I lost 15kg in 12 weeks and gained confidence I never had.'}"`, name: 'Member 01', role: 'Fat Loss Program', duration: '12 weeks' },
              { n: '02', quote: `"${e('testimonials.m2.quote') || 'The meal plans are exactly what I needed. Detailed, practical, and actually enjoyable to follow.'}"`, name: 'Member 02', role: 'Muscle Building',  duration: '16 weeks' },
              { n: '03', quote: `"${e('testimonials.m3.quote') || 'Best investment I\'ve made in my health. The coaches are responsive and genuinely care.'}"`, name: 'Member 03', role: 'Summer Body',    duration: '12 weeks' },
              { n: '04', quote: `"${e('testimonials.m4.quote') || 'I achieved my summer body goal ahead of schedule. The tracking system kept me accountable.'}"`, name: 'Member 04', role: 'Full Coaching',  duration: '20 weeks' },
            ].map((t,i) => (
              <div key={i} style={{ position: 'relative', background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2.25rem 1.75rem 1.75rem', boxShadow: '0 8px 36px rgba(0,0,0,0.5)' }}>
                {/* Number badge */}
                <div style={{ position: 'absolute', top: -18, left: 22, width: 36, height: 36, borderRadius: '50%', background: 'rgba(10,10,10,0.85)', border: '1px solid rgba(201,168,76,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#C9A84C', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>{t.n}</div>
                {/* Stars */}
                <div style={{ display: 'flex', gap: 3, marginBottom: '1rem' }}>
                  {[...Array(5)].map((_,s) => <span key={s} style={{ color: 'rgba(201,168,76,0.65)', fontSize: '0.72rem' }}>★</span>)}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.82rem', fontStyle: 'italic', lineHeight: 1.75, marginBottom: '1.5rem' }}>{t.quote}</p>
                {/* Divider */}
                <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(201,168,76,0.2),transparent)', marginBottom: '1rem' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#C9A84C', fontWeight: 700 }}>M</div>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 600 }}>{t.name}</p>
                      <p style={{ color: 'rgba(201,168,76,0.55)', fontSize: '0.65rem' }}>{t.role}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 999, padding: '0.25rem 0.6rem' }}>{t.duration}</span>
                </div>
              </div>
            ))}
          </div>
          {activeSection === 'testimonials' && <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: '#C9A84C', color: '#0B0B0B', fontSize: '0.55rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 4, letterSpacing: '0.06em' }}>EDITING</div>}
        </div>

        {/* ── CTA ── */}
        <div data-section="cta" style={{ ...highlight('cta'), position: 'relative', background: '#0B0B0B', padding: '6rem 3rem', overflow: 'hidden' }}>
          {/* Glows */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%,rgba(201,168,76,0.09) 0%,transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '20%', left: '15%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 180, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.35),transparent)' }} />
          {/* Glass card */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 720, margin: '0 auto', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '3rem 3.5rem', textAlign: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 48px rgba(0,0,0,0.5)' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 999, padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C' }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#C9A84C', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{e('cta.btn') || 'Apply for Access'}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{e('cta.title') || 'Apply for Access.'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.88rem', lineHeight: 1.9, marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>{e('cta.subtitle') || 'AthloCode accepts a limited number of members per cycle.'}</p>
            {/* Points */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem 2rem', marginBottom: '2rem' }}>
              {[1,2,3,4].map(n => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg style={{ width: 13, height: 13, color: '#C9A84C', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" /></svg>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{e(`cta.point${n}`) || `Point ${n}`}</span>
                </div>
              ))}
            </div>
            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#C9A84C,#E5C76B)', color: '#0A0A0A', padding: '1rem 2.25rem', borderRadius: 10, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', boxShadow: '0 8px 28px rgba(201,168,76,0.2)' }}>
                {e('cta.btn') || 'Apply for Access'}
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1rem 1.75rem', borderRadius: 10, border: '1px solid rgba(201,168,76,0.25)', color: 'rgba(201,168,76,0.7)', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{e('cta.secondary') || 'Join the Waitlist'}</span>
            </div>
          </div>
          {activeSection === 'cta' && <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: '#C9A84C', color: '#0B0B0B', fontSize: '0.55rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 4, letterSpacing: '0.06em' }}>EDITING</div>}
        </div>

        {/* ── Footer (exact replica of live Footer component) ── */}
        <div data-section="footer" style={{ ...highlight('footer'), position: 'relative', background: '#0B0B0B', overflow: 'hidden' }}>
          {/* Gold hairline */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 320, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.35),transparent)', pointerEvents: 'none' }} />
          {/* Radial glow */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(201,168,76,0.05) 0%,transparent 55%)', pointerEvents: 'none' }} />
          {/* Grain overlay */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.02, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: '200px 200px', pointerEvents: 'none' }} />

          {/* Glass panel */}
          <div style={{ position: 'relative', zIndex: 10, margin: '2.5rem 1.5rem', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 48px rgba(0,0,0,0.45)', borderRadius: 24, padding: '2.5rem 2.5rem 1.75rem' }}>

            {/* 4-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '0' }}>
              {/* Brand column */}
              <div>
                <img
                  src="https://res.cloudinary.com/dqiuwzvfb/image/upload/v1775629677/69007823-DC7E-42E1-AF8E-E57E11810549-Photoroom_nluyul.png"
                  alt="AthloCode Logo"
                  style={{ height: 64, width: 'auto', objectFit: 'contain', display: 'block', marginBottom: '1rem' }}
                />
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.77rem', lineHeight: 1.7, maxWidth: 220, marginBottom: '1.25rem' }}>
                  {e('footer.tagline') || 'Premium fitness coaching with personalized meal plans, workouts, and real results.'}
                </p>
                {/* Socials */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    <svg key="ig" style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>,
                    <svg key="x" style={{ width: 14, height: 14 }} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                    <svg key="wa" style={{ width: 15, height: 15 }} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.854L.057 23.535a.5.5 0 0 0 .608.608l5.765-1.506A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.799 9.799 0 0 1-5.003-1.373l-.357-.214-3.713.97.997-3.624-.234-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>,
                  ].map((icon, idx) => (
                    <div key={idx} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)' }}>{icon}</div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: '1.4rem' }}>Quick Links</p>
                {['Programs','How It Works','Transformations','About','Contact'].map(l => (
                  <p key={l} style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{l}</p>
                ))}
              </div>

              {/* Programs */}
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: '1.4rem' }}>Our Programs</p>
                {['Muscle Building','Fat Loss','Summer Body','Workout Plan','Meal Plan'].map(l => (
                  <p key={l} style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{l}</p>
                ))}
              </div>

              {/* Get in Touch */}
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: '1.4rem' }}>Get in Touch</p>
                {['Email Us','WhatsApp','Message Us','Free Consultation'].map(l => (
                  <p key={l} style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{l}</p>
                ))}
                {/* CTA */}
                <div style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.65rem 1.4rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.38)', background: 'transparent', borderRadius: 8 }}>
                  <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0m.75 0a.375.375 0 0 0-.75 0m.75 0H8.25m4.125 0a.375.375 0 1 1-.75 0m.75 0a.375.375 0 0 0-.75 0m.75 0H12m4.125 0a.375.375 0 1 1-.75 0m.75 0a.375.375 0 0 0-.75 0m.75 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
                  Free Consultation
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07) 30%,rgba(255,255,255,0.07) 70%,transparent)', margin: '2rem 0' }} />

            {/* Bottom bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.72rem' }}>
                © {new Date().getFullYear()} OMR+. All rights reserved.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {['Privacy Policy','Terms of Service'].map(l => (
                  <span key={l} style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.68rem' }}>{l}</span>
                ))}
              </div>
              {/* Language toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '0.2rem' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.45rem', borderRadius: 5, background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}>EN</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.45rem', color: 'rgba(255,255,255,0.3)' }}>AR</span>
              </div>
            </div>
          </div>
          {activeSection === 'footer' && <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 20, background: '#C9A84C', color: '#0B0B0B', fontSize: '0.55rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 4, letterSpacing: '0.06em' }}>EDITING</div>}
        </div>

      </div>
    );
  };

  const currentSec = CMS_SECTION_LIST.find(s => s.id === activeSection)!;

  if (loading) return <SkCMS />;

  return (
    /* Break out of dashboard padding to fill full width */
    <div className="cms-root" style={{ margin: '-1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', background: '#0d0d0d', overflow: 'hidden' }}>

      {/* ── Top bar ── */}
      <div className="cms-topbar" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', height: 46, background: '#141414', borderBottom: '1px solid rgba(255,255,255,0.08)', gap: '0.75rem', flexShrink: 0, zIndex: 10 }}>
        {/* Eye icon */}
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', cursor: 'pointer' }}>👁</div>

        {/* Section dropdown */}
        <select value={activeSection} onChange={e => setActiveSection(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: '0.78rem', fontWeight: 600, padding: '0.3rem 0.6rem', cursor: 'pointer', outline: 'none', minWidth: 160 }}>
          {CMS_SECTION_LIST.map(s => <option key={s.id} value={s.id} style={{ background: '#1a1a1a' }}>{s.label}</option>)}
        </select>

        {/* Device toggles — centered */}
        <div className="cms-topbar-devices" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
          {(['desktop','tablet','mobile'] as const).map(d => (
            <button key={d} onClick={() => setDevice(d)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', border: '1px solid', letterSpacing: '0.05em', borderColor: device === d ? '#C9A84C' : 'rgba(255,255,255,0.1)', background: device === d ? 'rgba(201,168,76,0.12)' : 'transparent', color: device === d ? '#C9A84C' : 'rgba(255,255,255,0.35)' }}>
              <span>{d === 'desktop' ? '🖥' : d === 'tablet' ? '📱' : '📲'}</span>
              {d.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Actions */}
        <button className="cms-topbar-restore" onClick={restoreDefaults}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
          ↺ RESTORE DEFAULT
        </button>
        <button onClick={publishSection} disabled={publishing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 1rem', borderRadius: 6, fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', border: 'none', background: pubDone ? '#4CAF50' : '#C9A84C', color: '#0B0B0B', letterSpacing: '0.05em' }}>
          {publishing ? '…' : pubDone ? '✓ PUBLISHED' : '✓ PUBLISH CHANGES'}
        </button>
      </div>

      {/* ── Main area: preview + sidebar ── */}
      <div className="cms-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Preview area */}
        <div className="cms-preview-area" style={{ flex: 1, overflowY: 'scroll', overflowX: 'hidden', background: '#1a1a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: device === 'desktop' ? '0' : '1.5rem 1rem' }}>
          <div ref={previewRef} style={{ width: DEVICE_WIDTHS[device], maxWidth: '100%', background: '#0B0B0B', boxShadow: device !== 'desktop' ? '0 0 40px rgba(0,0,0,0.6)' : 'none', borderRadius: device !== 'desktop' ? 12 : 0, overflow: 'visible', flexShrink: 0 }}>
            {renderPreview()}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="cms-sidebar" style={{ width: 320, background: '#141414', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Sidebar header */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>{currentSec.label}</p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>Edit the text content for this section</p>
          </div>

          {/* Fields */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
            {activeSection === 'hero' && <>
              {renderField('Badge Text', 'hero.badge')}
              {renderField('Headline Line 1', 'hero.headline1')}
              {renderField('Headline Line 2', 'hero.headline2')}
              {renderField('Sub-text', 'hero.subtext')}
              {renderField('Primary Button', 'hero.cta')}
              {renderField('Secondary Button', 'hero.secondary')}
            </>}
            {activeSection === 'howitworks' && <>
              {renderField('Badge', 'hiw.badge')}
              {renderField('Title', 'hiw.title')}
              {renderField('Title Highlight', 'hiw.titleHighlight')}
              {renderField('Subtitle', 'hiw.subtitle')}
              {renderField('Step 1 Title', 'hiw.step1.title')}
              {renderField('Step 1 Description', 'hiw.step1.desc')}
              {renderField('Step 2 Title', 'hiw.step2.title')}
              {renderField('Step 2 Description', 'hiw.step2.desc')}
              {renderField('Step 3 Title', 'hiw.step3.title')}
              {renderField('Step 3 Description', 'hiw.step3.desc')}
              {renderField('Step 4 Title', 'hiw.step4.title')}
              {renderField('Step 4 Description', 'hiw.step4.desc')}
            </>}
            {activeSection === 'testimonials' && <>
              {renderField('Badge', 'testimonials.badge')}
              {renderField('Title', 'testimonials.title')}
              {renderField('Title Highlight', 'testimonials.titleHighlight')}
              {renderField('Subtitle', 'testimonials.subtitle')}
            </>}
            {activeSection === 'cta' && <>
              {renderField('Heading', 'cta.title')}
              {renderField('Sub-text', 'cta.subtitle')}
              {renderField('Primary Button', 'cta.btn')}
              {renderField('Secondary Button', 'cta.secondary')}
              {renderField('Point 1', 'cta.point1')}
              {renderField('Point 2', 'cta.point2')}
              {renderField('Point 3', 'cta.point3')}
              {renderField('Point 4', 'cta.point4')}
            </>}
            {activeSection === 'footer' && <>
              {renderField('Tagline', 'footer.tagline')}
              {renderField('Rights Text', 'footer.allRightsReserved')}
            </>}
          </div>

          {/* Sidebar bottom actions */}
          <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '0.5rem' }}>
            <button onClick={restoreDefaults} style={{ flex: 1, padding: '0.5rem', borderRadius: 7, fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
              RESTORE DEFAULT
            </button>
            <button onClick={publishSection} disabled={publishing} style={{ flex: 1, padding: '0.5rem', borderRadius: 7, fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', border: 'none', background: pubDone ? '#4CAF50' : '#C9A84C', color: '#0B0B0B', letterSpacing: '0.06em' }}>
              {publishing ? '…' : pubDone ? '✓ DONE' : 'PUBLISH'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────── */
export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  // Role guard — redirect non-admins away
  useEffect(() => {
    if (user?.profile && user.profile.role !== 'admin') {
      router.replace('/dashboard/client');
    }
  }, [user?.profile?.role, router]);

  const navItems: NavItem[] = [
    { id: 'overview',      label: t('admin.overview'),      icon: AdminNavIcons.overview },
    { id: 'users',         label: t('admin.users'),         icon: AdminNavIcons.users },
    { id: 'trainers',      label: t('admin.coaches'),       icon: AdminNavIcons.trainers },
    { id: 'subscriptions', label: t('admin.subscriptions'), icon: AdminNavIcons.subscriptions },
    { id: 'marketplace',   label: t('admin.marketplace'),   icon: AdminNavIcons.marketplace },
    { id: 'orders',        label: 'Orders',                 icon: AdminNavIcons.orders },
    { id: 'pricing',       label: t('admin.pricing'),       icon: AdminNavIcons.pricing },
    { id: 'analytics',     label: t('admin.analytics'),     icon: AdminNavIcons.analytics },
    { id: 'billing',       label: 'Billing',                icon: AdminNavIcons.billing },
    { id: 'messages',      label: t('admin.chat'),          icon: AdminNavIcons.messages, badge: unreadMsgCount },
    { id: 'videos',        label: t('admin.videos'),        icon: AdminNavIcons.videos },
    { id: 'cms',           label: t('admin.cms'),           icon: AdminNavIcons.cms },
  ];


  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab) setActiveTab(tab);
  }, []);

  // Fetch unread message count for the badge
  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const { count, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false);
        
        if (error) throw error;
        setUnreadMsgCount(count ?? 0);
      } catch (err) {
        // Silent catch
      }
    }
    fetchUnreadCount();
  }, []);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [coaches, setCoaches] = useState<AdminCoach[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Use the server-side API route so the service-role client bypasses RLS,
      // giving the admin visibility over all profiles, subscriptions, and assignments.
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/data', {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      if (!res.ok) {
        console.error('[admin] loadData failed:', res.status, await res.text());
        return;
      }
      const { profiles, subscriptions: subs, assignments } = await res.json() as {
        profiles: Array<{ id: string; full_name: string | null; email?: string; role: string; onboarding_completed: boolean; created_at: string; phone: string | null; bio: string | null; specialization: string | null }>;
        subscriptions: AdminSubscription[];
        assignments: Array<{ client_id: string; trainer_id: string }>;
      };

      // Build active-sub map
      const activeSubMap: Record<string, string> = {};
      subs.filter(s => s.status === 'active').forEach(s => { activeSubMap[s.user_id] = 'active'; });

      // Build trainer assignment map
      const assignMap: Record<string, string> = {};
      assignments.forEach(a => {
        const coach = profiles.find(p => p.id === a.trainer_id);
        if (coach) assignMap[a.client_id] = coach.full_name ?? a.trainer_id;
      });

      const mappedUsers: AdminUser[] = profiles.map(p => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email ?? null,
        role: p.role ?? 'client',
        onboarding_completed: p.onboarding_completed ?? false,
        created_at: p.created_at,
        subscription_status: activeSubMap[p.id],
        assigned_coach: assignMap[p.id] ?? null,
      }));

      // Coach client counts (include suspended coaches)
      const coachList = profiles.filter(p => p.role === 'coach' || p.role === 'suspended');
      const mappedCoaches: AdminCoach[] = coachList.map(c => ({
        id: c.id,
        full_name: c.full_name,
        created_at: c.created_at,
        client_count: assignments.filter(a => a.trainer_id === c.id).length,
        role: c.role ?? 'coach',
        phone: c.phone ?? null,
        bio: c.bio ?? null,
        specialization: c.specialization ?? null,
      }));

      // Subscriptions with user name
      const mappedSubs: AdminSubscription[] = subs.map(s => ({
        ...s,
        user_name: profiles.find(p => p.id === s.user_id)?.full_name ?? null,
      }));

      setUsers(mappedUsers);
      setCoaches(mappedCoaches);
      setSubscriptions(mappedSubs);
    } catch (err) {
      console.error('[admin] loadData error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <DashboardShell role="admin" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
        <SkDashboardInit role="admin" />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="admin" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && (
        <AdminOverview users={users} coaches={coaches} subscriptions={subscriptions} onNavigate={setActiveTab} />
      )}
      {activeTab === 'users' && (
        <UsersTab users={users} coaches={coaches} onRefresh={loadData} />
      )}
      {activeTab === 'trainers' && (
        <CoachesTab coaches={coaches} onRefresh={loadData} />
      )}
      {activeTab === 'subscriptions' && (
        <SubscriptionsTab subscriptions={subscriptions} />
      )}
      {activeTab === 'marketplace' && (
        <MarketplaceTab />
      )}
      {activeTab === 'orders' && (
        <OrdersTab />
      )}
      {activeTab === 'pricing' && (
        <PricingTab />
      )}
      {activeTab === 'analytics' && (
        <AnalyticsTab users={users} subscriptions={subscriptions} />
      )}
      {activeTab === 'billing' && (
        <BillingTab subscriptions={subscriptions} />
      )}
      {activeTab === 'messages' && (
        <ChatThreadsTab />
      )}
      {activeTab === 'videos' && (
        <VideosTab />
      )}
      {activeTab === 'cms' && (
        <ContentTab />
      )}
    </DashboardShell>
  );
}
