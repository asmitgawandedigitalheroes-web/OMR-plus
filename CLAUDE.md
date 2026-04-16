# OMR+ Platform — Project Brain 🧠

> **⚠️ MANDATORY**: Always read this file before processing **ANY** prompt. This is the source of truth. No exceptions.

---

## 📋 Project Overview

**OMR+ is a premium fitness coaching ecosystem** — not a simple website. It's a unified, custom-built web application that combines:

- Marketing website (public-facing)
- Client dashboard (personal portal)
- Coach/Trainer dashboard (management)
- Admin/Owner dashboard (full control)
- Supplement & healthy product marketplace
- Subscription & recurring billing system
- AI meal plan system (Phase 1 architecture-ready)

**Client**: omrplus (Fiverr)
**Domain**: omrplus.com (GoDaddy)
**Delivery Timeline**: 25 working days from start
**Status**: Active — Development in Progress (Scope v1.0 — March 2026)

---

## 🎯 Core Goals & MVP

### What We're Building
1. **Coaching membership subscriptions** with AI-customized meal plans
2. **Bilingual experience** (English + Arabic, RTL-ready)
3. **Payment system** supporting Apple Pay, Visa/Mastercard, recurring billing
4. **Supermarket integration** (Phase 1: storefront + checkout; Phase 2: delivery, personalized recommendations)

### User Roles & Access
| Role | Access |
|------|--------|
| **Client (User)** | Register, onboarding, personal dashboard, view plans, track progress, message coach |
| **Coach (Trainer)** | Separate login, manage assigned clients, create meal/workout plans, chat with clients |
| **Admin (Owner)** | Full system control — all users, trainers, subscriptions, products, analytics, content |
| **Store Staff (Phase 2)** | Marketplace product management and order fulfillment only |

---

## 🏗️ Tech Stack & Architecture

### Frontend
- **Next.js 16.2.1** (React 19.2.4)
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **SSR/SSG** as appropriate per page
- **Mobile-first responsive design**

### Backend & Database
- **Supabase** (PostgreSQL) — single unified database for all roles
- **Supabase Auth** with role-based access control (RLS)
- **Supabase Realtime** for WebSocket-based real-time chat
- **Supabase Storage** for file uploads (PDFs, images, videos)

### Payments & External
- **Stripe** (primary) or PayTabs/Moyasar/HyperPay/Checkout.com (Middle East)
- **Webhooks** for subscription events (signup, renewal, cancellation, failure)
- **Apple Pay** & Visa/Mastercard support
- **Recurring billing** for coaching memberships

### Deployment
- **Frontend**: Vercel
- **Backend**: Supabase
- **Domain**: omrplus.com connected to Vercel

---

## 📱 Platform Sections

### 1. Marketing Website (Public-Facing) — Pages Required

| Page | Purpose |
|------|---------|
| **Home** | Hero section, program highlights, testimonials/transformations, CTA to consultation |
| **Programs** | List: Muscle Building, Fat Loss, Summer Body, Workout Plan Alone, Food Plan Alone |
| **Marketplace** | Products/ebooks section; launches in "Coming Soon" state until client adds products |
| **How It Works** | Explainer page for coaching process |
| **Transformations** | Privacy-protected results gallery (no client names/faces without permission) |
| **About** | Brand-focused only; no founder name/photo until client provides |
| **Contact** | Contact form + WhatsApp/chat link |
| **Free Consultation** | CTA replacing all "7-Day Trial" / "Free Trial" language |

### 2. Client Dashboard (Private Portal)

| Module | Features |
|--------|----------|
| **Onboarding** | Questionnaire: fitness goals, weight, dietary restrictions, health conditions (first login) |
| **Meal Plan** | Trainer-assigned plans (Breakfast, Lunch, Snack, Dinner); view-only; request changes via chat |
| **Workout Plan** | Day-wise schedule; exercises with sets, reps, rest time; images/videos viewable |
| **Progress Tracking** | Log weight & stats; timeline/chart view; body check uploads (PDF + photos) |
| **Messaging** | Real-time chat with assigned coach; message history stored |
| **Subscriptions** | View active plan, billing date, renewal status, invoices |

### 3. Coach/Trainer Dashboard (Separate Login)

