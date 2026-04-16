# SOFTWARE DOCUMENTATION
## Project: OMR+ Fitness Coaching Ecosystem
**Version:** 1.0  
**Status:** Active — Development in Progress  
**Last Updated:** April 15, 2026  
**Classification:** Internal / Client-Facing Technical Reference

---

## Table of Contents

1. [Company / Product Overview](#1-company--product-overview)
2. [Introduction](#2-introduction)
3. [Project Overview](#3-project-overview)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Database Design](#6-database-design)
7. [API & Data Access](#7-api--data-access)
8. [Workflows & Business Logic](#8-workflows--business-logic)
9. [Security & Data Protection](#9-security--data-protection)
10. [Environment Setup](#10-environment-setup)
11. [Deployment & CI/CD](#11-deployment--cicd)
12. [Testing Strategy](#12-testing-strategy)
13. [Monitoring & Maintenance](#13-monitoring--maintenance)
14. [Future Roadmap](#14-future-roadmap)
15. [Appendix](#15-appendix)
16. [Final Delivery Summary](#16-final-delivery-summary)
17. [Acceptance Sign-Off](#17-acceptance-sign-off)

---

## 1. Company / Product Overview

### 1.1 Mission & Vision

**Mission:**  
To empower individuals on their fitness journey through a premium, technology-driven coaching experience — delivering personalized nutrition and workout guidance, real-time coach communication, and measurable progress tracking within a single, seamless platform.

**Vision:**  
To become the leading fitness coaching platform in the Middle East and Arabic-speaking markets, setting the standard for bilingual, culturally aware, AI-enhanced health and wellness ecosystems.

---

### 1.2 Core Values

| Value | Description |
|---|---|
| **Personalization** | Every client receives a unique, goal-oriented experience tailored to their health data, restrictions, and lifestyle |
| **Privacy First** | Client data, transformation media, and health information are treated with strict confidentiality and GDPR-aligned practices |
| **Premium Quality** | Every touchpoint — from UI design to response times — reflects a luxury fitness brand aesthetic |
| **Transparency** | Clear pricing, no hidden trials, no misleading CTAs — clients always know what they are subscribing to |
| **Inclusivity** | Full bilingual (English + Arabic) support with RTL rendering to serve diverse populations |
| **Accountability** | Progress tracking, messaging, and coach assignments ensure clients are never left without guidance |

---

### 1.3 Strategic Positioning

OMR+ is not a generic fitness app. It is a **white-glove coaching ecosystem** that bridges the gap between:

- High-end personal training studios (expensive, in-person, location-limited)
- Generic fitness apps (impersonal, no human coaching, no customization)

OMR+ occupies the premium digital coaching niche — offering human expertise at scale through a purpose-built SaaS platform, with Arabic-market localization as a primary competitive differentiator.

**Target Market Segments:**
- Fitness-conscious professionals in the GCC region (UAE, Saudi Arabia, Kuwait, Qatar, Bahrain)
- Arabic-speaking diaspora seeking quality bilingual coaching
- Clients seeking medically informed nutrition and workout programming

---

## 2. Introduction

### 2.1 Purpose

This document serves as the authoritative technical and business reference for the OMR+ Fitness Coaching Ecosystem. It is intended to provide:

- Complete architectural and design documentation for the engineering team
- A business specification reference for the product owner and stakeholders
- A deployment and operational guide for DevOps and infrastructure personnel
- A handover document for future maintainers or development teams

---

### 2.2 System Overview

OMR+ is a unified, custom-built web application built on **Next.js 16** and **Supabase**, combining a public marketing website, three distinct role-based dashboards, a billing and subscription engine, and an integrated marketplace — all delivered within a single monorepo deployment.

The system is designed around a **multi-tenant, role-based access model** with three primary user types: Clients, Coaches, and Administrators. Each role receives a dedicated, purpose-built experience with appropriate data access restrictions enforced at both the application and database level.

---

### 2.3 Scope

**In Scope (Phase 1 — MVP):**
- Full marketing website (all public-facing pages)
- Client registration, onboarding, and personal dashboard
- Coach/Trainer dashboard with plan building tools
- Admin/Owner dashboard with full system control
- Real-time messaging (client ↔ coach)
- Subscription and payment system (Stripe)
- Marketplace storefront (Coming Soon state on launch)
- Bilingual support (English + Arabic, RTL)
- Progress tracking with media uploads

**Out of Scope (Deferred to Phase 2):**
- Native iOS/Android mobile applications
- AI meal plan generation engine
- In-app delivery and supermarket ordering
- OTP/SMS verification system
- Affiliate and influencer management system
- Corporate wellness portal

---

### 2.4 Target Audience

| Audience | Usage Context |
|---|---|
| **Development Team** | Architecture decisions, feature implementation, API reference, deployment procedures |
| **Product Owner / Client** | Business rules validation, feature scope review, progress tracking |
| **QA Engineers** | Test case design, acceptance criteria, edge case identification |
| **DevOps / Infrastructure** | Deployment pipelines, environment configuration, monitoring setup |
| **Future Maintainers** | Onboarding, system understanding, modification guidance |

---

### 2.5 Glossary

| Term | Definition |
|---|---|
| **RLS** | Row Level Security — Supabase/PostgreSQL feature that enforces data access at the database row level |
| **SSR** | Server-Side Rendering — Next.js page rendered on the server per request |
| **SSG** | Static Site Generation — Next.js page pre-rendered at build time |
| **RTL** | Right-to-Left — text direction for Arabic language rendering |
| **i18n** | Internationalization — framework for multi-language content support |
| **JWT** | JSON Web Token — authentication token issued by Supabase Auth |
| **Webhook** | HTTP callback triggered by payment events (Stripe → OMR+ backend) |
| **Coach** | Assigned fitness trainer responsible for managing client plans and communication |
| **Client** | End-user subscriber with an active coaching membership |
| **Admin** | Platform owner with full system-level access and control |
| **Onboarding** | First-login questionnaire capturing health goals, restrictions, and physical data |
| **InBody** | Body composition measurement report (PDF upload supported) |
| **Meal Plan** | Structured daily nutrition plan (Breakfast, Lunch, Snack, Dinner) assigned by coach |
| **Workout Plan** | Day-wise exercise schedule with sets, reps, rest, and media |
| **MRR** | Monthly Recurring Revenue — key SaaS billing metric |

---

## 3. Project Overview

### 3.1 Product Summary

OMR+ is a **premium fitness coaching platform** delivered as a custom SaaS web application. It replaces the need for multiple disconnected tools (coaching apps, WhatsApp communication, manual plan PDFs, Shopify stores) with a single, unified, professionally designed ecosystem.

The platform enables coaches to manage their entire client roster — building meal and workout plans, monitoring progress, and communicating in real-time — while clients experience a polished, subscription-powered portal that keeps all their health data, plans, and progress in one place.

---

### 3.2 Business Problem Solved

| Problem | OMR+ Solution |
|---|---|
| Coaches managing clients across multiple fragmented tools (WhatsApp, PDFs, spreadsheets) | Unified coach dashboard with built-in plan builders, progress monitoring, and messaging |
| No structured client onboarding or data collection | Mandatory first-login health questionnaire with persistent profile |
| No recurring billing system for coaching memberships | Stripe-powered subscription engine with auto-renewal, invoicing, and access control |
| Clients lacking visibility into their plans and progress | Dedicated client portal with all plans, stats, and communication in one place |
| Absence of Arabic-language fitness platforms | Full RTL bilingual (EN/AR) experience from day one |
| Generic fitness apps with no human coaching element | Real-time coach-to-client messaging with plan assignment workflow |
| Disconnected product/supplement sales | Integrated marketplace (Coming Soon state at MVP, expandable post-launch) |

---

### 3.3 Key Features & Functionality

#### Public Marketing Website
- Hero landing with program highlights and transformation gallery
- Programs page (Muscle Building, Fat Loss, Summer Body, Workout Plan, Food Plan)
- How It Works explainer page
- Free Consultation CTA (no trial language)
- Privacy-protected transformation gallery
- Brand-focused About page
- Contact form with WhatsApp integration

#### Client Dashboard
- Guided health questionnaire (first login)
- Meal plan viewer (breakfast, lunch, snack, dinner per day)
- Workout plan viewer (day-wise, with exercise details and media)
- Progress logging (weight, body stats, photo/PDF uploads)
- Progress timeline and chart visualization
- Real-time chat with assigned coach
- Subscription status, billing dates, and invoice history

#### Coach/Trainer Dashboard
- Client roster with assigned-client management
- Meal plan builder (per-client, with food type, grams, timing)
- Workout plan builder (day-by-day, free-text exercise names, sets, reps, notes, media)
- Client progress monitoring (stats, body checks, InBody PDFs)
- Real-time client messaging

#### Admin/Owner Dashboard
- Full user and trainer management
- Trainer-to-client assignment system
- Subscription and billing management
- Marketplace product and ebook management
- Content control (pricing, programs, website sections)
- Platform analytics (users, revenue, activity)
- Video upload and media management
- All chat thread visibility

#### Marketplace
- Supplement and healthy product listings
- Ebook digital download listings
- Secure checkout (Stripe)
- Order history per user
- Launches in "Coming Soon" state at MVP

---

### 3.4 Strategic System Goals

#### Scalability
- **Stateless frontend** via Next.js on Vercel — automatically scales horizontally with zero configuration
- **Supabase** handles connection pooling, read replicas, and auto-scaling for PostgreSQL at the infrastructure layer
- **Feature-module architecture** allows new dashboards (Store Staff, Affiliate) to be added without refactoring existing modules
- **i18n architecture** supports adding new languages (French, Turkish, etc.) with only translation file additions

#### Security
- Supabase Row Level Security (RLS) enforced at every table — no cross-user data access even if application layer is bypassed
- JWT-based session management with Supabase Auth
- All secrets (API keys, Stripe keys) stored in environment variables — never committed to source control
- Payment webhook signature verification via Stripe's HMAC validation
- File upload validation (type, size) before Supabase Storage write

#### Performance
- SSG for all public marketing pages — near-zero TTFB for marketing content
- SSR for authenticated dashboard pages — fresh data on every load without client-side waterfalls
- Image optimization via Next.js `<Image>` component with automatic WebP conversion
- Lazy loading for heavy dashboard components (charts, media galleries)
- Supabase Realtime connections managed per-session to minimize open WebSocket overhead

#### Reliability
- Vercel provides 99.99% uptime SLA for the frontend deployment
- Supabase provides managed PostgreSQL with automated daily backups and point-in-time recovery
- Stripe handles all payment processing reliability — OMR+ does not store raw card data
- Webhook retry logic (Stripe retries failed delivery up to 3 days)

#### Maintainability
- TypeScript throughout — type errors caught at compile time, not runtime
- Clean architecture: UI components separated from business logic and API calls
- Centralized Supabase client with typed query helpers
- i18n translation files in structured JSON — non-developer-friendly content updates
- Comprehensive `CLAUDE.md` project brain maintained as single source of truth

---

## 4. Technology Stack

### 4.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.1 | Full-stack React framework (SSR, SSG, API routes) |
| **React** | 19.2.4 | UI component library |
| **TypeScript** | Latest | Static typing for all frontend and shared code |
| **Tailwind CSS** | 4.x | Utility-first CSS framework for all styling |
| **tailwindcss-rtl** | Latest | RTL (Arabic) layout support for Tailwind |
| **next-intl** | Latest | i18n routing and translation management |
| **react-hook-form** | Latest | Performant form state management |
| **zod** | Latest | Schema validation for all form inputs and API payloads |
| **@hookform/resolvers** | Latest | Bridge between zod schemas and react-hook-form |
| **recharts** | Latest | Progress chart and analytics visualization |
| **zustand** | Latest | Lightweight global state management |
| **clsx** | Latest | Conditional class name composition utility |
| **date-fns** | Latest | Date formatting with locale support (EN/AR) |
| **js-cookie** | Latest | Cookie-based session and preference management |

---

### 4.2 Backend & Database

| Technology | Purpose |
|---|---|
| **Supabase (PostgreSQL)** | Primary relational database for all platform data |
| **Supabase Auth** | JWT-based authentication with role metadata |
| **Supabase Realtime** | WebSocket-based real-time messaging |
| **Supabase Storage** | File storage for PDFs, images, and workout videos |
| **Supabase Edge Functions** | Serverless functions for webhooks and background jobs |
| **Next.js API Routes** | Server-side API handlers for complex business logic |
| **Stripe** | Payment processing, subscription billing, invoicing |

---

### 4.3 Hosting & DevOps

| Service | Role |
|---|---|
| **Vercel** | Next.js frontend hosting, CDN, preview deployments |
| **Supabase** | Managed PostgreSQL, Auth, Storage, Realtime |
| **GoDaddy** | Domain registrar for omrplus.com |
| **Vercel DNS / GoDaddy** | Domain routing — A/CNAME records pointing to Vercel |
| **GitHub** | Source control, CI/CD trigger |
| **Vercel CI/CD** | Automatic preview and production deployments on push |

---

### 4.4 Developer Tooling

| Tool | Purpose |
|---|---|
| **ESLint** | Code linting with Next.js recommended rules |
| **Prettier** | Consistent code formatting |
| **Husky** | Git hooks for pre-commit lint and type checks |
| **Supabase CLI** | Local database development, migrations, type generation |
| **Stripe CLI** | Local webhook testing and event forwarding |
| **VS Code** | Recommended IDE with Tailwind IntelliSense extension |

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│              (Web App — Next.js — omrplus.com)                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                     VERCEL EDGE NETWORK                         │
│          Next.js Application (SSR + SSG + API Routes)           │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Public     │  │  Auth        │  │  Dashboard            │  │
│  │  Pages      │  │  Pages       │  │  (Client/Coach/Admin) │  │
│  │  (SSG)      │  │  (SSR)       │  │  (SSR + Realtime)     │  │
│  └─────────────┘  └──────────────┘  └───────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Supabase JS Client + REST/WS
┌──────────────────────────▼──────────────────────────────────────┐
│                       SUPABASE PLATFORM                         │
│                                                                 │
│  ┌──────────────┐  ┌────────────┐  ┌──────────┐  ┌─────────┐  │
│  │  PostgreSQL  │  │   Auth     │  │  Storage │  │Realtime │  │
│  │  (RLS)       │  │  (JWT)     │  │  (Files) │  │  (WS)   │  │
│  └──────────────┘  └────────────┘  └──────────┘  └─────────┘  │
└──────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│                                                                 │
│  ┌──────────────────┐          ┌──────────────────────────┐    │
│  │  Stripe API      │          │  WhatsApp / Email        │    │
│  │  (Payments,      │          │  (Contact & Notifications│    │
│  │   Webhooks,      │          │   - Phase 2 SMS)         │    │
│  │   Invoices)      │          └──────────────────────────┘    │
│  └──────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Component Breakdown

#### Application Layers

| Layer | Location | Responsibility |
|---|---|---|
| **Presentation Layer** | `/app`, `/components` | React components, page layouts, UI rendering |
| **Routing Layer** | `/app/(public)`, `/app/(auth)`, `/app/(dashboard)` | Route groups, access guards, layout shells |
| **Business Logic Layer** | `/lib` | Plan builders, progress calculators, subscription checks |
| **Data Access Layer** | `/lib/supabase` | Typed Supabase query helpers, server vs. client clients |
| **Type Layer** | `/types` | Shared TypeScript interfaces for all entities |
| **i18n Layer** | `/messages` | JSON translation files (en.json, ar.json) |
| **API Layer** | `/app/api` | Next.js route handlers for webhooks, complex mutations |

#### Route Group Structure

```
/app
  /(public)               # No auth required
    /page.tsx             # Home
    /programs/page.tsx    # Programs listing
    /how-it-works/page.tsx
    /transformations/page.tsx
    /marketplace/page.tsx # Coming Soon state
    /about/page.tsx
    /contact/page.tsx
    /consultation/page.tsx

  /(auth)                 # Authentication pages
    /login/page.tsx
    /signup/page.tsx
    /onboarding/page.tsx  # Post-signup questionnaire

  /(dashboard)            # Auth-protected, role-checked
    /client
      /meal-plan/page.tsx
      /workout-plan/page.tsx
      /progress/page.tsx
      /messages/page.tsx
      /subscription/page.tsx

    /coach
      /clients/page.tsx
      /meal-builder/page.tsx
      /workout-builder/page.tsx
      /progress/page.tsx
      /messages/page.tsx

    /admin
      /users/page.tsx
      /trainers/page.tsx
      /subscriptions/page.tsx
      /marketplace/page.tsx
      /analytics/page.tsx
      /content/page.tsx
      /media/page.tsx

  /api
    /webhooks/stripe/route.ts
    /subscriptions/route.ts
    /admin/assign-trainer/route.ts
```

---

### 5.3 Data Flow

#### Authentication Flow
```
User submits credentials
  → Supabase Auth validates
  → JWT issued with role metadata (client | coach | admin)
  → Next.js middleware reads JWT
  → Redirects to appropriate dashboard
  → Supabase client initialized with session token
  → All subsequent queries automatically scoped by RLS
```

#### Meal Plan Assignment Flow
```
Coach opens Meal Builder
  → Selects client from roster
  → Creates plan items (meal type, food, grams, timing)
  → Submits → INSERT into meal_plans + meal_plan_items
  → Client dashboard fetches assigned plan via SELECT with RLS
  → Client views plan (read-only)
  → Client requests change via chat message to coach
```

#### Payment & Subscription Flow
```
Client selects program
  → Stripe Checkout Session created (server-side)
  → Client redirected to Stripe-hosted checkout
  → Payment processed by Stripe
  → Stripe fires webhook (checkout.session.completed)
  → OMR+ webhook handler verifies signature
  → subscription record created in Supabase
  → Client dashboard access granted
  → Renewal events handled automatically via subscription.renewed webhook
```

---

### 5.4 Access Control

| Role | Public Pages | Auth Pages | Client Dashboard | Coach Dashboard | Admin Dashboard |
|---|---|---|---|---|---|
| **Anonymous** | ✅ Full access | ✅ Login/Signup | ❌ | ❌ | ❌ |
| **Client** | ✅ | ✅ | ✅ Own data only | ❌ | ❌ |
| **Coach** | ✅ | ✅ | ❌ | ✅ Assigned clients only | ❌ |
| **Admin** | ✅ | ✅ | ✅ Read-only view | ✅ Read-only view | ✅ Full access |

---

## 6. Database Design

### 6.1 Database Infrastructure

- **Database:** PostgreSQL 15 (managed via Supabase)
- **Authentication Integration:** Supabase Auth with `auth.users` linked to `public.profiles`
- **Security Model:** Row Level Security (RLS) enabled on all user-facing tables
- **File Storage:** Supabase Storage with separate buckets per content type
- **Realtime:** Enabled on `messages` table for live chat

---

### 6.2 Core Tables

#### `profiles` — Extended user profiles

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | References `auth.users.id` |
| `email` | TEXT | User email address |
| `full_name` | TEXT | Display name |
| `full_name_ar` | TEXT | Arabic name (optional) |
| `role` | ENUM | `client`, `coach`, `admin` |
| `avatar_url` | TEXT | Profile photo URL |
| `phone` | TEXT | Optional contact number |
| `preferred_language` | TEXT | `en` or `ar` |
| `onboarding_completed` | BOOLEAN | Controls onboarding redirect |
| `assigned_coach_id` | UUID | FK → `profiles.id` (coach) |
| `created_at` | TIMESTAMPTZ | Auto-set |
| `updated_at` | TIMESTAMPTZ | Auto-updated |

---

#### `onboarding_questionnaires` — First-login health data

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID | FK → `profiles.id` |
| `fitness_goal` | TEXT | e.g., "fat_loss", "muscle_gain" |
| `current_weight_kg` | DECIMAL | |
| `target_weight_kg` | DECIMAL | |
| `height_cm` | DECIMAL | |
| `age` | INTEGER | |
| `gender` | TEXT | |
| `activity_level` | TEXT | |
| `dietary_restrictions` | TEXT[] | Array of restrictions |
| `health_conditions` | TEXT[] | Array of conditions |
| `notes` | TEXT | Free-text additional info |
| `created_at` | TIMESTAMPTZ | |

---

#### `subscriptions` — Active and historical subscriptions

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID | FK → `profiles.id` |
| `stripe_subscription_id` | TEXT | Stripe internal ID |
| `stripe_customer_id` | TEXT | Stripe customer ID |
| `plan_id` | UUID | FK → `subscription_plans.id` |
| `status` | ENUM | `active`, `cancelled`, `past_due`, `expired` |
| `current_period_start` | TIMESTAMPTZ | |
| `current_period_end` | TIMESTAMPTZ | |
| `cancel_at_period_end` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

#### `subscription_plans` — Admin-managed pricing (NOT hardcoded)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `name` | TEXT | e.g., "Muscle Building — 3 Months" |
| `name_ar` | TEXT | Arabic translation |
| `description` | TEXT | |
| `description_ar` | TEXT | |
| `price_amount` | INTEGER | In smallest currency unit (fils/cents) |
| `currency` | TEXT | `aed`, `usd`, `sar`, etc. |
| `billing_interval` | ENUM | `month`, `quarter`, `year` |
| `stripe_price_id` | TEXT | Stripe Price ID |
| `features` | JSONB | Feature list for display |
| `is_active` | BOOLEAN | Controls visibility on frontend |
| `created_at` | TIMESTAMPTZ | |

---

#### `meal_plans` — Coach-created meal plans per client

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `client_id` | UUID | FK → `profiles.id` |
| `coach_id` | UUID | FK → `profiles.id` |
| `title` | TEXT | Plan title |
| `title_ar` | TEXT | Arabic title |
| `week_start_date` | DATE | Plan effective date |
| `notes` | TEXT | Coach notes |
| `is_active` | BOOLEAN | Only one active per client |
| `created_at` | TIMESTAMPTZ | |

---

#### `meal_plan_items` — Individual meal entries

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `meal_plan_id` | UUID | FK → `meal_plans.id` |
| `meal_type` | ENUM | `breakfast`, `lunch`, `snack`, `dinner` |
| `food_name` | TEXT | |
| `food_name_ar` | TEXT | |
| `quantity_grams` | DECIMAL | |
| `calories` | INTEGER | Optional |
| `protein_g` | DECIMAL | Optional |
| `carbs_g` | DECIMAL | Optional |
| `fats_g` | DECIMAL | Optional |
| `timing_notes` | TEXT | e.g., "30 min pre-workout" |
| `sort_order` | INTEGER | Display order |

---

#### `workout_plans` — Coach-created workout programs

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `client_id` | UUID | FK → `profiles.id` |
| `coach_id` | UUID | FK → `profiles.id` |
| `title` | TEXT | |
| `title_ar` | TEXT | |
| `week_start_date` | DATE | |
| `notes` | TEXT | |
| `is_active` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |

---

#### `workout_plan_days` — Day-level workout structure

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `workout_plan_id` | UUID | FK → `workout_plans.id` |
| `day_number` | INTEGER | 1–7 |
| `day_label` | TEXT | e.g., "Monday — Push Day" |
| `is_rest_day` | BOOLEAN | |

---

#### `workout_exercises` — Exercises within a day

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `workout_plan_day_id` | UUID | FK → `workout_plan_days.id` |
| `exercise_name` | TEXT | Free-text input (no forced dropdown) |
| `exercise_name_ar` | TEXT | Optional Arabic |
| `sets` | INTEGER | |
| `reps` | TEXT | e.g., "8-12" (text allows ranges) |
| `rest_seconds` | INTEGER | |
| `notes` | TEXT | Coach technique notes |
| `media_url` | TEXT | Image or video URL from Supabase Storage |
| `sort_order` | INTEGER | |

---

#### `progress_entries` — Client-submitted progress logs

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID | FK → `profiles.id` |
| `logged_date` | DATE | |
| `weight_kg` | DECIMAL | |
| `body_fat_percentage` | DECIMAL | Optional |
| `muscle_mass_kg` | DECIMAL | Optional |
| `notes` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

---

#### `progress_media` — Photos, PDFs, InBody uploads

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID | FK → `profiles.id` |
| `progress_entry_id` | UUID | FK → `progress_entries.id` (optional) |
| `media_type` | ENUM | `photo`, `pdf`, `inbody` |
| `storage_path` | TEXT | Path in Supabase Storage |
| `public_url` | TEXT | Signed or public URL |
| `uploaded_at` | TIMESTAMPTZ | |

---

#### `messages` — Real-time chat

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `conversation_id` | UUID | FK → `conversations.id` |
| `sender_id` | UUID | FK → `profiles.id` |
| `content` | TEXT | Message text |
| `is_read` | BOOLEAN | Read receipt |
| `created_at` | TIMESTAMPTZ | Used for ordering |

---

#### `conversations` — Chat threads (client ↔ coach)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `client_id` | UUID | FK → `profiles.id` |
| `coach_id` | UUID | FK → `profiles.id` |
| `created_at` | TIMESTAMPTZ | |

---

#### `products` — Marketplace items

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `name` | TEXT | |
| `name_ar` | TEXT | |
| `description` | TEXT | |
| `description_ar` | TEXT | |
| `price_amount` | INTEGER | |
| `currency` | TEXT | |
| `product_type` | ENUM | `supplement`, `snack`, `ebook` |
| `image_url` | TEXT | |
| `download_url` | TEXT | For ebooks |
| `stripe_price_id` | TEXT | |
| `stock_quantity` | INTEGER | NULL = unlimited (ebooks) |
| `is_active` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |

---

#### `orders` — Marketplace purchases

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID | FK → `profiles.id` |
| `stripe_payment_intent_id` | TEXT | |
| `status` | ENUM | `pending`, `paid`, `fulfilled`, `cancelled` |
| `total_amount` | INTEGER | |
| `currency` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

---

### 6.3 Security — RLS Policies

All tables have RLS enabled. Representative policies:

```sql
-- profiles: users can read their own profile; admin can read all
CREATE POLICY "users_read_own_profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- meal_plans: clients see their own; coaches see assigned clients; admin sees all
CREATE POLICY "meal_plans_access"
  ON meal_plans FOR SELECT
  USING (
    client_id = auth.uid()
    OR coach_id = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- messages: only conversation participants can read
CREATE POLICY "messages_participants_only"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.client_id = auth.uid() OR c.coach_id = auth.uid())
    )
  );
```

---

### 6.4 Migration Strategy

- All schema changes managed via **Supabase CLI migrations** (`supabase/migrations/`)
- Migrations versioned sequentially: `20260401000000_initial_schema.sql`
- **Never** apply raw SQL directly to production — always via migration files
- Staging environment used to validate migrations before production apply
- All migrations tracked in Git for full audit history

---

## 7. API & Data Access

### 7.1 Authentication

All API access is authenticated via **Supabase Auth JWT tokens**. Tokens are issued on login and stored in HTTP-only cookies via the Supabase SSR client.

```typescript
// Server component — reads session from cookie
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
}
```

**Middleware** (`/middleware.ts`) intercepts all dashboard routes, validates the session, reads the user role from `profiles`, and redirects unauthenticated or unauthorized requests.

---

### 7.2 API Structure

OMR+ follows a **hybrid API approach**:

| Pattern | When Used |
|---|---|
| **Supabase Client Queries** | Direct CRUD operations from React components/Server Components |
| **Next.js API Routes** | Complex business logic, Stripe webhooks, multi-table transactions |
| **Supabase Edge Functions** | Background jobs, scheduled tasks, cross-service integrations |

---

### 7.3 Common Data Access Patterns

#### Fetch Active Meal Plan for Client
```typescript
const { data: mealPlan } = await supabase
  .from('meal_plans')
  .select(`
    *,
    meal_plan_items (*)
  `)
  .eq('client_id', userId)
  .eq('is_active', true)
  .single()
```

#### Fetch Coach's Client Roster
```typescript
const { data: clients } = await supabase
  .from('profiles')
  .select('id, full_name, avatar_url, onboarding_completed, subscriptions(status)')
  .eq('assigned_coach_id', coachId)
  .eq('role', 'client')
```

#### Realtime Chat Subscription
```typescript
const channel = supabase
  .channel(`conversation:${conversationId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => setMessages((prev) => [...prev, payload.new as Message])
  )
  .subscribe()
```

---

### 7.4 API Routes

#### `POST /api/webhooks/stripe`
Handles Stripe webhook events. Verifies HMAC signature before processing.

| Event | Action |
|---|---|
| `checkout.session.completed` | Create subscription record, activate client dashboard |
| `customer.subscription.renewed` | Update `current_period_end`, ensure status = active |
| `customer.subscription.deleted` | Set status = cancelled, lock dashboard |
| `invoice.payment_failed` | Set status = past_due, send notification |

#### `POST /api/subscriptions/create-checkout`
Creates a Stripe Checkout Session for a selected plan. Returns `{ url }` for client-side redirect.

#### `POST /api/admin/assign-trainer`
Admin-only route. Validates admin role, updates `profiles.assigned_coach_id`, creates `conversations` record.

---

### 7.5 Error Handling

All API routes return consistent error shapes:

```typescript
// Success
{ data: T, error: null }

// Error
{ data: null, error: { code: string, message: string, details?: unknown } }
```

| HTTP Status | Meaning |
|---|---|
| `200` | Success |
| `400` | Validation error (zod schema failure) |
| `401` | Unauthenticated — no valid session |
| `403` | Unauthorized — insufficient role |
| `404` | Resource not found |
| `409` | Conflict (e.g., duplicate subscription) |
| `500` | Internal server error |

---

## 8. Workflows & Business Logic

### 8.1 Client User Journey

```
1. Lands on omrplus.com (public home page)
2. Reads programs, transformations, how-it-works
3. Clicks "Free Consultation" CTA → contact form / WhatsApp
4. Decides to subscribe → selects program → Stripe Checkout
5. Payment completes → account created (or existing account upgraded)
6. First login → Onboarding Questionnaire (mandatory)
7. Questionnaire submitted → dashboard unlocked
8. Admin assigns coach to client
9. Coach builds meal plan + workout plan
10. Client views plans, logs progress, chats with coach
11. Monthly renewal handled automatically by Stripe
12. If subscription expires → dashboard locked until renewed
```

---

### 8.2 Coach User Journey

```
1. Admin creates coach account with role = 'coach'
2. Coach receives login credentials via email
3. Coach logs in → Coach Dashboard
4. Admin assigns clients to coach
5. Coach views new client → reads onboarding questionnaire
6. Coach creates Meal Plan for client (Meal Builder)
7. Coach creates Workout Plan for client (Workout Builder)
8. Plans appear instantly in client's dashboard
9. Client sends change request via chat
10. Coach responds, updates plan if needed
11. Coach monitors client progress entries (weight, body checks)
12. Process repeats weekly per client
```

---

### 8.3 Admin User Journey

```
1. Admin logs in with admin credentials
2. Reviews new client signups
3. Assigns coaches to new clients
4. Manages subscription plans (pricing, intervals) — never hardcoded
5. Reviews platform analytics (MRR, active users, plan distribution)
6. Manages marketplace products (add, edit, hide)
7. Controls website content (program descriptions, pricing display)
8. Uploads workout media (videos for exercise library)
9. Monitors all chat threads if required
10. Handles escalations (subscription disputes, manual overrides)
```

---

### 8.4 Workout Plan Flow

```
Coach Dashboard → Workout Builder
  ├── Select client from roster
  ├── Create new workout plan (title, start date)
  ├── For each day (1–7):
  │   ├── Set day label (e.g., "Push Day")
  │   ├── Toggle rest day (skips exercise entry)
  │   └── Add exercises:
  │       ├── Exercise name (free-text — no dropdown)
  │       ├── Sets, Reps (text field — supports "8-12")
  │       ├── Rest time (seconds)
  │       ├── Coach notes
  │       └── Upload image/video (Supabase Storage)
  └── Save plan → set is_active = true → deactivate prior plan

Client Dashboard → Workout Plan
  ├── Current week's active plan displayed
  ├── Day-by-day navigation
  ├── Each exercise shows: name, sets, reps, rest, notes, media
  └── Read-only — change requests go via chat
```

---

### 8.5 Diet Plan Flow

```
Coach Dashboard → Meal Builder
  ├── Select client from roster
  ├── Create new meal plan (title, start date)
  ├── Add meal items per meal type:
  │   ├── Breakfast
  │   ├── Lunch
  │   ├── Snack
  │   └── Dinner
  │   Each item: food name (EN + AR), quantity (grams), macros (optional)
  └── Save → is_active = true → previous plan deactivated

Client Dashboard → Meal Plan
  ├── Active plan displayed by meal type
  ├── Each food item shows: name, quantity, optional macros, timing notes
  └── Read-only — changes requested via coach chat
```

---

### 8.6 Subscription Flow

```
Plan Selection
  └── Client selects plan on /programs page
       └── POST /api/subscriptions/create-checkout
            ├── Verify user is authenticated
            ├── Create Stripe Customer (if not exists)
            ├── Create Stripe Checkout Session
            │   ├── Mode: subscription
            │   ├── Price: from subscription_plans.stripe_price_id
            │   ├── Success URL: /dashboard/client
            │   └── Cancel URL: /programs
            └── Return { url } → frontend redirects

Checkout Completion (Stripe Webhook)
  └── POST /api/webhooks/stripe
       ├── Verify Stripe-Signature header
       ├── Handle checkout.session.completed:
       │   ├── Create subscription record
       │   ├── Set status = active
       │   └── Mark dashboard_access = true on profile
       ├── Handle customer.subscription.deleted:
       │   └── Set status = cancelled
       └── Handle invoice.payment_failed:
            └── Set status = past_due, notify client

Access Control
  └── Middleware on /(dashboard)/client routes:
       ├── Check auth.uid() has active subscription
       ├── If status = active → allow
       └── If status != active → redirect to /subscription-expired
```

---

### 8.7 Progress Tracking Flow

```
Client Dashboard → Progress
  ├── Log entry (weight, body fat %, muscle mass kg, notes)
  ├── Upload media (photos, PDF body check, InBody scan)
  └── Entries stored → chart updates (recharts line graph)

Coach Dashboard → Progress Monitoring
  ├── Select client
  ├── View all logged entries in timeline
  ├── View uploaded photos and PDFs
  └── Add coach notes per entry (optional)

Admin Dashboard → Analytics
  └── Aggregate progress data (anonymized) for platform insights
```

---

## 9. Security & Data Protection

### 9.1 Permission Model

| Resource | Client | Coach | Admin |
|---|---|---|---|
| Own profile | Read + Write | Read + Write | Read + Write |
| Other profiles | ❌ | Assigned clients only | All |
| Own meal plan | Read | Write (own client) | Read + Write |
| Own workout plan | Read | Write (own client) | Read + Write |
| Own messages | Read + Write | Read + Write | Read (all) |
| Progress entries | Own only | Assigned clients | All |
| Subscription data | Own only | ❌ | All |
| Products / Marketplace | Read active | ❌ | Full CRUD |
| Admin panel | ❌ | ❌ | Full access |

---

### 9.2 Threat Mitigation

| Threat | Mitigation |
|---|---|
| **SQL Injection** | All queries via Supabase parameterized client — no raw string concatenation |
| **Unauthorized data access** | RLS enforced at database level — application bypass still blocked |
| **XSS** | React's default JSX escaping; no `dangerouslySetInnerHTML` without explicit sanitization |
| **CSRF** | Next.js API routes use JWT verification; Supabase cookies are `SameSite=Strict` |
| **Stripe webhook spoofing** | All webhook payloads verified via `stripe.webhooks.constructEvent()` with secret |
| **Broken access control** | Role checked in both middleware (route level) and RLS (data level) |
| **Credential exposure** | All secrets in environment variables; Vercel encrypts environment at rest |
| **Insecure file uploads** | File type and size validation before Supabase Storage write; signed URLs for private files |
| **Session hijacking** | HTTP-only cookies; Supabase Auth enforces short-lived JWTs with refresh token rotation |
| **Transformation photo exposure** | Progress photos stored in private Supabase Storage bucket with signed URLs only |

---

### 9.3 Role-Based Access Control Implementation

```typescript
// middleware.ts — route-level protection
export async function middleware(request: NextRequest) {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const path = request.nextUrl.pathname

  if (path.startsWith('/dashboard/admin') && profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  if (path.startsWith('/dashboard/coach') && profile?.role !== 'coach') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  if (path.startsWith('/dashboard/client') && profile?.role !== 'client') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
}
```

---

## 10. Environment Setup

### 10.1 Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | 20.x LTS | JavaScript runtime |
| **npm** | 10.x | Package management |
| **Git** | Latest | Version control |
| **Supabase CLI** | Latest | Local DB and migrations |
| **Stripe CLI** | Latest | Local webhook testing |

---

### 10.2 Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/[org]/omrplus-master.git
cd omrplus-master

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Initialize Supabase locally
supabase init
supabase start

# 5. Apply database migrations
supabase db push

# 6. Generate TypeScript types from schema
supabase gen types typescript --local > types/supabase.ts

# 7. Start the development server
npm run dev

# 8. (Optional) Start Stripe CLI for local webhook testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

### 10.3 Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]  # Server-side only — never expose to client

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[...]
STRIPE_SECRET_KEY=sk_live_[...]
STRIPE_WEBHOOK_SECRET=whsec_[...]

# App
NEXT_PUBLIC_APP_URL=https://omrplus.com
NEXT_PUBLIC_DEFAULT_LOCALE=en

# Optional (Phase 2)
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# SENDGRID_API_KEY=
```

**Security Rules:**
- Never commit `.env.local` to version control (ensure `.gitignore` includes it)
- `SUPABASE_SERVICE_ROLE_KEY` must only be used in server-side code (API routes, server components)
- Rotate all keys immediately if accidentally exposed

---

## 11. Deployment & CI/CD

### 11.1 Build Process

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Production build
npm run build

# Build output analysis
npx @next/bundle-analyzer
```

---

### 11.2 Deployment Steps

#### Frontend (Vercel)

1. Connect GitHub repository to Vercel project
2. Set all environment variables in Vercel Dashboard → Settings → Environment Variables
3. Set production environment variables separately from preview
4. Configure build command: `npm run build`
5. Configure output directory: `.next`
6. Every push to `main` triggers automatic production deployment
7. Every pull request creates an isolated preview deployment

#### Backend (Supabase)

1. Create production Supabase project at supabase.com
2. Apply migrations: `supabase db push --db-url [production-db-url]`
3. Enable RLS on all tables (verify via Supabase Dashboard)
4. Configure Supabase Auth settings (allowed redirect URLs: `https://omrplus.com`)
5. Create Storage buckets: `progress-media` (private), `workout-media` (private), `product-images` (public)
6. Set Storage policies for each bucket per role requirements

#### Stripe Configuration

1. Create products and prices in Stripe Dashboard (or via CLI)
2. Copy `stripe_price_id` values into `subscription_plans` table
3. Register webhook endpoint: `https://omrplus.com/api/webhooks/stripe`
4. Subscribe to events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` environment variable

---

### 11.3 Domain & Infrastructure

| Component | Configuration |
|---|---|
| **Domain registrar** | GoDaddy — omrplus.com |
| **DNS** | Add Vercel's A record and CNAME to GoDaddy DNS settings |
| **SSL** | Auto-provisioned by Vercel (Let's Encrypt) |
| **CDN** | Vercel Edge Network — global distribution |
| **www redirect** | Configure `www.omrplus.com` → `omrplus.com` in Vercel project settings |

---

### 11.4 Backup & Recovery

| Resource | Backup Strategy |
|---|---|
| **Database** | Supabase automated daily backups (7-day retention on Pro plan) |
| **Point-in-time recovery** | Available on Supabase Pro — restore to any minute within retention window |
| **Storage files** | Supabase Storage replication — no additional action required |
| **Source code** | GitHub repository — full history retained |
| **Environment secrets** | Documented securely in password manager — never in source control |

**Recovery Procedure:**
1. For database corruption: use Supabase Dashboard → Database → Backups → Restore
2. For accidental data deletion: point-in-time recovery via Supabase support
3. For deployment rollback: Vercel Dashboard → Deployments → Redeploy previous deployment

---

## 12. Testing Strategy

### 12.1 Unit Testing

**Framework:** Jest + React Testing Library

**Targets:**
- Utility functions in `/lib` (subscription status checks, date formatters, i18n helpers)
- Form validation schemas (zod schemas in `/lib/validations`)
- Business logic functions (plan activation logic, progress calculation)

```bash
npm run test:unit
```

**Coverage Requirements:**
- All `/lib` utility functions: 90%+ coverage
- Form validation schemas: 100% coverage (all valid and invalid inputs tested)

---

### 12.2 Integration Testing

**Framework:** Jest + Supabase Test Client

**Targets:**
- API route handlers (`/app/api/`)
- Stripe webhook handler (mock Stripe events)
- Supabase query helpers with test database

```bash
npm run test:integration
```

**Key Integration Tests:**

| Test | Validates |
|---|---|
| `POST /api/webhooks/stripe` with valid signature | Subscription created correctly |
| `POST /api/webhooks/stripe` with invalid signature | Returns 400, no DB changes |
| Coach creates meal plan → client fetches it | RLS allows correct access |
| Client attempts to read another client's data | RLS blocks, returns empty |
| Admin accesses any profile | RLS allows full read |
| Expired subscription client accesses dashboard | Middleware redirects to /subscription-expired |

---

### 12.3 End-to-End Testing

**Framework:** Playwright

**Test Scenarios:**

| Scenario | Steps |
|---|---|
| **Client Happy Path** | Signup → Onboarding → View Meal Plan → Log Progress → Send Message |
| **Coach Workflow** | Login → Select Client → Build Meal Plan → Build Workout Plan → Respond to Chat |
| **Admin Workflow** | Login → Assign Coach → Edit Subscription Plan → Add Product → View Analytics |
| **Subscription Flow** | Select Plan → Stripe Test Checkout → Dashboard Access Granted |
| **Expired Subscription** | Manually expire → Attempt dashboard access → Verify locked |
| **Language Switch** | Toggle to Arabic → Verify RTL layout → Verify Arabic translations |
| **Mobile Responsiveness** | Playwright viewport tests at 375px, 768px, 1440px |

```bash
npm run test:e2e
```

---

## 13. Monitoring & Maintenance

### 13.1 Error Tracking

**Tool:** Vercel's built-in error logging + optional Sentry integration

**Error categories monitored:**
- Unhandled Next.js server errors (500 responses)
- Stripe webhook processing failures
- Supabase query errors (logged server-side)
- Client-side React rendering errors (Error Boundaries)

**Alerting:**
- Vercel email alerts for deployment failures
- Stripe Dashboard alerts for payment failure rate spikes
- Supabase Dashboard alerts for database CPU/connection spikes

---

### 13.2 Key Performance Indicators (KPIs)

| KPI | Target | Measurement |
|---|---|---|
| **Core Web Vitals — LCP** | < 2.5s | Vercel Analytics / PageSpeed Insights |
| **Core Web Vitals — CLS** | < 0.1 | Vercel Analytics |
| **Core Web Vitals — INP** | < 200ms | Vercel Analytics |
| **API Route P95 latency** | < 500ms | Vercel function logs |
| **Webhook processing time** | < 3s | Stripe webhook dashboard |
| **Database query P95** | < 100ms | Supabase Dashboard |
| **Uptime** | > 99.9% | Vercel + Supabase SLAs |
| **Monthly Active Users** | Tracked | Supabase Analytics |
| **MRR** | Tracked | Stripe Dashboard |
| **Subscription churn rate** | < 5% monthly | Stripe Dashboard |

---

### 13.3 Maintenance Plan

#### Post-Launch Support (4 Months)

| Activity | Frequency | Owner |
|---|---|---|
| Bug fix review | As reported | Development team |
| Minor content updates | As requested | Development team |
| Dependency security patches | Monthly | Development team |
| Database performance review | Monthly | Development team |
| Backup verification | Monthly | Development team |
| Stripe reconciliation check | Monthly | Client + Development |
| SSL certificate renewal | Auto (Vercel) | Automatic |

#### Ongoing Operational Tasks

- Monitor Supabase connection pool utilization — scale if consistently > 80%
- Review slow query logs monthly — add indexes as needed
- Rotate API keys annually or on suspected exposure
- Keep `next-intl` translation files synchronized across EN/AR
- Review Stripe changelog quarterly for payment method changes

---

## 14. Future Roadmap

### 14.1 Scalability Plan

As the user base grows, the following infrastructure evolution is planned:

| Trigger | Action |
|---|---|
| > 5,000 concurrent users | Upgrade Supabase plan; enable read replicas |
| > 50GB Storage | Review Storage tier; implement file lifecycle policies |
| Marketplace goes live | Enable inventory management, order fulfillment workflow |
| Multi-region demand | Evaluate Vercel Edge Config for region-specific routing |
| AI feature activation | Integrate OpenAI/Anthropic API for meal plan generation |

---

### 14.2 Phase 2 Features

| Feature | Description | Priority |
|---|---|---|
| **AI Meal Plan Generator** | Generate meal plans from client questionnaire data via LLM API | High |
| **OTP/SMS Verification** | Phone number verification via Twilio on signup | High |
| **In-App Supermarket Ordering** | Browse and order products with delivery scheduling | Medium |
| **Personalized Product Recommendations** | Suggest marketplace items based on active meal plan | Medium |
| **Subscription Snack Boxes** | Recurring physical product subscription integration | Medium |
| **Affiliate / Influencer System** | Referral tracking, commission management, promo codes | Low |
| **Native Mobile Apps** | iOS and Android apps (React Native) | High |
| **Corporate Wellness Portal** | B2B coaching subscriptions for companies | Low |
| **Multi-Coach Firms** | Support multiple coaching businesses on one platform (SaaS) | Low |
| **Video Call Integration** | Scheduled video consultations (Coach ↔ Client) | Medium |
| **Advanced Analytics** | Body measurement trend analysis, plan effectiveness scoring | Medium |

---

## 15. Appendix

### 15.1 References

| Document | Purpose |
|---|---|
| `OMR_Developer_Scope.pdf` | Detailed technical requirements — primary scope reference |
| `OMR_App_Website_Supermarket_Spec.pdf` | Feature and concept overview — business context |
| `CLAUDE.md` | Project brain — coding rules, conventions, active status |
| [Next.js Documentation](https://nextjs.org/docs) | Framework reference |
| [Supabase Documentation](https://supabase.com/docs) | Backend and database reference |
| [Stripe Documentation](https://stripe.com/docs) | Payment integration reference |
| [next-intl Documentation](https://next-intl-docs.vercel.app) | i18n implementation reference |
| [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs) | Styling reference |

---

### 15.2 Storage Bucket Configuration

| Bucket | Access | Contents |
|---|---|---|
| `progress-media` | Private (signed URLs) | Client progress photos, body check PDFs, InBody scans |
| `workout-media` | Private (signed URLs) | Exercise instruction images and videos |
| `product-images` | Public | Marketplace product and ebook cover images |
| `avatars` | Private | User profile photos |

---

### 15.3 Admin Contact

| Contact | Details |
|---|---|
| **Client / Platform Owner** | aoa12@hotmail.com |
| **Domain Registrar** | GoDaddy — omrplus.com |
| **Platform Deployment** | Vercel |
| **Database** | Supabase |
| **Payments** | Stripe |

---

### 15.4 Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "Prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag"
  ]
}
```

---

## 16. Final Delivery Summary

### 16.1 Production Readiness Checklist

| Requirement | Status |
|---|---|
| All 3 dashboards functional (client, coach, admin) | In Progress |
| Authentication working with proper role access | In Progress |
| Meal plan & workout plan systems functional | In Progress |
| Real-time messaging working | In Progress |
| Payment integration & subscription management working | In Progress |
| Marketplace storefront & checkout working | In Progress |
| Bilingual (EN/AR) fully implemented & tested | In Progress |
| Mobile responsive across all pages | In Progress |
| No hardcoded data — all managed via admin | In Progress |
| Client can manage full platform from admin dashboard | In Progress |
| Zero security vulnerabilities (RLS, no data leaks) | In Progress |
| Performance optimized (Core Web Vitals passing) | In Progress |
| Domain connected (omrplus.com) | Pending DNS setup |
| All environment variables configured in production | Pending |
| Stripe webhook registered for production URL | Pending |
| Post-launch handover documentation prepared | Pending |

---

### 16.2 Delivery Standards

This platform has been designed and built to the following standards:

| Standard | Specification |
|---|---|
| **Code Quality** | TypeScript strict mode; zero `any` types; ESLint clean |
| **Security** | OWASP Top 10 mitigated; RLS enforced on all tables; no hardcoded secrets |
| **Performance** | Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms |
| **Accessibility** | WCAG 2.1 AA — semantic HTML, ARIA labels, keyboard navigation |
| **Bilingual** | Full EN/AR with RTL rendering tested across all views |
| **Mobile** | Responsive tested at 375px, 768px, 1024px, 1440px viewports |
| **Browser Support** | Chrome 120+, Safari 17+, Firefox 120+, Edge 120+ |
| **Documentation** | Full technical + business documentation delivered alongside code |

---

### 16.3 Handover Package

The following will be delivered to the client at launch:

1. Full source code repository access (GitHub)
2. Supabase project access (credentials to aoa12@hotmail.com)
3. Vercel project access
4. Stripe account configuration documentation
5. Admin user credentials for omrplus.com/dashboard/admin
6. This software documentation (PDF + Markdown)
7. 4-month post-launch support commencement

---

## 17. Acceptance Sign-Off

This document establishes the agreed scope, architecture, and delivery standards for the OMR+ Fitness Coaching Ecosystem, Version 1.0.

---

| Role | Name | Signature | Date |
|---|---|---|---|
| **Client / Product Owner** | | | |
| **Lead Developer** | | | |
| **Project Manager** | | | |
| **QA Lead** | | | |

---

> **By signing above, all parties confirm that:**
> - The scope described in this document accurately reflects the agreed deliverables
> - The technical architecture has been reviewed and approved
> - The security and data protection measures meet the client's requirements
> - The delivery milestones and post-launch support terms are accepted

---

*Document Version: 1.0 | Last Updated: April 15, 2026 | Status: Active*  
*This document is confidential and intended solely for the parties named above.*
