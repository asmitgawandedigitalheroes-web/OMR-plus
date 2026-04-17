'use client';

import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell, { NavItem } from '@/components/dashboard/DashboardShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { SkMealPlan, SkWorkoutPlan, SkMessages, SkSubscription, SkOrders, SkDashboardInit, SkInline } from '@/components/ui/Skeleton';
import CustomSelect from '@/components/ui/Select';

/* ─── Icons ──────────────────────────────────────────── */
const Icons = {
  grid: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>,
  meal: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5M12 8.25V6.75m0 0c-1.354 0-2.7.055-4.024.166C6.845 6.885 6 7.647 6 8.55V6.75m6 1.5V6.75m6 1.5c-.224-.016-.449-.03-.676-.041m.676.041V6.75" /></svg>,
  bolt: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  chart: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>,
  chat: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>,
  card: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>,
  fire: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" /></svg>,
  arrow: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>,
  send: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>,
  upload: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>,
  check: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>,
  user: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>,
  receipt: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>,
  settings: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>,
};

/* navItems built inside component to support i18n — see component body */

/* ─── Types ──────────────────────────────────────────── */
interface MealPlanItem { id:string; meal_type:string; meal_timing:string|null; food_name:string; food_name_ar:string|null; quantity_g:number|null; calories:number|null; }
interface MealPlan { id:string; title:string; meal_plan_items: MealPlanItem[]; }
interface WorkoutExercise { id:string; exercise_name:string; exercise_name_ar:string|null; exercise_category:string|null; sets:number|null; reps:string|null; rest_seconds:number|null; notes:string|null; video_url:string|null; sort_order:number; }
interface WorkoutDay { id:string; day_label:string; focus:string|null; sort_order:number; workout_exercises: WorkoutExercise[]; }
interface WorkoutPlan { id:string; title:string; workout_plan_days: WorkoutDay[]; }
interface ProgressLog { id:string; weight_kg:number|null; body_fat_pct:number|null; muscle_mass_kg:number|null; notes:string|null; logged_at:string; }
interface Message { id:string; sender_id:string; content:string; created_at:string; }

