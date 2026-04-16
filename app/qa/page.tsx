'use client';

import { useState, useEffect } from "react";

// ─── TEST DEFINITIONS ───────────────────────────────────────────────────────

const TEST_SUITE = {
  admin: {
    label: "Admin Panel",
    icon: "⚙️",
    color: "#FFD700",
    sections: [
      {
        name: "User Management",
        tests: [
          { id: "A-UM-01", name: "View all registered users", critical: true },
          { id: "A-UM-02", name: "Activate / deactivate user accounts", critical: true },
          { id: "A-UM-03", name: "View user profile + questionnaire answers", critical: false },
          { id: "A-UM-04", name: "Search & filter users by status/name", critical: false },
        ],
      },
      {
        name: "Trainer Management",
        tests: [
          { id: "A-TM-01", name: "Create trainer account", critical: true },
          { id: "A-TM-02", name: "Assign trainer to client", critical: true },
          { id: "A-TM-03", name: "View all trainer accounts", critical: true },
          { id: "A-TM-04", name: "Remove / deactivate trainer", critical: false },
        ],
      },
      {
        name: "Subscription & Payments",
        tests: [
          { id: "A-SP-01", name: "View all subscription plans", critical: true },
          { id: "A-SP-02", name: "Edit membership pricing (not hardcoded)", critical: true },
          { id: "A-SP-03", name: "View all payments & invoices", critical: true },
          { id: "A-SP-04", name: "Handle subscription cancellation webhook", critical: true },
          { id: "A-SP-05", name: "Handle renewal failure webhook", critical: true },
          { id: "A-SP-06", name: "Lock dashboard on subscription expiry", critical: true },
        ],
      },
      {
        name: "Marketplace Management",
        tests: [
          { id: "A-MM-01", name: "Add new product listing", critical: true },
          { id: "A-MM-02", name: "Edit product listing", critical: false },
          { id: "A-MM-03", name: "Remove product listing", critical: false },
          { id: "A-MM-04", name: "Add ebook listing", critical: false },
          { id: "A-MM-05", name: "Toggle marketplace Coming Soon state", critical: true },
          { id: "A-MM-06", name: "View all marketplace orders", critical: true },
        ],
      },
      {
        name: "Content & Media",
        tests: [
          { id: "A-CM-01", name: "Upload workout videos", critical: false },
          { id: "A-CM-02", name: "Control website content sections (coaches hidden)", critical: true },
          { id: "A-CM-03", name: "Bilingual content input (EN/AR)", critical: true },
          { id: "A-CM-04", name: "Transformation gallery privacy controls", critical: true },
        ],
      },
      {
        name: "Analytics & Communication",
        tests: [
          { id: "A-AC-01", name: "View platform analytics dashboard", critical: false },
          { id: "A-AC-02", name: "View all chat threads between clients/trainers", critical: false },
          { id: "A-AC-03", name: "Role-based access control (no cross-user exposure)", critical: true },
          { id: "A-AC-04", name: "Row-level security on Supabase", critical: true },
        ],
      },
    ],
  },
  coach: {
    label: "Coach / Trainer Panel",
    icon: "🏋️",
    color: "#4ADE80",
    sections: [
      {
        name: "Client Management",
        tests: [
          { id: "C-CM-01", name: "View all assigned clients list", critical: true },
          { id: "C-CM-02", name: "Add client by registered email", critical: true },
          { id: "C-CM-03", name: "View client profile: goals, questionnaire, body stats", critical: true },
          { id: "C-CM-04", name: "Access only assigned clients (not all users)", critical: true },
        ],
      },
      {
        name: "Meal Plan Builder",
        tests: [
          { id: "C-MP-01", name: "Create meal plan per client", critical: true },
          { id: "C-MP-02", name: "Input food type, name, grams, meal timing", critical: true },
          { id: "C-MP-03", name: "Save & assign plan to client account", critical: true },
          { id: "C-MP-04", name: "Update and push revised meal plan", critical: true },
          { id: "C-MP-05", name: "Bilingual meal name input (EN/AR)", critical: false },
        ],
      },
      {
        name: "Workout Plan Builder",
        tests: [
          { id: "C-WP-01", name: "Create day-by-day workout plan per client", critical: true },
          { id: "C-WP-02", name: "Free-text exercise name field (not dropdown)", critical: true },
          { id: "C-WP-03", name: "Input sets, reps, rest time, notes", critical: true },
          { id: "C-WP-04", name: "Upload exercise images per exercise", critical: false },
          { id: "C-WP-05", name: "Upload exercise videos per exercise", critical: false },
          { id: "C-WP-06", name: "Assign completed plan to client", critical: true },
          { id: "C-WP-07", name: "Exercise categories: Chest/Back/Legs/Shoulders/Arms/Abs/Cardio", critical: false },
        ],
      },
      {
        name: "Progress Monitoring",
        tests: [
          { id: "C-PM-01", name: "View client-submitted progress entries", critical: true },
          { id: "C-PM-02", name: "Review PDF body scans (InBody) uploaded by client", critical: true },
          { id: "C-PM-03", name: "View progress history timeline/chart", critical: false },
        ],
      },
      {
        name: "Communication",
        tests: [
          { id: "C-CO-01", name: "Chat with assigned client from dashboard", critical: true },
          { id: "C-CO-02", name: "Real-time or near-real-time message delivery", critical: true },
          { id: "C-CO-03", name: "Message history stored & accessible", critical: true },
        ],
      },
    ],
  },
  client: {
    label: "Client / User Panel",
    icon: "👤",
    color: "#60A5FA",
    sections: [
      {
        name: "Onboarding",
        tests: [
          { id: "U-ON-01", name: "Onboarding questionnaire on first login", critical: true },
          { id: "U-ON-02", name: "Collects: fitness goals, weight, dietary restrictions, health conditions", critical: true },
          { id: "U-ON-03", name: "Data stored in profile visible to trainer", critical: true },
          { id: "U-ON-04", name: "Questionnaire not repeated on subsequent logins", critical: false },
        ],
      },
      {
        name: "Meal Plan View",
        tests: [
          { id: "U-MP-01", name: "View trainer-assigned meal plan", critical: true },
          { id: "U-MP-02", name: "Meals displayed by timing: Breakfast/Lunch/Snack/Dinner", critical: true },
          { id: "U-MP-03", name: "Each meal shows: food name, grams, nutritional notes", critical: true },
          { id: "U-MP-04", name: "Client cannot edit their own plan", critical: true },
          { id: "U-MP-05", name: "Send plan change request via messaging", critical: false },
        ],
      },
      {
        name: "Workout Plan View",
        tests: [
          { id: "U-WP-01", name: "View day-wise workout schedule", critical: true },
          { id: "U-WP-02", name: "View exercise name, sets, reps, rest time", critical: true },
          { id: "U-WP-03", name: "View workout images uploaded by trainer", critical: false },
          { id: "U-WP-04", name: "View workout videos uploaded by trainer", critical: false },
        ],
      },
      {
        name: "Progress Tracking",
        tests: [
          { id: "U-PT-01", name: "Log weight and body stats", critical: true },
          { id: "U-PT-02", name: "View progress history (timeline or chart)", critical: true },
          { id: "U-PT-03", name: "Upload PDF body check (InBody scan)", critical: true },
          { id: "U-PT-04", name: "Upload progress photos", critical: false },
        ],
      },
      {
        name: "Messaging",
        tests: [
          { id: "U-MS-01", name: "Real-time chat with assigned trainer", critical: true },
          { id: "U-MS-02", name: "Message history stored & accessible", critical: true },
        ],
      },
      {
        name: "Subscription Management",
        tests: [
          { id: "U-SM-01", name: "View active plan, billing date, renewal status", critical: true },
          { id: "U-SM-02", name: "Access invoices from account", critical: true },
          { id: "U-SM-03", name: "Dashboard locked when subscription expired", critical: true },
        ],
      },
      {
        name: "Authentication & Security",
        tests: [
          { id: "U-AS-01", name: "Register via website", critical: true },
          { id: "U-AS-02", name: "Role-based login (client vs trainer vs admin)", critical: true },
          { id: "U-AS-03", name: "Cannot access trainer or admin routes", critical: true },
          { id: "U-AS-04", name: "Cannot see other clients' data", critical: true },
        ],
      },
    ],
  },
};

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  untested: { label: "Untested", color: "#6B7280", bg: "#1F2937" },
  pass: { label: "PASS", color: "#4ADE80", bg: "#052e16" },
  fail: { label: "FAIL", color: "#F87171", bg: "#2d0b0b" },
  partial: { label: "PARTIAL", color: "#FBBF24", bg: "#2d1f00" },
  blocked: { label: "BLOCKED", color: "#C084FC", bg: "#1e0a2e" },
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function OMRPlusTestSuite() {
  // ── Admin guard ──────────────────────────────────────────
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    import('@/lib/supabase').then(({ supabase }) => {
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) { setAuthed(false); return; }
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', user.id).single();
        setAuthed(profile?.role === 'admin');
      });
    });
  }, []);

  if (authed === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #FFD70033', borderTopColor: '#FFD700', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#e2e8f0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#F87171', letterSpacing: 2, marginBottom: 8 }}>ACCESS DENIED</div>
        <div style={{ fontSize: 11, color: '#4B5563', marginBottom: 24 }}>Admin credentials required to access the QA suite.</div>
        <a href="/dashboard/admin" style={{ fontSize: 11, color: '#FFD700', textDecoration: 'none', border: '1px solid #FFD70044', padding: '8px 20px', borderRadius: 6 }}>
          Go to Admin Panel
        </a>
      </div>
    );
  }
  // ────────────────────────────────────────────────────────

  const [activePanel, setActivePanel] = useState("admin");
  const [results, setResults] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Persist results & notes to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("omrplus-qa-results");
    const savedNotes = localStorage.getItem("omrplus-qa-notes");
    if (saved) setResults(JSON.parse(saved));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  useEffect(() => {
    localStorage.setItem("omrplus-qa-results", JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem("omrplus-qa-notes", JSON.stringify(notes));
  }, [notes]);

  const setResult = (id: string, status: string) => {
    setResults((prev) => ({ ...prev, [id]: status }));
  };

  const saveNote = (id: string) => {
    setNotes((prev) => ({ ...prev, [id]: noteText }));
    setActiveNote(null);
    setNoteText("");
  };

  const openNote = (id: string) => {
    setActiveNote(id);
    setNoteText(notes[id] || "");
  };

  const toggleSection = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetAll = () => {
    if (!confirm("Reset ALL test results and notes? This cannot be undone.")) return;
    setResults({});
    setNotes({});
    localStorage.removeItem("omrplus-qa-results");
    localStorage.removeItem("omrplus-qa-notes");
  };

  // Compute stats
  const computeStats = (panelKey: string) => {
    const suite = TEST_SUITE[panelKey as keyof typeof TEST_SUITE];
    const all = suite.sections.flatMap((s) => s.tests);
    const total = all.length;
    const pass = all.filter((t) => results[t.id] === "pass").length;
    const fail = all.filter((t) => results[t.id] === "fail").length;
    const partial = all.filter((t) => results[t.id] === "partial").length;
    const blocked = all.filter((t) => results[t.id] === "blocked").length;
    const untested = all.filter((t) => !results[t.id] || results[t.id] === "untested").length;
    const criticalFails = all.filter((t) => t.critical && results[t.id] === "fail").length;
    const pct = total > 0 ? Math.round(((pass + partial * 0.5) / total) * 100) : 0;
    return { total, pass, fail, partial, blocked, untested, criticalFails, pct };
  };

  const globalStats = () => {
    const keys = Object.keys(TEST_SUITE);
    const all = keys.flatMap((k) => TEST_SUITE[k as keyof typeof TEST_SUITE].sections.flatMap((s) => s.tests));
    return {
      total: all.length,
      pass: all.filter((t) => results[t.id] === "pass").length,
      fail: all.filter((t) => results[t.id] === "fail").length,
      criticalFails: all.filter((t) => t.critical && results[t.id] === "fail").length,
      untested: all.filter((t) => !results[t.id] || results[t.id] === "untested").length,
    };
  };

  const gs = globalStats();
  const panelColor = TEST_SUITE[activePanel as keyof typeof TEST_SUITE].color;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e2e8f0",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* HEADER */}
      <div style={{
        borderBottom: "1px solid #1e2433",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(90deg, #0a0a0f 0%, #0f1420 100%)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: "linear-gradient(135deg, #FFD700, #b8860b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900,
          }}>⊕</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#FFD700", letterSpacing: 2 }}>OMR+ PLATFORM</div>
            <div style={{ fontSize: 10, color: "#4B5563", letterSpacing: 1 }}>QA TEST SUITE v1.0</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#6B7280" }}>TOTAL TESTS</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{gs.total}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#4ADE80" }}>PASS</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#4ADE80" }}>{gs.pass}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#F87171" }}>FAIL</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#F87171" }}>{gs.fail}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#FBBF24" }}>UNTESTED</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#FBBF24" }}>{gs.untested}</div>
          </div>
          <button onClick={resetAll} style={{
            background: "transparent",
            color: "#4B5563",
            border: "1px solid #1e2433",
            borderRadius: 6, padding: "8px 12px",
            fontSize: 11, fontWeight: 700, letterSpacing: 1,
            cursor: "pointer",
          }}>
            ↺ RESET
          </button>
          <button onClick={() => setShowReport(true)} style={{
            background: gs.untested === 0 ? "linear-gradient(135deg, #FFD700, #b8860b)" : "#1e2433",
            color: gs.untested === 0 ? "#000" : "#6B7280",
            border: "1px solid",
            borderColor: gs.untested === 0 ? "#FFD700" : "#374151",
            borderRadius: 6, padding: "8px 16px",
            fontSize: 11, fontWeight: 700, letterSpacing: 1,
            cursor: "pointer", transition: "all 0.2s",
          }}>
            {gs.untested > 0 ? `${gs.untested} UNTESTED` : "⬇ EXPORT REPORT"}
          </button>
        </div>
      </div>

      {/* PANEL TABS */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e2433", background: "#0d1017" }}>
        {Object.entries(TEST_SUITE).map(([key, panel]) => {
          const stats = computeStats(key);
          const isActive = activePanel === key;
          return (
            <button key={key} onClick={() => setActivePanel(key)} style={{
              flex: 1, padding: "14px 16px",
              background: isActive ? "#0f1420" : "transparent",
              border: "none",
              borderBottom: isActive ? `2px solid ${panel.color}` : "2px solid transparent",
              color: isActive ? panel.color : "#6B7280",
              cursor: "pointer", transition: "all 0.2s",
              textAlign: "left",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>{panel.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{panel.label.toUpperCase()}</span>
              </div>
              <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
                <span style={{ color: "#4ADE80" }}>{stats.pass}P</span>
                <span style={{ color: "#F87171" }}>{stats.fail}F</span>
                <span style={{ color: "#FBBF24" }}>{stats.partial}~</span>
                <span style={{ color: "#6B7280" }}>{stats.untested}?</span>
                <span style={{ marginLeft: "auto", color: isActive ? panel.color : "#6B7280", fontWeight: 700 }}>
                  {stats.pct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* PANEL PROGRESS BAR */}
      {(() => {
        const stats = computeStats(activePanel);
        return (
          <div style={{ padding: "10px 24px", background: "#0d1017", borderBottom: "1px solid #1e2433" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 10, color: "#6B7280" }}>
              <span>PANEL COVERAGE</span>
              <span style={{ color: stats.criticalFails > 0 ? "#F87171" : "#4ADE80", fontWeight: 700 }}>
                {stats.criticalFails > 0 ? `⚠ ${stats.criticalFails} CRITICAL FAILS` : "✓ NO CRITICAL FAILS"}
              </span>
            </div>
            <div style={{ height: 4, background: "#1e2433", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2, transition: "width 0.5s ease",
                width: `${stats.pct}%`,
                background: stats.criticalFails > 0
                  ? "linear-gradient(90deg, #ef4444, #dc2626)"
                  : `linear-gradient(90deg, ${panelColor}, ${panelColor}88)`,
              }} />
            </div>
          </div>
        );
      })()}

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        {TEST_SUITE[activePanel as keyof typeof TEST_SUITE].sections.map((section) => {
          const sectionKey = `${activePanel}-${section.name}`;
          const isCollapsed = collapsed[sectionKey];
          const sectionPass = section.tests.filter((t) => results[t.id] === "pass").length;
          const sectionFail = section.tests.filter((t) => results[t.id] === "fail").length;

          return (
            <div key={section.name} style={{ marginBottom: 12 }}>
              {/* Section Header */}
              <button onClick={() => toggleSection(sectionKey)} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#0f1420", border: "1px solid #1e2433",
                borderRadius: isCollapsed ? 8 : "8px 8px 0 0",
                padding: "10px 14px", cursor: "pointer", color: "#e2e8f0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 10, color: panelColor }}>▶</span>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>{section.name.toUpperCase()}</span>
                  <span style={{ fontSize: 10, color: "#4B5563" }}>({section.tests.length} tests)</span>
                </div>
                <div style={{ display: "flex", gap: 10, fontSize: 10 }}>
                  {sectionPass > 0 && <span style={{ color: "#4ADE80" }}>✓ {sectionPass}</span>}
                  {sectionFail > 0 && <span style={{ color: "#F87171" }}>✗ {sectionFail}</span>}
                  <span style={{ color: "#4B5563" }}>{isCollapsed ? "▼" : "▲"}</span>
                </div>
              </button>

              {/* Test Rows */}
              {!isCollapsed && (
                <div style={{ border: "1px solid #1e2433", borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
                  {section.tests.map((test, idx) => {
                    const r = results[test.id] || "untested";
                    const s = STATUS[r];
                    const hasNote = notes[test.id];
                    return (
                      <div key={test.id} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 14px",
                        background: idx % 2 === 0 ? "#0a0e1a" : "#080c16",
                        borderTop: "1px solid #111827",
                        transition: "background 0.15s",
                      }}>
                        {/* ID */}
                        <span style={{ fontSize: 9, color: "#374151", minWidth: 65, fontWeight: 700 }}>{test.id}</span>

                        {/* Critical badge */}
                        <span style={{
                          fontSize: 8, minWidth: 14, textAlign: "center",
                          color: test.critical ? "#F87171" : "#374151",
                        }}>{test.critical ? "●" : "○"}</span>

                        {/* Test name */}
                        <span style={{ flex: 1, fontSize: 11, color: r === "untested" ? "#9CA3AF" : "#e2e8f0" }}>
                          {test.name}
                        </span>

                        {/* Note indicator */}
                        {hasNote && (
                          <span style={{ fontSize: 9, color: "#FBBF24" }} title={notes[test.id]}>📝</span>
                        )}

                        {/* Status buttons */}
                        <div style={{ display: "flex", gap: 4 }}>
                          {(["pass", "partial", "fail", "blocked"] as const).map((st) => (
                            <button key={st} onClick={() => setResult(test.id, r === st ? "untested" : st)} style={{
                              padding: "3px 8px", fontSize: 9, fontWeight: 700,
                              borderRadius: 4, cursor: "pointer", letterSpacing: 0.5,
                              border: `1px solid ${r === st ? STATUS[st].color : "#1e2433"}`,
                              background: r === st ? STATUS[st].bg : "transparent",
                              color: r === st ? STATUS[st].color : "#374151",
                              transition: "all 0.15s",
                            }}>
                              {st === "pass" ? "PASS" : st === "partial" ? "~OK" : st === "fail" ? "FAIL" : "BLK"}
                            </button>
                          ))}
                        </div>

                        {/* Note button */}
                        <button onClick={() => openNote(test.id)} style={{
                          background: "transparent", border: "1px solid #1e2433",
                          borderRadius: 4, padding: "3px 6px", fontSize: 10,
                          color: hasNote ? "#FBBF24" : "#4B5563", cursor: "pointer",
                        }}>✎</button>

                        {/* Current status badge */}
                        <div style={{
                          minWidth: 60, textAlign: "center", fontSize: 9,
                          padding: "3px 6px", borderRadius: 4, fontWeight: 700,
                          background: s.bg, color: s.color, border: `1px solid ${s.color}33`,
                        }}>{s.label}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* NOTE MODAL */}
      {activeNote && (
        <div style={{
          position: "fixed", inset: 0, background: "#000000cc",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
          <div style={{
            background: "#0f1420", border: "1px solid #374151",
            borderRadius: 10, padding: 20, width: 400,
          }}>
            <div style={{ fontSize: 11, color: "#FBBF24", marginBottom: 8, letterSpacing: 1 }}>
              ADD NOTE — {activeNote}
            </div>
            <textarea
              autoFocus
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) saveNote(activeNote); }}
              placeholder="Describe the error, steps to reproduce, or observations..."
              style={{
                width: "100%", height: 120, background: "#080c16",
                border: "1px solid #374151", borderRadius: 6,
                color: "#e2e8f0", padding: 10, fontSize: 11, resize: "vertical",
                fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={() => saveNote(activeNote)} style={{
                flex: 1, padding: "8px", background: "#FBBF24",
                color: "#000", border: "none", borderRadius: 6,
                fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}>SAVE NOTE</button>
              {notes[activeNote] && (
                <button onClick={() => {
                  setNotes((prev) => { const n = { ...prev }; delete n[activeNote]; return n; });
                  setActiveNote(null); setNoteText("");
                }} style={{
                  padding: "8px 12px", background: "#2d0b0b",
                  color: "#F87171", border: "1px solid #F8717144",
                  borderRadius: 6, fontSize: 11, cursor: "pointer",
                }}>DELETE</button>
              )}
              <button onClick={() => { setActiveNote(null); setNoteText(""); }} style={{
                padding: "8px 16px", background: "transparent",
                color: "#6B7280", border: "1px solid #374151",
                borderRadius: 6, fontSize: 11, cursor: "pointer",
              }}>CANCEL</button>
            </div>
            <div style={{ fontSize: 9, color: "#374151", marginTop: 8 }}>Ctrl+Enter to save</div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReport && (
        <div style={{
          position: "fixed", inset: 0, background: "#000000ee",
          overflowY: "auto", zIndex: 100, padding: 24,
        }}>
          <div style={{
            maxWidth: 860, margin: "0 auto",
            background: "#0a0e1a", border: "1px solid #1e2433",
            borderRadius: 12, padding: 28,
          }}>
            {/* Report Header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#FFD700", letterSpacing: 2 }}>OMR+ QA TEST REPORT</div>
                <div style={{ fontSize: 10, color: "#4B5563", marginTop: 4 }}>
                  Generated: {new Date().toLocaleString()} — Scope v1.0 March 2026
                </div>
              </div>
              <button onClick={() => setShowReport(false)} style={{
                background: "transparent", border: "1px solid #374151",
                color: "#6B7280", borderRadius: 6, padding: "6px 14px",
                fontSize: 11, cursor: "pointer",
              }}>✕ CLOSE</button>
            </div>

            {/* Global Summary */}
            {(() => {
              const all = Object.keys(TEST_SUITE).flatMap((k) =>
                TEST_SUITE[k as keyof typeof TEST_SUITE].sections.flatMap((s) => s.tests)
              );
              const pass = all.filter((t) => results[t.id] === "pass").length;
              const fail = all.filter((t) => results[t.id] === "fail").length;
              const partial = all.filter((t) => results[t.id] === "partial").length;
              const blocked = all.filter((t) => results[t.id] === "blocked").length;
              const untested = all.filter((t) => !results[t.id] || results[t.id] === "untested").length;
              const critFails = all.filter((t) => t.critical && results[t.id] === "fail");
              const pct = Math.round(((pass + partial * 0.5) / all.length) * 100);
              const overallStatus = critFails.length > 0 ? "CRITICAL ISSUES" : untested > 0 ? "IN PROGRESS" : fail === 0 ? "READY FOR LAUNCH" : "NEEDS FIXES";
              const statusColor = critFails.length > 0 ? "#F87171" : untested > 0 ? "#FBBF24" : fail === 0 ? "#4ADE80" : "#FBBF24";

              return (
                <div style={{
                  background: "#0f1420", border: `1px solid ${statusColor}44`,
                  borderRadius: 8, padding: 16, marginBottom: 20,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF" }}>OVERALL PLATFORM STATUS</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "4px 12px",
                      borderRadius: 20, background: `${statusColor}22`, color: statusColor,
                      border: `1px solid ${statusColor}44`,
                    }}>{overallStatus}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {[
                      { label: "Total Tests", val: all.length, color: "#e2e8f0" },
                      { label: "Pass", val: pass, color: "#4ADE80" },
                      { label: "Fail", val: fail, color: "#F87171" },
                      { label: "Partial", val: partial, color: "#FBBF24" },
                      { label: "Blocked", val: blocked, color: "#C084FC" },
                      { label: "Untested", val: untested, color: "#6B7280" },
                      { label: "Critical Fails", val: critFails.length, color: "#F87171" },
                      { label: "Coverage", val: `${pct}%`, color: statusColor },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
                        <div style={{ fontSize: 9, color: "#6B7280", letterSpacing: 0.5 }}>{label.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>

                  {critFails.length > 0 && (
                    <div style={{ marginTop: 12, padding: 10, background: "#2d0b0b", borderRadius: 6, borderLeft: "3px solid #F87171" }}>
                      <div style={{ fontSize: 10, color: "#F87171", fontWeight: 700, marginBottom: 6 }}>
                        🚨 CRITICAL FAILURES — MUST FIX BEFORE LAUNCH
                      </div>
                      {critFails.map((t) => (
                        <div key={t.id} style={{ fontSize: 10, color: "#FCA5A5", padding: "2px 0" }}>
                          • [{t.id}] {t.name}
                          {notes[t.id] && <span style={{ color: "#FBBF24" }}> — {notes[t.id]}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Per-panel reports */}
            {Object.entries(TEST_SUITE).map(([key, panel]) => {
              const stats = computeStats(key);
              return (
                <div key={key} style={{ marginBottom: 20 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    marginBottom: 10, paddingBottom: 8,
                    borderBottom: `1px solid ${panel.color}44`,
                  }}>
                    <span>{panel.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: panel.color }}>{panel.label.toUpperCase()}</span>
                    <span style={{ fontSize: 11, color: "#6B7280", marginLeft: "auto" }}>
                      {stats.pass}/{stats.total} pass · {stats.pct}% coverage
                      {stats.criticalFails > 0 && (
                        <span style={{ color: "#F87171", marginLeft: 8 }}>⚠ {stats.criticalFails} CRITICAL</span>
                      )}
                    </span>
                  </div>

                  {panel.sections.map((section) => {
                    const passes = section.tests.filter((t) => results[t.id] === "pass");
                    return (
                      <div key={section.name} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
                          {section.name.toUpperCase()} ({passes.length}/{section.tests.length} pass)
                        </div>
                        {section.tests.map((test) => {
                          const r = results[test.id] || "untested";
                          const s = STATUS[r];
                          return (
                            <div key={test.id} style={{
                              display: "flex", gap: 8, padding: "3px 8px",
                              borderRadius: 4, marginBottom: 2,
                              background: r !== "untested" ? `${s.bg}88` : "transparent",
                            }}>
                              <span style={{ fontSize: 9, color: "#374151", minWidth: 65 }}>{test.id}</span>
                              <span style={{ fontSize: 9, color: test.critical ? "#F87171" : "#374151", minWidth: 8 }}>
                                {test.critical ? "●" : "○"}
                              </span>
                              <span style={{ flex: 1, fontSize: 10, color: "#9CA3AF" }}>{test.name}</span>
                              <span style={{ fontSize: 9, fontWeight: 700, color: s.color }}>{s.label}</span>
                              {notes[test.id] && (
                                <span style={{ fontSize: 9, color: "#FBBF24" }}>→ {notes[test.id]}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Error Summary */}
            {(() => {
              const allTests = Object.keys(TEST_SUITE).flatMap((k) =>
                TEST_SUITE[k as keyof typeof TEST_SUITE].sections.flatMap((s) =>
                  s.tests.map((t) => ({ ...t, panel: TEST_SUITE[k as keyof typeof TEST_SUITE].label }))
                )
              );
              const issues = allTests.filter((t) =>
                ["fail", "partial", "blocked"].includes(results[t.id])
              );
              if (issues.length === 0) return null;
              return (
                <div style={{ border: "1px solid #F87171", borderRadius: 8, padding: 16, marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#F87171", marginBottom: 12, letterSpacing: 1 }}>
                    ERROR REPORT — {issues.length} ISSUE{issues.length !== 1 ? "S" : ""} FOUND
                  </div>
                  {issues.map((t) => {
                    const r = results[t.id];
                    const s = STATUS[r];
                    return (
                      <div key={t.id} style={{
                        padding: "8px 10px", marginBottom: 6, borderRadius: 6,
                        background: s.bg, borderLeft: `3px solid ${s.color}`,
                      }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: notes[t.id] ? 4 : 0 }}>
                          <span style={{ fontSize: 9, color: s.color, fontWeight: 700 }}>[{s.label}]</span>
                          <span style={{ fontSize: 9, color: "#6B7280" }}>{t.id}</span>
                          <span style={{ fontSize: 10, color: "#e2e8f0", flex: 1 }}>{t.name}</span>
                          {t.critical && <span style={{ fontSize: 8, color: "#F87171", fontWeight: 700 }}>CRITICAL</span>}
                          <span style={{ fontSize: 9, color: "#4B5563" }}>{t.panel}</span>
                        </div>
                        {notes[t.id] && (
                          <div style={{ fontSize: 10, color: "#FBBF24", paddingLeft: 8 }}>
                            📝 {notes[t.id]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Footer */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #1e2433", fontSize: 9, color: "#374151", textAlign: "center" }}>
              OMR+ Platform QA Suite · Digital Marketing Heroes · Scope v1.0 — March 2026 · Prepared by Khushi Gupta
            </div>
          </div>
        </div>
      )}

      {/* LEGEND */}
      <div style={{
        borderTop: "1px solid #1e2433", padding: "8px 24px",
        display: "flex", gap: 20, alignItems: "center",
        background: "#0d1017", fontSize: 9, color: "#4B5563",
      }}>
        <span style={{ color: "#F87171" }}>● CRITICAL</span>
        <span style={{ color: "#374151" }}>○ normal</span>
        {Object.entries(STATUS).map(([k, v]) => (
          <span key={k} style={{ color: v.color }}>{v.label}</span>
        ))}
        <span style={{ marginLeft: "auto" }}>Click status buttons to mark tests · ✎ to add notes · Ctrl+Enter to save note</span>
      </div>
    </div>
  );
}