| Module | Features |
|--------|----------|
| **Client Management** | View assigned clients; add by email; view profiles (goals, questionnaire, stats) |
| **Meal Plan Builder** | Create plans per client (food type, name, grams, meal timing); assign & update |
| **Workout Plan Builder** | Day-by-day plans (exercise name as free text, sets, reps, notes); upload images/videos |
| **Progress Monitoring** | View client-submitted progress entries, body checks, InBody PDFs |
| **Communication** | Direct chat with assigned clients |

### 4. Admin/Owner Dashboard (Full Control)

Complete visibility & control:
- Manage all users, trainers, subscriptions
- Manage marketplace products & ebook listings
- Assign trainers to clients
- View all chat threads & analytics
- Control website content sections
- Manage membership pricing (must be editable, not hardcoded)
- View payments, invoices, platform analytics
- Upload & manage workout videos

### 5. Marketplace (Built-In, Not Separate)

**Phase 1 (MVP):**
- Product listings (supplements, healthy snacks, nutrition items)
- Ebook listings with digital download/access links
- Product management from admin (add, edit, remove)
- Secure checkout connected to payment gateway
- Order history linked to user account
- Status: "Coming Soon" on frontend until client launches

**Phase 2 (Future):**
- In-app store ordering & delivery
- Personalized product suggestions based on meal plans
- Subscription snack boxes

---

## 🌐 Bilingual Support (English + Arabic)

**Mandatory across all pages & dashboards:**
- Full English and Arabic language support
- Arabic uses **RTL (Right-to-Left)** rendering
- Localized number formats & date formats per language
- Language toggle in header on all pages
- All dynamic content (meal names, exercise names, plan titles) must accept bilingual input from admin

---

## 💳 Subscription & Payment System

**Recurring Billing:**
- Recurring subscriptions for coaching memberships
- One-time purchases for standalone workout or meal plans

**Payment Methods:**
- Visa/Mastercard
- Apple Pay

**Gateway:**
- Stripe (primary)
- PayTabs, Moyasar, HyperPay, Checkout.com (Middle East support)

**Webhooks:**
- New signup, renewal, cancellation, failure events

**Invoicing:**
- Auto-generated invoices
- Accessible from user account
- **Subscription access control**: Dashboard locked if subscription expired

---

## 🔑 Critical Business Rules (From Client Confirmation)

**Must follow exactly:**

1. ✅ **"Free Consultation" replaces all trial CTAs** — NO "7-Day Trial" or "Free Trial" copy anywhere
2. ✅ **Coaches section hidden from frontend** until owner assigns coaches
3. ✅ **Transformation photos privacy-protected** — no names/faces without permission
4. ✅ **About page brand-focused only** — no founder name/photo yet
5. ✅ **Exercise name input is free-text**, not forced dropdown
6. ✅ **Marketplace launches "Coming Soon"** — client adds real products post-launch
7. ✅ **Membership pricing editable by admin** — must not be hardcoded
8. ✅ **Shopify removed** — fully custom platform (Option B confirmed March 28)

---

## 📦 Out of Scope (This Build)

These are NOT part of Phase 1 delivery:

- Native iOS/Android mobile app
- AI meal generator integration (architecture-ready, AI itself is Phase 2)
- Affiliate/influencer system
- In-app supermarket ordering & delivery
- Subscription snack boxes
- Corporate wellness portal
- Physical supermarket digital integration (QR codes, in-store screens)
- OTP/SMS verification (deferred post-launch)

---

## 📅 Delivery Milestones (25 Working Days)

### Phase 1 — Foundation (Days 1–6)
- Project setup, repository, Supabase schema design
- Auth system: client, trainer, admin roles
- Marketing website structure — all pages scaffolded
- First design preview

### Phase 2 — Core Platform (Days 7–15)
- Client dashboard: meal plan, workout plan, progress tracking, body check
- Trainer dashboard: client management, plan builder, progress view
- Admin panel: full user/trainer/subscription management
- Real-time messaging

### Phase 3 — Commerce & Integration (Days 16–21)
- Marketplace: product listings, ebook listings, checkout
- Subscription & payment gateway integration
- Bilingual (EN/AR) implementation
- Domain connection & deployment setup