/* ─── Onboarding Modal ───────────────────────────────── */
function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const total = 4;
  const [form, setForm] = useState({ goal:'', currentWeight:'', targetWeight:'', height:'', age:'', gender:'', activityLevel:'', dietaryRestrictions:'', healthConditions:'', experience:'' });
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const Chip = ({ label, field, value }: { label:string; field:string; value:string }) => {
    const active = (form as Record<string,string>)[field] === value;
    return (
      <button type="button" onClick={() => set(field, value)}
        className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
        style={{ background: active ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)', border: active ? '1px solid rgba(201,168,76,0.45)' : '1px solid rgba(255,255,255,0.08)', color: active ? '#C9A84C' : 'rgba(255,255,255,0.5)' }}>
        {label}
      </button>
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSubmitError('Session expired — please refresh the page.'); setSubmitting(false); return; }

      // Save onboarding responses (best-effort — don't block on this table)
      const dietaryArr = form.dietaryRestrictions
        ? form.dietaryRestrictions.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const { error: onboardErr } = await supabase.from('onboarding_responses').upsert({
        user_id: user.id,
        fitness_goal: form.goal,
        current_weight_kg: form.currentWeight ? parseFloat(form.currentWeight) : null,
        target_weight_kg: form.targetWeight ? parseFloat(form.targetWeight) : null,
        height_cm: form.height ? parseFloat(form.height) : null,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender,
        activity_level: form.activityLevel,
        dietary_restrictions: dietaryArr,
        health_conditions: form.healthConditions,
        experience_level: form.experience,
      }, { onConflict: 'user_id' });

      // Log but don't block — table may not exist yet in all environments
      if (onboardErr) console.warn('[onboarding] onboarding_responses upsert failed:', onboardErr.message);

      // Mark onboarding complete on the profile — this is the critical step
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (profileErr) {
        console.error('[onboarding] profiles update failed:', profileErr.message);
        setSubmitError('Could not save your profile. Please try again.');
        setSubmitting(false);
        return;
      }

      onComplete();
    } catch (err) {
      console.error('[onboarding] unexpected error:', err);
      setSubmitError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', background:'rgba(0,0,0,0.88)', backdropFilter:'blur(8px)' }}>
      <div className="cd-onboarding-box">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.75rem' }}>
          <div>
            <p style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)' }}>Step {step} of {total}</p>
            <div style={{ display:'flex', gap:6, marginTop:8 }}>
              {Array.from({length:total}).map((_,i) => <div key={i} style={{ height:3, width:36, borderRadius:4, background: i<step ? '#C9A84C' : 'rgba(255,255,255,0.1)', transition:'background 0.3s' }} />)}
            </div>
          </div>
        </div>

        {step===1 && <div>
          <h2 style={{ fontSize:'1.5rem', fontWeight:700, color:'white', marginBottom:6 }}>{t('client.onboarding.welcome')}</h2>
          <p style={{ fontSize:'0.83rem', color:'rgba(255,255,255,0.38)', marginBottom:'1.5rem' }}>{t('client.onboarding.primaryGoal')}</p>
          <div className="cd-chips-grid">
            {['Muscle Building','Fat Loss','Summer Body','General Fitness','Workout Only','Meal Plan Only'].map(g => <Chip key={g} label={g} value={g} field="goal" />)}
          </div>
        </div>}

        {step===2 && <div>
          <h2 style={{ fontSize:'1.5rem', fontWeight:700, color:'white', marginBottom:6 }}>{t('client.onboarding.bodyStats')}</h2>
          <p style={{ fontSize:'0.83rem', color:'rgba(255,255,255,0.38)', marginBottom:'1.5rem' }}>{t('client.onboarding.bodyStatsSub')}</p>
          <div className="cd-bodystats-input-grid">
            {[{label:'Current Weight (kg)',key:'currentWeight',ph:'75'},{label:'Target Weight (kg)',key:'targetWeight',ph:'70'},{label:'Height (cm)',key:'height',ph:'175'},{label:'Age',key:'age',ph:'28'}].map(f=>(
              <div key={f.key}><label className="ds-label">{f.label}</label><input type="number" className="ds-input" placeholder={f.ph} value={(form as Record<string,string>)[f.key]} onChange={e=>set(f.key,e.target.value)} /></div>
            ))}
            <div style={{ gridColumn:'span 2' }}>
              <label className="ds-label">{t('client.onboarding.gender')}</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>

                {/* ── Male card ── */}
                {(['Male','Female'] as const).map(g => {
                  const isMale = g === 'Male';
                  const active = form.gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set('gender', g)}
                      style={{
                        display:'flex', alignItems:'center', gap:'0.75rem',
                        padding:'0.85rem 1rem',
                        background: active ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${active ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.09)'}`,
                        borderRadius:12, cursor:'pointer',
                        transition:'all 0.2s ease', outline:'none', textAlign:'left',
                      }}
                    >
                      {/* Icon circle */}
                      <span style={{
                        width:36, height:36, borderRadius:'50%', flexShrink:0,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        background: active ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${active ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        transition:'all 0.2s ease',
                      }}>
                        {isMale ? (
                          /* ♂ male symbol */
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                            stroke={active ? '#C9A84C' : 'rgba(255,255,255,0.35)'}
                            strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="10" cy="14" r="5.5"/>
                            <path d="M19.5 4.5l-5.5 5.5M14 4.5h5.5V10"/>
                          </svg>
                        ) : (
                          /* ♀ female symbol */
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                            stroke={active ? '#C9A84C' : 'rgba(255,255,255,0.35)'}
                            strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8.5" r="5.5"/>
                            <path d="M12 14v6.5M9 18h6"/>
                          </svg>
                        )}
                      </span>

                      {/* Label */}
                      <div>
                        <div style={{
                          fontSize:'0.84rem', fontWeight:600,
                          color: active ? '#C9A84C' : 'rgba(255,255,255,0.72)',
                          lineHeight:1.2, transition:'color 0.2s',
                        }}>{g}</div>
                        <div style={{ fontSize:'0.64rem', color:'rgba(255,255,255,0.27)', marginTop:2 }}>
                          {isMale ? 'He / Him' : 'She / Her'}
                        </div>
                      </div>

                      {/* Check badge when active */}
                      {active && (
                        <span style={{
                          marginLeft:'auto', width:18, height:18, borderRadius:'50%', flexShrink:0,
                          background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.4)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                        }}>
                          <svg width="9" height="9" fill="none" stroke="#C9A84C" strokeWidth="2.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}

              </div>
            </div>
          </div>
        </div>}

        {step===3 && <div>
          <h2 style={{ fontSize:'1.5rem', fontWeight:700, color:'white', marginBottom:6 }}>{t('client.onboarding.activity')}</h2>
          <p style={{ fontSize:'0.83rem', color:'rgba(255,255,255,0.38)', marginBottom:'1.5rem' }}>{t('client.onboarding.activitySub')}</p>

          {/* ── Activity Level ── */}
          <label className="ds-label" style={{ marginBottom:10, display:'block' }}>{t('client.onboarding.activityLevel')}</label>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:'1.5rem' }}>
            {([
              { value:'Sedentary (desk job)',          label:'Sedentary',        sub:'Little to no exercise, desk job',       bars:1,
                icon:<svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z"/><path d="M6 19v2M18 19v2"/></svg> },
              { value:'Lightly Active (1–3x/week)',    label:'Lightly Active',   sub:'Light exercise 1–3 times per week',     bars:2,
                icon:<svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/><path d="m7.5 13.5 2-4.5 2.5 2 2-2.5 2 4"/><path d="M3 20h18"/><path d="M5 20V10"/><path d="M19 20V10"/></svg> },
              { value:'Moderately Active (3–5x/week)', label:'Moderately Active', sub:'Regular workouts 3–5 times per week',  bars:3,
                icon:<svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="m9 10-3 7"/><path d="m15 10 3 7"/></svg> },
              { value:'Very Active (6–7x/week)',        label:'Very Active',       sub:'Intense training almost every day',   bars:4,
                icon:<svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
            ] as { value:string; label:string; sub:string; bars:number; icon:React.ReactNode }[]).map(({ value, label, sub, bars, icon }) => {
              const active = form.activityLevel === value;
              return (
                <button key={value} type="button" onClick={() => set('activityLevel', value)}
                  style={{
                    display:'flex', alignItems:'center', gap:'0.85rem',
                    padding:'0.85rem 1rem', width:'100%', textAlign:'left', cursor:'pointer',
                    background: active ? 'rgba(201,168,76,0.07)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${active ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius:12, outline:'none', transition:'all 0.2s ease',
                  }}>
                  {/* Icon circle */}
                  <span style={{
                    width:38, height:38, borderRadius:10, flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background: active ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${active ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    color: active ? '#C9A84C' : 'rgba(255,255,255,0.35)',
                    transition:'all 0.2s ease',
                  }}>{icon}</span>

                  {/* Text */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'0.85rem', fontWeight:600, color: active ? '#C9A84C' : 'rgba(255,255,255,0.78)', transition:'color 0.2s', lineHeight:1.2 }}>{label}</div>
                    <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.3)', marginTop:3 }}>{sub}</div>
                  </div>

                  {/* Intensity bars */}
                  <div style={{ display:'flex', gap:3, flexShrink:0 }}>
                    {[1,2,3,4].map(i => (
                      <span key={i} style={{
                        width:4, height: 8 + i * 4,
                        borderRadius:3,
                        background: i <= bars
                          ? (active ? '#C9A84C' : 'rgba(255,255,255,0.25)')
                          : 'rgba(255,255,255,0.07)',
                        transition:'background 0.2s',
                        alignSelf:'flex-end',
                      }} />
                    ))}
                  </div>

                  {/* Check */}
                  {active && (
                    <span style={{
                      width:18, height:18, borderRadius:'50%', flexShrink:0, marginLeft:4,
                      background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.4)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      <svg width="9" height="9" fill="none" stroke="#C9A84C" strokeWidth="2.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Training Experience ── */}
          <label className="ds-label" style={{ marginBottom:10, display:'block' }}>{t('client.onboarding.experience')}</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {([
              { value:'Beginner',     sub:'Under 1 year',  stars:1,
                icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Z"/><path d="M12 8v4l3 3"/></svg> },
              { value:'Intermediate', sub:'1 – 3 years',   stars:2,
                icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 20h12"/><path d="M8 20V10"/><path d="M12 20V4"/><path d="M16 20v-7"/></svg> },
              { value:'Advanced',     sub:'3+ years',      stars:3,
                icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
            ] as { value:string; sub:string; stars:number; icon:React.ReactNode }[]).map(({ value, sub, stars, icon }) => {
              const active = form.experience === value;
              return (
                <button key={value} type="button" onClick={() => set('experience', value)}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem',
                    padding:'1rem 0.6rem', textAlign:'center', cursor:'pointer',
                    background: active ? 'rgba(201,168,76,0.07)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${active ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius:12, outline:'none', transition:'all 0.2s ease',
                  }}>
                  {/* Icon */}
                  <span style={{
                    width:40, height:40, borderRadius:10,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background: active ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${active ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    color: active ? '#C9A84C' : 'rgba(255,255,255,0.35)',
                    transition:'all 0.2s ease',
                  }}>{icon}</span>

                  {/* Label */}
                  <div style={{ fontSize:'0.8rem', fontWeight:700, color: active ? '#C9A84C' : 'rgba(255,255,255,0.72)', transition:'color 0.2s', lineHeight:1.2 }}>{value}</div>

                  {/* Sub */}
                  <div style={{ fontSize:'0.63rem', color:'rgba(255,255,255,0.28)' }}>{sub}</div>

                  {/* Star dots */}
                  <div style={{ display:'flex', gap:3, marginTop:1 }}>
                    {[1,2,3].map(i => (
                      <span key={i} style={{
                        width:6, height:6, borderRadius:'50%',
                        background: i <= stars
                          ? (active ? '#C9A84C' : 'rgba(255,255,255,0.22)')
                          : 'rgba(255,255,255,0.07)',
                        transition:'background 0.2s',
                      }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>}

        {step===4 && (() => {
          /* helpers — toggle a tag in/out of a comma-separated string */
          const hasTag = (field: string, tag: string) =>
            (form as Record<string,string>)[field].split(',').map(s=>s.trim()).filter(Boolean).includes(tag);
          const toggleTag = (field: string, tag: string) => {
            const current = (form as Record<string,string>)[field].split(',').map(s=>s.trim()).filter(Boolean);
            const next = current.includes(tag) ? current.filter(t=>t!==tag) : [...current, tag];
            set(field, next.join(', '));
          };

          const TagBtn = ({ field, tag }: { field:string; tag:string }) => {
            const on = hasTag(field, tag);
            return (
              <button type="button" onClick={() => toggleTag(field, tag)}
                style={{
                  padding:'0.38rem 0.75rem', borderRadius:999, cursor:'pointer',
                  fontSize:'0.72rem', fontWeight:600, whiteSpace:'nowrap',
                  background: on ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${on ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.09)'}`,
                  color: on ? '#C9A84C' : 'rgba(255,255,255,0.4)',
                  outline:'none', transition:'all 0.18s ease',
                  display:'inline-flex', alignItems:'center', gap:'0.3rem',
                }}>
                {on && (
                  <svg width="9" height="9" fill="none" stroke="#C9A84C" strokeWidth="2.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                  </svg>
                )}
                {tag}
              </button>
            );
          };

          return (
            <div>
              <h2 style={{ fontSize:'1.5rem', fontWeight:700, color:'white', marginBottom:6 }}>{t('client.onboarding.health')}</h2>
              <p style={{ fontSize:'0.83rem', color:'rgba(255,255,255,0.38)', marginBottom:'1.5rem' }}>{t('client.onboarding.healthSub')}</p>

              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

                {/* ── Dietary Restrictions ── */}
                <div style={{
                  background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)',
                  borderRadius:14, padding:'1rem 1.1rem',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem' }}>
                    <span style={{
                      width:28, height:28, borderRadius:8, flexShrink:0,
                      background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      <svg width="14" height="14" fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                      </svg>
                    </span>
                    <label className="ds-label" style={{ margin:0 }}>{t('client.onboarding.dietaryLabel')}</label>
                  </div>

                  {/* Quick-select tags */}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'0.75rem' }}>
                    {['Vegetarian','Vegan','Halal','Keto','Gluten-Free','Lactose-Free','Dairy-Free','Nut Allergy','None'].map(tag=>(
                      <TagBtn key={tag} field="dietaryRestrictions" tag={tag} />
                    ))}
                  </div>

                  {/* Custom input */}
                  <input
                    type="text"
                    className="ds-input"
                    placeholder="Or type custom restrictions…"
                    value={form.dietaryRestrictions}
                    onChange={e=>set('dietaryRestrictions',e.target.value)}
                    style={{ fontSize:'0.8rem' }}
                  />
                </div>

                {/* ── Health Conditions ── */}
                <div style={{
                  background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)',
                  borderRadius:14, padding:'1rem 1.1rem',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem' }}>
                    <span style={{
                      width:28, height:28, borderRadius:8, flexShrink:0,
                      background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      <svg width="14" height="14" fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                      </svg>
                    </span>
                    <label className="ds-label" style={{ margin:0 }}>{t('client.onboarding.healthLabel')}</label>
                  </div>

                  {/* Quick-select tags */}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'0.75rem' }}>
                    {['None','Diabetes','Hypertension','Heart Condition','Knee Injury','Back Pain','Asthma','Thyroid','Osteoporosis'].map(tag=>(
                      <TagBtn key={tag} field="healthConditions" tag={tag} />
                    ))}
                  </div>

                  {/* Custom textarea */}
                  <textarea
                    className="ds-input"
                    placeholder="Or describe your conditions in detail…"
                    value={form.healthConditions}
                    onChange={e=>set('healthConditions',e.target.value)}
                    style={{ resize:'none', minHeight:72, fontSize:'0.8rem' }}
                  />
                </div>

                {/* ── Privacy notice ── */}
                <div style={{
                  display:'flex', alignItems:'flex-start', gap:'0.65rem',
                  background:'rgba(201,168,76,0.04)', border:'1px solid rgba(201,168,76,0.12)',
                  borderRadius:12, padding:'0.75rem 0.9rem',
                }}>
                  <svg style={{ flexShrink:0, marginTop:1 }} width="14" height="14" fill="none" stroke="rgba(201,168,76,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.28)', lineHeight:1.7, margin:0 }}>
                    {t('client.onboarding.privacy')}
                  </p>
                </div>

              </div>
            </div>
          );
        })()}

        {/* Submit error */}
        {submitError && step === total && (
          <div style={{
            marginTop:'1rem', display:'flex', alignItems:'center', gap:'0.5rem',
            background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.22)',
            borderRadius:10, padding:'0.65rem 0.9rem',
            fontSize:'0.78rem', color:'rgba(239,68,68,0.88)',
          }}>
            <svg style={{ width:14, height:14, flexShrink:0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
            </svg>
            {submitError}
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'1.5rem' }}>
          {step>1
            ? <button onClick={()=>setStep(s=>s-1)} className="ds-btn-outline" disabled={submitting}>{t('client.onboarding.back')}</button>
            : <div />}
          {step<total
            ? <button onClick={()=>setStep(s=>s+1)} className="ds-btn-gold" disabled={step===1&&!form.goal}>{t('client.onboarding.continue')}</button>
            : (
              <button onClick={handleSubmit} className="ds-btn-gold" disabled={submitting}
                style={{ display:'flex', alignItems:'center', gap:'0.5rem', minWidth:140, justifyContent:'center' }}>
                {submitting ? (
                  <>
                    <svg style={{ width:14, height:14, animation:'spin 0.8s linear infinite', flexShrink:0 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
                    </svg>
                    Saving…
                  </>
                ) : t('client.onboarding.complete')}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

/* ─── Client Modal ───────────────────────────────────── */
function ClientModal({ open, onClose, title, maxWidth = 520, children }: {
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
        <div style={{ padding: '1.5rem 1.75rem 1.75rem', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────── */
function calculateStreak(logs: ProgressLog[]): number {
  const dates = new Set(logs.map(l => l.logged_at.slice(0, 10)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; ; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dates.has(key)) streak++;
    else break;
  }
  return streak;
}

interface SubInfo { expires_at: string | null; plan_name: string; cancel_at_period_end: boolean; }

function formatRenewal(sub: SubInfo | null): string {
  if (!sub?.expires_at) return 'No active plan';
  const days = Math.ceil((new Date(sub.expires_at).getTime() - Date.now()) / 86400000);
  const label = sub.cancel_at_period_end ? 'Expires' : 'Renews';
  const date = new Date(sub.expires_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${label} ${date} · ${Math.max(0, days)} days remaining`;
}

/* ─── Overview Tab ───────────────────────────────────── */
function OverviewTab({ progressLogs, mealPlan, workoutPlan, onNavigate, subscription }: {
  progressLogs: ProgressLog[]; mealPlan: MealPlan|null; workoutPlan: WorkoutPlan|null; onNavigate:(tab:string)=>void; subscription: SubInfo|null;
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('client.overview.greeting.morning') : hour < 17 ? t('client.overview.greeting.afternoon') : t('client.overview.greeting.evening');

  const weightChange = progressLogs.length >= 2
    ? (progressLogs[0].weight_kg ?? 0) - (progressLogs[progressLogs.length-1].weight_kg ?? 0)
    : null;

  const stats = [
    { label:t('client.stats.activeStreak'), value:`${calculateStreak(progressLogs)} days`, sub:t('client.stats.streakSub'), icon:Icons.fire, color:'rgba(251,146,60,0.12)', border:'rgba(251,146,60,0.22)' },
    { label:t('client.stats.mealPlan'), value:mealPlan?t('client.stats.assigned'):t('client.stats.pending'), sub:mealPlan?mealPlan.title:t('client.stats.awaitingCoach'), icon:Icons.meal, color:'rgba(201,168,76,0.08)', border:'rgba(201,168,76,0.2)' },
    { label:t('client.stats.weightChange'), value:weightChange!=null?`${weightChange>0?'+':''}${weightChange.toFixed(1)} kg`:t('client.stats.noLogs'), sub:t('client.stats.fromFirstEntry'), icon:Icons.chart, color:'rgba(74,222,128,0.07)', border:'rgba(74,222,128,0.18)' },
    { label:t('client.stats.workoutPlan'), value:workoutPlan?t('client.stats.assigned'):t('client.stats.pending'), sub:workoutPlan?workoutPlan.title:t('client.stats.awaitingCoach'), icon:Icons.bolt, color:'rgba(100,180,255,0.07)', border:'rgba(100,180,255,0.18)' },
  ];

  const quick = [
    { tab:'meal-plan',    label:t('client.quick.todaysMeals'),    sub: mealPlan?`${mealPlan.meal_plan_items.length} items today`:t('client.quick.noItemsToday') },
    { tab:'workout',      label:t('client.quick.todaysWorkout'),  sub: workoutPlan?workoutPlan.title:t('client.quick.noItemsToday') },
    { tab:'progress',     label:t('client.quick.logProgress'),    sub:t('client.quick.updateStats') },
    { tab:'messages',     label:t('client.quick.messageCoach'),   sub:t('client.quick.chatCoach') },
  ];

  return (
    <div>
      <div style={{ marginBottom:'1.75rem' }}>
        <h2 style={{ fontSize:'1.6rem', fontWeight:700, color:'white', marginBottom:4 }}>
          {greeting}, <span style={{ color:'#C9A84C' }}>{user?.profile?.full_name?.split(' ')[0] ?? 'there'}</span>
        </h2>
        <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.32)' }}>{t('client.overview.summary')}</p>
      </div>

      <div className="cd-stats-grid">
        {stats.map(s => (
          <div key={s.label} className="ds-stat" style={{ background:s.color, borderColor:s.border }}>
            <div className="ds-stat-icon" style={{ background:s.color, borderColor:s.border }}>{s.icon}</div>
            <div className="ds-stat-value" style={{ fontSize:'1.4rem' }}>{s.value}</div>
            <div className="ds-stat-label">{s.label}</div>
            <div className="ds-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="cd-quick-grid">
        {quick.map(q => (
          <button key={q.tab} onClick={()=>onNavigate(q.tab)}
            className="ds-card"
            style={{ padding:'1.35rem 1.5rem', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'1rem', transition:'border-color 0.2s ease' }}
            onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(201,168,76,0.25)')}
            onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.07)')}>
            <div>
              <p style={{ fontSize:'0.85rem', fontWeight:600, color:'rgba(255,255,255,0.85)', marginBottom:3 }}>{q.label}</p>
              <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.32)' }}>{q.sub}</p>
            </div>
            <span style={{ marginLeft:'auto', color:'rgba(255,255,255,0.2)' }}>{Icons.arrow}</span>
          </button>
        ))}
      </div>

      <div className="ds-card-gold cd-sub-pill-row">
        <div className="ds-icon-box">{Icons.card}</div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:'0.85rem', fontWeight:600, color:'white' }}>{subscription?.plan_name ?? t('client.sub.fullCoaching')}</p>
          <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.32)', marginTop:2 }}>{formatRenewal(subscription)}</p>
        </div>
        <button onClick={()=>onNavigate('subscription')} className="ds-btn-gold" style={{ padding:'0.5rem 1rem', fontSize:'0.75rem' }}>{t('client.sub.manage')}</button>
      </div>
    </div>
  );
}

/* ─── Meal Plan Tab ──────────────────────────────────── */
function MealPlanTab({ mealPlan, loading, onNavigate }: { mealPlan:MealPlan|null; loading:boolean; onNavigate:(tab:string)=>void }) {
  const { t, tDb } = useLanguage();
  if (loading) return <SkMealPlan />;

  if (!mealPlan) return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}><p className="ds-section-title">{t('client.mealPlan.sectionTitle')}</p><p className="ds-section-sub">{t('client.mealPlan.sectionSub')}</p></div>
      <div className="ds-card ds-empty">
        <div className="ds-empty-icon">{Icons.meal}</div>
        <p>{t('client.mealPlan.noItems')}</p>
        <small>{t('client.mealPlan.noItemsSub')}</small>
      </div>
    </div>
  );

  // Ordered display labels keyed by the DB value coaches save
  const MEAL_LABELS: Record<string, string> = {
    breakfast: 'Breakfast',
    morning_snack: 'Morning Snack',
    lunch: 'Lunch',
    afternoon_snack: 'Afternoon Snack',
    dinner: 'Dinner',
    pre_workout: 'Pre-Workout',
    post_workout: 'Post-Workout',
    snack: 'Snack',
  };
  const ORDER = ['breakfast','morning_snack','lunch','afternoon_snack','dinner','pre_workout','post_workout','snack'];

  // Group by normalised meal_type (lowercase, trim)
  const grouped: Record<string, MealPlanItem[]> = {};
  for (const item of mealPlan.meal_plan_items) {
    const key = item.meal_type?.toLowerCase().trim() ?? 'other';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  // Sort groups by ORDER, put unknowns at end
  const sortedGroups = Object.entries(grouped).sort(([a],[b]) => {
    const ai = ORDER.indexOf(a), bi = ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const totalCal = mealPlan.meal_plan_items.reduce((s,i)=>s+(i.calories??0),0);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'start', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:12 }}>
        <div><p className="ds-section-title">{mealPlan.title}</p><p className="ds-section-sub">{t('client.mealPlan.assignedBy')}</p></div>
        {totalCal > 0 && <span className="ds-gold-pill">{totalCal} kcal / day</span>}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {sortedGroups.map(([type, items]) => {
          const mealCal = items.reduce((s,i)=>s+(i.calories??0),0);
          const timing = items[0]?.meal_timing;
          const displayLabel = MEAL_LABELS[type] ?? type.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
          return (
            <div key={type} className="ds-card" style={{ padding:'1.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div className="ds-icon-box">{Icons.meal}</div>
                  <div>
                    <p style={{ fontWeight:600, color:'white', fontSize:'0.9rem' }}>{displayLabel}</p>
                    {timing && <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.28)' }}>{timing}</p>}
                  </div>
                </div>
                {mealCal > 0 && <span style={{ fontSize:'0.85rem', fontWeight:600, color:'#C9A84C' }}>{mealCal} kcal</span>}
              </div>
              <div>
                {items.map((item,i) => (
                  <div key={item.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.65rem 0', borderBottom: i<items.length-1?'1px solid rgba(255,255,255,0.05)':'none' }}>
                    <span style={{ fontSize:'0.83rem', color:'rgba(255,255,255,0.68)' }}>{tDb(item.food_name, item.food_name_ar)}</span>
                    <div style={{ display:'flex', gap:'1.5rem', fontSize:'0.75rem', color:'rgba(255,255,255,0.32)' }}>
                      {item.quantity_g && <span>{item.quantity_g}g</span>}
                      {item.calories && <span>{item.calories} kcal</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="ds-card cd-meal-footer">
        <div className="ds-icon-box"><svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg></div>
        <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.38)', flex:1 }}>{t('client.mealPlan.requestChanges')}</p>
        <button onClick={()=>onNavigate('messages')} className="ds-btn-gold" style={{ padding:'0.5rem 1rem', fontSize:'0.75rem' }}>{t('client.mealPlan.messageCoachBtn')}</button>
      </div>
    </div>
  );
}

/* ─── Workout Plan Tab ───────────────────────────────── */
function WorkoutTab({ workoutPlan, loading }: { workoutPlan:WorkoutPlan|null; loading:boolean }) {
  const { t, tDb } = useLanguage();
  const [activeDay, setActiveDay] = useState(0);
  if (loading) return <SkWorkoutPlan />;

  if (!workoutPlan) return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}><p className="ds-section-title">{t('client.workout.sectionTitle')}</p><p className="ds-section-sub">{t('client.workout.sectionSub')}</p></div>
      <div className="ds-card ds-empty">
        <div className="ds-empty-icon">{Icons.bolt}</div>
        <p>{t('client.workout.noItems')}</p>
        <small>{t('client.workout.noItemsSub')}</small>
      </div>
    </div>
  );

  const days = workoutPlan.workout_plan_days.sort((a,b)=>a.sort_order-b.sort_order);
  const current = days[activeDay];

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <p className="ds-section-title">{workoutPlan.title}</p>
        <p className="ds-section-sub">{t('client.workout.assignedBy')}</p>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:20, overflowX:'auto', paddingBottom:4 }}>
        {days.map((d,i) => (
          <button key={d.id} onClick={()=>setActiveDay(i)}
            style={{ flexShrink:0, minWidth:64, padding:'0.6rem 0.5rem', borderRadius:12, cursor:'pointer', textAlign:'center', background: i===activeDay?'rgba(201,168,76,0.1)':'rgba(255,255,255,0.03)', border: i===activeDay?'1px solid rgba(201,168,76,0.3)':'1px solid rgba(255,255,255,0.06)', transition:'all 0.18s' }}>
            <span style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color: i===activeDay?'#C9A84C':'rgba(255,255,255,0.38)', display:'block' }}>{d.day_label}</span>
            <span style={{ fontSize:'0.7rem', color: i===activeDay?'rgba(201,168,76,0.7)':'rgba(255,255,255,0.2)', marginTop:2, display:'block' }}>{d.focus?.split(' ').slice(0,2).join(' ') ?? '—'}</span>
          </button>
        ))}
      </div>

      {current && (
        <div className="ds-card" style={{ padding:'1.75rem', borderColor: activeDay===0?'rgba(201,168,76,0.2)':'rgba(255,255,255,0.07)' }}>
          <div style={{ marginBottom:'1.25rem' }}>
            <p style={{ fontWeight:700, color:'white', fontSize:'1.1rem' }}>{current.focus ?? current.day_label}</p>
            <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.3)', marginTop:2 }}>{current.day_label}</p>
          </div>

          {current.workout_exercises.length === 0 ? (
            <div className="ds-empty" style={{ padding:'2rem' }}>
              <div className="ds-empty-icon" style={{ margin:'0 auto 1rem' }}><svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg></div>
              <p>{t('client.workout.recovery')}</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {current.workout_exercises.sort((a,b)=>a.sort_order-b.sort_order).map((ex,i) => (
                <div key={ex.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden' }}>
                  <div className="cd-exercise-row">
                    <span style={{ width:28, height:28, borderRadius:8, background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)', color:'#C9A84C', fontSize:'0.75rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</span>
                    <div style={{ flex:1 }}>
                      {ex.exercise_category && <span style={{ fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(201,168,76,0.7)', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.18)', borderRadius:6, padding:'1px 6px', marginBottom:4, display:'inline-block' }}>{ex.exercise_category}</span>}
                      <p style={{ fontSize:'0.85rem', fontWeight:600, color:'white' }}>{tDb(ex.exercise_name, ex.exercise_name_ar)}</p>
                      {ex.notes && <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.28)', marginTop:2 }}>{ex.notes}</p>}
                    </div>
                    <div className="cd-exercise-stats">
                      {[[t('client.workout.sets'),ex.sets],[t('client.workout.reps'),ex.reps],[t('client.workout.rest'),ex.rest_seconds ? `${ex.rest_seconds}s` : null]].map(([label,val]) => val && (
                        <div key={label as string}>
                          <p style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(255,255,255,0.22)' }}>{label}</p>
                          <p style={{ fontSize:'0.85rem', fontWeight:700, color:'white', marginTop:1 }}>{val}</p>
                        </div>
                      ))}
                      {ex.video_url && (
                        <a href={ex.video_url} target="_blank" rel="noopener noreferrer"
                          style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, textDecoration:'none', flexShrink:0 }}>
                          <div style={{ width:32, height:32, borderRadius:8, background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <svg style={{ width:14, height:14, color:'#C9A84C' }} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                          <p style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(201,168,76,0.7)' }}>{t('client.watchVideo')}</p>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Progress Tab ───────────────────────────────────── */
function ProgressTab({ progressLogs, onLogged }: { progressLogs:ProgressLog[]; onLogged:()=>void }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [form, setForm] = useState({ weight:'', body_fat:'', muscle_mass:'', notes:'' });
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name:string; url:string}[]>([]);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleLog = async (e:React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    await supabase.from('progress_logs').insert({
      user_id: user.id,
      weight_kg: parseFloat(form.weight),
      body_fat_pct: form.body_fat ? parseFloat(form.body_fat) : null,
      muscle_mass_kg: form.muscle_mass ? parseFloat(form.muscle_mass) : null,
      notes: form.notes || null,
    });
    setSubmitted(true); setForm({weight:'',body_fat:'',muscle_mass:'',notes:''});
    setShowLogModal(false);
    setTimeout(()=>{ setSubmitted(false); onLogged(); }, 2000);
  };

  const handleUpload = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !user?.id) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      formData.append('folder', `body-checks/${user.id}`);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: 'POST', body: formData }
      );
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Upload failed');

      const fileUrl: string = json.secure_url;
      await supabase.from('body_checks').insert({ user_id:user.id, file_url:fileUrl, file_type:file.type });
      setUploadedFiles(prev => [...prev, { name:file.name, url:fileUrl }]);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const maxW = Math.max(...progressLogs.map(l=>l.weight_kg??0), 1);
  const minW = Math.min(...progressLogs.map(l=>l.weight_kg??0), maxW-1);
  const range = maxW-minW || 1;
  const hasFat = progressLogs.some(l=>l.body_fat_pct!=null);
  const hasMuscle = progressLogs.some(l=>l.muscle_mass_kg!=null);
  const maxFat = Math.max(...progressLogs.map(l=>l.body_fat_pct??0), 1);
  const minFat = Math.min(...progressLogs.map(l=>l.body_fat_pct??0), maxFat-1);
  const rangeFat = maxFat-minFat || 1;
  const maxMuscle = Math.max(...progressLogs.map(l=>l.muscle_mass_kg??0), 1);
  const minMuscle = Math.min(...progressLogs.map(l=>l.muscle_mass_kg??0), maxMuscle-1);
  const rangeMuscle = maxMuscle-minMuscle || 1;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'start', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:10 }}>
        <div><p className="ds-section-title">{t('client.progress.sectionTitle')}</p><p className="ds-section-sub">{t('client.progress.sectionSub')}</p></div>
        <div style={{ display:'flex', gap:8, flexShrink:0 }}>
          <button onClick={() => setShowLogModal(true)} className="ds-btn-gold" style={{ fontSize:'0.78rem', padding:'0.5rem 1rem' }}>{t('client.progress.logToday')}</button>
          <button onClick={() => setShowUploadModal(true)} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', padding:'0.5rem 1rem', borderRadius:10, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.65)', cursor:'pointer' }}>
            <span style={{ width:14, height:14, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>{Icons.upload}</span>
            {t('client.progress.uploadFile')}
          </button>
        </div>
      </div>

      {submitted && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0.85rem 1.15rem', borderRadius:12, marginBottom:16, background:'rgba(74,222,128,0.07)', border:'1px solid rgba(74,222,128,0.2)' }}>
          <span style={{ color:'rgba(74,222,128,0.9)', flexShrink:0 }}>{Icons.check}</span>
          <p style={{ fontSize:'0.83rem', color:'rgba(74,222,128,0.85)', fontWeight:500 }}>{t('client.progress.statsSaved')}</p>
        </div>
      )}

      <div className="cd-progress-grid">
        {/* Chart */}
        <div className="ds-card" style={{ padding:'1.75rem' }}>
          <p style={{ fontWeight:600, color:'white', marginBottom:'1.25rem' }}>{t('client.progress.weightTimeline')}</p>
          {progressLogs.length === 0 ? (
            <div className="ds-empty" style={{ padding:'2rem 0' }}>
              <div className="ds-empty-icon" style={{ margin:'0 auto 0.75rem' }}>{Icons.chart}</div>
              <p style={{ fontSize:'0.8rem' }}>{t('client.progress.noLogs')}</p>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:120, marginBottom:12 }}>
                {progressLogs.slice().reverse().slice(-8).map((log,i,arr) => {
                  const pct = (((log.weight_kg??0)-minW)/range)*70+25;
                  return (
                    <div key={log.id} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <span style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.35)' }}>{log.weight_kg}</span>
                      <div style={{ width:'100%', borderRadius:'4px 4px 0 0', height:`${pct}%`, background: i===arr.length-1?'rgba(201,168,76,0.55)':'rgba(201,168,76,0.2)', border:'1px solid rgba(201,168,76,0.15)' }} />
                      <span style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.25)' }}>{new Date(log.logged_at).toLocaleDateString('en',{month:'short',day:'numeric'})}</span>
                    </div>
                  );
                })}
              </div>
              {progressLogs.length >= 2 && (
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.75rem', color:'rgba(255,255,255,0.35)' }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:'rgba(74,222,128,0.7)', flexShrink:0 }} />
                  {t('client.progress.totalChange')} <span style={{ color:'rgba(74,222,128,0.9)', fontWeight:600 }}>
                    {((progressLogs[0].weight_kg??0)-(progressLogs[progressLogs.length-1].weight_kg??0)).toFixed(1)} kg
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Body stat mini charts */}
      {(hasFat || hasMuscle) && (
        <div className="cd-bodystat-grid" style={{ gridTemplateColumns: hasFat && hasMuscle ? '1fr 1fr' : '1fr' }}>
          {hasFat && (
            <div className="ds-card" style={{ padding:'1.75rem' }}>
              <p style={{ fontWeight:600, color:'white', marginBottom:'1rem', fontSize:'0.88rem' }}>{t('client.bodyFatPct')}</p>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:90 }}>
                {progressLogs.slice().reverse().slice(-8).filter(l=>l.body_fat_pct!=null).map((log,i,arr)=>{
                  const pct = (((log.body_fat_pct??0)-minFat)/rangeFat)*70+25;
                  return (
                    <div key={log.id} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                      <span style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.35)' }}>{log.body_fat_pct}%</span>
                      <div style={{ width:'100%', borderRadius:'4px 4px 0 0', height:`${pct}%`, background: i===arr.length-1?'rgba(251,146,60,0.6)':'rgba(251,146,60,0.2)', border:'1px solid rgba(251,146,60,0.15)' }} />
                      <span style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.25)' }}>{new Date(log.logged_at).toLocaleDateString('en',{month:'short',day:'numeric'})}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {hasMuscle && (
            <div className="ds-card" style={{ padding:'1.75rem' }}>
              <p style={{ fontWeight:600, color:'white', marginBottom:'1rem', fontSize:'0.88rem' }}>{t('client.muscleMassKg')}</p>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:90 }}>
                {progressLogs.slice().reverse().slice(-8).filter(l=>l.muscle_mass_kg!=null).map((log,i,arr)=>{
                  const pct = (((log.muscle_mass_kg??0)-minMuscle)/rangeMuscle)*70+25;
                  return (
                    <div key={log.id} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                      <span style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.35)' }}>{log.muscle_mass_kg}</span>
                      <div style={{ width:'100%', borderRadius:'4px 4px 0 0', height:`${pct}%`, background: i===arr.length-1?'rgba(74,222,128,0.55)':'rgba(74,222,128,0.18)', border:'1px solid rgba(74,222,128,0.12)' }} />
                      <span style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.25)' }}>{new Date(log.logged_at).toLocaleDateString('en',{month:'short',day:'numeric'})}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {progressLogs.length > 0 && (
        <div className="ds-card" style={{ padding:'1.75rem', marginBottom:16 }}>
          <p style={{ fontWeight:600, color:'white', marginBottom:'1rem' }}>{t('client.progress.logHistory')}</p>
          <div style={{ overflowX:'auto' }}>
            <table className="ds-table">
              <thead><tr>
                <th>{t('client.progress.colDate')}</th>
                <th>{t('client.progress.colWeight')}</th>
                {hasFat && <th>{t('client.bodyFatPct')}</th>}
                {hasMuscle && <th>{t('client.muscleMassKg')}</th>}
                <th>{t('client.progress.colChange')}</th>
                <th>{t('client.progress.colNotes')}</th>
              </tr></thead>
              <tbody>
                {progressLogs.map((log,i) => {
                  const prev = progressLogs[i+1]?.weight_kg;
                  const ch = prev!=null?((log.weight_kg??0)-prev).toFixed(1):null;
                  return (
                    <tr key={log.id}>
                      <td>{new Date(log.logged_at).toLocaleDateString('en',{month:'short',day:'numeric',year:'2-digit'})}</td>
                      <td style={{ fontWeight:600, color:'white' }}>{log.weight_kg} kg</td>
                      {hasFat && <td style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.78rem' }}>{log.body_fat_pct!=null?`${log.body_fat_pct}%`:'—'}</td>}
                      {hasMuscle && <td style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.78rem' }}>{log.muscle_mass_kg!=null?`${log.muscle_mass_kg} kg`:'—'}</td>}
                      <td>{ch && <span style={{ fontWeight:600, fontSize:'0.78rem', color: parseFloat(ch)<0?'rgba(74,222,128,0.9)':'rgba(248,113,113,0.85)' }}>{parseFloat(ch)>0?'+':''}{ch} kg</span>}</td>
                      <td style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.78rem' }}>{log.notes||'—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Body check upload summary card */}
      <div className="ds-card" style={{ padding:'1.75rem' }}>
        <div className="cd-bodycheck-header">
          <div>
            <p style={{ fontWeight:600, color:'white' }}>{t('client.progress.bodyChecks')}</p>
            <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.3)', marginTop:2 }}>{t('client.progress.bodyChecksSub')}</p>
          </div>
          <button onClick={() => setShowUploadModal(true)} className="ds-btn-gold" style={{ cursor:'pointer', fontSize:'0.78rem' }}>
            <span style={{ width:16, height:16, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>{Icons.upload}</span>
            {t('client.progress.uploadFile')}
          </button>
        </div>
        {uploadedFiles.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:4 }}>
            {uploadedFiles.map((f,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'0.5rem 0.75rem', background:'rgba(74,222,128,0.05)', border:'1px solid rgba(74,222,128,0.15)', borderRadius:8 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'rgba(74,222,128,0.8)', flexShrink:0 }} />
                <a href={f.url} target="_blank" rel="noreferrer" style={{ fontSize:'0.78rem', color:'rgba(74,222,128,0.85)', textDecoration:'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</a>
                <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.2)', marginLeft:'auto', flexShrink:0 }}>{t('client.progress.uploaded')}</span>
              </div>
            ))}
          </div>
        )}
        {uploadedFiles.length === 0 && (
          <p style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.2)', marginTop:4 }}>No files uploaded yet.</p>
        )}
      </div>

      {/* Log Progress Modal */}
      <ClientModal open={showLogModal} onClose={() => setShowLogModal(false)} title="Log Progress" maxWidth={480}>
        <form onSubmit={handleLog} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label className="ds-label">{t('client.weightKg')}</label><input type="number" step="0.1" className="ds-input" placeholder="82.5" value={form.weight} onChange={e=>setForm(f=>({...f,weight:e.target.value}))} required /></div>
          <div className="cd-inner-grid-2">
            <div><label className="ds-label">{t('client.bodyFatPct')}</label><input type="number" step="0.1" className="ds-input" placeholder="e.g. 18.5" value={form.body_fat} onChange={e=>setForm(f=>({...f,body_fat:e.target.value}))} /></div>
            <div><label className="ds-label">{t('client.muscleMassKg')}</label><input type="number" step="0.1" className="ds-input" placeholder="e.g. 65.0" value={form.muscle_mass} onChange={e=>setForm(f=>({...f,muscle_mass:e.target.value}))} /></div>
          </div>
          <div><label className="ds-label">{t('client.notes')}</label><input className="ds-input" placeholder="How are you feeling today?" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} /></div>
          <button type="submit" className="ds-btn-gold" style={{ justifyContent:'center' }}>{t('client.saveEntry')}</button>
        </form>
      </ClientModal>

      {/* Upload Body Check Modal */}
      <ClientModal open={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Body Check" maxWidth={480}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>{t('client.progress.bodyChecksSub')}</p>
          <label className="ds-btn-gold" style={{ cursor: uploading ? 'not-allowed' : 'pointer', fontSize:'0.82rem', opacity: uploading ? 0.6 : 1, justifyContent:'center' }}>
            <span style={{ width:16, height:16, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>{Icons.upload}</span>
            {uploading ? t('client.progress.uploading') : t('client.progress.uploadFile')}
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={async (e) => { await handleUpload(e); setShowUploadModal(false); }} disabled={uploading} style={{ display:'none' }} />
          </label>
          {uploading && <div className="ds-loading" style={{ height:6, background:'rgba(201,168,76,0.15)', borderRadius:8 }} />}
          {uploadError && (
            <p style={{ fontSize:'0.75rem', color:'rgba(248,113,113,0.85)' }}>{uploadError}</p>
          )}
          {uploadedFiles.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <p style={{ fontSize:'0.72rem', fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Uploaded this session</p>
              {uploadedFiles.map((f,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'0.5rem 0.75rem', background:'rgba(74,222,128,0.05)', border:'1px solid rgba(74,222,128,0.15)', borderRadius:8 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'rgba(74,222,128,0.8)', flexShrink:0 }} />
                  <a href={f.url} target="_blank" rel="noreferrer" style={{ fontSize:'0.78rem', color:'rgba(74,222,128,0.85)', textDecoration:'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</a>
                  <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.2)', marginLeft:'auto', flexShrink:0 }}>{t('client.progress.uploaded')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ClientModal>
    </div>
  );
}

/* ─── Messages Tab ───────────────────────────────────── */
/** Returns up to 2 initials from a full name, e.g. "Kunal Gawande" → "KG" */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function MessagesTab() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string|null>(null);
  const [trainerId, setTrainerId] = useState<string|null>(null);
  const [trainerName, setTrainerName] = useState('Your Coach');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [noCoach, setNoCoach] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollDown = useCallback(() => {
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}), 50);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      try {
        // Find assigned trainer — join profiles in one round-trip so we get the
        // coach's full_name immediately. Requires the RLS policy
        // "client_read_assigned_coach" to exist on the profiles table.
        const { data:assign } = await supabase
          .from('trainer_client_assignments')
          .select('trainer_id, profiles:trainer_id ( full_name )')
          .eq('client_id', user.id)
          .maybeSingle();

        if (!assign) { setNoCoach(true); setLoading(false); return; }
        setTrainerId(assign.trainer_id);

        // Resolve coach name from join result; fall back to a direct fetch
        // (works once the "client_read_assigned_coach" RLS policy is applied)
        const joinedName = (assign.profiles as { full_name?: string } | null)?.full_name;
        if (joinedName) {
          setTrainerName(joinedName);
        } else {
          // Fallback: direct select — succeeds after the RLS patch is applied
          const { data:tp } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', assign.trainer_id)
            .maybeSingle();
          if (tp?.full_name) setTrainerName(tp.full_name);
        }

        // Find or create thread — table uses coach_id (not trainer_id)
        let tid: string;
        const { data:thread } = await supabase.from('message_threads').select('id').eq('client_id', user.id).eq('coach_id', assign.trainer_id).maybeSingle();
        if (thread) {
          tid = thread.id;
        } else {
          const { data:nt } = await supabase.from('message_threads').insert({ client_id:user.id, coach_id:assign.trainer_id }).select('id').single();
          if (!nt) { setLoading(false); return; }
          tid = nt.id;
        }
        setThreadId(tid);

        // Load history
        const { data:msgs } = await supabase.from('messages').select('*').eq('thread_id', tid).order('created_at', { ascending:true });
        if (msgs) setMessages(msgs as Message[]);
        setLoading(false);
        scrollDown();

        // Realtime — subscribe and store ref for cleanup
        channel = supabase.channel(`client-thread-${tid}`)
          .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages', filter:`thread_id=eq.${tid}` }, (payload) => {
            const incoming = payload.new as Message;
            setMessages(m => {
              if (m.find(x => x.id === incoming.id)) return m;
              return [...m, incoming];
            });
            scrollDown();
          })
          .subscribe();
      } catch {
        setNoCoach(true);
        setLoading(false);
      }
    };

    init();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [user?.id, scrollDown]);

  useEffect(()=>{ scrollDown(); }, [messages, scrollDown]);

  const send = async (e:React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()||!threadId||!user) return;
    const content = text.trim();
    setText('');
    // Optimistic update — show immediately
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = { id: tempId, sender_id: user.id, content, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    scrollDown();
    const { data } = await supabase.from('messages').insert({ thread_id:threadId, sender_id:user.id, content }).select('*').single();
    // Replace temp — if realtime already added the real record, just remove the temp
    if (data) setMessages(prev => {
      const real = data as Message;
      const alreadyIn = prev.find(m => m.id === real.id);
      if (alreadyIn) return prev.filter(m => m.id !== tempId);
      return prev.map(m => m.id === tempId ? real : m);
    });
  };

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}><p className="ds-section-title">{t('client.messages.sectionTitle')}</p><p className="ds-section-sub">{t('client.messages.sectionSub')}</p></div>

      <div className="ds-card cd-chat-box" style={{ display:'flex', flexDirection:'column', height:'clamp(520px, 70vh, 720px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'1rem 1.25rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#C9A84C', fontWeight:700, fontSize:'0.75rem', flexShrink:0, letterSpacing:'0.03em' }}>
            {getInitials(trainerName)}
          </div>
          <div>
            <p style={{ fontSize:'0.85rem', fontWeight:600, color:'white' }}>{trainerName}</p>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'rgba(74,222,128,0.9)' }} />
              <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.3)' }}>{t('client.online')}</span>
            </div>
          </div>
        </div>

        <div className="ds-no-scroll" style={{ flex:1, overflowY:'auto', padding:'1rem 1.25rem', display:'flex', flexDirection:'column', gap:10 }}>
          {loading && <SkMessages />}
          {noCoach && (
            <div className="ds-empty" style={{ margin:'auto' }}>
              <div className="ds-empty-icon" style={{ margin:'0 auto 1rem' }}>{Icons.user}</div>
              <p>{t('client.messages.noCoach')}</p>
              <small>{t('client.messages.noCoachSub')}</small>
            </div>
          )}
          {!loading && !noCoach && messages.length===0 && (
            <div className="ds-empty" style={{ margin:'auto' }}>
              <div className="ds-empty-icon" style={{ margin:'0 auto 1rem' }}>{Icons.chat}</div>
              <p>{t('client.messages.noMessages')}</p>
              <small>{t('client.messages.sendFirst')} {trainerName}</small>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} style={{ display:'flex', justifyContent: isMe?'flex-end':'flex-start' }}>
                <div style={{ maxWidth:'75%', borderRadius:16, padding:'0.7rem 1rem', background: isMe?'rgba(201,168,76,0.1)':'rgba(255,255,255,0.05)', border: isMe?'1px solid rgba(201,168,76,0.22)':'1px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.85)', lineHeight:1.6 }}>{msg.content}</p>
                  <p style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.22)', marginTop:4, textAlign: isMe?'right':'left' }}>
                    {new Date(msg.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {!noCoach && (
          <form onSubmit={send} style={{ display:'flex', gap:8, padding:'1rem 1.25rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <input className="ds-input" style={{ flex:1 }} placeholder={t('client.messagePlaceholder')} value={text} onChange={e=>setText(e.target.value)} />
            <button type="submit" className="ds-btn-gold" style={{ padding:'0.65rem 1rem', flexShrink:0 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── Subscription Tab ───────────────────────────────── */
function SubscriptionTab({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const [sub, setSub] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [invoices, setInvoices] = useState<{ id:string; number:string|null; status:string; amount:number; currency:string; date:string|null; pdf:string|null; hosted_url:string|null }[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  useEffect(()=>{
    if (!userId) return;
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSub(data);
        setLoading(false);
      });
  },[userId]);

  // Fetch Stripe invoices (only when the subscription has a stripe_subscription_id)
  useEffect(()=>{
    if (!userId) return;
    // Wait for sub to load so we know if it's Stripe-backed
    if (loading) return;
    if (!sub?.stripe_subscription_id) {
      // No Stripe sub — nothing to fetch from Stripe
      setInvoicesLoading(false);
      return;
    }
    setInvoicesLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
      return fetch('/api/stripe/invoices', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId }),
      });
    })
      .then(r => r.json())
      .then((data: { invoices?: typeof invoices }) => {
        if (data.invoices) setInvoices(data.invoices);
      })
      .catch(() => {})
      .finally(() => setInvoicesLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[userId, loading]);

  async function handleCancel() {
    if (!userId) return;
    setCancelLoading(true);
    try {
      const res = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setCancelConfirm(false);
        // Immediately update local state so UI reflects the change
        setSub(prev => prev ? { ...prev, cancel_at_period_end: true } : prev);
      }
    } finally {
      setCancelLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    active: 'rgba(74,222,128,0.9)',
    pending: 'rgba(251,191,36,0.9)',
    cancelled: 'rgba(248,113,113,0.9)',
    expired: 'rgba(255,255,255,0.3)',
  };

  const isPendingCancel = sub && sub.cancel_at_period_end === true && sub.status === 'active';
  const isCancelledButValid = !!(sub?.status === 'cancelled' && sub.expires_at && new Date(sub.expires_at as string) > new Date());
  const isActive = sub && (sub.status === 'active' || isCancelledButValid);

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <p className="ds-section-title">{t('client.subscription')}</p>
        <p className="ds-section-sub">{t('client.sub.manageSub')}</p>
      </div>

      {loading ? (
        <SkSubscription />
      ) : isActive ? (
        <>
          {/* Active Plan Card */}
          <div className="ds-card-gold" style={{ padding:'1.75rem', marginBottom:20 }}>
            <div className="cd-sub-header" style={{ display:'flex', alignItems:'start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
              <div>
                <span className="ds-badge-gold" style={{ marginBottom:12, display:'inline-flex' }}>{t('client.sub.activePlan')}</span>
                <h3 style={{ fontSize:'1.5rem', fontWeight:700, color:'white', marginTop:4, marginBottom:4 }}>{sub.plan_name as string}</h3>
              </div>
              <div style={{ textAlign:'right' }}>
                <p className="cd-sub-price" style={{ fontSize:'2rem', fontWeight:700, color:'#C9A84C', lineHeight:1 }} dir="ltr">AED {String(sub.price_sar)}</p>
                <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.3)', marginTop:4 }}>{t('client.sub.perMonth')}</p>
              </div>
            </div>
            <div className="ds-divider" />
            <div className="cd-sub-stats-grid">
              {[
                { label:t('client.sub.statusLabel'), value: String(sub.status).charAt(0).toUpperCase()+String(sub.status).slice(1), color: statusColors[sub.status as string] ?? 'rgba(255,255,255,0.7)' },
                { label:t('client.sub.nextBilling'), value: sub.expires_at ? new Date(sub.expires_at as string).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'}) : '—', color:'rgba(255,255,255,0.7)' },
                { label:t('client.sub.memberSince'), value: sub.started_at ? new Date(sub.started_at as string).toLocaleDateString('en',{month:'short',year:'numeric'}) : '—', color:'rgba(255,255,255,0.7)' },
              ].map(i=>(
                <div key={i.label}>
                  <p style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.12em', color:'rgba(255,255,255,0.25)', marginBottom:4 }}>{i.label}</p>
                  <p style={{ fontSize:'0.88rem', fontWeight:600, color:i.color }}>{i.value}</p>
                </div>
              ))}
            </div>

            {/* Cancellation scheduled banner */}
            {(isPendingCancel || isCancelledButValid) && (
              <div style={{ padding:'0.85rem 1.15rem', borderRadius:10, marginBottom:12, background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.2)' }}>
                <p style={{ fontSize:'0.8rem', color:'rgba(251,191,36,0.85)', fontWeight:500 }}>
                  Your subscription has been cancelled. You retain full access until{' '}
                  <strong>{sub?.expires_at ? new Date(sub.expires_at as string).toLocaleDateString('en',{month:'long',day:'numeric',year:'numeric'}) : 'the end of your billing period'}</strong>.
                </p>
              </div>
            )}

            {/* Cancel button — only show if not already cancelled */}
            {!isPendingCancel && !isCancelledButValid && (
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <button
                  onClick={() => setCancelConfirm(true)}
                  style={{
                    fontSize:'0.75rem', fontWeight:600, padding:'0.55rem 1.2rem',
                    borderRadius:10, border:'1px solid rgba(248,113,113,0.25)',
                    background:'transparent', color:'rgba(248,113,113,0.7)', cursor:'pointer',
                    transition:'all 0.2s ease', letterSpacing:'0.04em',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.06)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.25)'; }}
                >
                  {t('client.sub.cancelSub')}
                </button>
              </div>
            )}

            {/* Cancel Subscription Modal */}
            <ClientModal open={cancelConfirm} onClose={() => setCancelConfirm(false)} title="Cancel Subscription" maxWidth={420}>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <p style={{ fontSize:'0.85rem', color:'rgba(248,113,113,0.9)', lineHeight:1.65, fontWeight:500 }}>
                  {t('client.sub.cancelConfirm')}
                </p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button
                    onClick={async () => { await handleCancel(); }}
                    disabled={cancelLoading}
                    style={{ flex:1, padding:'0.65rem 1rem', borderRadius:10, fontSize:'0.78rem', fontWeight:700, border:'1px solid rgba(248,113,113,0.4)', background:'rgba(248,113,113,0.1)', color:'rgba(248,113,113,0.9)', cursor: cancelLoading ? 'not-allowed' : 'pointer', letterSpacing:'0.05em', textTransform:'uppercase', opacity: cancelLoading ? 0.7 : 1 }}
                  >
                    {cancelLoading ? t('client.sub.cancelling') : t('client.sub.yesCancelSub')}
                  </button>
                  <button
                    onClick={() => setCancelConfirm(false)}
                    style={{ flex:1, padding:'0.65rem 1rem', borderRadius:10, fontSize:'0.78rem', fontWeight:600, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.6)', cursor:'pointer' }}
                  >
                    {t('client.sub.keepSub')}
                  </button>
                </div>
              </div>
            </ClientModal>
          </div>

          {/* Invoices / Receipts Section */}
          <div className="ds-card" style={{ padding:'1.5rem' }}>
            <p style={{ fontSize:'0.88rem', fontWeight:700, color:'white', marginBottom:4 }}>{t('client.sub.invoices')}</p>
            <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.3)', marginBottom:16 }}>{t('client.sub.invoicesSub')}</p>

            {/* ── Always show a receipt for the current subscription ── */}
            {sub && (
              <div className="cd-invoice-row" style={{
                display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.75rem 1rem',
                borderRadius:10, background:'rgba(201,168,76,0.04)', border:'1px solid rgba(201,168,76,0.14)',
                marginBottom: invoices.length > 0 ? 10 : 0,
              }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'0.82rem', fontWeight:600, color:'rgba(255,255,255,0.75)' }}>
                    {sub.plan_name as string}
                  </p>
                  <p style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', marginTop:2 }}>
                    {sub.started_at ? new Date(sub.started_at as string).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                    {sub.expires_at ? ` → ${new Date(sub.expires_at as string).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}` : ''}
                  </p>
                </div>
                <div style={{ textAlign:'right', marginRight:14 }}>
                  <p style={{ fontSize:'0.85rem', fontWeight:700, color:'#C9A84C' }} dir="ltr">
                    AED {String(sub.price_sar)}
                  </p>
                  <p style={{ fontSize:'0.65rem', color:'rgba(74,222,128,0.75)', textTransform:'capitalize', marginTop:1 }}>
                    {sub.status as string}
                  </p>
                </div>
                <a
                  href={`/api/invoices/receipt?sub_id=${sub.id as string}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={async e => {
                    // Attach auth token as a query param via a signed URL isn't trivial;
                    // instead open via a fetch then blob URL so the Bearer header goes through
                    e.preventDefault();
                    const { data:{ session } } = await supabase.auth.getSession();
                    const res = await fetch(`/api/invoices/receipt?sub_id=${sub.id as string}`, {
                      headers: session?.access_token ? { Authorization:`Bearer ${session.access_token}` } : {},
                    });
                    if (!res.ok) { alert('Could not load receipt. Please try again.'); return; }
                    const html = await res.text();
                    const blob = new Blob([html], { type:'text/html' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                  }}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:4, padding:'0.4rem 0.75rem',
                    borderRadius:8, fontSize:'0.7rem', fontWeight:600,
                    border:'1px solid rgba(201,168,76,0.3)', color:'#C9A84C',
                    textDecoration:'none', transition:'all 0.2s ease', cursor:'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <svg style={{ width:13, height:13 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Receipt
                </a>
              </div>
            )}

            {/* ── Stripe invoice list (when available) ── */}
            {invoicesLoading ? (
              <SkInline lines={2} />
            ) : invoices.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {invoices.map(inv => (
                  <div key={inv.id} className="cd-invoice-row" style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.75rem 1rem',
                    borderRadius:10, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:'0.82rem', fontWeight:600, color:'rgba(255,255,255,0.7)' }}>
                        {inv.number ?? inv.id.slice(-8)}
                      </p>
                      <p style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', marginTop:2 }}>
                        {inv.date ? new Date(inv.date).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                      </p>
                    </div>
                    <div style={{ textAlign:'right', marginRight:16 }}>
                      <p style={{ fontSize:'0.85rem', fontWeight:700, color:'#C9A84C' }} dir="ltr">
                        {inv.amount} {inv.currency}
                      </p>
                      <p style={{ fontSize:'0.65rem', color: inv.status === 'paid' ? 'rgba(74,222,128,0.8)' : 'rgba(255,255,255,0.3)', textTransform:'capitalize', marginTop:1 }}>
                        {inv.status}
                      </p>
                    </div>
                    {(inv.pdf || inv.hosted_url) && (
                      <a
                        href={inv.pdf ?? inv.hosted_url ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display:'inline-flex', alignItems:'center', gap:4, padding:'0.4rem 0.75rem',
                          borderRadius:8, fontSize:'0.7rem', fontWeight:600,
                          border:'1px solid rgba(201,168,76,0.3)', color:'#C9A84C',
                          textDecoration:'none', transition:'all 0.2s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.07)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <svg style={{ width:13, height:13 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : !sub ? (
              <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.25)', textAlign:'center', padding:'1rem 0' }}>
                {t('client.sub.noInvoices')}
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <div className="ds-card" style={{ padding:'2rem', marginBottom:20, textAlign:'center' }}>
          <div className="ds-empty-icon" style={{ margin:'0 auto 1rem' }}>{Icons.card}</div>
          <p style={{ color:'white', fontWeight:600, marginBottom:6 }}>{t('client.sub.noSubTitle')}</p>
          <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.35)', marginBottom:'1.25rem' }}>
            {t('client.sub.noSubDesc')}
          </p>
          <a
            href="/checkout"
            className="ds-btn-gold"
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'0.7rem 1.5rem', fontSize:'0.8rem', textDecoration:'none' }}
          >
            {t('client.sub.viewPlansSubscribe')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}

/* ─── Subscription Gate (locked screen) ─────────────── */
function SubscriptionGate() {
  const { t } = useLanguage();
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', padding:'2rem' }}>
      <div style={{ maxWidth:420, width:'100%', textAlign:'center', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(201,168,76,0.18)', borderRadius:24, padding:'3rem 2rem' }}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
          <svg className="w-6 h-6" fill="none" stroke="#C9A84C" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <h2 style={{ fontSize:'1.35rem', fontWeight:700, color:'white', marginBottom:8 }}>{t('client.gate.title')}</h2>
        <p style={{ fontSize:'0.83rem', color:'rgba(255,255,255,0.38)', lineHeight:1.6, marginBottom:'1.75rem' }}>
          {t('client.gate.desc')}
        </p>
        <a
          href="/checkout"
          style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'0.8rem 1.75rem', background:'linear-gradient(135deg,#C9A84C,#E8C76A)', color:'#0B0B0B', fontWeight:800, fontSize:'0.8rem', letterSpacing:'0.1em', textTransform:'uppercase', borderRadius:12, textDecoration:'none' }}
        >
          {t('client.gate.viewPlans')}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ─── Orders Tab ─────────────────────────────────────── */
interface OrderProduct { name: string; type: string | null; image_url: string | null; file_url: string | null; }
interface OrderItem { id: string; quantity: number; price_sar: number; products: OrderProduct | null; }
interface Order { id: string; status: string; total_sar: number; created_at: string; order_items: OrderItem[]; }

function OrdersTab({ userId }: { userId: string }) {
  const { isRTL } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, total_sar, created_at, order_items(id, quantity, price_sar, products(name, type, image_url, file_url))')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Map data to fix nested array from Supabase join
        const mapped = (data as any[])?.map(order => ({
          ...order,
          order_items: order.order_items.map((item: any) => ({
            ...item,
            products: Array.isArray(item.products) ? item.products[0] : item.products
          }))
        })) as Order[];

        setOrders(mapped ?? []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [userId]);

  const statusColor = (s: string) => s === 'completed' ? '#4ade80' : s === 'pending' ? '#facc15' : 'rgba(255,255,255,0.4)';

  if (loading) return <SkOrders />;

  return (
    <div>
      <p className="ds-section-title" style={{ marginBottom: '0.5rem' }}>{isRTL ? 'طلباتي' : 'My Orders'}</p>
      <p className="ds-section-sub" style={{ marginBottom: '1.75rem' }}>{isRTL ? 'سجل مشترياتك من المتجر' : 'Your marketplace purchase history'}</p>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg style={{ width: 24, height: 24, color: 'rgba(255,255,255,0.2)' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>{isRTL ? 'لا طلبات بعد' : 'No orders yet'}</p>
          <a href="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.76rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 600 }}>
            {isRTL ? 'تصفح المتجر' : 'Browse Marketplace'}
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {orders.map(order => (
            <div key={order.id} className="ds-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: expanded === order.id ? '1rem' : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>
                    {new Date(order.created_at).toLocaleDateString(isRTL ? 'ar' : 'en', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>#{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 6, background: `${statusColor(order.status)}18`, color: statusColor(order.status), border: `1px solid ${statusColor(order.status)}33` }}>
                    {order.status}
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#C9A84C' }}>{order.total_sar} AED</span>
                  <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4 }} onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                    <svg style={{ width: 16, height: 16, transform: expanded === order.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>
              </div>
              {expanded === order.id && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                  {order.order_items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {item.products?.image_url ? (
                          <img src={item.products.image_url} alt={item.products.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg style={{ width: 16, height: 16, color: 'rgba(201,168,76,0.4)' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.349" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{item.products?.name ?? 'Product'}</p>
                          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Qty: {item.quantity} · {item.price_sar} AED</p>
                        </div>
                      </div>
                      {item.products?.type === 'ebook' && item.products?.file_url && (
                        <a href={item.products.file_url} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 700, padding: '0.3rem 0.7rem', borderRadius: 7, background: 'linear-gradient(135deg, #C9A84C, #E8C76A)', color: '#0B0B0B', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          {isRTL ? 'تنزيل' : 'Download'}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Profile Tab ────────────────────────────────────── */
function ProfileTab() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  // Personal info
  const [fullName, setFullName]   = useState(user?.profile?.full_name ?? '');
  const [phone, setPhone]         = useState('');
  const [dob, setDob]             = useState('');
  const [gender, setGender]       = useState('');
  const [location, setLocation]   = useState('');
  const [bio, setBio]             = useState('');

  // Fitness stats
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight,  setTargetWeight]  = useState('');
  const [height,        setHeight]        = useState('');
  const [fitnessGoal,   setFitnessGoal]   = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [experience,    setExperience]    = useState('');

  // Dietary & health
  const [dietary,  setDietary]  = useState('');
  const [health,   setHealth]   = useState('');

  // UI states — single save for all sections
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [saveError,    setSaveError]    = useState('');
  const [resetSent,    setResetSent]    = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Load all profile data on mount
  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      supabase.from('profiles').select('full_name, phone, date_of_birth, gender, location, bio').eq('id', user.id).maybeSingle(),
      supabase.from('onboarding_responses').select('*').eq('user_id', user.id).maybeSingle(),
    ]).then(([{ data: p }, { data: o }]) => {
      if (p) {
        if (p.full_name) setFullName(p.full_name);
        if (p.phone) setPhone(p.phone);
        if (p.date_of_birth) setDob(p.date_of_birth);
        if (p.gender) setGender(p.gender);
        if (p.location) setLocation(p.location);
        if (p.bio) setBio(p.bio);
      }
      if (o) {
        if (o.current_weight_kg) setCurrentWeight(String(o.current_weight_kg));
        if (o.target_weight_kg)  setTargetWeight(String(o.target_weight_kg));
        if (o.height_cm)         setHeight(String(o.height_cm));
        if (o.fitness_goal)      setFitnessGoal(o.fitness_goal);
        if (o.activity_level)    setActivityLevel(o.activity_level);
        if (o.experience_level)  setExperience(o.experience_level);
        const dr = Array.isArray(o.dietary_restrictions) ? o.dietary_restrictions.join(', ') : (o.dietary_restrictions ?? '');
        if (dr) setDietary(dr);
        if (o.health_conditions) setHealth(o.health_conditions);
      }
    });
  }, [user?.id]);

  const saveAll = async () => {
    if (!user?.id) return;
    setSaving(true);
    setSaveError('');
    try {
      const dietaryArr = dietary ? dietary.split(',').map(s => s.trim()).filter(Boolean) : [];
      const [profileRes, onboardRes] = await Promise.all([
        supabase.from('profiles').update({
          full_name:     fullName.trim(),
          phone:         phone.trim(),
          date_of_birth: dob || null,
          gender:        gender || null,
          location:      location.trim() || null,
          bio:           bio.trim() || null,
        }).eq('id', user.id),
        supabase.from('onboarding_responses').upsert({
          user_id:              user.id,
          current_weight_kg:    currentWeight ? parseFloat(currentWeight) : null,
          target_weight_kg:     targetWeight  ? parseFloat(targetWeight)  : null,
          height_cm:            height        ? parseFloat(height)        : null,
          fitness_goal:         fitnessGoal   || null,
          activity_level:       activityLevel || null,
          experience_level:     experience    || null,
          dietary_restrictions: dietaryArr,
          health_conditions:    health.trim() || null,
        }, { onConflict: 'user_id' }),
      ]);
      if (profileRes.error) throw new Error(profileRes.error.message);
      if (onboardRes.error) console.warn('[profile] onboarding_responses upsert:', onboardRes.error.message);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/reset-password` });
    setResetLoading(false); setResetSent(true);
  };

  const initials  = (fullName || user?.email || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const memberSince = user?.profile?.created_at
    ? new Date(user.profile.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long' })
    : '—';

  /* ── shared micro-styles ── */
  const inp: CSSProperties = { width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:10, padding:'0.68rem 0.9rem', fontSize:'0.855rem', color:'white', outline:'none', boxSizing:'border-box' };
const lbl: CSSProperties = { display:'block', fontSize:'0.67rem', fontWeight:700, color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem' };
  const card: CSSProperties = { background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'1.5rem', marginBottom:'1rem' };
  const sectionTitle: CSSProperties = { fontSize:'0.78rem', fontWeight:700, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1.1rem' };
  const grid2: CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.85rem' };


  return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:'0 0 3rem' }}>

      {/* ── Hero header ── */}
      <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', marginBottom:'2rem', padding:'1.5rem', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16 }}>
        <div style={{ width:76, height:76, borderRadius:'50%', background:'linear-gradient(135deg,#C9A84C,#E8CC6E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:800, color:'#0B0B0B', flexShrink:0, boxShadow:'0 4px 20px rgba(201,168,76,0.3)' }}>
          {initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:'1.15rem', fontWeight:700, color:'white', marginBottom:3 }}>{fullName || user?.email}</p>
          <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.32)', marginBottom:6 }}>{t('client.memberSince')}: {memberSince}</p>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            {user?.email && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:'0.68rem', color:'rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:999, padding:'0.2rem 0.65rem' }}>
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
                {user.email}
              </span>
            )}
            {fitnessGoal && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:'0.68rem', color:'rgba(201,168,76,0.75)', background:'rgba(201,168,76,0.07)', border:'1px solid rgba(201,168,76,0.18)', borderRadius:999, padding:'0.2rem 0.65rem' }}>
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>
                {fitnessGoal}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 1. Account Information (read-only) ── */}
      <div style={card}>
        <p style={sectionTitle}>{t('client.accountInfo')}</p>
        <div style={grid2}>
          <div>
            <span style={lbl}>{t('client.emailAddress')}</span>
            <p style={{ fontSize:'0.855rem', color:'rgba(255,255,255,0.45)', wordBreak:'break-all', padding:'0.68rem 0.9rem', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10 }}>{user?.email ?? '—'}</p>
          </div>
          <div>
            <span style={lbl}>{t('client.memberSince')}</span>
            <p style={{ fontSize:'0.855rem', color:'rgba(255,255,255,0.45)', padding:'0.68rem 0.9rem', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10 }}>{memberSince}</p>
          </div>
        </div>
      </div>

      {/* ── 2. Personal Information ── */}
      <div style={card}>
        <p style={sectionTitle}>{t('client.personalInfo')}</p>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
          <div style={grid2}>
            <div>
              <span style={lbl}>{t('client.fullName')}</span>
              <input style={inp} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <span style={lbl}>{t('client.phone')}</span>
              <input style={inp} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+971 50 000 0000" />
            </div>
          </div>
          <div style={grid2}>
            <div>
              <span style={lbl}>Date of Birth</span>
              <input type="date" style={{ ...inp, colorScheme:'dark' }} value={dob} onChange={e=>setDob(e.target.value)} />
            </div>
            <div>
              <span style={lbl}>Gender</span>
              <CustomSelect
                value={gender}
                onChange={setGender}
                placeholder="Select gender"
                searchable={false}
                options={[
                  { value:'Male',              label:'Male' },
                  { value:'Female',            label:'Female' },
                  { value:'Prefer not to say', label:'Prefer not to say' },
                ]}
              />
            </div>
          </div>
          <div>
            <span style={lbl}>Location / City</span>
            <input style={inp} value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Dubai, UAE" />
          </div>
          <div>
            <span style={lbl}>Bio <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span></span>
            <textarea style={{ ...inp, resize:'none', minHeight:72 }} value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell your coach a bit about yourself…" />
          </div>
        </div>
      </div>

      {/* ── 3. Fitness Profile ── */}
      <div style={card}>
        <p style={sectionTitle}>Fitness Profile</p>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
          <div style={grid2}>
            <div>
              <span style={lbl}>Current Weight (kg)</span>
              <input type="number" style={inp} value={currentWeight} onChange={e=>setCurrentWeight(e.target.value)} placeholder="e.g. 80" />
            </div>
            <div>
              <span style={lbl}>Target Weight (kg)</span>
              <input type="number" style={inp} value={targetWeight} onChange={e=>setTargetWeight(e.target.value)} placeholder="e.g. 72" />
            </div>
          </div>
          <div style={grid2}>
            <div>
              <span style={lbl}>Height (cm)</span>
              <input type="number" style={inp} value={height} onChange={e=>setHeight(e.target.value)} placeholder="e.g. 175" />
            </div>
            <div>
              <span style={lbl}>Experience Level</span>
              <CustomSelect
                value={experience}
                onChange={setExperience}
                placeholder="Select level"
                searchable={false}
                options={[
                  { value:'Beginner',     label:'Beginner (under 1 year)' },
                  { value:'Intermediate', label:'Intermediate (1–3 years)' },
                  { value:'Advanced',     label:'Advanced (3+ years)' },
                ]}
              />
            </div>
          </div>
          <div>
            <span style={lbl}>Primary Fitness Goal</span>
            {/* Values must match the onboarding chip values exactly so saved data pre-populates */}
            <CustomSelect
              value={fitnessGoal}
              onChange={setFitnessGoal}
              placeholder="Select goal"
              searchable={false}
              options={[
                { value:'Muscle Building', label:'Muscle Building' },
                { value:'Fat Loss',        label:'Fat Loss' },
                { value:'Summer Body',     label:'Summer Body' },
                { value:'General Fitness', label:'General Fitness' },
                { value:'Workout Only',    label:'Workout Only' },
                { value:'Meal Plan Only',  label:'Meal Plan Only' },
              ]}
            />
          </div>
          <div>
            <span style={lbl}>Activity Level</span>
            <CustomSelect
              value={activityLevel}
              onChange={setActivityLevel}
              placeholder="Select activity level"
              searchable={false}
              options={[
                { value:'Sedentary (desk job)',          label:'Sedentary — desk job, little movement' },
                { value:'Lightly Active (1–3x/week)',    label:'Lightly Active — 1–3x per week' },
                { value:'Moderately Active (3–5x/week)', label:'Moderately Active — 3–5x per week' },
                { value:'Very Active (6–7x/week)',       label:'Very Active — 6–7x per week' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ── 4. Dietary & Health ── */}
      <div style={card}>
        <p style={sectionTitle}>Dietary & Health Info</p>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
          <div>
            <span style={lbl}>Dietary Restrictions</span>
            <input style={inp} value={dietary} onChange={e=>setDietary(e.target.value)} placeholder="e.g. Vegetarian, Gluten-Free, Halal…" />
            <p style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.22)', marginTop:'0.35rem' }}>Separate multiple items with commas</p>
          </div>
          <div>
            <span style={lbl}>Health Conditions</span>
            <textarea style={{ ...inp, resize:'none', minHeight:80 }} value={health} onChange={e=>setHealth(e.target.value)} placeholder="e.g. Diabetes, Knee Injury, Hypertension…" />
          </div>
          <div style={{ display:'flex', alignItems:'flex-start', gap:'0.55rem', background:'rgba(201,168,76,0.04)', border:'1px solid rgba(201,168,76,0.12)', borderRadius:10, padding:'0.65rem 0.8rem' }}>
            <svg style={{ flexShrink:0, marginTop:1 }} width="13" height="13" fill="none" stroke="rgba(201,168,76,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <p style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.28)', lineHeight:1.65, margin:0 }}>
              This information is private and only visible to your assigned coach.
            </p>
          </div>
        </div>
      </div>

      {/* ── Single Save Button ── */}
      <div style={{ marginBottom:'1rem' }}>
        {saveError && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.65rem 1rem', background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.22)', borderRadius:10, marginBottom:'0.75rem' }}>
            <svg style={{ width:13, height:13, flexShrink:0 }} fill="none" stroke="rgba(248,113,113,0.85)" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>
            <p style={{ fontSize:'0.78rem', color:'rgba(248,113,113,0.85)', margin:0 }}>{saveError}</p>
          </div>
        )}
        <button
          onClick={saveAll}
          disabled={saving}
          style={{
            width:'100%', padding:'0.82rem 1.5rem',
            background: saved
              ? 'rgba(34,197,94,0.1)'
              : 'linear-gradient(135deg,#C9A84C 0%,#E8CC6E 50%,#C9A84C 100%)',
            border: saved ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent',
            borderRadius:12,
            color: saved ? '#4ade80' : '#0B0B0B',
            fontWeight:800, fontSize:'0.85rem',
            letterSpacing:'0.04em', textTransform:'uppercase',
            cursor: saving ? 'default' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition:'all 0.22s ease',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'0.55rem',
          }}
        >
          {saved ? (
            <>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
              Changes Saved!
            </>
          ) : saving ? (
            <>
              <svg style={{ animation:'spin 0.8s linear infinite' }} width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
              Saving…
            </>
          ) : (
            <>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"/></svg>
              {t('client.saveChanges')}
            </>
          )}
        </button>
      </div>

      {/* ── 5. Change Password ── */}
      <div style={card}>
        <p style={sectionTitle}>{t('client.changePassword')}</p>
        <p style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.3)', marginBottom:'1rem', lineHeight:1.6 }}>
          A password reset link will be sent to <strong style={{ color:'rgba(255,255,255,0.5)' }}>{user?.email}</strong>.
        </p>
        {resetSent ? (
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.7rem 1rem', background:'rgba(34,197,94,0.07)', border:'1px solid rgba(34,197,94,0.22)', borderRadius:10 }}>
            <svg style={{ width:14, height:14, flexShrink:0 }} fill="none" stroke="rgba(34,197,94,0.85)" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
            <p style={{ fontSize:'0.8rem', color:'rgba(34,197,94,0.85)' }}>{t('client.resetEmailSent')}</p>
          </div>
        ) : (
          <button onClick={handlePasswordReset} disabled={resetLoading}
            style={{ padding:'0.65rem 1.25rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'rgba(255,255,255,0.65)', fontWeight:600, fontSize:'0.78rem', cursor: resetLoading ? 'default' : 'pointer', opacity: resetLoading ? 0.6 : 1, display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <svg style={{ width:14, height:14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
            {resetLoading ? '…' : t('client.sendResetEmail')}
          </button>
        )}
      </div>

    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function ClientDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [tab, setTab] = useState('overview');

  // Role guard — send coaches and admins to their own dashboards
  useEffect(() => {
    if (!user?.profile) return;
    if (user.profile.role === 'admin') router.replace('/dashboard/admin');
    else if (user.profile.role === 'coach') router.replace('/dashboard/coach');
  }, [user?.profile, router]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'loading'|'active'|'inactive'>('loading');

  const navItems: NavItem[] = [
    { id: 'overview',     label: t('client.overview'),    icon: Icons.grid  },
    { id: 'meal-plan',    label: t('client.mealPlan'),    icon: Icons.meal  },
    { id: 'workout',      label: t('client.workoutPlan'), icon: Icons.bolt  },
    { id: 'progress',     label: t('client.progress'),    icon: Icons.chart },
    { id: 'messages',     label: t('client.messages'),    icon: Icons.chat    },
    { id: 'subscription', label: t('client.subscription'),icon: Icons.card    },
    { id: 'orders',       label: t('client.orders'),      icon: Icons.receipt },
    { id: 'profile',      label: t('client.profile'),     icon: Icons.settings },
  ];
  const [showOnboarding, setShowOnboarding] = useState(false);
  // Prevents the useEffect from re-showing the modal after the user just completed onboarding
  const onboardingDoneRef = useRef(false);
  const [mealPlan, setMealPlan] = useState<MealPlan|null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan|null>(null);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubInfo|null>(null);

  // Check subscription status on mount
  // A subscription is considered active if status='active' OR if it's cancelled but hasn't expired yet
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    async function checkSubscription() {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('status, expires_at, plan_name, cancel_at_period_end')
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setSubscriptionStatus('inactive');
          return;
        }

        setSubscription({ 
          expires_at: data.expires_at, 
          plan_name: data.plan_name ?? 'Full Coaching', 
          cancel_at_period_end: data.cancel_at_period_end ?? false 
        });

        const isActive = data.status === 'active';
        const isCancelledButValid = data.status === 'cancelled' && data.expires_at && new Date(data.expires_at) > new Date();
        
        if (isActive || isCancelledButValid) {
          setSubscriptionStatus('active');
        } else {
          setSubscriptionStatus('inactive');
        }
      } catch {
        setSubscriptionStatus('inactive');
      }
    }
    checkSubscription();
  }, [user?.id]);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    const [mp, wp, logs] = await Promise.all([
      // .maybeSingle() instead of .single() — returns null (not 406) when no plan assigned yet
      supabase.from('meal_plans').select('id, title, meal_plan_items(*)').eq('client_id', user.id).order('created_at',{ascending:false}).limit(1).maybeSingle(),
      supabase.from('workout_plans').select('id, title, workout_plan_days(id, day_label, focus, sort_order, workout_exercises(*))').eq('client_id', user.id).order('created_at',{ascending:false}).limit(1).maybeSingle(),
      supabase.from('progress_logs').select('*').eq('user_id', user.id).order('logged_at',{ascending:false}).limit(30),
    ]);
    if (mp.data) setMealPlan(mp.data as unknown as MealPlan);
    if (wp.data) setWorkoutPlan(wp.data as unknown as WorkoutPlan);
    if (logs.data) setProgressLogs(logs.data as ProgressLog[]);
    setLoading(false);
  }, [user?.id]);

  useEffect(()=>{ loadData(); }, [loadData]);

  useEffect(()=>{
    // Don't re-trigger the modal if the user just completed onboarding in this session
    if (onboardingDoneRef.current) return;
    if (user?.profile && !user.profile.onboarding_completed) setShowOnboarding(true);
  }, [user]);

  // Tabs that are always accessible even without an active subscription
  const openTabs = new Set(['subscription', 'orders', 'profile']);

  const render = () => {
    // While auth/subscription is still resolving, show a neutral loader
    if (subscriptionStatus === 'loading') {
      return <SkDashboardInit role="client" />;
    }
    // Show gate for locked tabs if subscription is inactive
    if (subscriptionStatus === 'inactive' && !openTabs.has(tab)) {
      return <SubscriptionGate />;
    }
    switch(tab) {
      case 'overview':     return <OverviewTab progressLogs={progressLogs} mealPlan={mealPlan} workoutPlan={workoutPlan} onNavigate={setTab} subscription={subscription} />;
      case 'meal-plan':    return <MealPlanTab mealPlan={mealPlan} loading={loading} onNavigate={setTab} />;
      case 'workout':      return <WorkoutTab workoutPlan={workoutPlan} loading={loading} />;
      case 'progress':     return <ProgressTab progressLogs={progressLogs} onLogged={loadData} />;
      case 'messages':     return <MessagesTab />;
      case 'subscription': return user ? <SubscriptionTab userId={user.id} /> : <SkSubscription />;
      case 'orders':       return user ? <OrdersTab userId={user.id} /> : <SkOrders />;
      case 'profile':      return <ProfileTab />;
      default: return null;
    }
  };

  return (
    <>
      <style>{`
        /* ─── Client Dashboard Mobile Responsive ─── */

        /* Stats grid: 2-col on mobile, 4-col on large */
        .cd-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }
        @media (max-width: 479px) {
          .cd-stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
        }
        @media (min-width: 1024px) {
          .cd-stats-grid { grid-template-columns: repeat(4, 1fr); }
        }

        /* Quick actions grid: 2-col collapsing to 1-col on very small screens */
        .cd-quick-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        @media (max-width: 479px) {
          .cd-quick-grid { grid-template-columns: 1fr; gap: 10px; }
        }

        /* Progress main grid: 2-col, stacks on mobile */
        .cd-progress-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }
        @media (max-width: 767px) {
          .cd-progress-grid { grid-template-columns: 1fr; }
        }

        /* Body stat charts grid: stacks on mobile */
        .cd-bodystat-grid {
          display: grid;
          gap: 16px;
          margin-bottom: 20px;
        }
        @media (max-width: 767px) {
          .cd-bodystat-grid { grid-template-columns: 1fr !important; }
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Onboarding modal: full-width, scroll on mobile */
        .cd-onboarding-box {
          width: 100%;
          max-width: 680px;
          background: #0E0E0E;
          border: 1px solid rgba(201,168,76,0.22);
          border-radius: 24px;
          padding: 2.5rem;
          max-height: 90vh;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .cd-onboarding-box::-webkit-scrollbar { display: none; }
        @media (max-width: 639px) {
          .cd-onboarding-box {
            padding: 1.5rem 1.25rem;
            border-radius: 16px;
            margin: 0.5rem;
          }
        }

        /* Onboarding goal chips grid: 1-col on very small screens */
        .cd-chips-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 399px) {
          .cd-chips-grid { grid-template-columns: 1fr; }
        }

        /* Onboarding body stats inner grid: 2-col, 1-col on very small */
        .cd-bodystats-input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 399px) {
          .cd-bodystats-input-grid { grid-template-columns: 1fr; }
        }

        /* Progress inner 2-col inputs */
        .cd-inner-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 479px) {
          .cd-inner-grid-2 { grid-template-columns: 1fr; }
        }

        /* Subscription 3-col stat row: stacks on mobile */
        .cd-sub-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }
        @media (max-width: 639px) {
          .cd-sub-stats-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 399px) {
          .cd-sub-stats-grid { grid-template-columns: 1fr; }
        }

        /* Workout exercise row: wrap stats on small screens */
        .cd-exercise-row {
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .cd-exercise-stats {
          display: flex;
          gap: 20px;
          text-align: center;
          flex-shrink: 0;
          align-items: center;
        }
        @media (max-width: 639px) {
          .cd-exercise-row { flex-wrap: wrap; gap: 0.75rem; }
          .cd-exercise-stats { gap: 12px; margin-left: 0; width: 100%; justify-content: flex-start; }
        }

        /* Subscription active plan card price: shrink on mobile */
        @media (max-width: 479px) {
          .cd-sub-price { font-size: 1.5rem !important; }
          .cd-sub-header { flex-direction: column !important; gap: 8px !important; }
        }

        /* Body check upload row: wrap on mobile */
        .cd-bodycheck-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        @media (max-width: 479px) {
          .cd-bodycheck-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
        }

        /* Messages chat box: reduce min-height on mobile */
        @media (max-width: 639px) {
          .cd-chat-box { height: clamp(420px, 65vh, 600px) !important; }
        }

        /* Meal plan request-changes footer row: stack on mobile */
        .cd-meal-footer {
          padding: 1.25rem 1.5rem;
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        @media (max-width: 479px) {
          .cd-meal-footer { flex-direction: column; align-items: flex-start; }
        }

        /* Overview subscription pill row: stack on mobile */
        .cd-sub-pill-row {
          padding: 1.35rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        @media (max-width: 479px) {
          .cd-sub-pill-row { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
          .cd-sub-pill-row .ds-btn-gold { align-self: flex-start; }
        }

        /* Invoice rows: tighten on mobile */
        @media (max-width: 479px) {
          .cd-invoice-row { flex-wrap: wrap; gap: 0.5rem; }
          .cd-invoice-row > div:first-child { flex: 1 1 100%; }
        }
      `}</style>
      {showOnboarding && <OnboardingModal onComplete={()=>{ onboardingDoneRef.current = true; setShowOnboarding(false); loadData(); }} />}
      <DashboardShell role="client" navItems={navItems} activeTab={tab} onTabChange={setTab}>
        {render()}
      </DashboardShell>
    </>
  );
}
