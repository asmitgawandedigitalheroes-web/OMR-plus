# OMR+ — Master Project Specification
> **Version:** v1.0 — March 2026  
> **Prepared by:** Digital Marketing Heroes (Khushi Gupta)  
> **Client:** omrplus (Fiverr handle) · omrplus.com (GoDaddy)  
> **Status:** Active — Development in Progress  
> **Delivery:** 25 working days from project start

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Brand Identity](#2-brand-identity)
3. [Platform Architecture](#3-platform-architecture)
4. [Tech Stack](#4-tech-stack)
5. [User Roles & Access Levels](#5-user-roles--access-levels)
6. [Database Schema Overview](#6-database-schema-overview)
7. [Marketing Website — Public Pages](#7-marketing-website--public-pages)
8. [Client Dashboard](#8-client-dashboard)
9. [Trainer / Coach Dashboard](#9-trainer--coach-dashboard)
10. [Admin / Owner Dashboard](#10-admin--owner-dashboard)
11. [Marketplace Module](#11-marketplace-module)
12. [Subscription & Payment System](#12-subscription--payment-system)
13. [Bilingual Support (EN / AR)](#13-bilingual-support-en--ar)
14. [Authentication & Security](#14-authentication--security)
15. [File Storage](#15-file-storage)
16. [Real-Time Messaging](#16-real-time-messaging)
17. [Technical Requirements](#17-technical-requirements)
18. [Deployment & Infrastructure](#18-deployment--infrastructure)
19. [Out of Scope — Phase 1](#19-out-of-scope--phase-1)
20. [Phase 2 Roadmap (Future)](#20-phase-2-roadmap-future)
21. [Delivery Milestones](#21-delivery-milestones)
22. [Post-Launch Support](#22-post-launch-support)
23. [Developer Notes & Confirmed Client Decisions](#23-developer-notes--confirmed-client-decisions)

---

## 1. Project Overview

OMR+ is a **premium fitness coaching ecosystem** — not a simple website or a Shopify store. It is a fully custom-built web application that unifies:

- A public-facing marketing website with checkout
- A private client portal (meal plans, workouts, progress)
- A trainer management system
- An AI-assisted meal planning architecture (Phase 1 ready, AI in Phase 2)
- A healthy product and supplement marketplace
- A full admin panel with centralized control over all roles and data

The platform is bilingual (English + Arabic RTL) from the ground up, targets the Middle East market, and supports Apple Pay alongside Visa/Mastercard.

> **Architecture decision confirmed Mar 28 by client:** Fully custom platform (Option B). Shopify has been removed entirely from the project. All modules share one Supabase (PostgreSQL) database and one admin panel.

---

## 2. Brand Identity

| Property | Value |
|---|---|
| Brand Name | OMR+ |
| Arabic Tagline | منصة الصحة الذكية ("The Smart Health Platform") |
| Primary Color | Deep Forest Green (`#1A3A2A` range) |
| Accent Color | Gold (`#C9A84C` range) |
| Background | Near-black / dark charcoal |
| Typography | Premium / editorial feel — suggest Lexend or similar |
| Logo | Circle ECG icon + OMR+ wordmark in gold on dark green (provided) |
| Interior Aesthetic (Supermarket Phase 2) | Black and gold luxury fitness |

**Design rules:**
- Match the OMR+ logo palette strictly: dark green, gold, black
- Mobile-first responsive design on every page and dashboard
- No "7-Day Trial" or "Free Trial" copy anywhere on the site
- Replace all trial CTAs with **"Free Consultation"**
- Coaches section hidden from the public frontend until the owner manually assigns coaches

---

## 3. Platform Architecture

The platform is one unified system. All components share a single database and are managed through one admin panel.

```
┌─────────────────────────────────────────────────────────────┐
│                     OMR+ Unified Platform                   │
├──────────────────────┬──────────────────────────────────────┤
│  Public / Marketing  │  Authenticated                       │
│  Website             │  Applications                        │
├──────────────────────┼──────────────────────────────────────┤
│  - Home              │  Client Dashboard                    │
│  - Programs          │  Trainer / Coach Dashboard           │
│  - How It Works      │  Admin / Owner Dashboard             │
│  - Transformations   │                                      │
│  - About             │  Shared Services:                    │
│  - Contact           │  - Supabase PostgreSQL DB            │
│  - Free Consultation │  - Supabase Auth (RBAC)              │
│  - Marketplace       │  - Supabase Storage                  │
│    (Coming Soon)     │  - Supabase Realtime (Chat)          │
│                      │  - Stripe / ME Payment Gateway       │
└──────────────────────┴──────────────────────────────────────┘
```

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js (React) — SSR/SSG per page as appropriate |
| **Styling** | Tailwind CSS (recommended) |
| **Backend / Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth with Role-Based Access Control (RBAC) |
| **Real-Time** | Supabase Realtime (WebSockets) for chat |
| **File Storage** | Supabase Storage (PDFs, images, videos) |
| **Payments** | Stripe (primary); PayTabs / Moyasar / HyperPay / Checkout.com for ME |
| **Deployment — Frontend** | Vercel |
| **Deployment — Backend** | Supabase (managed) |
| **Domain** | omrplus.com (GoDaddy — connect to Vercel) |
| **Language i18n** | next-intl or next-i18next |
| **Future App API** | All business logic exposed as a REST/API layer for iOS/Android |

---

## 5. User Roles & Access Levels

| Role | Description |
|---|---|
| **Client (User)** | Registers on the website. Completes onboarding questionnaire. Accesses personal dashboard. Views trainer-assigned meal and workout plans. Logs progress. Uploads body check files. Messages assigned trainer. Manages subscription. |
| **Coach (Trainer)** | Has a dedicated trainer login. Views and manages assigned clients. Builds and assigns meal/workout plans. Monitors client progress. Chats with clients. |
| **Admin (Owner)** | Full system control from a single panel. Manages all users, trainers, subscriptions, products, marketplace orders, content, analytics, and membership pricing. |
| **Store Staff (Phase 2)** | Limited access to marketplace product management and order fulfillment only. Not built in Phase 1. |

### Role Assignment Flow
- New users register as **Client** by default
- Admin manually assigns **Trainer** role to staff accounts
- Admin account is seeded at platform setup
- Trainer-client link established by trainer (via client email) or by admin

---

## 6. Database Schema Overview

> Supabase (PostgreSQL) with Row-Level Security (RLS) enforced on all tables.

### Core Tables

**`profiles`**
- `id` (uuid, FK → auth.users)
- `role` (enum: client | trainer | admin | store_staff)
- `full_name`, `email`, `phone`
- `preferred_language` (en | ar)
- `created_at`, `updated_at`

**`onboarding_responses`**
- `id`, `user_id` (FK → profiles)
- `fitness_goal`, `current_weight`, `target_weight`
- `dietary_restrictions`, `health_conditions`
- `completed_at`

**`trainer_client_assignments`**
- `trainer_id` (FK → profiles), `client_id` (FK → profiles)
- `assigned_at`, `is_active`

**`meal_plans`**
- `id`, `client_id`, `trainer_id`
- `title` (bilingual), `week_start_date`
- `created_at`, `updated_at`

**`meal_plan_entries`**
- `id`, `meal_plan_id`
- `meal_timing` (breakfast | lunch | snack | dinner)
- `food_name`, `quantity_grams`, `notes`
- Supports bilingual `food_name_ar`

**`workout_plans`**
- `id`, `client_id`, `trainer_id`
- `title` (bilingual), `week_start_date`

**`workout_plan_days`**
- `id`, `workout_plan_id`, `day_label` (e.g., "Monday", "Day 1")

**`workout_exercises`**
- `id`, `workout_day_id`
- `exercise_name` (free text — NOT a forced dropdown)
- `category` (chest | back | legs | shoulders | arms | abs | cardio)
- `sets`, `reps`, `rest_seconds`, `notes`
- `image_url`, `video_url` (Supabase Storage references)

**`progress_logs`**
- `id`, `user_id`, `logged_at`
- `weight_kg`, `body_fat_pct`, `notes`

**`body_check_uploads`**
- `id`, `user_id`, `upload_type` (photo | pdf)
- `file_url`, `uploaded_at`

**`messages`**
- `id`, `sender_id`, `receiver_id`
- `content`, `sent_at`, `read_at`

**`subscriptions`**
- `id`, `user_id`, `plan_id`
- `status` (active | expired | cancelled | past_due)
- `start_date`, `renewal_date`
- `stripe_subscription_id`, `stripe_customer_id`

**`membership_plans`**
- `id`, `name` (bilingual), `description`
- `price`, `currency`, `interval` (monthly | quarterly | yearly)
- `is_active` — editable by admin only, NOT hardcoded

**`invoices`**
- `id`, `user_id`, `amount`, `currency`
- `status` (paid | pending | failed)
- `stripe_invoice_id`, `created_at`

**`products`** (Marketplace)
- `id`, `name` (bilingual), `description` (bilingual)
- `price`, `category` (supplement | snack | ebook | merchandise)
- `image_url`, `stock_count`, `is_visible`, `is_ebook`
- `ebook_file_url` or `ebook_access_link`

**`orders`** (Marketplace)
- `id`, `user_id`, `total_amount`, `status`
- `created_at`

**`order_items`**
- `id`, `order_id`, `product_id`, `quantity`, `unit_price`

---

## 7. Marketing Website — Public Pages

All pages below are part of the main public-facing website. Built with Next.js. Fully bilingual.

---

### 7.1 Home (`/`)

**Sections:**
- **Hero** — Full-width cinematic hero. Headline in EN + AR. Primary CTA: "Book Free Consultation" (links to WhatsApp or consultation form). No "Free Trial" language.
- **Program Highlights** — Preview cards for the 5 coaching programs (see Programs page). CTA per card links to `/programs`.
- **How It Works** — 3–4 step visual explainer (simplified). Full page linked from here.
- **Transformations Preview** — 2–3 anonymized before/after cards. Links to `/transformations`.
- **Testimonials** — Client quote cards (text only initially).
- **CTA Banner** — "Start Your Journey" → "Book Free Consultation."
- **Footer** — Nav links, social links, language toggle, copyright.

**Notes:**
- Coaches section is **hidden** from this page and all public pages until owner assigns coaches in admin.
- No mention of 7-day or free trial anywhere.

---

### 7.2 Programs (`/programs`)

Lists exactly these 5 programs (from confirmed client spec):

1. **Muscle Building**
2. **Fat Loss**
3. **Summer Body**
4. **Workout Plan Alone**
5. **Food Plan Alone**

**Each program card must include:**
- Program name (EN + AR)
- Short description
- What's included (bullet points)
- Price / "Starts from" — pulled dynamically from `membership_plans` table (NOT hardcoded)
- CTA: "Book Free Consultation" (WhatsApp link or form)

---

### 7.3 Marketplace (`/marketplace`)

- Displayed as **"Coming Soon"** on frontend until admin enables it
- Admin can toggle marketplace visibility from admin panel
- When live: product grid (supplements, snacks, ebooks, merchandise)
- Ebooks section visible as a subsection
- Checkout connects to main payment gateway

---

### 7.4 How It Works (`/how-it-works`)

Step-by-step explainer page for the coaching process:
1. Book a free consultation
2. Complete onboarding questionnaire
3. Receive personalized meal + workout plan
4. Check in weekly with your trainer
5. Track progress and adjust

Visual/icon-based layout. Bilingual.

---

### 7.5 Transformations (`/transformations`)

- Privacy-protected results gallery
- **No client names displayed**
- **No faces displayed** without explicit client permission
- Admin uploads transformation entries via admin panel
- Each card: before/after description (text), optional anonymized image
- Admin can toggle visibility of each entry

---

### 7.6 About (`/about`)

- Brand-focused page only
- **No founder name or founder photo** — leave placeholder until client provides update
- Includes: brand story, mission statement, vision
- Brand values / pillars section
- OMR+ logo prominently featured

---

### 7.7 Contact (`/contact`)

- Contact form: Name, Email, Phone (optional), Message
- WhatsApp button / chat link prominently displayed
- Form submissions saved to database and optionally forwarded via email notification

---

### 7.8 Free Consultation (`/consultation`)

- This is the primary CTA destination across the entire site
- Options: WhatsApp redirect, embedded form, or in-platform booking request
- Replaces all "Start Trial" / "7-Day Trial" / "Free Trial" CTAs site-wide
- Short form: Name, Goal (dropdown), Phone number, Preferred language

---

### 7.9 Auth Pages

- `/login` — Email + password login. Role-based redirect after login:
  - Client → `/dashboard`
  - Trainer → `/trainer`
  - Admin → `/admin`
- `/register` — Email, password, name, phone. Role auto-assigned as **client**.
- `/forgot-password` — Supabase password reset flow
- `/onboarding` — Post-registration questionnaire (first login only, then redirect to dashboard)

---

## 8. Client Dashboard

Route: `/dashboard` — accessible to authenticated **client** role only.  
Subscription check on load: if subscription is expired → show paywall/upgrade prompt.

---

### 8.1 Onboarding Questionnaire (`/onboarding`)

Triggered on first login. Completed once. Stores data to `onboarding_responses`.

**Fields collected:**
- Fitness goal (select: Muscle Building | Fat Loss | Summer Body | General Fitness | Other)
- Current weight (kg)
- Target weight (kg)
- Dietary restrictions (free text + common checkboxes: vegetarian, vegan, halal, gluten-free, lactose-free)
- Health conditions (free text, e.g., diabetes, hypertension, injuries)
- Activity level (sedentary | lightly active | moderately active | very active)

Data visible to assigned trainer and admin. Client can view but not edit after submission (trainer or admin can update).

---

### 8.2 Dashboard Home (`/dashboard`)

Quick-view widgets:
- Active meal plan (current day's meals)
- Today's workout
- Progress summary (last logged weight)
- Unread messages from trainer
- Subscription status + renewal date

---

### 8.3 Meal Plan Module (`/dashboard/meal-plan`)

- Displays trainer-assigned meal plan for the current week
- Organized by timing: **Breakfast | Lunch | Snack | Dinner**
- Each entry shows: food item name, quantity in grams, nutritional notes (if added by trainer)
- Client can **view only** — no editing of the plan
- Client can send a **plan change request** via the messaging module
- Weekly navigation (previous/next week)

---

### 8.4 Workout Plan Module (`/dashboard/workout-plan`)

- Day-wise workout schedule assigned by trainer
- Days shown as tabs or accordion (Day 1, Day 2 … or Monday–Sunday)
- **Exercise categories:** Chest | Back | Legs | Shoulders | Arms | Abs | Cardio
- Each exercise shows:
  - Exercise name (free text — trainer inputs custom names)
  - Sets, Reps, Rest time
  - Notes
  - Image (if uploaded by trainer)
  - Video (if uploaded by trainer — embedded player)
- Client views only

---

### 8.5 Progress Tracking (`/dashboard/progress`)

- Client logs: weight (kg), body fat % (optional), notes
- Log submitted per entry with timestamp
- Progress history displayed as:
  - Timeline list view
  - Chart view (line chart: weight over time)
- Body check upload:
  - PDF upload (InBody scan)
  - Photo upload (body check photo)
  - Files stored in Supabase Storage
  - Visible to assigned trainer and admin

---

### 8.6 Messaging (`/dashboard/messages`)

- Chat interface with assigned trainer
- Real-time or near-real-time (Supabase Realtime)
- Message history stored and paginated
- Unread message indicator in dashboard nav
- Client cannot message admin directly (admin can view all threads)

---

### 8.7 Subscription Management (`/dashboard/subscription`)

- Active plan name and description
- Billing start date and next renewal date
- Subscription status badge (active | expired | cancelled)
- Invoices list with download links (PDF)
- Upgrade / manage plan button → links to payment flow
- If subscription expired: full dashboard locked, paywall overlay shown with CTA to renew

---

## 9. Trainer / Coach Dashboard

Route: `/trainer` — accessible to authenticated **trainer** role only.

---

### 9.1 Client List (`/trainer/clients`)

- List of all clients assigned to this trainer
- Each row: client name, goal, onboarding status, last check-in date
- Search and filter by name
- "Add Client" button: input registered client email → system creates trainer-client link
- Click client → opens client detail view

---

### 9.2 Client Detail View (`/trainer/clients/[clientId]`)

Tabs:
1. **Profile** — Goals, onboarding answers, body stats history
2. **Meal Plan** — View + edit assigned meal plan
3. **Workout Plan** — View + edit assigned workout plan
4. **Progress** — Client progress logs + body check uploads (PDF + photo)
5. **Messages** — Chat with this client

---

### 9.3 Meal Plan Builder

- Create new meal plan per client
- **Input fields per entry:**
  - Meal timing: Breakfast | Lunch | Snack | Dinner
  - Food type (optional category)
  - Food name (free text, bilingual: EN + AR)
  - Quantity in grams
  - Nutritional notes (optional)
- Save and assign plan to client account
- Can update and push revised plans (client sees latest version)
- Plan history maintained (previous plans accessible but not active)

---

### 9.4 Workout Plan Builder

- Create day-by-day workout plans per client
- **Input fields per exercise:**
  - Exercise name — **free text field, NOT a forced dropdown** (client-confirmed requirement)
  - Exercise category (Chest | Back | Legs | Shoulders | Arms | Abs | Cardio)
  - Sets, Reps, Rest time (seconds)
  - Notes (optional)
  - Upload exercise image (JPEG/PNG)
  - Upload exercise video (MP4/MOV — stored in Supabase Storage)
- Add multiple exercises per day
- Assign completed plan to client

---

### 9.5 Progress Monitoring

- View all progress entries submitted by client
- View body check uploads: photos and InBody PDFs
- PDF viewer inline or download link

---

### 9.6 Messages (`/trainer/messages`)

- Chat interface per client
- All assigned client conversations listed
- Unread count per conversation
- Supabase Realtime

---

## 10. Admin / Owner Dashboard

Route: `/admin` — accessible to authenticated **admin** role only.  
Single panel. Centralized control over the entire platform.

---

### 10.1 Overview / Analytics (`/admin`)

- Total registered users
- Active subscriptions count
- Monthly recurring revenue (MRR)
- New signups (last 7 days / 30 days)
- Total marketplace orders
- Platform health summary

---

### 10.2 User Management (`/admin/users`)

- Full list of all registered users (clients)
- Columns: Name, Email, Role, Subscription Status, Join Date
- Filter by role, subscription status, trainer assignment
- View individual user profile + onboarding answers
- Assign trainer to client
- Manually activate / deactivate account
- Reset password (trigger Supabase reset email)

---

### 10.3 Trainer Management (`/admin/trainers`)

- List of all trainer accounts
- Create new trainer account (email, name, phone)
- Assign clients to trainers
- View trainer's client list
- Deactivate trainer account

---

### 10.4 Subscription & Plan Management (`/admin/subscriptions`)

- View all active / expired / cancelled subscriptions
- Membership plan editor:
  - Create / edit / delete membership plans
  - Set name (EN + AR), description, price, currency, billing interval
  - **Pricing is NOT hardcoded** — fully editable from admin
  - Toggle plan visibility (active / inactive)
- Manual subscription override (activate / extend / cancel for a user)

---

### 10.5 Payments & Invoices (`/admin/payments`)

- All transactions: date, user, amount, status, gateway reference
- Export to CSV
- View and re-send individual invoices
- View failed payment events
- Stripe webhook event log

---

### 10.6 Chat Management (`/admin/messages`)

- View all chat threads between clients and trainers (read-only)
- Search by user name

---

### 10.7 Marketplace Management (`/admin/marketplace`)

- Add / edit / remove products
  - Product name (EN + AR), description, price, category, stock, image
- Add / edit / remove ebooks
  - Ebook name (EN + AR), description, price, upload PDF or input access URL
- Toggle marketplace "Coming Soon" state (global on/off switch)
- Toggle individual product visibility
- View all orders
  - Order ID, user, items, total, status (pending | fulfilled | cancelled)
  - Update order status

---

### 10.8 Content Management (`/admin/content`)

- Toggle **Coaches section** visibility on public frontend
- Manage **Transformation gallery** entries:
  - Add / edit / delete transformation posts
  - Toggle individual entry visibility
  - Privacy control per entry (no names / no faces by default)
- Edit **Home page** CTA text / banner content
- Manage **About page** content (brand story, mission — placeholder until client provides update)

---

### 10.9 Workout Video Library (`/admin/videos`)

- Upload and manage workout videos for trainer use
- Videos stored in Supabase Storage
- Accessible by trainers when building workout plans

---

### 10.10 Platform Settings (`/admin/settings`)

- Language toggle default (EN | AR)
- WhatsApp number (used across site CTAs)
- Notification email addresses
- Stripe API key management (or via environment variables)
- Marketplace visible toggle

---

## 11. Marketplace Module

Built into the same platform — **not a separate store**.

### Phase 1 (This Build)
- Product listings: supplements, healthy snacks, nutrition items, ebooks, branded merchandise
- Product cards: image, name (bilingual), price, "Add to Cart"
- Shopping cart
- Secure checkout → Stripe payment
- Order confirmation email
- Order history linked to user account (`/dashboard/orders`)
- Ebooks: digital download link or access URL provided post-purchase
- Marketplace shows **"Coming Soon"** banner on public frontend by default — admin toggles it live

### Phase 2 (Future — Not in This Build)
- In-app store ordering with delivery integration
- Personalized product suggestions based on active meal plans
- Subscription snack boxes
- Physical supermarket digital integration (QR codes, in-store screens)

---

## 12. Subscription & Payment System

### Plans
- Recurring billing for coaching membership (monthly / quarterly / yearly)
- One-time purchase for standalone workout plan or meal plan
- All plan prices managed via admin panel — never hardcoded in code

### Payment Methods
- Visa / Mastercard
- Apple Pay
- **Primary gateway:** Stripe
- **Middle East alternative:** PayTabs / Moyasar / HyperPay / Checkout.com (client to confirm region preference)

### Subscription Logic
- Webhooks handled for:
  - `checkout.session.completed` → activate subscription
  - `invoice.paid` → renew subscription, generate invoice
  - `invoice.payment_failed` → flag account, send notification
  - `customer.subscription.deleted` → deactivate access
- Dashboard access controlled by subscription status
- If subscription expires → dashboard locked, paywall overlay with renewal CTA

### Invoices
- Auto-generated on every successful payment
- Stored in `invoices` table
- Downloadable PDF from client dashboard and admin panel

---

## 13. Bilingual Support (EN / AR)

- **Full English and Arabic** language support across all pages, dashboards, and forms
- Arabic layout uses **RTL (Right-to-Left)** rendering — built into the layout structure using `dir="rtl"` and Tailwind RTL utilities
- **Localized formats:** numbers and dates formatted per active language (Arabic-Indic numerals optional)
- Language toggle accessible from the **header on all pages** and all dashboards
- User's preferred language stored in `profiles.preferred_language`
- All dynamic content supports bilingual input:
  - Meal plan food names: `food_name_en`, `food_name_ar`
  - Exercise names: `exercise_name_en`, `exercise_name_ar`
  - Plan titles: bilingual fields
  - Products and ebooks: bilingual name and description
  - Membership plan names: bilingual
- i18n implementation: `next-intl` or `next-i18next`
- Translation files organized in `/locales/en/` and `/locales/ar/`

---

## 14. Authentication & Security

### Auth System
- **Supabase Auth** — email + password
- Role stored in `profiles.role` — set at registration (client default) or by admin/trainer setup
- Role-based route protection using Next.js middleware
- Post-login redirect by role:
  - client → `/dashboard`
  - trainer → `/trainer`
  - admin → `/admin`

### Security
- **Row-Level Security (RLS)** enabled on all Supabase tables
  - Clients can only read their own data
  - Trainers can only read data for their assigned clients
  - Admins have full access
  - No cross-user data exposure
- HTTPS enforced (Vercel default)
- API routes protected with Supabase session verification
- File storage: Supabase Storage with signed URLs for private files

### OTP / Phone Verification
- **Deferred to post-launch** per confirmed client decision
- Architecture should support adding Supabase SMS OTP (Lucent or Twilio) later without rework

---

## 15. File Storage

All files stored in **Supabase Storage**.

| File Type | Bucket | Access |
|---|---|---|
| Body check photos | `body-checks` | Private (user + trainer + admin) |
| InBody PDF scans | `body-checks` | Private (user + trainer + admin) |
| Workout images | `workout-media` | Private (trainer write, client read) |
| Workout videos | `workout-media` | Private (trainer write, client read) |
| Ebook PDFs | `ebooks` | Private (purchased users only) |
| Product images | `products` | Public |
| Transformation photos | `transformations` | Private (admin-controlled) |

- File size limits should be enforced at upload (e.g., 50MB for videos, 10MB for PDFs/images)
- Signed URLs with expiry for private file access

---

## 16. Real-Time Messaging

- Built on **Supabase Realtime** (WebSocket subscriptions)
- Chat between client ↔ assigned trainer only
- Admin has read-only access to all threads
- Messages stored in `messages` table
- Realtime subscription: subscribe to channel filtered by `sender_id` or `receiver_id`
- Unread count tracked: `read_at` null = unread
- Message history paginated (load last 50, infinite scroll up)
- Notification badge in dashboard nav

---

## 17. Technical Requirements

| Requirement | Specification |
|---|---|
| **Framework** | Next.js 14+ (App Router), React 18+/19 |
| **Rendering** | SSR for dashboard pages, SSG/ISR for marketing pages |
| **Database** | Supabase (PostgreSQL), single unified DB |
| **Auth** | Supabase Auth, RBAC |
| **ORM / Query** | Supabase JS client v2 |
| **Styling** | Tailwind CSS with RTL plugin |
| **State Management** | Zustand or React Context (lightweight) |
| **Forms** | React Hook Form + Zod validation |
| **Charts** | Recharts or Chart.js (progress tracking) |
| **File Uploads** | Supabase Storage SDK |
| **Real-Time** | Supabase Realtime |
| **Payments** | Stripe JS + Stripe Node SDK |
| **i18n** | next-intl or next-i18next |
| **Environment Variables** | `.env.local` — never commit secrets |
| **Mobile Responsiveness** | Full optimization — dashboard AND website |
| **Scalability** | Architecture supports 5,000+ concurrent users without rework |
| **API Layer** | All business logic in API routes / server actions — structured for future iOS/Android app consumption |
| **SEO** | Meta tags, Open Graph, sitemap for all public pages |
| **Performance** | Lighthouse score target: 90+ on public pages |

---

## 18. Deployment & Infrastructure

| Component | Service |
|---|---|
| **Frontend Hosting** | Vercel |
| **Backend / DB** | Supabase (managed cloud) |
| **Domain** | omrplus.com (GoDaddy → connect to Vercel via DNS) |
| **Environment** | `dev` (local) → `staging` (Vercel preview) → `production` |
| **CI/CD** | Vercel automatic deploys from GitHub main branch |
| **Database migrations** | Supabase migrations folder tracked in repo |
| **Secrets** | Vercel environment variables (never in codebase) |

**Post-launch DB access:** Supabase dashboard access to be provided to client email: `aoa12@hotmail.com`

---

## 19. Out of Scope — Phase 1

The following items are **explicitly NOT** part of this delivery. Do not build or bill for these:

| Item | Notes |
|---|---|
| Native iOS or Android mobile app | Backend structured as API layer for future build |
| AI meal plan generator | Architecture-ready, AI integration is Phase 2 |
| Affiliate or influencer login system | Future roadmap |
| In-app supermarket ordering & delivery | Phase 2 |
| Subscription snack boxes | Phase 2 |
| Corporate wellness portal | Future |
| Physical supermarket integration (QR codes, in-store screens) | Phase 2 / Supermarket build |
| OTP / SMS verification | Deferred post-launch, client confirmed |
| Store Staff role | Phase 2 |

---

## 20. Phase 2 Roadmap (Future)

Not scoped or priced in this build. Listed for architectural awareness:

- **AI Meal Plan Generation** — Claude or OpenAI API integration; generate personalized plans from onboarding data
- **Native Mobile App** — iOS + Android (React Native or Flutter), connects to the existing API layer
- **In-App Supermarket** — Full catalog, ordering, delivery scheduling
- **Subscription Snack Boxes** — Recurring product delivery tied to meal plan
- **Corporate Wellness Portal** — Lead capture and group plans for corporate clients
- **Personalized Product Recommendations** — Based on active meal plan ingredients and goals
- **Affiliate / Influencer System** — Referral codes, commission tracking
- **QR Code Integration** — Physical supermarket products linking to app meal plans
- **OTP / SMS Verification** — Lucent app or Twilio (Supabase supports this natively)
- **Store Staff Role** — Marketplace fulfillment-only access panel

---

## 21. Delivery Milestones

### Phase 1 — Foundation (Days 1–6)
- [ ] GitHub repo setup, project structure, environment configuration
- [ ] Supabase project: schema design, RLS policies, storage buckets
- [ ] Auth system: client, trainer, admin roles + middleware
- [ ] Marketing website: all pages scaffolded (Home, Programs, How It Works, About, Contact, Consultation, Transformations, Marketplace Coming Soon)
- [ ] First design preview shared with client

### Phase 2 — Core Platform (Days 7–15)
- [ ] Client dashboard: meal plan, workout plan, progress tracking, body check upload
- [ ] Trainer dashboard: client management, meal plan builder, workout plan builder, progress view
- [ ] Admin panel: user management, trainer management, subscription management, content management
- [ ] Real-time messaging (client ↔ trainer)

### Phase 3 — Commerce & Integration (Days 16–21)
- [ ] Marketplace: product listings, ebook listings, cart, checkout
- [ ] Stripe payment integration: one-time + recurring subscriptions
- [ ] Webhook handlers: signup, renewal, failure, cancellation
- [ ] Invoice generation
- [ ] Bilingual (EN/AR) implementation across all views
- [ ] Domain connection (omrplus.com → Vercel)
- [ ] Deployment to production

### Phase 4 — Testing & Launch (Days 22–25)
- [ ] Full QA across all user roles (client, trainer, admin)
- [ ] RLS security audit — no cross-user data leaks
- [ ] Stripe payment flow end-to-end testing
- [ ] Performance and accessibility checks
- [ ] Mobile responsiveness QA
- [ ] Client walkthrough and review
- [ ] Final revisions
- [ ] Go-live
- [ ] Handover documentation + admin credentials + Supabase access

---

## 22. Post-Launch Support

- **Duration:** 4 months from delivery date
- **Includes:** Bug fixes, minor content updates, plan adjustments
- **Excludes:** New feature development (quoted separately)
- **DB Access:** Supabase dashboard provided to `aoa12@hotmail.com` post-launch
- **Handover:** Full admin credentials + handover documentation at delivery

---

## 23. Developer Notes & Confirmed Client Decisions

These points were explicitly confirmed in client communication and **must be respected throughout development:**

| # | Confirmed Decision |
|---|---|
| 1 | **"Free Consultation"** replaces all trial CTAs — no "7-day trial" or "free trial" language anywhere on the site |
| 2 | **Coaches section** is hidden from the public frontend — admin enables it when coaches are assigned |
| 3 | **Transformation gallery** is privacy-first — no client names, no faces displayed without explicit permission |
| 4 | **About page** is brand-only — no founder name or photo until client provides an update |
| 5 | **Exercise name** input must be a **free-text field** — NOT a forced dropdown |
| 6 | **Marketplace** launches in "Coming Soon" state — admin activates it when ready |
| 7 | **Membership pricing** is editable by admin — must never be hardcoded in the codebase |
| 8 | **Option B (fully custom)** confirmed March 28 — Shopify is completely removed from the project |
| 9 | **OTP/SMS verification** deferred to post-launch — confirm before implementing |
| 10 | **Apple Pay** must be supported alongside Visa/Mastercard |
| 11 | All plans, programs, and pricing pulled from the **database** — content-managed, not static |
| 12 | **Arabic RTL** must be a structural layout decision, not patched in later |
| 13 | Backend must function as an **API layer** so a future iOS/Android app can connect without a rebuild |

---

*OMR+ Master Specification — v1.0 — March 2026*  
*Digital Marketing Heroes · digitalheroes.co.in*