### Phase 4 — Testing & Launch (Days 22–25)
- Full platform QA across all user roles
- Performance & security checks
- Client review & final revisions
- Go-live & post-launch handover

---

## 🎨 Design & Branding

**Colors & Palette:**
- Black, Gold, Green (from OMR+ logo)
- Premium, luxury fitness aesthetic
- Black & gold interior design reference (supermarket concept)

**Typography:**
- Mobile-first responsive design
- Clean, professional fitness coaching aesthetic

**Assets Provided:**
- OMR+ logo (gold on dark background)
- Color palette (black/gold/green)

---

## 🔐 Security & Access Control

**Must implement:**
- Row-level security on Supabase (no cross-user data exposure)
- Role-based access control (Client, Coach, Admin, Store Staff)
- Subscription access control (locked if expired)
- Secure file upload handling (PDFs, images, videos)
- Payment webhook verification

---

## 📝 Content & Copy Guidelines

- **Brand voice**: Premium, professional, fitness-focused, inclusive
- **Tone**: Supportive, motivating, clear, accessible
- **Trial language**: NONE. Use "Free Consultation" instead.
- **Founder info**: Not included until client approves
- **Transformation gallery**: Privacy-first approach

---

## 🚀 Post-Launch Support

- **4 months** of post-launch support included
- Bug fixes, minor content updates, plan adjustments
- Database access provided to client (aoa12@hotmail.com)
- Full admin credentials & handover documentation at delivery

---

## 📚 Reference Documents

All technical specifications sourced from:
- **OMR_Developer_Scope.pdf** — Detailed technical requirements
- **OMR_App_Website_Supermarket_Spec.pdf** — Feature & concept overview

Refer to these documents for any ambiguity. They are the source of truth.

---

## ✅ Coding Rules & Conventions

### General
- **Clean architecture**: Separate concerns (API layer, UI layer, business logic)
- **Type safety**: Use TypeScript throughout; avoid `any`
- **Performance**: SSR/SSG as appropriate; optimize images & bundles
- **Security**: Validate inputs, use Supabase RLS, no hardcoded secrets
- **Responsive**: Mobile-first design; test on multiple devices

### Component Structure
```
/app
  /(public)       # Public-facing pages (marketing website)
  /(auth)         # Auth pages (login, signup)
  /(dashboard)    # Role-based dashboards
    /client       # Client portal
    /coach        # Trainer portal
    /admin        # Admin panel
/components       # Reusable React components
/lib              # Utilities, helpers, API functions
/types            # TypeScript interfaces & types
/styles           # Global styles (Tailwind)
```

### Database (Supabase)
- Use RLS policies for all tables
- Foreign keys for all relationships
- Indexes on frequently queried fields
- Clear schema naming conventions

### API Endpoints
- RESTful design where possible
- Use Supabase client libraries
- Webhook handlers for payment events
- Error handling with proper status codes

### Bilingual Support
- Use i18n library (next-intl or similar)
- Support dynamic content bilingual input
- Test RTL rendering thoroughly
- Handle number/date localization

---

## 📦 Skills Reference & Conditional Routing

**All skills installed globally at `~/.claude/skills/`. Load based on task type:**

### 🎨 **UI/UX & Design Tasks** → Load `ui-ux-pro-max-skill` ⭐ PRIMARY
- **Path:** `~/.claude/skills/ui-ux-pro-max-skill`
- **When:** Building UI components, designing layouts, frontend work, dashboard design
- **What:** 67 UI styles, 96 color palettes, 57 font pairings, component templates
- **For OMR+:** Use extensively for client/trainer/admin dashboards, marketing pages

### 📄 **File Generation** → Load `anthropic/skills`
- **Path:** `~/.claude/skills/skills`
- **When:** Need to generate PDF/Word/Excel/Slides, invoices, reports
- **For OMR+:** Invoice PDFs, body check reports, admin exports

### 🔌 **External API Integrations** → Load `awesome-claude-skills`
- **Path:** `~/.claude/skills/awesome-claude-skills`
- **When:** Stripe integration, WhatsApp API, email notifications, third-party services
- **For OMR+:** Stripe payment integration, webhook handlers, SMS/email services

