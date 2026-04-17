'use client';

import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell, { NavItem } from '@/components/dashboard/DashboardShell';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Select from '@/components/ui/Select';
import { useLanguage } from '@/context/LanguageContext';
import { SkProgressMonitor, SkMessages, SkDashboardInit } from '@/components/ui/Skeleton';

/* ─── Nav icons (labels built inside component for i18n) ── */
const CoachNavIcons = {
  overview: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>,
  clients: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>,
  mealBuilder: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5M6 10.608v6.137a2.587 2.587 0 0 0 2.587 2.587h6.826A2.587 2.587 0 0 0 18 16.745v-6.137M6 10.608H4.5m13.5 0H19.5" /></svg>,
  workoutBuilder: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  progress: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>,
  messages: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>,
  settings: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>,
};

/* ─── Types ───────────────────────────────────────────── */
interface ClientProfile {
  id: string;
  full_name: string | null;
  email: string;
  goal?: string;
  weight?: number;
  onboarding_completed: boolean;
  subscription_status?: string;
  assigned_at: string;
}

interface MealPlan {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface MealPlanItem {
  id?: string;
  meal_type: string;
  food_name: string;
  food_name_ar: string | null;
  grams: number;
  calories: number | null;
  notes: string | null;
}

interface WorkoutPlan {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface WorkoutDay {
  id?: string;
  day_number: number;
  day_label: string;
  focus: string | null;
  exercises: WorkoutExercise[];
}

const EXERCISE_CATEGORIES = ['Push', 'Pull', 'Legs', 'Core', 'Cardio', 'Mobility', 'Full Body', 'Arms'];

interface WorkoutExercise {
  id?: string;
  exercise_name: string;
  exercise_name_ar: string | null;
  exercise_category: string | null;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  notes: string | null;
  video_url: string | null;
  sort_order: number;
}

interface WorkoutVideo {
  id: string;
  title: string;
  cloudinary_url: string;
  public_id: string;
  thumbnail_url: string | null;
  duration: number | null;
}

interface ProgressLog {
  id: string;
  client_id: string;
  logged_at: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  muscle_mass_kg: number | null;
  notes: string | null;
  client_name?: string;
}

interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

/* ─── Coach Modal ─────────────────────────────────────── */
function CoachModal({ open, onClose, title, maxWidth = 600, children }: {
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
      style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.4rem 1.75rem 0', flexShrink: 0 }}>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>{title}</p>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{ height: 1, margin: '1rem 1.75rem 0', background: 'linear-gradient(90deg, rgba(201,168,76,0.4), transparent)', flexShrink: 0 }} />
        <div style={{ padding: '1.5rem 1.75rem 1.75rem', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Overview ────────────────────────────────────────── */
function OverviewTab({
  clients,
  onNavigate,
}: {
  clients: ClientProfile[];
  onNavigate: (tab: string) => void;
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const coachFirstName = user?.profile?.full_name?.split(' ')[0] ?? 'Coach';
  const active = clients.filter(c => c.subscription_status === 'active').length;

  const stats = [
    {
      label: t('coach.stats.totalClients'),
      value: String(clients.length),
      sub: t('coach.stats.assignedToYou'),
      bg: 'rgba(201,168,76,0.06)',
      border: 'rgba(201,168,76,0.2)',
      icon: (
        <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
    },
    {
      label: t('coach.stats.activeMembers'),
      value: String(active),
      sub: t('coach.stats.activeSubscription'),
      bg: 'rgba(74,222,128,0.04)',
      border: 'rgba(74,222,128,0.18)',
      icon: (
        <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
    {
      label: t('coach.stats.onboarded'),
      value: String(clients.filter(c => c.onboarding_completed).length),
      sub: t('coach.stats.completedQuestionnaire'),
      bg: 'rgba(255,255,255,0.03)',
      border: 'rgba(255,255,255,0.08)',
      icon: (
        <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
      ),
    },
    {
      label: t('coach.stats.pendingSetup'),
      value: String(clients.filter(c => !c.onboarding_completed).length),
      sub: t('coach.stats.needOnboarding'),
      bg: 'rgba(255,200,80,0.04)',
      border: 'rgba(255,200,80,0.18)',
      icon: (
        <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-7">
        <div className="ds-gold-pill mb-3">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', flexShrink: 0, display: 'inline-block' }} />
          {t('dash.coachPortal')}
        </div>
        <h2 dir="auto" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'white', marginBottom: '0.35rem' }}>
          {t('coach.welcomeBack')}&nbsp;<span style={{ color: '#C9A84C' }}>{coachFirstName}</span>
        </h2>
        <p dir="auto" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>
          {t('coach.overview.summary')}
        </p>
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

      <div className="ds-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <p dir="auto" className="ds-section-title">{t('coach.assignedClients')}</p>
            <p dir="auto" className="ds-section-sub">{t('coach.roster.sub')}</p>
          </div>
          <button className="ds-btn-gold" onClick={() => onNavigate('clients')}>
            {t('admin.viewAll')}
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="ds-empty">
            <div className="ds-empty-icon">
              <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" />
              </svg>
            </div>
            <p dir="auto">{t('coach.noClients')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ds-table">
              <thead>
                <tr>
                  <th>{t('admin.member')}</th>
                  <th>{t('coach.table.goal')}</th>
                  <th>{t('admin.status')}</th>
                  <th>{t('admin.joined')}</th>
                </tr>
              </thead>
              <tbody>
                {clients.slice(0, 5).map(c => {
                  const initials = c.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? 'U';
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                            fontSize: 11, fontWeight: 700, color: '#C9A84C',
                          }}>{initials}</div>
                          <div>
                            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.82rem', fontWeight: 500 }}>
                              {c.full_name ?? t('coach.unnamed')}
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.7rem' }}>{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{c.goal ?? '—'}</td>
                      <td>
                        <span className={c.subscription_status === 'active' ? 'ds-badge-green' : 'ds-badge-gray'}>
                          {c.subscription_status ?? t('coach.noPlan')}
                        </span>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.75rem' }}>
                        {new Date(c.assigned_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Clients Tab ─────────────────────────────────────── */
interface SearchResult { id: string; full_name: string | null; email: string; onboarding_completed: boolean; }

function ClientsTab({
  clients,
  coachId,
  onOpenChat,
  onBuildMeal,
  onBuildWorkout,
  onRefresh,
}: {
  clients: ClientProfile[];
  coachId: string;
  onOpenChat: (clientId: string) => void;
  onBuildMeal: (clientId: string) => void;
  onBuildWorkout: (clientId: string) => void;
  onRefresh: () => void;
}) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<ClientProfile | null>(null);
  const [onboarding, setOnboarding] = useState<Record<string, string> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  /* ── Search & Assign state ── */
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDone, setSearchDone]       = useState(false);
  const [assigningId, setAssigningId]     = useState<string | null>(null);
  const [assignedIds, setAssignedIds]     = useState<Set<string>>(new Set());
  const [searchError, setSearchError]     = useState('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = async (q: string) => {
    setSearchLoading(true);
    const alreadyAssigned = clients.map(c => c.id);
    let query = supabase
      .from('profiles')
      .select('id, full_name, email, onboarding_completed')
      .eq('role', 'client')
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(10);
    if (alreadyAssigned.length > 0) {
      query = query.not('id', 'in', `(${alreadyAssigned.join(',')})`);
    }
    const { data, error } = await query;
    setSearchLoading(false);
    setSearchDone(true);
    if (error) { setSearchError('Search failed. Please try again.'); return; }
    setSearchResults((data ?? []) as SearchResult[]);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setSearchDone(false);
    setSearchError('');
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!val.trim()) { setSearchResults([]); return; }
    searchTimerRef.current = setTimeout(() => runSearch(val.trim()), 300);
  };

  const assignClient = async (result: SearchResult) => {
    setAssigningId(result.id);
    setSearchError('');
    const { error } = await supabase
      .from('trainer_client_assignments')
      .insert({ trainer_id: coachId, client_id: result.id });
    setAssigningId(null);
    if (error) {
      setSearchError('Assignment failed. They may already be assigned.');
      return;
    }
    setAssignedIds(prev => new Set(prev).add(result.id));
    onRefresh();
  };

  const closeAddModal = () => {
    setShowAddForm(false);
    setSearchQuery('');
    setSearchResults([]);
    setAssignedIds(new Set());
    setSearchDone(false);
    setSearchError('');
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
  };

  const openClient = async (c: ClientProfile) => {
    setSelected(c);
    const { data, error } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', c.id)
      .maybeSingle();
    setOnboarding(data ?? null);
  };

  const selectedInitials = selected?.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? 'U';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p dir="auto" className="ds-section-title">{t('coach.myClients')}</p>
          <p dir="ltr" className="ds-section-sub">{clients.length} {clients.length === 1 ? t('coach.client') : t('admin.clients')}</p>
        </div>
        <button className="ds-btn-gold" onClick={() => setShowAddForm(true)}>
          <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('coach.addClient')}
        </button>
      </div>

      <CoachModal
        open={showAddForm}
        onClose={closeAddModal}
        title={t('coach.addClient')}
        maxWidth={520}
      >
        {/* Search label */}
        <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '0.6rem' }}>
          Search by name or email
        </p>

        {/* Search input with icon */}
        <div style={{ position: 'relative' }}>
          <svg
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', flexShrink: 0 }}
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            className="ds-input"
            style={{ width: '100%', paddingLeft: 36, paddingRight: searchLoading ? 36 : 12, boxSizing: 'border-box' }}
            placeholder="e.g. Ahmed or ahmed@gmail.com"
            value={searchQuery}
            autoFocus
            onChange={e => handleSearchChange(e.target.value)}
          />
          {searchLoading && (
            <svg
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'rgba(201,168,76,0.7)', animation: 'spin 0.8s linear infinite' }}
              fill="none" viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
            </svg>
          )}
        </div>

        {/* Error message */}
        {searchError && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(248,113,113,0.85)' }}>{searchError}</p>
        )}

        {/* Results list */}
        {searchResults.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {searchResults.map(r => {
              const initials = r.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? 'U';
              const isAssigning = assigningId === r.id;
              const isAssigned  = assignedIds.has(r.id);
              return (
                <div
                  key={r.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                    background: isAssigned ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isAssigned ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 12, padding: '0.85rem 1rem',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#C9A84C',
                  }}>{initials}</div>

                  {/* Name + email */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.full_name ?? 'Unnamed'}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.email}
                    </p>
                  </div>

                  {/* Onboarding badge */}
                  <span className={r.onboarding_completed ? 'ds-badge-green' : 'ds-badge-gray'} style={{ flexShrink: 0 }}>
                    {r.onboarding_completed ? 'Onboarded' : 'Not onboarded'}
                  </span>

                  {/* Assign / Assigned */}
                  {isAssigned ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(74,222,128,0.85)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Assigned
                    </span>
                  ) : (
                    <button
                      className="ds-btn-gold"
                      style={{ flexShrink: 0, padding: '0.35rem 0.9rem', fontSize: '0.78rem' }}
                      disabled={isAssigning}
                      onClick={() => assignClient(r)}
                    >
                      {isAssigning ? (
                        <svg style={{ width: 13, height: 13, animation: 'spin 0.8s linear infinite' }} fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                        </svg>
                      ) : 'Assign'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* No results state */}
        {searchDone && !searchLoading && searchResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>
            No unassigned clients found for &quot;{searchQuery}&quot;
          </div>
        )}

        {/* Idle hint */}
        {!searchDone && !searchQuery && (
          <p style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
            Start typing to search registered clients
          </p>
        )}
      </CoachModal>

      {clients.length === 0 ? (
        <div className="ds-empty">
          <div className="ds-empty-icon">
            <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" />
            </svg>
          </div>
          <p dir="auto">{t('coach.noClients')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {clients.map(c => {
            const initials = c.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? 'U';
            return (
              <div
                key={c.id}
                className="ds-card"
                style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onClick={() => openClient(c)}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.22)',
                  fontSize: 14, fontWeight: 700, color: '#C9A84C',
                }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                    {c.full_name ?? t('coach.unnamed')}
                  </p>
                  <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{c.email}</p>
                </div>
                <div className="coach-client-badges" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                  {c.onboarding_completed
                    ? <span className="ds-badge-green">{t('coach.onboarded')}</span>
                    : <span className="ds-badge-gray">{t('coach.notOnboarded')}</span>}
                  <span className={c.subscription_status === 'active' ? 'ds-badge-green' : 'ds-badge-gold'}>
                    {c.subscription_status ?? t('coach.noPlan')}
                  </span>
                </div>
                <svg style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Client Details Modal ── */}
      <CoachModal
        open={!!selected}
        onClose={() => { setSelected(null); setOnboarding(null); }}
        title={selected?.full_name ?? t('coach.unnamed')}
        maxWidth={640}
      >
        {selected && (
          <>
            <div className="ds-card coach-client-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(201,168,76,0.1)', border: '2px solid rgba(201,168,76,0.3)',
                  fontSize: 18, fontWeight: 700, color: '#C9A84C', flexShrink: 0,
                }}>{selectedInitials}</div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{selected.full_name ?? t('coach.unnamed')}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{selected.email}</p>
                  <span className={selected.subscription_status === 'active' ? 'ds-badge-green' : 'ds-badge-gray'} style={{ marginTop: 6, display: 'inline-block' }}>
                    {selected.subscription_status ?? t('coach.noSubscription')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="ds-btn-gold" onClick={() => { onOpenChat(selected.id); setSelected(null); setOnboarding(null); }}>
                  <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                  </svg>
                  {t('coach.actions.message')}
                </button>
                <button className="ds-btn-outline" onClick={() => { onBuildMeal(selected.id); setSelected(null); setOnboarding(null); }}>
                  {t('coach.actions.buildMealPlan')}
                </button>
                <button className="ds-btn-outline" onClick={() => { onBuildWorkout(selected.id); setSelected(null); setOnboarding(null); }}>
                  {t('coach.actions.buildWorkoutPlan')}
                </button>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.75rem', backdropFilter: 'blur(20px)' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: 16, height: 16, color: '#C9A84C' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white' }}>{t('coach.questionnaire.title')}</p>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{t('coach.questionnaire.sub')}</p>
            </div>
            {onboarding && (
              <span style={{ marginLeft: 'auto', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.25rem 0.65rem', borderRadius: 20, background: 'rgba(74,222,128,0.08)', color: 'rgba(74,222,128,0.85)', border: '1px solid rgba(74,222,128,0.18)' }}>
                {t('coach.questionnaire.completed')}
              </span>
            )}
          </div>

          {onboarding ? (() => {
            const GoldIcon = ({ path, path2 }: { path: string; path2?: string }) => (
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg style={{ width: 14, height: 14, color: '#C9A84C' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                  {path2 && <path strokeLinecap="round" strokeLinejoin="round" d={path2} />}
                </svg>
              </div>
            );
            const fields: { key: string; label: string; path: string; path2?: string; unit?: string }[] = [
              { key: 'fitness_goal',         label: 'Fitness Goal',          path: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z' },
              { key: 'current_weight_kg',    label: 'Current Weight',        path: 'M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z', unit: 'kg' },
              { key: 'target_weight_kg',     label: 'Target Weight',         path: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', unit: 'kg' },
              { key: 'height_cm',            label: 'Height',                path: 'M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5', unit: 'cm' },
              { key: 'age',                  label: 'Age',                   path: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5', unit: 'yrs' },
              { key: 'gender',               label: 'Gender',                path: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' },
              { key: 'activity_level',       label: 'Activity Level',        path: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
              { key: 'experience_level',     label: 'Experience',            path: 'M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0' },
              { key: 'dietary_restrictions', label: 'Dietary',               path: 'M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5M6 10.608v6.137a2.587 2.587 0 0 0 2.587 2.587h6.826A2.587 2.587 0 0 0 18 16.745v-6.137M6 10.608H4.5m13.5 0H19.5' },
              { key: 'health_conditions',    label: 'Health',                path: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z' },
              { key: 'workout_days_per_week',label: 'Days / Week',           path: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H18v-.008Zm0 2.25h.008v.008H18V15Z', unit: 'days' },
              { key: 'notes',                label: 'Notes',                 path: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10' },
            ];
            const ob = onboarding as Record<string, unknown>;
            const visible = fields.filter(f => ob[f.key] != null && ob[f.key] !== '' && String(ob[f.key]).toLowerCase() !== 'null');
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: '0.75rem' }}>
                {visible.map(f => {
                  const raw = ob[f.key];
                  const display = Array.isArray(raw) ? (raw as string[]).join(', ') : String(raw);
                  return (
                    <div key={f.key} style={{
                      padding: '1rem 1.1rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 14,
                      transition: 'border-color 0.2s ease',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <GoldIcon path={f.path} path2={f.path2} />
                        <p style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                          {f.label}
                        </p>
                      </div>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'rgba(255,255,255,0.82)', paddingLeft: '0.25rem' }}>
                        {display}{f.unit ? <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginLeft: 3 }}>{f.unit}</span> : null}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })() : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <svg style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.2)' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.3)' }}>{t('coach.questionnaire.notCompleted')}</p>
              <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.18)', marginTop: 4 }}>{t('coach.questionnaire.notCompletedSub')}</p>
            </div>
          )}
            </div>
          </>
        )}
      </CoachModal>
    </div>
  );
}

/* ─── Meal Builder ────────────────────────────────────── */
function MealBuilderTab({ clients, preselectedClientId }: { clients: ClientProfile[]; preselectedClientId: string | null }) {
  const { t } = useLanguage();
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId ?? '');
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editPlan, setEditPlan] = useState<MealPlan | null>(null);
  const [items, setItems] = useState<MealPlanItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState<MealPlanItem>({ meal_type: 'breakfast', food_name: '', food_name_ar: null, grams: 0, calories: null, notes: null });

  const mealTypes = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'];

  useEffect(() => {
    if (preselectedClientId) setSelectedClientId(preselectedClientId);
  }, [preselectedClientId]);

  useEffect(() => {
    if (!selectedClientId) return;
    supabase.from('meal_plans').select('*').eq('client_id', selectedClientId).order('created_at', { ascending: false })
      .then(({ data }) => setPlans(data ?? []));
  }, [selectedClientId]);

  const openEdit = async (plan: MealPlan) => {
    setEditPlan(plan);
    setTitle(plan.title);
    setDescription(plan.description ?? '');
    const { data } = await supabase.from('meal_plan_items').select('*').eq('meal_plan_id', plan.id).order('meal_type');
    setItems(data ?? []);
    setView('edit');
  };

  const savePlan = async () => {
    if (!selectedClientId || !title.trim()) return;
    setSaving(true);
    if (view === 'create') {
      const { data: plan, error } = await supabase.from('meal_plans').insert({
        client_id: selectedClientId,
        coach_id: (await supabase.auth.getUser()).data.user?.id,
        title: title.trim(),
        description: description.trim() || null,
        status: 'active',
      }).select().single();
      if (!error && plan) {
        if (items.length > 0) {
          await supabase.from('meal_plan_items').insert(items.map(i => ({ meal_plan_id: plan.id, meal_type: i.meal_type, food_name: i.food_name, food_name_ar: i.food_name_ar ?? null, quantity_g: i.grams, calories: i.calories, notes: i.notes})));
        }
        const { data: updated } = await supabase.from('meal_plans').select('*').eq('client_id', selectedClientId).order('created_at', { ascending: false });
        setPlans(updated ?? []);
        setView('list'); setTitle(''); setDescription(''); setItems([]);
      }
    } else if (editPlan) {
      await supabase.from('meal_plans').update({ title: title.trim(), description: description.trim() || null }).eq('id', editPlan.id);
      await supabase.from('meal_plan_items').delete().eq('meal_plan_id', editPlan.id);
      if (items.length > 0) {
        await supabase.from('meal_plan_items').insert(items.map(i => ({ meal_plan_id: editPlan.id, meal_type: i.meal_type, food_name: i.food_name, food_name_ar: i.food_name_ar ?? null, quantity_g: i.grams, calories: i.calories, notes: i.notes})));
      }
      const { data: updated } = await supabase.from('meal_plans').select('*').eq('client_id', selectedClientId).order('created_at', { ascending: false });
      setPlans(updated ?? []);
      setView('list'); setTitle(''); setDescription(''); setItems([]); setEditPlan(null);
    }
    setSaving(false);
  };

  const addItem = () => {
    if (!newItem.food_name.trim()) return;
    setItems(prev => [...prev, { ...newItem }]);
    setNewItem({ meal_type: newItem.meal_type, food_name: '', food_name_ar: null, grams: 0, calories: null, notes: null });
  };

  const deletePlan = async (id: string) => {
    await supabase.from('meal_plan_items').delete().eq('meal_plan_id', id);
    await supabase.from('meal_plans').delete().eq('id', id);
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="ds-section-title">{t('coach.mealPlan.sectionTitle')}</p>
          <p className="ds-section-sub">{t('coach.mealPlan.sectionSub')}</p>
        </div>
        {selectedClientId && (
          <button className="ds-btn-gold" onClick={() => setView('create')}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t('coach.mealPlan.newPlan')}
          </button>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="ds-label">{t('coach.mealPlan.selectClient')}</label>
        <Select
          value={selectedClientId}
          onChange={setSelectedClientId}
          placeholder={t('coach.mealPlan.chooseClient')}
          options={clients.map(c => ({ value: c.id, label: c.full_name ?? c.email }))}
        />
      </div>

      {selectedClientId && plans.length === 0 ? (
        <div className="ds-empty">
          <div className="ds-empty-icon">
            <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513" />
            </svg>
          </div>
          <p>{t('coach.mealPlan.noPlans')}</p>
          <small>{t('coach.mealPlan.noPlansCreate')}</small>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {plans.map(plan => (
            <div key={plan.id} className="ds-card coach-plan-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="ds-icon-box">
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{plan.title}</p>
                {plan.description && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.32)', marginTop: 2 }}>{plan.description}</p>}
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.22)', marginTop: 3 }}>
                  Created {new Date(plan.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={plan.status === 'active' ? 'ds-badge-green' : 'ds-badge-gray'}>{plan.status}</span>
              <button className="ds-btn-outline" style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem' }} onClick={() => openEdit(plan)}>{t('coach.mealPlan.editBtn')}</button>
              <button
                style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', padding: 4 }}
                onClick={() => deletePlan(plan.id)}
              >
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Meal Plan Create / Edit Modal ── */}
      <CoachModal
        open={view !== 'list'}
        onClose={() => { setView('list'); setTitle(''); setDescription(''); setItems([]); setEditPlan(null); }}
        title={view === 'create' ? t('coach.mealPlan.newTitle') : t('coach.mealPlan.editTitle')}
        maxWidth={660}
      >
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label className="ds-label">{t('coach.mealPlan.planTitleLabel')}</label>
            <input className="ds-input" placeholder="e.g. Week 1 Cut Plan" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="ds-label">{t('coach.mealPlan.description')}</label>
            <textarea className="ds-input" placeholder="Notes about this plan..." value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ minHeight: 72, resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <p className="ds-section-title" style={{ marginBottom: '1rem' }}>{t('coach.mealPlan.mealItems')}</p>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.025)', borderRadius: 10 }}>
              <span className="ds-badge-gold" style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{item.meal_type.replace(/_/g, ' ')}</span>
              <span style={{ flex: 1, fontSize: '0.83rem', color: 'rgba(255,255,255,0.72)' }}>{item.food_name}</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)', whiteSpace: 'nowrap' }}>{item.grams}g</span>
              {item.calories && <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap' }}>{item.calories} kcal</span>}
              <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.6)', cursor: 'pointer', padding: 0 }}>
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <div className="coach-meal-add-row" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 80px 80px', gap: '0.6rem', marginTop: '1rem' }}>
            <Select
              value={newItem.meal_type}
              onChange={v => setNewItem(p => ({ ...p, meal_type: v }))}
              options={mealTypes.map(t => ({ value: t, label: t.replace(/_/g, ' ') }))}
              placeholder=""
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <input className="ds-input" placeholder="Food name (EN)" value={newItem.food_name} onChange={e => setNewItem(p => ({ ...p, food_name: e.target.value }))} />
              <input className="ds-input" dir="rtl" placeholder="اسم الطعام (AR)" value={newItem.food_name_ar ?? ''} onChange={e => setNewItem(p => ({ ...p, food_name_ar: e.target.value || null }))} />
            </div>
            <input className="ds-input" type="number" placeholder="g" value={newItem.grams || ''} onChange={e => setNewItem(p => ({ ...p, grams: Number(e.target.value) }))} />
            <input className="ds-input" type="number" placeholder="kcal" value={newItem.calories ?? ''} onChange={e => setNewItem(p => ({ ...p, calories: e.target.value ? Number(e.target.value) : null }))} />
          </div>
          <button className="ds-btn-outline" style={{ marginTop: '0.75rem' }} onClick={addItem}>
            {t('coach.mealPlan.addItem')}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="ds-btn-gold" disabled={saving || !title.trim()} onClick={savePlan}>
            {saving ? t('coach.mealPlan.saving') : t('coach.mealPlan.savePlan')}
          </button>
          <button className="ds-btn-outline" onClick={() => { setView('list'); setTitle(''); setDescription(''); setItems([]); setEditPlan(null); }}>
            {t('coach.cancelBtn')}
          </button>
        </div>
      </CoachModal>
    </div>
  );
}

/* ─── Video Picker Modal ──────────────────────────────── */
function VideoPickerModal({ videos, onSelect, onClose, t }: {
  videos: WorkoutVideo[];
  onSelect: (url: string) => void;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const [pasteUrl, setPasteUrl] = useState('');

  const confirmPaste = () => {
    const trimmed = pasteUrl.trim();
    if (!trimmed) return;
    onSelect(trimmed);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}>
      <div className="ds-modal-inner" style={{ background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 640, maxHeight: '80vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <p style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{t('coach.workout.selectVideo')}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
        </div>

        {/* Paste URL option */}
        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 10 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: '0.6rem' }}>Paste a video URL</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="ds-input"
              style={{ flex: 1 }}
              placeholder="https://youtube.com/... or Cloudinary URL"
              value={pasteUrl}
              onChange={e => setPasteUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmPaste(); }}
            />
            <button
              className="ds-btn-gold"
              style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
              disabled={!pasteUrl.trim()}
              onClick={confirmPaste}>
              Use URL
            </button>
          </div>
        </div>

        {videos.length > 0 && (
          <>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Or pick from library</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {videos.map(v => (
                <button key={v.id} onClick={() => onSelect(v.cloudinary_url)}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 0, cursor: 'pointer', overflow: 'hidden', textAlign: 'left' }}>
                  {v.thumbnail_url ? (
                    <img src={v.thumbnail_url} alt={v.title} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: 100, background: 'rgba(201,168,76,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg style={{ width: 24, height: 24, color: 'rgba(201,168,76,0.3)' }} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  )}
                  <div style={{ padding: '0.5rem 0.6rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</p>
                    {v.duration && <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{Math.floor(v.duration / 60)}:{String(Math.round(v.duration % 60)).padStart(2, '0')}</p>}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {videos.length === 0 && (
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '1rem 0' }}>{t('coach.workout.noVideos')}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Workout Builder ─────────────────────────────────── */
function WorkoutBuilderTab({ clients, preselectedClientId }: { clients: ClientProfile[]; preselectedClientId: string | null }) {
  const { t } = useLanguage();
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId ?? '');
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editPlan, setEditPlan] = useState<WorkoutPlan | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [saving, setSaving] = useState(false);
  // Video picker
  const [videos, setVideos] = useState<WorkoutVideo[]>([]);
  const [pickerTarget, setPickerTarget] = useState<{ dayIdx: number; exIdx: number } | null>(null);

  useEffect(() => {
    fetch('/api/admin/list-videos').then(r => r.json()).then(j => setVideos(j.videos ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (preselectedClientId) setSelectedClientId(preselectedClientId);
  }, [preselectedClientId]);

  useEffect(() => {
    if (!selectedClientId) return;
    supabase.from('workout_plans').select('*').eq('client_id', selectedClientId).order('created_at', { ascending: false })
      .then(({ data }) => setPlans(data ?? []));
  }, [selectedClientId]);

  const addDay = () => {
    const num = days.length + 1;
    setDays(prev => [...prev, {
      day_number: num,
      day_label: `Day ${num}`,
      focus: null,
      exercises: [],
    }]);
  };

  const updateDay = (idx: number, field: keyof WorkoutDay, value: string) => {
    setDays(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const addExercise = (dayIdx: number) => {
    setDays(prev => prev.map((d, i) => i === dayIdx ? {
      ...d,
      exercises: [...d.exercises, {
        exercise_name: '',
        exercise_name_ar: null,
        exercise_category: null,
        sets: null,
        reps: null,
        rest_seconds: null,
        notes: null,
        video_url: null,
        sort_order: d.exercises.length,
      }],
    } : d));
  };

  const updateExercise = (dayIdx: number, exIdx: number, field: string, value: string | number | null) => {
    setDays(prev => prev.map((d, i) => i === dayIdx ? {
      ...d,
      exercises: d.exercises.map((e, j) => j === exIdx ? { ...e, [field]: value } : e),
    } : d));
  };

  const openEdit = async (plan: WorkoutPlan) => {
    setEditPlan(plan);
    setTitle(plan.title);
    setDescription(plan.description ?? '');
    const { data: planDays } = await supabase.from('workout_plan_days').select('*').eq('workout_plan_id', plan.id).order('day_number');
    const loadedDays: WorkoutDay[] = [];
    for (const d of planDays ?? []) {
      const { data: exs } = await supabase.from('workout_exercises').select('*').eq('workout_day_id', d.id).order('sort_order');
      loadedDays.push({ ...d, exercises: exs ?? [] });
    }
    setDays(loadedDays);
    setView('edit');
  };

  const savePlan = async () => {
    if (!selectedClientId || !title.trim()) return;
    setSaving(true);
    const coachId = (await supabase.auth.getUser()).data.user?.id;

    let planId: string;
    if (view === 'create') {
      const { data: plan, error } = await supabase.from('workout_plans').insert({
        client_id: selectedClientId, coach_id: coachId, title: title.trim(),
        description: description.trim() || null, status: 'active',
      }).select().single();
      if (error || !plan) { setSaving(false); return; }
      planId = plan.id;
    } else if (editPlan) {
      await supabase.from('workout_plans').update({ title: title.trim(), description: description.trim() || null }).eq('id', editPlan.id);
      // delete old days (cascade deletes exercises)
      await supabase.from('workout_plan_days').delete().eq('workout_plan_id', editPlan.id);
      planId = editPlan.id;
    } else { setSaving(false); return; }

    for (const day of days) {
      const { data: dayRow } = await supabase.from('workout_plan_days').insert({
        workout_plan_id: planId, day_number: day.day_number,
        day_label: day.day_label, focus: day.focus || null,
      }).select().single();
      if (dayRow && day.exercises.length > 0) {
        await supabase.from('workout_exercises').insert(
          day.exercises.map((e, idx) => ({ exercise_name: e.exercise_name, exercise_name_ar: e.exercise_name_ar ?? null, exercise_category: e.exercise_category ?? null, sets: e.sets, reps: e.reps, rest_seconds: e.rest_seconds, notes: e.notes, video_url: e.video_url ?? null, workout_day_id: dayRow.id, sort_order: idx }))
        );
      }
    }

    const { data: updated } = await supabase.from('workout_plans').select('*').eq('client_id', selectedClientId).order('created_at', { ascending: false });
    setPlans(updated ?? []);
    setView('list'); setTitle(''); setDescription(''); setDays([]); setEditPlan(null);
    setSaving(false);
  };

  const deletePlan = async (id: string) => {
    await supabase.from('workout_plans').delete().eq('id', id);
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="ds-section-title">{t('coach.workout.sectionTitle')}</p>
          <p className="ds-section-sub">{t('coach.workout.sectionSub')}</p>
        </div>
        {selectedClientId && (
          <button className="ds-btn-gold" onClick={() => setView('create')}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t('coach.workout.newPlan')}
          </button>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="ds-label">{t('coach.mealPlan.selectClient')}</label>
        <Select
          value={selectedClientId}
          onChange={setSelectedClientId}
          placeholder={t('coach.mealPlan.chooseClient')}
          options={clients.map(c => ({ value: c.id, label: c.full_name ?? c.email }))}
        />
      </div>

      {selectedClientId && plans.length === 0 ? (
        <div className="ds-empty">
          <div className="ds-empty-icon">
            <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <p>{t('coach.workout.noPlans')}</p>
          <small>{t('coach.workout.noPlansCreate')}</small>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {plans.map(plan => (
            <div key={plan.id} className="ds-card coach-plan-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="ds-icon-box">
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{plan.title}</p>
                {plan.description && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.32)', marginTop: 2 }}>{plan.description}</p>}
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.22)', marginTop: 3 }}>
                  Created {new Date(plan.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={plan.status === 'active' ? 'ds-badge-green' : 'ds-badge-gray'}>{plan.status}</span>
              <button className="ds-btn-outline" style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem' }} onClick={() => openEdit(plan)}>{t('coach.workout.editBtn')}</button>
              <button style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', padding: 4 }} onClick={() => deletePlan(plan.id)}>
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Workout Plan Create / Edit Modal ── */}
      <CoachModal
        open={view !== 'list'}
        onClose={() => { setView('list'); setTitle(''); setDescription(''); setDays([]); setEditPlan(null); }}
        title={view === 'create' ? t('coach.workout.newTitle') : t('coach.workout.editTitle')}
        maxWidth={720}
      >
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label className="ds-label">{t('coach.workout.planTitleLabel')}</label>
            <input className="ds-input" placeholder="e.g. 4-Week Strength Program" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="ds-label">{t('coach.workout.description')}</label>
            <textarea className="ds-input" placeholder="Overview of this program..." value={description}
              onChange={e => setDescription(e.target.value)} style={{ minHeight: 72, resize: 'vertical' }} />
          </div>
        </div>

        {/* ── Days ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {days.map((day, dayIdx) => (
          <div key={dayIdx} style={{ border: '1px solid rgba(201,168,76,0.18)', borderRadius: 14, overflow: 'hidden' }}>

            {/* Day header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.1rem', background: 'rgba(201,168,76,0.05)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Day number badge */}
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(201,168,76,0.14)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#C9A84C' }}>{dayIdx + 1}</span>
              </div>
              {/* Day label */}
              <input
                className="ds-input"
                placeholder="Day name (e.g. Push Day)"
                value={day.day_label}
                onChange={e => updateDay(dayIdx, 'day_label', e.target.value)}
                style={{ flex: 1, minWidth: 120, fontWeight: 600 }}
              />
              {/* Focus area */}
              <input
                className="ds-input"
                placeholder="Focus (e.g. Chest & Shoulders)"
                value={day.focus ?? ''}
                onChange={e => updateDay(dayIdx, 'focus', e.target.value)}
                style={{ flex: 1, minWidth: 140 }}
              />
              {/* Remove day */}
              <button
                onClick={() => setDays(prev => prev.filter((_, i) => i !== dayIdx))}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 7, color: 'rgba(248,113,113,0.6)', cursor: 'pointer', padding: '0.3rem 0.65rem', fontSize: '0.72rem', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.08)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.4)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.2)'; }}
              >
                <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                {t('coach.workout.removeDay')}
              </button>
            </div>

            {/* Exercises */}
            <div style={{ padding: '0.85rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', background: 'rgba(255,255,255,0.01)' }}>

              {/* Exercise column headers */}
              {day.exercises.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 68px 80px 80px 1fr 32px', gap: '0.5rem', padding: '0 0.1rem' }}>
                  {['Category','Exercise Name','Sets','Reps','Rest (s)','Notes',''].map((h, i) => (
                    <span key={i} style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>
                  ))}
                </div>
              )}

              {day.exercises.map((ex, exIdx) => (
                <div key={exIdx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '0.75rem 0.85rem' }}>

                  {/* Exercise number + main row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.55rem' }}>
                    {/* Index */}
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{exIdx + 1}</span>
                    </div>
                    {/* Fields grid */}
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '140px 1fr 68px 80px 80px 1fr 32px', gap: '0.5rem', alignItems: 'center' }}>
                      {/* Category */}
                      <Select
                        value={ex.exercise_category ?? ''}
                        onChange={v => updateExercise(dayIdx, exIdx, 'exercise_category', v || null)}
                        placeholder="Category"
                        searchable={false}
                        options={EXERCISE_CATEGORIES.map(c => ({ value: c, label: c }))}
                      />
                      {/* Exercise name EN + AR stacked */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <input className="ds-input" placeholder="Exercise name (EN)" value={ex.exercise_name}
                          onChange={e => updateExercise(dayIdx, exIdx, 'exercise_name', e.target.value)}
                          style={{ fontSize: '0.8rem' }} />
                        <input className="ds-input" dir="rtl" placeholder="اسم التمرين" value={ex.exercise_name_ar ?? ''}
                          onChange={e => updateExercise(dayIdx, exIdx, 'exercise_name_ar', e.target.value || null)}
                          style={{ fontSize: '0.8rem' }} />
                      </div>
                      {/* Sets */}
                      <input className="ds-input" type="number" placeholder="—" value={ex.sets ?? ''}
                        onChange={e => updateExercise(dayIdx, exIdx, 'sets', e.target.value ? Number(e.target.value) : null)}
                        style={{ textAlign: 'center', fontSize: '0.82rem' }} />
                      {/* Reps */}
                      <input className="ds-input" placeholder="—" value={ex.reps ?? ''}
                        onChange={e => updateExercise(dayIdx, exIdx, 'reps', e.target.value)}
                        style={{ textAlign: 'center', fontSize: '0.82rem' }} />
                      {/* Rest */}
                      <input className="ds-input" type="number" placeholder="—" value={ex.rest_seconds ?? ''}
                        onChange={e => updateExercise(dayIdx, exIdx, 'rest_seconds', e.target.value ? Number(e.target.value) : null)}
                        style={{ textAlign: 'center', fontSize: '0.82rem' }} />
                      {/* Notes */}
                      <input className="ds-input" placeholder="Optional notes…" value={ex.notes ?? ''}
                        onChange={e => updateExercise(dayIdx, exIdx, 'notes', e.target.value)}
                        style={{ fontSize: '0.8rem' }} />
                      {/* Remove exercise */}
                      <button
                        onClick={() => setDays(prev => prev.map((d, i) => i === dayIdx ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIdx) } : d))}
                        style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 7, color: 'rgba(248,113,113,0.55)', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.14)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.06)'; }}
                      >
                        <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>

                  {/* Video row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingLeft: '1.85rem' }}>
                    {ex.video_url ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 6, padding: '0.25rem 0.65rem' }}>
                        <svg style={{ width: 11, height: 11, color: '#C9A84C', flexShrink: 0 }} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(201,168,76,0.85)', fontWeight: 500 }}>{t('coach.workout.videoAttached')}</span>
                        <button onClick={() => setPickerTarget({ dayIdx, exIdx })}
                          style={{ background: 'none', border: 'none', fontSize: '0.68rem', color: 'rgba(201,168,76,0.55)', cursor: 'pointer', padding: 0 }}>{t('coach.workout.changeVideo')}</button>
                        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem' }}>·</span>
                        <button onClick={() => updateExercise(dayIdx, exIdx, 'video_url', null)}
                          style={{ background: 'none', border: 'none', fontSize: '0.68rem', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', padding: 0 }}>{t('coach.workout.removeVideo')}</button>
                      </div>
                    ) : (
                      <button onClick={() => setPickerTarget({ dayIdx, exIdx })}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 6, padding: '0.22rem 0.6rem', fontSize: '0.69rem', color: 'rgba(255,255,255,0.28)', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201,168,76,0.3)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(201,168,76,0.6)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.28)'; }}
                      >
                        <svg style={{ width: 11, height: 11 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72m0 0-5.47.75m5.47-.75-3.53 5.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                        {t('coach.workout.attachVideo')}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add exercise button */}
              <button
                className="ds-btn-outline"
                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, padding: '0.45rem 0.9rem', fontSize: '0.75rem', marginTop: day.exercises.length > 0 ? '0.25rem' : 0 }}
                onClick={() => addExercise(dayIdx)}
              >
                <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                {t('coach.workout.addExercise')}
              </button>
            </div>
          </div>
        ))}
        </div>

        {/* ── Modal footer actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            className="ds-btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={addDay}
          >
            <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            {t('coach.workout.addDay')}
          </button>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button className="ds-btn-outline" onClick={() => { setView('list'); setTitle(''); setDescription(''); setDays([]); setEditPlan(null); }}>
              {t('coach.cancelBtn')}
            </button>
            <button className="ds-btn-gold" disabled={saving || !title.trim()} onClick={savePlan}>
              {saving ? t('coach.workout.saving') : t('coach.workout.savePlan')}
            </button>
          </div>
        </div>

        {/* ── Video Picker Modal (kept as-is, nested inside workout modal) ── */}
        {pickerTarget && (
          <VideoPickerModal
            videos={videos}
            onSelect={(url) => {
              updateExercise(pickerTarget.dayIdx, pickerTarget.exIdx, 'video_url', url);
              setPickerTarget(null);
            }}
            onClose={() => setPickerTarget(null)}
            t={t}
          />
        )}
      </CoachModal>
    </div>
  );
}

/* ─── Progress Monitor ────────────────────────────────── */
interface BodyCheck { id: string; file_url: string; file_type: string; uploaded_at: string; }

function ProgressTab({ clients }: { clients: ClientProfile[] }) {
  const { t } = useLanguage();
  const [selectedClientId, setSelectedClientId] = useState('');
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [bodyChecks, setBodyChecks] = useState<BodyCheck[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedClientId) return;
    setLoading(true);
    Promise.all([
      supabase.from('progress_logs').select('*').eq('user_id', selectedClientId).order('logged_at', { ascending: false }),
      supabase.from('body_checks').select('*').eq('user_id', selectedClientId).order('uploaded_at', { ascending: false }),
    ]).then(([logsRes, checksRes]) => {
      setLogs(logsRes.data ?? []);
      setBodyChecks(checksRes.data ?? []);
      setLoading(false);
    });
  }, [selectedClientId]);

  const isImage = (type: string) => type.startsWith('image/');

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <p className="ds-section-title">{t('coach.progress.title')}</p>
        <p className="ds-section-sub">{t('coach.progress.sub')}</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="ds-label">{t('coach.mealPlan.selectClient')}</label>
        <Select
          value={selectedClientId}
          onChange={setSelectedClientId}
          placeholder={t('coach.mealPlan.chooseClient')}
          options={clients.map(c => ({ value: c.id, label: c.full_name ?? c.email }))}
        />
      </div>

      {loading && <SkProgressMonitor />}

      {!loading && selectedClientId && logs.length === 0 && bodyChecks.length === 0 && (
        <div className="ds-empty">
          <div className="ds-empty-icon">
            <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </div>
          <p>{t('coach.progress.noData')}</p>
          <small>{t('coach.progress.noDataSub')}</small>
        </div>
      )}

      {logs.length > 0 && (
        <div className="ds-card" style={{ overflowX: 'auto', marginBottom: 20 }}>
          <table className="ds-table">
            <thead>
              <tr>
                <th>{t('coach.progress.colDate')}</th>
                <th>{t('coach.progress.colWeight')}</th>
                <th>{t('client.bodyFatPct')}</th>
                <th>{t('client.muscleMassKg')}</th>
                <th>{t('coach.progress.colNotes')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{new Date(log.logged_at).toLocaleDateString()}</td>
                  <td style={{ color: 'rgba(255,255,255,0.82)' }}>{log.weight_kg != null ? `${log.weight_kg} kg` : '—'}</td>
                  <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>{log.body_fat_pct != null ? `${log.body_fat_pct}%` : '—'}</td>
                  <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>{log.muscle_mass_kg != null ? `${log.muscle_mass_kg} kg` : '—'}</td>
                  <td style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem' }}>{log.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {bodyChecks.length > 0 && (
        <div className="ds-card" style={{ padding: '1.5rem' }}>
          <p style={{ fontWeight: 600, color: 'white', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {t('coach.progress.bodyChecks')}
            <span style={{ marginLeft: 8, fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>{bodyChecks.length} file{bodyChecks.length !== 1 ? 's' : ''}</span>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {bodyChecks.map(bc => (
              <a key={bc.id} href={bc.file_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', transition: 'border-color 0.18s ease' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.35)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'}
                >
                  {isImage(bc.file_type) ? (
                    <img src={bc.file_url} alt="body check" style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ height: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(201,168,76,0.04)' }}>
                      <svg style={{ width: 32, height: 32, color: 'rgba(201,168,76,0.5)' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>PDF</span>
                    </div>
                  )}
                  <div style={{ padding: '0.5rem 0.65rem' }}>
                    <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>
                      {new Date(bc.uploaded_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Messages ────────────────────────────────────────── */
function MessagesTab({
  coachId,
  clients,
  preselectedClientId,
}: {
  coachId: string;
  clients: ClientProfile[];
  preselectedClientId: string | null;
}) {
  const { t } = useLanguage();
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId ?? '');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (preselectedClientId) setSelectedClientId(preselectedClientId);
  }, [preselectedClientId]);

  const loadThread = useCallback(async (clientId: string) => {
    if (!clientId || !coachId) return;
    setLoadingThread(true);
    setMessages([]);
    setThreadId(null);

    try {
      let { data: thread, error: threadErr } = await supabase.from('message_threads')
        .select('id').eq('client_id', clientId).eq('coach_id', coachId).single();

      if (threadErr && threadErr.code !== 'PGRST116') {
        // unexpected DB error — thread load failed, bail out
        setLoadingThread(false);
        return;
      }

      if (!thread) {
        const { data: newThread } = await supabase.from('message_threads')
          .insert({ client_id: clientId, coach_id: coachId }).select().single();
        thread = newThread;
      }

      if (!thread) return;
      setThreadId(thread.id);

      const { data: msgs } = await supabase.from('messages').select('*').eq('thread_id', thread.id).order('created_at');
      setMessages(msgs ?? []);

      if (channelRef.current) { supabase.removeChannel(channelRef.current); }
      channelRef.current = supabase.channel(`coach-thread-${thread.id}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'messages',
          filter: `thread_id=eq.${thread.id}`,
        }, payload => {
          setMessages(prev => {
            if (prev.find(m => m.id === (payload.new as ChatMessage).id)) return prev;
            return [...prev, payload.new as ChatMessage];
          });
        })
        .subscribe();
    } catch {
      // silent
    } finally {
      setLoadingThread(false);
    }
  }, [coachId]);

  useEffect(() => {
    if (selectedClientId) loadThread(selectedClientId);
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [selectedClientId, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !threadId || sending) return;
    const text = input.trim();
    setInput('');
    // Optimistic update — show immediately
    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = { id: tempId, thread_id: threadId, sender_id: coachId, content: text, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    setSending(true);
    const { data } = await supabase.from('messages').insert({ thread_id: threadId, sender_id: coachId, content: text }).select('*').single();
    // Replace temp with real record
    if (data) setMessages(prev => prev.map(m => m.id === tempId ? data as ChatMessage : m));
    setSending(false);
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="coach-messages-root" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', minHeight: 560, gap: '1rem' }}>
      <div style={{ flexShrink: 0 }}>
        <p dir="auto" className="ds-section-title" style={{ marginBottom: '0.75rem' }}>{t('coach.messages')}</p>
        <Select
          value={selectedClientId}
          onChange={setSelectedClientId}
          placeholder={t('coach.messages.selectClient')}
          options={clients.map(c => ({ value: c.id, label: c.full_name ?? c.email }))}
        />
      </div>

      {selectedClient && (
        <div className="coach-chat-box" style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden',
        }}>
          {/* Chat header */}
          <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.22)',
              fontSize: 11, fontWeight: 700, color: '#C9A84C',
            }}>
              {selectedClient.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? 'U'}
            </div>
            <div>
              <p style={{ fontSize: '0.83rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{selectedClient.full_name ?? 'Client'}</p>
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>{selectedClient.email}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="ds-no-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {loadingThread && <SkMessages />}
            {!loadingThread && messages.length === 0 && (
              <div style={{ textAlign: 'center', margin: 'auto' }}>
                <p dir="auto" style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.28)' }}>{t('coach.noMessages')}</p>
              </div>
            )}
            {messages.map(msg => {
              const isCoach = msg.sender_id === coachId;
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isCoach ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '70%', padding: '0.65rem 1rem',
                    borderRadius: isCoach ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isCoach ? 'rgba(201,168,76,0.14)' : 'rgba(255,255,255,0.06)',
                    border: isCoach ? '1px solid rgba(201,168,76,0.25)' : '1px solid rgba(255,255,255,0.08)',
                    fontSize: '0.84rem', color: 'rgba(255,255,255,0.82)',
                    lineHeight: 1.45,
                  }}>
                    {msg.content}
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', marginTop: 4, textAlign: 'right' }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.65rem' }}>
            <input
              className="ds-input"
              placeholder={t('coach.messagePlaceholder')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              style={{ flex: 1 }}
            />
            <button
              className="ds-btn-gold"
              style={{ flexShrink: 0, padding: '0.65rem 1.1rem' }}
              onClick={sendMessage}
              disabled={sending || !input.trim()}
            >
              <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {!selectedClientId && (
        <div className="ds-empty" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="ds-empty-icon">
            <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <p dir="auto">{t('coach.selectClient')}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Coach Profile Tab ───────────────────────────────── */
function CoachProfileTab() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('profiles').select('full_name, phone, bio, specialization').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) setFullName(data.full_name);
        if (data?.phone) setPhone(data.phone ?? '');
        if (data?.bio) setBio(data.bio ?? '');
        if (data?.specialization) setSpecialization(data.specialization ?? '');
      });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName.trim(), phone: phone.trim(), bio: bio.trim(), specialization: specialization.trim() }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/reset-password` });
    setResetLoading(false);
    setResetSent(true);
  };

  const initials = (fullName || user?.email || '?').split(' ').map((w: string) => w[0]).slice(0,2).join('').toUpperCase();
  const memberSince = user?.profile?.created_at ? new Date(user.profile.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long' }) : '—';

  const inputStyle: CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.7rem 0.9rem', fontSize: '0.875rem', color: 'white', outline: 'none' };
  const labelStyle: CSSProperties = { fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' };
  const cardStyle: CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', marginBottom: '1rem' };

  return (
    <div style={{ maxWidth: 580, margin: '0 auto', padding: '0 0 2rem' }}>
      {/* Avatar + name header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8CC6E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: '#0B0B0B', flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: 2 }}>{fullName || user?.email}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 20, background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coach</span>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{t('client.memberSince')}: {memberSince}</p>
          </div>
        </div>
      </div>

      {/* Account info (read-only) */}
      <div style={cardStyle}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('client.accountInfo')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={labelStyle}>{t('client.emailAddress')}</p>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', wordBreak: 'break-all' }}>{user?.email ?? '—'}</p>
          </div>
          <div>
            <p style={labelStyle}>{t('client.memberSince')}</p>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>{memberSince}</p>
          </div>
        </div>
      </div>

      {/* Editable profile info */}
      <div style={cardStyle}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('client.personalInfo')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={labelStyle}>{t('client.fullName')}</p>
              <input style={inputStyle} value={fullName} onChange={e => setFullName(e.target.value)} placeholder={isRTL ? 'الاسم الكامل' : 'Your full name'} />
            </div>
            <div>
              <p style={labelStyle}>{t('client.phone')}</p>
              <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder={isRTL ? 'رقم الهاتف' : '+971 50 000 0000'} />
            </div>
          </div>
          <div>
            <p style={labelStyle}>{isRTL ? 'التخصص' : 'Specialization'}</p>
            <input style={inputStyle} value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder={isRTL ? 'مثال: بناء العضلات، فقدان الوزن' : 'e.g. Muscle Building, Weight Loss'} />
          </div>
          <div>
            <p style={labelStyle}>{isRTL ? 'نبذة تعريفية' : 'Bio'}</p>
            <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={bio} onChange={e => setBio(e.target.value)} placeholder={isRTL ? 'اكتب نبذة قصيرة عنك…' : 'Write a short bio about yourself…'} />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: '1.25rem', padding: '0.7rem 1.75rem', background: saved ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg, #C9A84C 0%, #E8CC6E 50%, #C9A84C 100%)', border: saved ? '1px solid rgba(34,197,94,0.4)' : 'none', borderRadius: 10, color: saved ? '#4ade80' : '#0B0B0B', fontWeight: 700, fontSize: '0.8rem', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s' }}
        >
          {saving ? t('client.saving') : saved ? t('client.saved') : t('client.saveChanges')}
        </button>
      </div>

      {/* Change password */}
      <div style={cardStyle}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('client.changePassword')}</p>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
          {isRTL ? 'سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.' : 'A password reset link will be sent to your email address.'}
        </p>
        {resetSent ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10 }}>
            <svg style={{ width: 16, height: 16, color: '#4ade80', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
            <p style={{ fontSize: '0.8rem', color: '#4ade80' }}>{t('client.resetEmailSent')}</p>
          </div>
        ) : (
          <button
            onClick={handlePasswordReset}
            disabled={resetLoading}
            style={{ padding: '0.65rem 1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.8rem', cursor: resetLoading ? 'default' : 'pointer', opacity: resetLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
            {resetLoading ? '…' : t('client.sendResetEmail')}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────── */
export default function CoachDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  // Role guard — redirect non-coaches away
  useEffect(() => {
    if (user?.profile && user.profile.role !== 'coach' && user.profile.role !== 'admin') {
      router.replace('/dashboard/client');
    }
  }, [user?.profile?.role, router]);

  const navItems: NavItem[] = [
    { id: 'overview',        label: t('client.overview'),      icon: CoachNavIcons.overview },
    { id: 'clients',         label: t('coach.clients'),        icon: CoachNavIcons.clients },
    { id: 'meal-builder',    label: t('coach.mealBuilder'),    icon: CoachNavIcons.mealBuilder },
    { id: 'workout-builder', label: t('coach.workoutBuilder'), icon: CoachNavIcons.workoutBuilder },
    { id: 'progress',        label: t('coach.progress'),       icon: CoachNavIcons.progress },
    { id: 'messages',        label: t('coach.messages'),       icon: CoachNavIcons.messages },
    { id: 'profile',         label: t('coach.profile'),        icon: CoachNavIcons.settings },
  ];
  const [activeTab, setActiveTab] = useState('overview');
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // For cross-tab navigation with pre-selected client
  const [deepLinkClientId, setDeepLinkClientId] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    // Don't start fetching until auth has fully resolved
    if (authLoading) return;
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);

    // Hard timeout — if queries stall (RLS, network, etc.) we still unlock the UI
    const timeout = setTimeout(() => {
      console.warn('[coach] loadClients timed out after 10s');
      setLoading(false);
    }, 10_000);

    try {
      const { data: assignments, error } = await supabase
        .from('trainer_client_assignments')
        .select(`
          client_id,
          assigned_at,
          client:profiles!trainer_client_assignments_client_id_fkey (
            id, full_name, email, onboarding_completed
          )
        `)
        .eq('trainer_id', user.id);

      if (error) {
        console.error('[coach] trainer_client_assignments error:', error.message);
        setClients([]);
        return;
      }

      if (!assignments || assignments.length === 0) {
        setClients([]);
        return;
      }

      const clientIds = assignments.map(a => a.client_id);

      const { data: subs } = await supabase
        .from('subscriptions')
        .select('user_id, status')
        .in('user_id', clientIds)
        .eq('status', 'active');

      const activeSubIds = new Set((subs ?? []).map(s => s.user_id));

      const merged: ClientProfile[] = assignments.map(a => {
        const profile = (Array.isArray(a.client) ? a.client[0] : a.client) as { id: string; full_name: string | null; email?: string | null; onboarding_completed: boolean } | null;
        return {
          id: a.client_id,
          full_name: profile?.full_name ?? null,
          email: profile?.email ?? `${a.client_id.slice(0, 8)}…`,
          onboarding_completed: profile?.onboarding_completed ?? false,
          subscription_status: activeSubIds.has(a.client_id) ? 'active' : undefined,
          assigned_at: a.assigned_at,
        };
      });

      setClients(merged);
    } catch (err) {
      console.error('[coach] loadClients exception:', err);
      setClients([]);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const navigateWithClient = (tab: string, clientId?: string) => {
    if (clientId) setDeepLinkClientId(clientId);
    setActiveTab(tab);
  };

  if (authLoading || loading) {
    return (
      <DashboardShell role="coach" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
        <SkDashboardInit role="coach" />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="coach" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && (
        <OverviewTab clients={clients} onNavigate={setActiveTab} />
      )}
      {activeTab === 'clients' && user && (
        <ClientsTab
          clients={clients}
          coachId={user.id}
          onOpenChat={(id) => navigateWithClient('messages', id)}
          onBuildMeal={(id) => navigateWithClient('meal-builder', id)}
          onBuildWorkout={(id) => navigateWithClient('workout-builder', id)}
          onRefresh={loadClients}
        />
      )}
      {activeTab === 'meal-builder' && (
        <MealBuilderTab clients={clients} preselectedClientId={deepLinkClientId} />
      )}
      {activeTab === 'workout-builder' && (
        <WorkoutBuilderTab clients={clients} preselectedClientId={deepLinkClientId} />
      )}
      {activeTab === 'progress' && (
        <ProgressTab clients={clients} />
      )}
      {activeTab === 'messages' && user?.id && (
        <MessagesTab coachId={user.id} clients={clients} preselectedClientId={deepLinkClientId} />
      )}
      {activeTab === 'profile' && (
        <CoachProfileTab />
      )}
    </DashboardShell>
  );
}
