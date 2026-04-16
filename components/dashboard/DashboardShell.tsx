'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface DashboardShellProps {
  role: 'client' | 'coach' | 'admin';
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
}

const roleKeys = { client: 'dash.memberPortal', coach: 'dash.coachPortal', admin: 'dash.adminPanel' } as const;

export default function DashboardShell({ role, navItems, activeTab, onTabChange, children }: DashboardShellProps) {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user?.profile?.full_name
    ? user.profile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <>
      <style>{`
        .dsh-root { display:flex; min-height:100vh; background:#080808; }

        /* ─── Sidebar ─── */
        .dsh-sidebar {
          width: 272px; flex-shrink: 0;
          background: rgba(12,12,12,0.95);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column;
          position: fixed; top:0; left:0; bottom:0; z-index:40;
          transition: transform 0.28s cubic-bezier(.4,0,.2,1);
          backdrop-filter: blur(24px);
        }
        .dsh-sidebar.closed { transform: translateX(-100%); }
        @media (min-width:1024px) {
          .dsh-sidebar { position:sticky; top:0; height:100vh; transform:none !important; }
          .dsh-main { margin-left: 0; }
        }

        /* Sidebar top */
        .dsh-sidebar-top {
          padding: 1.75rem 1.5rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .dsh-role-pill {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.3rem 0.8rem; border-radius: 20px; margin-top: 0.85rem;
          font-size: 0.62rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: #C9A84C;
          background: rgba(201,168,76,0.07);
          border: 1px solid rgba(201,168,76,0.18);
        }

        /* Nav */
        .dsh-nav { flex:1; padding: 1rem 0.75rem; overflow-y:auto; }
        .dsh-nav-item {
          display: flex; align-items: center; gap: 0.75rem;
          width: 100%; padding: 0.72rem 1rem; margin-bottom: 2px;
          border-radius: 10px; border: 1px solid transparent;
          font-size: 0.82rem; font-weight: 500;
          color: rgba(255,255,255,0.38);
          background: transparent; cursor: pointer; text-align: left;
          transition: all 0.18s ease;
        }
        .dsh-nav-item:hover {
          color: rgba(255,255,255,0.75);
          background: rgba(255,255,255,0.04);
        }
        .dsh-nav-item.signout:hover {
          color: #ef4444;
          background: rgba(239,68,68,0.06);
        }
        .dsh-nav-item.active {
          color: #C9A84C;
          background: rgba(201,168,76,0.07);
          border-color: rgba(201,168,76,0.2);
        }
        .dsh-nav-icon { flex-shrink:0; width:16px; height:16px; opacity:0.7; }
        .dsh-nav-item.active .dsh-nav-icon { opacity:1; }

        /* Sidebar bottom */
        .dsh-sidebar-footer {
          padding: 1rem 1.25rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .dsh-avatar {
          width:34px; height:34px; border-radius:50%;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.25);
          font-size:12px; font-weight:700; color:#C9A84C;
        }

        /* ─── Main ─── */
        .dsh-main { flex:1; min-width:0; display:flex; flex-direction:column; }

        /* Topbar */
        .dsh-topbar {
          height: 60px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.75rem;
          background: rgba(8,8,8,0.9);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(16px);
          position: sticky; top:0; z-index:30;
        }

        /* Content */
        .dsh-content { flex:1; padding: 2rem 1.75rem; overflow-y:auto; }
        @media (max-width:1023px) { .dsh-content { padding: 1.25rem 1rem; } }
        @media (max-width:767px) {
          .dsh-content { padding: 1rem 0.75rem; padding-bottom: 5.5rem; }
        }

        /* ─── Mobile bottom nav bar ─── */
        .dsh-bottom-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
          background: rgba(10,10,10,0.97);
          border-top: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding-bottom: env(safe-area-inset-bottom, 0.25rem);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .dsh-bottom-nav::-webkit-scrollbar { display: none; }
        .dsh-bottom-nav-inner {
          display: flex; align-items: stretch;
          min-width: max-content; width: 100%;
        }
        .dsh-bottom-nav-item {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.18rem; flex: 1; min-width: 56px;
          padding: 0.5rem 0.25rem;
          border: none; background: transparent; cursor: pointer;
          color: rgba(255,255,255,0.32);
          font-size: 0.52rem; font-weight: 600; letter-spacing: 0.04em;
          text-transform: uppercase; transition: color 0.18s ease; white-space: nowrap;
        }
        .dsh-bottom-nav-item.active { color: #C9A84C; }
        .dsh-bottom-nav-item svg { width: 20px; height: 20px; flex-shrink: 0; margin-bottom: 1px; }
        @media (max-width:1023px) { .dsh-bottom-nav { display: flex; } }

        /* Overlay */
        .dsh-overlay {
          display:none; position:fixed; inset:0;
          background:rgba(0,0,0,0.65); z-index:35;
          backdrop-filter: blur(2px);
        }
        .dsh-overlay.open { display:block; }

        /* ─── Design tokens (available to all pages) ─── */

        /* Glass card */
        .ds-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
        }
        .ds-card-gold {
          background: rgba(201,168,76,0.04);
          border: 1px solid rgba(201,168,76,0.18);
          border-radius: 16px;
        }

        /* Stat card */
        .ds-stat {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.5rem;
          transition: border-color 0.2s ease;
        }
        .ds-stat:hover { border-color: rgba(255,255,255,0.12); }
        .ds-stat-icon {
          width:40px; height:40px; border-radius:12px;
          display:flex; align-items:center; justify-content:center; margin-bottom:1rem;
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.18);
          color: #C9A84C; flex-shrink:0;
        }
        .ds-stat-value { font-size:1.75rem; font-weight:700; color:white; line-height:1; }
        .ds-stat-label { font-size:0.75rem; color:rgba(255,255,255,0.38); margin-top:0.35rem; }
        .ds-stat-sub { font-size:0.68rem; color:rgba(255,255,255,0.22); margin-top:0.25rem; }

        /* Icon box */
        .ds-icon-box {
          width:36px; height:36px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.16);
          color: #C9A84C;
        }

        /* Gold pill */
        .ds-gold-pill {
          display:inline-flex; align-items:center; gap:0.35rem;
          padding: 0.25rem 0.75rem; border-radius:20px;
          font-size:0.62rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase;
          color:#C9A84C; background:rgba(201,168,76,0.08); border:1px solid rgba(201,168,76,0.2);
        }

        /* Buttons */
        .ds-btn-gold {
          display:inline-flex; align-items:center; gap:0.5rem;
          padding: 0.65rem 1.35rem;
          font-size:0.8rem; font-weight:600; letter-spacing:0.03em;
          color:#C9A84C; background:rgba(201,168,76,0.08);
          border:1px solid rgba(201,168,76,0.3); border-radius:10px;
          cursor:pointer; transition:all 0.2s ease; white-space:nowrap;
        }
        .ds-btn-gold:hover { background:rgba(201,168,76,0.14); border-color:rgba(201,168,76,0.55); }
        .ds-btn-gold:disabled { opacity:0.4; cursor:not-allowed; }

        .ds-btn-outline {
          display:inline-flex; align-items:center; gap:0.5rem;
          padding: 0.65rem 1.35rem;
          font-size:0.8rem; font-weight:500;
          color:rgba(255,255,255,0.5); background:transparent;
          border:1px solid rgba(255,255,255,0.1); border-radius:10px;
          cursor:pointer; transition:all 0.2s ease; white-space:nowrap;
        }
        .ds-btn-outline:hover { color:rgba(255,255,255,0.8); border-color:rgba(255,255,255,0.22); background:rgba(255,255,255,0.04); }

        /* Inputs */
        .ds-input {
          width:100%;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09);
          border-radius:10px; padding:0.7rem 1rem;
          font-size:0.84rem; color:rgba(255,255,255,0.85);
          outline:none; transition:border-color 0.2s ease; box-sizing:border-box;
        }
        .ds-input::placeholder { color:rgba(255,255,255,0.22); }
        .ds-input:focus { border-color:rgba(201,168,76,0.45); }

        /* Remove number input spinners globally */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; appearance: textfield; }

        /* Select overrides — kill browser default arrow, inject gold custom arrow */
        select.ds-input {
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
        select.ds-input:focus { border-color:rgba(201,168,76,0.45); }
        select.ds-input option {
          background: #111;
          color: rgba(255,255,255,0.82);
        }

        /* Label */
        .ds-label {
          display:block; font-size:0.7rem; font-weight:600;
          letter-spacing:0.1em; text-transform:uppercase;
          color:rgba(255,255,255,0.28); margin-bottom:0.5rem;
        }

        /* Divider */
        .ds-divider { height:1px; background:rgba(255,255,255,0.06); margin:1.5rem 0; }

        /* Section header */
        .ds-section-title { font-size:1.1rem; font-weight:700; color:white; }
        .ds-section-sub { font-size:0.78rem; color:rgba(255,255,255,0.32); margin-top:0.2rem; }

        /* Status badge */
        .ds-badge-green {
          font-size:0.65rem; font-weight:700; padding:0.2rem 0.6rem; border-radius:20px;
          background:rgba(74,222,128,0.08); color:rgba(74,222,128,0.9); border:1px solid rgba(74,222,128,0.18);
        }
        .ds-badge-red {
          font-size:0.65rem; font-weight:700; padding:0.2rem 0.6rem; border-radius:20px;
          background:rgba(248,113,113,0.08); color:rgba(248,113,113,0.8); border:1px solid rgba(248,113,113,0.18);
        }
        .ds-badge-gold {
          font-size:0.65rem; font-weight:700; padding:0.2rem 0.6rem; border-radius:20px;
          background:rgba(201,168,76,0.1); color:#C9A84C; border:1px solid rgba(201,168,76,0.22);
        }
        .ds-badge-gray {
          font-size:0.65rem; font-weight:700; padding:0.2rem 0.6rem; border-radius:20px;
          background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.35); border:1px solid rgba(255,255,255,0.08);
        }

        /* Table */
        .ds-table { width:100%; border-collapse:collapse; }
        .ds-table th {
          text-align:left; padding:0.75rem 1rem;
          font-size:0.65rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase;
          color:rgba(255,255,255,0.25);
          background:rgba(255,255,255,0.02);
          border-bottom:1px solid rgba(255,255,255,0.06);
        }
        .ds-table td {
          padding:0.9rem 1rem;
          font-size:0.83rem; color:rgba(255,255,255,0.65);
          border-bottom:1px solid rgba(255,255,255,0.04);
        }
        .ds-table tr:last-child td { border-bottom:none; }
        .ds-table tr:hover td { background:rgba(255,255,255,0.015); }

        /* Table scroll containers: smooth iOS swipe */
        .ds-table-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* Toggle switch */
        .ds-toggle {
          position:relative; width:44px; height:24px; border-radius:12px;
          cursor:pointer; border:none; transition:background 0.25s ease;
          flex-shrink:0;
        }
        .ds-toggle-knob {
          position:absolute; top:3px; width:18px; height:18px; border-radius:50%;
          background:white; transition:left 0.25s ease;
        }

        /* Empty state */
        .ds-empty {
          text-align:center; padding:3.5rem 1rem;
        }
        .ds-empty-icon {
          width:56px; height:56px; border-radius:16px; margin:0 auto 1.25rem;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
          color:rgba(255,255,255,0.2);
        }
        .ds-empty p { font-size:0.85rem; color:rgba(255,255,255,0.3); }
        .ds-empty small { font-size:0.75rem; color:rgba(255,255,255,0.18); }

        /* Skeleton shimmer (inherits global sk-sweep keyframe) */
        .ds-loading {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.09) 80px, rgba(255,255,255,0.03) 160px);
          background-size: 800px 100%;
          animation: sk-sweep 1.5s ease-in-out infinite;
          border-radius: 6px;
        }

        /* Hide scrollbar */
        .ds-no-scroll::-webkit-scrollbar { display: none; }
        .ds-no-scroll { scrollbar-width: none; -ms-overflow-style: none; }

        /* ─── Mobile responsive overrides ─── */
        @media (max-width: 639px) {
          /* Stat cards: 1 col on very small screens */
          .ds-stat { padding: 1rem; }
          .ds-stat-value { font-size: 1.35rem; }

          /* Tighten card padding */
          .ds-card, .ds-card-gold { border-radius: 12px; }

          /* Table: ensure horizontal scroll container works */
          .ds-table th, .ds-table td { padding: 0.6rem 0.75rem; font-size: 0.78rem; }

          /* Buttons: allow wrapping on very small screens */
          .ds-btn-gold, .ds-btn-outline { font-size: 0.76rem; padding: 0.55rem 1rem; }

          /* Empty state: less padding */
          .ds-empty { padding: 2rem 0.75rem; }

          /* ── Coach: client detail card ── */
          .coach-client-card { padding: 1.25rem !important; }

          /* ── Coach: meal builder add-item row → stack vertically ── */
          .coach-meal-add-row {
            grid-template-columns: 1fr !important;
          }

          /* ── Coach: workout exercise row → stack vertically ── */
          .coach-ex-row {
            grid-template-columns: 1fr 1fr !important;
          }
          .coach-ex-row-full {
            grid-template-columns: 1fr !important;
          }

          /* ── Coach: workout plan list card actions ── */
          .coach-plan-card {
            flex-wrap: wrap !important;
            gap: 0.5rem !important;
          }
          .coach-plan-card > .ds-btn-outline,
          .coach-plan-card > button { flex-shrink: 0; }

          /* ── Coach: client card badge area ── */
          .coach-client-badges {
            display: none !important;
          }

          /* ── Coach: messages height ── */
          .coach-messages-root {
            height: auto !important;
            min-height: auto !important;
          }
          .coach-messages-root .coach-chat-box {
            height: 55vh !important;
            min-height: 300px;
          }

          /* ── Modals: full-width on mobile ── */
          .ds-modal-inner {
            width: calc(100% - 1.5rem) !important;
            max-width: none !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
          }
        }

        /* Mobile bottom-nav for sidebar (alternative to hamburger drawer) */
        @media (max-width: 1023px) {
          /* Sidebar stays as slide-out drawer — ensure overlay is full-screen */
          .dsh-overlay.open { display: block; }
        }

        /* ─── Admin dashboard mobile fixes ─── */

        /* Large overview heading */
        @media (max-width: 767px) {
          .admin-overview-h2 { font-size: 1.2rem !important; }
          .ds-stat-value { font-size: 1.25rem !important; }
          .ds-stat { padding: 1rem !important; }
          .ds-stat-icon { width: 32px !important; height: 32px !important; margin-bottom: 0.5rem !important; }
          .ds-section-title { font-size: 0.95rem !important; }
        }

        /* Tables: ensure nowrap so horizontal scroll works */
        @media (max-width: 767px) {
          .ds-table th, .ds-table td { white-space: nowrap !important; }
        }

        /* Collapsible 2-col grids in forms (pricing plan form, product form descriptions, etc.) */
        @media (max-width: 639px) {
          .admin-2col-grid { grid-template-columns: 1fr !important; }
        }

        /* Tab header rows: allow wrap so search input drops below title */
        @media (max-width: 639px) {
          .admin-tab-header { flex-direction: column !important; align-items: flex-start !important; }
          .admin-search-input { width: 100% !important; min-width: 0 !important; }
        }

        /* CMS split layout: stack on tablet/mobile */
        @media (max-width: 1023px) {
          .cms-root { height: auto !important; overflow: auto !important; }
          .cms-layout { flex-direction: column !important; overflow: visible !important; height: auto !important; }
          .cms-preview-area { flex: none !important; min-height: 50vh; overflow-y: auto !important; }
          .cms-sidebar { width: 100% !important; border-left: none !important; border-top: 1px solid rgba(255,255,255,0.08) !important; flex: none !important; max-height: 50vh; overflow-y: auto !important; }
        }
        @media (max-width: 767px) {
          .cms-root { margin: -0.75rem !important; }
          .cms-topbar { flex-wrap: wrap !important; height: auto !important; padding: 0.5rem 0.75rem !important; gap: 0.4rem !important; }
          .cms-topbar-devices { display: none !important; }
          .cms-topbar-restore { display: none !important; }
        }
      `}</style>

      <div className="dsh-root">
        <div className={`dsh-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* ── Sidebar ── */}
        <aside className={`dsh-sidebar ${sidebarOpen ? '' : 'closed'}`}>
          <div className="dsh-sidebar-top">
            <Link href="/" onClick={() => setSidebarOpen(false)}>
              <img
                src="https://res.cloudinary.com/dqiuwzvfb/image/upload/v1775629677/69007823-DC7E-42E1-AF8E-E57E11810549-Photoroom_nluyul.png"
                alt="AthloCode" className="h-16 w-auto object-contain"
              />
            </Link>
            <div className="dsh-role-pill">
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#C9A84C', flexShrink:0 }} />
              {t(roleKeys[role])}
            </div>
          </div>

          <nav className="dsh-nav">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`dsh-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => { onTabChange(item.id); setSidebarOpen(false); }}
              >
                <span className="dsh-nav-icon">{item.icon}</span>
                {item.label}
                {item.badge != null && item.badge > 0 && (
                  <span style={{ marginLeft: 'auto', minWidth: 18, height: 18, borderRadius: 9, background: '#C9A84C', color: '#0B0B0B', fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="dsh-sidebar-footer">
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
              <div className="dsh-avatar">{initials}</div>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:'0.8rem', fontWeight:600, color:'rgba(255,255,255,0.75)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {user?.profile?.full_name ?? 'User'}
                </p>
                <p style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.28)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="dsh-nav-item signout"
              style={{ width:'100%', color:'rgba(255,255,255,0.28)', marginBottom:0 }}
            >
              <svg className="dsh-nav-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              {t('dash.signOut')}
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="dsh-main">
          <header className="dsh-topbar">
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ color:'rgba(255,255,255,0.45)', background:'none', border:'none', cursor:'pointer', padding:'4px' }}
              >
                <svg style={{ width:20, height:20 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <span style={{ fontSize:'0.85rem', fontWeight:600, color:'rgba(255,255,255,0.6)' }}>
                {navItems.find(n => n.id === activeTab)?.label}
              </span>
            </div>
            <a href="/" style={{
              fontSize:'0.75rem', color:'rgba(255,255,255,0.3)', textDecoration:'none',
              display:'inline-flex', alignItems:'center', gap:'0.4rem',
              padding:'0.35rem 0.85rem', borderRadius:8,
              border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)',
              transition:'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <svg style={{ width:14, height:14 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              {t('dash.backToSite')}
            </a>
          </header>

          <main className="dsh-content">{children}</main>
        </div>
      </div>

      {/* ── Mobile bottom nav (shown on < 1024px) ── */}
      <nav className="dsh-bottom-nav" aria-label="Mobile navigation">
        <div className="dsh-bottom-nav-inner">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`dsh-bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { onTabChange(item.id); setSidebarOpen(false); }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          {/* Sign out — always visible on mobile */}
          <button
            className="dsh-bottom-nav-item"
            onClick={signOut}
            style={{ color: 'rgba(239,68,68,0.6)' }}
          >
            <svg style={{ width:20, height:20 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