### 🚀 **Frontend & Next.js** → Load `agent-skills (Vercel)`
- **Path:** `~/.claude/skills/agent-skills`
- **When:** Vercel deployment, Next.js features, performance optimization
- **For OMR+:** Deployment to Vercel, Next.js configuration

### 💻 **AI Component Generation** → Use **21st.dev** (local installation)
- **Setup:** `npx @21st-dev/cli@latest init` (use your free 21st.dev API key)
- **When:** Rapidly scaffolding React components from descriptions
- **For OMR+:** Component prototyping, dashboard layouts

### 🤖 **Advanced Agents** → Check `superpowers`
- **When:** Complex autonomous workflows, multi-step operations
- **For OMR+:** Batch user operations, data migrations

---

## 🔧 Workflow Guidelines

### 1. **Plan Mode Default** — Non-trivial tasks ALWAYS start here
- 3+ steps → use plan mode
- Architectural decisions → use plan mode
- Multiple file changes → use plan mode
- **If blocked:** Stop immediately, re-plan instead of pushing through

### 2. **Subagent Strategy** — Offload liberally
- Use Explore agent for deep codebase understanding
- Use general-purpose agents for research + parallel tasks
- One focused task per subagent
- Keep main context clean for implementation

### 3. **Verification Before Done** — Never mark complete without proof
- Demonstrate it works (tests, logs, behavior)
- Diff changes when relevant
- Run tests, check errors
- Ask: "Would a staff engineer approve this?"

### 4. **Autonomous Bug Fixing** — No hand-holding needed
- Fix bugs immediately when reported
- Point at logs/errors, then resolve
- Zero context-switching from user
- Go fix failing tests without being told how

### 5. **Demand Elegance (Balanced)** — When it matters
- For non-trivial changes: ask "more elegant way?"
- If fix feels hacky: implement elegant solution instead
- Skip for simple, obvious fixes — don't over-engineer
- Challenge your work before presenting

### 6. **Task Tracking** — Use TodoWrite for complex work
- Write plan with checkable items
- Mark items complete as you go (not in batch)
- Explain changes at each step
- Document results in review section

---

## 🎯 Success Criteria

Platform is complete when:
1. ✅ All 3 dashboards functional (client, coach, admin)
2. ✅ Authentication working with proper role access
3. ✅ Meal plan & workout plan systems functional
4. ✅ Real-time messaging working
5. ✅ Payment integration & subscription management working
6. ✅ Marketplace storefront & checkout working
7. ✅ Bilingual (EN/AR) fully implemented & tested
8. ✅ Mobile responsive across all pages
9. ✅ No hardcoded data; all managed via admin
10. ✅ Client can manage full platform from admin dashboard
11. ✅ Zero security vulnerabilities (RLS, no data leaks)
12. ✅ Performance optimized (Core Web Vitals passing)

---

## 📞 Client Contact & Preferences

**Email**: aoa12@hotmail.com
**Preferences**:
- Privacy-first approach
- Premium, luxury positioning
- Clear pricing & no hidden trials
- Bilingual from day one

---

## 🔧 When to Check This File

Re-read before:
- Starting any major feature
- Making architectural decisions
- Building new pages or dashboards
- Implementing anything not explicitly in the scope docs
- Making assumptions about requirements

**This is your north star. Refer to it constantly.**

---

---

## 📦 Dependencies to Install

**Already installed:**
- next@16.2.1, react@19.2.4, typescript, tailwindcss@4

**Still needed (in priority order):**

```bash
# i18n & Bilingual
npm install next-intl

# Supabase (backend + auth + realtime)
npm install @supabase/supabase-js

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Payments (Stripe)
npm install stripe @stripe/react-js

# UI Utilities
npm install tailwindcss-rtl  # For RTL support
npm install clsx             # classname utility

# Charts (Progress tracking)
npm install recharts

# State Management
npm install zustand

# Utilities
npm install date-fns         # Date formatting with locale support
npm install js-cookie        # Cookie management
```

---

**Last Updated**: 2026-03-30
**Version**: v1.1 (Enhanced with Skills Reference & Workflow Guidelines)
**Status**: Development in Progress — Phase 1 Foundation Ready
