/**
 * Skeleton loader components for OMR+ platform.
 * All components use the .sk-base class (defined in globals.css) for the shimmer sweep.
 */

import React from 'react';

/* ─── Base primitive ─────────────────────────────────── */
export function Sk({
  w = '100%',
  h = 12,
  r = 6,
  style,
}: {
  w?: string | number;
  h?: string | number;
  r?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="sk-base"
      style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...style }}
    />
  );
}

/* ─── Stat card grid (4 cards) ───────────────────────── */
export function SkStatCards({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1.35rem' }}>
          <Sk w={36} h={36} r={10} style={{ marginBottom: 14 }} />
          <Sk w="55%" h={26} r={6} style={{ marginBottom: 8 }} />
          <Sk w="70%" h={11} r={4} style={{ marginBottom: 6 }} />
          <Sk w="45%" h={9}  r={4} />
        </div>
      ))}
    </div>
  );
}

/* ─── Table rows ─────────────────────────────────────── */
export function SkTableRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  const colWidths = ['40%', '20%', '20%', '15%', '12%', '10%'];
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
      {/* header */}
      <div style={{ display: 'flex', gap: '1.5rem', padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Sk key={i} w={colWidths[i] ?? '15%'} h={10} r={4} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '1.5rem', padding: '0.9rem 1.25rem', borderBottom: r < rows - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
          {Array.from({ length: cols }).map((_, c) => (
            c === 0
              ? <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: colWidths[0] }}>
                  <Sk w={28} h={28} r={50} />
                  <Sk w="60%" h={11} r={4} />
                </div>
              : <Sk key={c} w={colWidths[c] ?? '15%'} h={11} r={4} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── Card list (coach client list, etc.) ────────────── */
export function SkCardList({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Sk w={40} h={40} r={50} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Sk w="35%" h={12} r={5} />
            <Sk w="55%" h={9} r={4} />
          </div>
          <Sk w={64} h={24} r={8} />
        </div>
      ))}
    </div>
  );
}

/* ─── Overview tab (client & coach) ─────────────────── */
export function SkOverview() {
  return (
    <div>
      {/* heading */}
      <div style={{ marginBottom: '1.75rem' }}>
        <Sk w="28%" h={28} r={7} style={{ marginBottom: 10 }} />
        <Sk w="42%" h={11} r={5} />
      </div>
      <SkStatCards />
      {/* quick-action cards 2×2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 20 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.35rem 1.5rem' }}>
            <Sk w="55%" h={13} r={5} style={{ marginBottom: 8 }} />
            <Sk w="70%" h={10} r={4} />
          </div>
        ))}
      </div>
      {/* subscription banner */}
      <div style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: '1.35rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Sk w={40} h={40} r={10} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Sk w="35%" h={13} r={5} />
          <Sk w="50%" h={10} r={4} />
        </div>
        <Sk w={90} h={34} r={9} />
      </div>
    </div>
  );
}

/* ─── Meal plan tab ──────────────────────────────────── */
export function SkMealPlan() {
  const meals = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <Sk w={200} h={18} r={6} style={{ marginBottom: 8 }} />
          <Sk w={140} h={11} r={4} />
        </div>
        <Sk w={80} h={24} r={8} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {meals.map(m => (
          <div key={m} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
            {/* meal heading */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <Sk w={100} h={13} r={5} />
              <Sk w={60} h={11} r={5} />
            </div>
            {/* items */}
            {[0, 1].map(i => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: 10, marginBottom: i === 0 ? 10 : 0, borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <Sk w={32} h={32} r={8} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Sk w="45%" h={12} r={4} />
                  <Sk w="30%" h={9}  r={4} />
                </div>
                <Sk w={48} h={11} r={4} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Workout plan tab ───────────────────────────────── */
export function SkWorkoutPlan() {
  return (
    <div>
      <Sk w={220} h={18} r={6} style={{ marginBottom: 8 }} />
      <Sk w={160} h={11} r={4} style={{ marginBottom: '1.5rem' }} />
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'hidden', marginBottom: '1.5rem' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <Sk key={i} w={72} h={34} r={10} style={{ flexShrink: 0 }} />
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <Sk w={130} h={14} r={5} />
          <Sk w={80} h={11} r={4} />
        </div>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.85rem 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <Sk w={36} h={36} r={9} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Sk w="40%" h={12} r={4} />
              <Sk w="60%" h={9} r={4} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Sk w={42} h={22} r={6} />
              <Sk w={42} h={22} r={6} />
              <Sk w={42} h={22} r={6} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Progress tab ───────────────────────────────────── */
export function SkProgress() {
  return (
    <div>
      <Sk w={200} h={18} r={6} style={{ marginBottom: 8 }} />
      <Sk w={150} h={11} r={4} style={{ marginBottom: '1.5rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Log form card */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Sk w="50%" h={14} r={5} />
          <Sk w="100%" h={36} r={8} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Sk h={36} r={8} />
            <Sk h={36} r={8} />
          </div>
          <Sk w="100%" h={36} r={8} />
          <Sk w="100%" h={38} r={9} />
        </div>
        {/* Chart card */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.75rem' }}>
          <Sk w="45%" h={14} r={5} style={{ marginBottom: '1.25rem' }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, marginBottom: 12 }}>
            {[60, 80, 50, 95, 70, 85, 45, 75].map((h, i) => (
              <Sk key={i} w="100%" h={`${h}%`} r={4} style={{ flex: 1 }} />
            ))}
          </div>
          <Sk w="55%" h={10} r={4} />
        </div>
      </div>
      {/* History table */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.75rem', marginBottom: 16 }}>
        <Sk w="30%" h={14} r={5} style={{ marginBottom: '1rem' }} />
        <SkTableRows rows={4} cols={4} />
      </div>
      {/* Body check upload */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Sk w={160} h={13} r={5} />
          <Sk w={220} h={9} r={4} />
        </div>
        <Sk w={110} h={36} r={9} />
      </div>
    </div>
  );
}

/* ─── Messages / Chat tab ────────────────────────────── */
export function SkMessages() {
  const bubbles = [
    { mine: false, w: '55%' },
    { mine: true,  w: '45%' },
    { mine: false, w: '65%' },
    { mine: true,  w: '38%' },
    { mine: false, w: '50%' },
    { mine: true,  w: '60%' },
  ];
  return (
    <div>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Sk w={36} h={36} r={50} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <Sk w={120} h={12} r={5} />
          <Sk w={80} h={9} r={4} />
        </div>
      </div>
      {/* Chat area */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.25rem', height: 360, display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
        {bubbles.map((b, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: b.mine ? 'flex-end' : 'flex-start' }}>
            <Sk w={b.w} h={36} r={12} />
          </div>
        ))}
      </div>
      {/* Input */}
      <div style={{ display: 'flex', gap: '0.65rem' }}>
        <Sk h={44} style={{ flex: 1 }} r={10} />
        <Sk w={44} h={44} r={10} />
      </div>
    </div>
  );
}

/* ─── Subscription tab ───────────────────────────────── */
export function SkSubscription() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Plan card */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Sk w={160} h={15} r={6} />
            <Sk w={110} h={11} r={4} />
          </div>
          <Sk w={80} h={26} r={8} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Sk w="50%" h={9} r={4} />
              <Sk w="70%" h={12} r={4} />
            </div>
          ))}
        </div>
        <Sk w="100%" h={38} r={9} />
      </div>
      {/* Invoices card */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1.5rem' }}>
        <Sk w={140} h={14} r={5} style={{ marginBottom: 6 }} />
        <Sk w={200} h={10} r={4} style={{ marginBottom: 16 }} />
        {[0, 1, 2].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <Sk w={44} h={24} r={6} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Sk w="40%" h={11} r={4} />
              <Sk w="25%" h={9} r={4} />
            </div>
            <Sk w={60} h={11} r={4} />
            <Sk w={70} h={28} r={7} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Orders tab ─────────────────────────────────────── */
export function SkOrders() {
  return (
    <div>
      <Sk w={140} h={18} r={6} style={{ marginBottom: 8 }} />
      <Sk w={220} h={11} r={4} style={{ marginBottom: '1.75rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Sk w={110} h={11} r={4} />
                <Sk w={80} h={9} r={4} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Sk w={64} h={22} r={6} />
                <Sk w={60} h={14} r={5} />
                <Sk w={24} h={24} r={6} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Coach overview ─────────────────────────────────── */
export function SkCoachOverview() {
  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <Sk w={80} h={10} r={5} style={{ marginBottom: 8 }} />
        <Sk w="35%" h={28} r={7} style={{ marginBottom: 8 }} />
        <Sk w="45%" h={11} r={4} />
      </div>
      <SkStatCards />
      {/* client roster card */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Sk w={150} h={14} r={5} />
            <Sk w={110} h={10} r={4} />
          </div>
          <Sk w={80} h={30} r={8} />
        </div>
        <SkTableRows rows={5} cols={4} />
      </div>
    </div>
  );
}

/* ─── Coach progress monitor ─────────────────────────── */
export function SkProgressMonitor() {
  return (
    <div>
      <Sk w={200} h={18} r={6} style={{ marginBottom: 8 }} />
      <Sk w={160} h={11} r={4} style={{ marginBottom: '1.5rem' }} />
      <Sk w="100%" h={42} r={9} style={{ marginBottom: '1.5rem' }} />
      {/* log rows */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.5rem' }}>
        <Sk w={140} h={14} r={5} style={{ marginBottom: '1rem' }} />
        <SkTableRows rows={5} cols={5} />
      </div>
      {/* body checks */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.5rem', marginTop: '1rem' }}>
        <Sk w={140} h={14} r={5} style={{ marginBottom: '1rem' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0' }}>
              <Sk w={32} h={32} r={8} />
              <Sk w="50%" h={11} r={4} />
              <Sk w={70} h={9} r={4} style={{ marginLeft: 'auto' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Admin overview ─────────────────────────────────── */
export function SkAdminOverview() {
  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <Sk w={80} h={10} r={5} style={{ marginBottom: 8 }} />
        <Sk w="30%" h={28} r={7} style={{ marginBottom: 8 }} />
        <Sk w="42%" h={11} r={4} />
      </div>
      <SkStatCards />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem' }}>
        {[0, 1].map(col => (
          <div key={col} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <Sk w={130} h={13} r={5} />
              <Sk w={60} h={26} r={7} />
            </div>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.55rem 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <Sk w={28} h={28} r={50} />
                <Sk w="55%" h={11} r={4} style={{ flex: 1 }} />
                <Sk w={50} h={20} r={6} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Admin users/subscriptions table ────────────────── */
export function SkAdminTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Sk w={160} h={16} r={6} />
          <Sk w={100} h={10} r={4} />
        </div>
        <Sk w={180} h={38} r={9} />
      </div>
      <SkTableRows rows={rows} cols={cols} />
    </div>
  );
}

/* ─── Marketplace product grid ───────────────────────── */
export function SkProductGrid() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Sk w={180} h={16} r={6} />
          <Sk w={140} h={10} r={4} />
        </div>
        <Sk w={120} h={36} r={9} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem' }}>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Sk w="100%" h={140} r={10} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Sk w="55%" h={13} r={5} />
              <Sk w={60} h={22} r={6} />
            </div>
            <Sk w="80%" h={9} r={4} />
            <Sk w="40%" h={9} r={4} />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Sk w={50} h={28} r={7} />
              <Sk w={28} h={28} r={7} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Pricing plans grid ─────────────────────────────── */
export function SkPricingPlans() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Sk w={160} h={16} r={6} />
          <Sk w={120} h={10} r={4} />
        </div>
        <Sk w={120} h={36} r={9} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Sk w="50%" h={20} r={6} />
            <Sk w="70%" h={11} r={4} />
            <Sk w="40%" h={28} r={7} style={{ marginTop: 4 }} />
            {[0, 1, 2, 3].map(f => (
              <div key={f} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Sk w={14} h={14} r={50} />
                <Sk w="65%" h={10} r={4} />
              </div>
            ))}
            <Sk w="100%" h={38} r={9} style={{ marginTop: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Analytics charts ───────────────────────────────── */
export function SkAnalytics() {
  return (
    <div>
      <Sk w={160} h={18} r={6} style={{ marginBottom: 8 }} />
      <Sk w={220} h={11} r={4} style={{ marginBottom: '2rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {[0, 1].map(i => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.5rem' }}>
            <Sk w="40%" h={13} r={5} style={{ marginBottom: '1.25rem' }} />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
              {[55, 70, 45, 80, 60, 90, 50, 75, 85, 65].map((h, j) => (
                <Sk key={j} w="100%" h={`${h}%`} r={4} style={{ flex: 1 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <SkTableRows rows={4} cols={4} />
    </div>
  );
}

/* ─── Video library ──────────────────────────────────── */
export function SkVideos() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Sk w={140} h={16} r={6} />
          <Sk w={180} h={10} r={4} />
        </div>
        <Sk w={120} h={36} r={9} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
            <Sk w="100%" h={130} r={0} />
            <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Sk w="75%" h={12} r={4} />
              <Sk w="40%" h={9}  r={4} />
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: 2 }}>
                <Sk w={60} h={26} r={7} />
                <Sk w={26} h={26} r={7} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CMS section ────────────────────────────────────── */
export function SkCMS() {
  return (
    <div style={{ display: 'flex', gap: '1.25rem' }}>
      {/* sidebar */}
      <div style={{ width: 200, flexShrink: 0, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <Sk key={i} w="100%" h={32} r={8} />
        ))}
      </div>
      {/* content area */}
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Sk w="40%" h={16} r={6} />
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Sk w="25%" h={10} r={4} />
            <Sk w="100%" h={40} r={8} />
          </div>
        ))}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 4 }}>
          <Sk w={80} h={36} r={8} />
          <Sk w={120} h={36} r={8} />
        </div>
      </div>
    </div>
  );
}

/* ─── Full dashboard init (replaces "Loading dashboard…") */
export function SkDashboardInit({ role = 'client' }: { role?: 'client' | 'coach' | 'admin' }) {
  if (role === 'admin') return (
    <div style={{ padding: '0.5rem 0' }}>
      <SkAdminOverview />
    </div>
  );
  if (role === 'coach') return (
    <div style={{ padding: '0.5rem 0' }}>
      <SkCoachOverview />
    </div>
  );
  return (
    <div style={{ padding: '0.5rem 0' }}>
      <SkOverview />
    </div>
  );
}

/* ─── Billing / order rows ───────────────────────────── */
export function SkOrderRows({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '1.5rem', padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {['12%', '18%', '12%', '14%', '12%', '14%', '12%'].map((w, i) => (
          <Sk key={i} w={w} h={10} r={4} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '1.5rem', padding: '0.9rem 1.25rem', borderBottom: r < rows - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
          {['12%', '18%', '12%', '14%', '12%', '14%', '12%'].map((w, c) => (
            <Sk key={c} w={w} h={11} r={c === 3 ? 6 : 4} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── Inline small loader (replaces loading text) ────── */
export function SkInline({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '1.5rem 0' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Sk key={i} w={`${60 + (i % 3) * 12}%`} h={12} r={5} />
      ))}
    </div>
  );
}
