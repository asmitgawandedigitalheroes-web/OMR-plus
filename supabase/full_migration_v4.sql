-- ============================================================
-- OMR+ FULL PLATFORM MIGRATION (v4)
-- Project: skgdbfvlbjsxhvlpvoim
-- Date: 2026-04-10
--
-- Instructions:
-- 1. Open Supabase Dashboard for the NEW project.
-- 2. Go to SQL Editor -> New Query.
-- 3. Paste this entire script and click 'Run'.
-- ============================================================

-- ── 1. ENUMS ────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('client', 'coach', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending', 'past_due');
CREATE TYPE plan_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE message_sender AS ENUM ('client', 'coach', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'refunded', 'cancelled');
CREATE TYPE product_type AS ENUM ('supplement', 'snack', 'ebook', 'other');
CREATE TYPE body_check_status AS ENUM ('pending', 'reviewed');

-- ── 2. HELPER FUNCTIONS ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 3. PROFILES TABLE ───────────────────────────────────────
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  role          user_role NOT NULL DEFAULT 'client',
  avatar_url    TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles Helpers
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_coach()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. SUBSCRIPTIONS TABLE ──────────────────────────────────
CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_name               TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'inactive', -- Using text for flexibility with enum
  price_sar               NUMERIC(10, 2) NOT NULL DEFAULT 0,
  started_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at              TIMESTAMPTZ,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT UNIQUE,
  stripe_price_id         TEXT,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION is_subscribed()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > NOW())
  );
$$;

-- ── 5. TRAINER ↔ CLIENT ASSIGNMENTS ─────────────────────────
CREATE TABLE trainer_client_assignments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(trainer_id, client_id)
);

-- ── 6. ONBOARDING RESPONSES ─────────────────────────────────
CREATE TABLE onboarding_responses (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fitness_goal         TEXT,
  current_weight_kg    NUMERIC(5,2),
  target_weight_kg     NUMERIC(5,2),
  height_cm            NUMERIC(5,1),
  age                  INT,
  gender               TEXT,
  activity_level       TEXT,
  dietary_restrictions TEXT[],
  health_conditions    TEXT,
  experience_level     TEXT,
  workout_days_per_week INT,
  notes                TEXT,
  completed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ── 7. MEAL PLANS ────────────────────────────────────────────
CREATE TABLE meal_plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id     UUID NOT NULL REFERENCES profiles(id),
  title        TEXT NOT NULL,
  title_ar     TEXT,
  description  TEXT,
  status       plan_status NOT NULL DEFAULT 'draft',
  week_start   DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE meal_plan_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id  UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  meal_type     TEXT NOT NULL,
  food_name     TEXT NOT NULL,
  food_name_ar  TEXT,
  quantity_g    NUMERIC(6,1),
  calories      INT,
  protein_g     NUMERIC(5,1),
  carbs_g       NUMERIC(5,1),
  fat_g         NUMERIC(5,1),
  notes         TEXT,
  sort_order    INT NOT NULL DEFAULT 0
);

-- ── 8. WORKOUT PLANS ─────────────────────────────────────────
CREATE TABLE workout_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id    UUID NOT NULL REFERENCES profiles(id),
  title       TEXT NOT NULL,
  title_ar    TEXT,
  description TEXT,
  status      plan_status NOT NULL DEFAULT 'draft',
  week_start  DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workout_plan_days (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_label       TEXT NOT NULL,
  day_number      INT NOT NULL,
  focus           TEXT,
  sort_order      INT NOT NULL DEFAULT 0
);

CREATE TABLE workout_exercises (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_day_id   UUID NOT NULL REFERENCES workout_plan_days(id) ON DELETE CASCADE,
  exercise_name    TEXT NOT NULL,
  exercise_name_ar TEXT,
  exercise_category TEXT,
  sets             INT,
  reps             TEXT,
  rest_seconds     INT,
  weight_note      TEXT,
  image_url        TEXT,
  video_url        TEXT,
  notes            TEXT,
  sort_order       INT NOT NULL DEFAULT 0
);

-- ── 9. PROGRESS & TRACKING ──────────────────────────────────
CREATE TABLE progress_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  weight_kg      NUMERIC(5,2),
  body_fat_pct   NUMERIC(4,1),
  muscle_mass_kg NUMERIC(5,2),
  waist_cm       NUMERIC(5,1),
  chest_cm       NUMERIC(5,1),
  arms_cm        NUMERIC(5,1),
  notes          TEXT
);

CREATE TABLE body_checks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url    TEXT NOT NULL,
  file_type   TEXT NOT NULL DEFAULT 'pdf',
  status      body_check_status NOT NULL DEFAULT 'pending',
  coach_notes TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 10. MESSAGING ─────────────────────────────────────────────
CREATE TABLE message_threads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, coach_id)
);

CREATE TABLE messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id    UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 11. MARKETPLACE ───────────────────────────────────────────
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  name_ar       TEXT,
  description   TEXT,
  description_ar TEXT,
  type          product_type NOT NULL DEFAULT 'supplement',
  price_sar     NUMERIC(10,2) NOT NULL,
  image_url     TEXT,
  file_url      TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT FALSE,
  stock         INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status               order_status NOT NULL DEFAULT 'pending',
  total_sar            NUMERIC(10,2) NOT NULL,
  stripe_payment_id    TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  quantity    INT NOT NULL DEFAULT 1,
  price_sar   NUMERIC(10,2) NOT NULL
);

-- ── 12. PRICING PLANS (Stripe compatible) ─────────────────────
CREATE TABLE pricing_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  name_ar         TEXT,
  description     TEXT,
  description_ar  TEXT,
  tagline         TEXT,
  tagline_ar      TEXT,
  cta_text        TEXT DEFAULT 'Get Started',
  cta_text_ar     TEXT,
  price_sar       INTEGER NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  features        TEXT[] DEFAULT '{}',
  features_ar     TEXT[] DEFAULT '{}',
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 13. EXTRA FEATURES ────────────────────────────────────────
CREATE TABLE workout_videos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  cloudinary_url  TEXT NOT NULL,
  public_id       TEXT NOT NULL,
  thumbnail_url   TEXT,
  bytes           INTEGER,
  duration        NUMERIC(10,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE content_blocks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value_en   TEXT NOT NULL,
  value_ar   TEXT,
  section    TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- ── 14. TRIGGERS ──────────────────────────────────────────────
CREATE TRIGGER meal_plans_updated_at BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER workout_plans_updated_at BEFORE UPDATE ON workout_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER pricing_plans_updated_at BEFORE UPDATE ON pricing_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER content_blocks_updated_at BEFORE UPDATE ON content_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 15. INDEXES ───────────────────────────────────────────────
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_tca_trainer ON trainer_client_assignments(trainer_id);
CREATE INDEX idx_tca_client  ON trainer_client_assignments(client_id);
CREATE INDEX idx_meal_plans_client ON meal_plans(client_id);
CREATE INDEX idx_meal_items_plan   ON meal_plan_items(meal_plan_id);
CREATE INDEX idx_workout_plans_client ON workout_plans(client_id);
CREATE INDEX idx_workout_days_plan    ON workout_plan_days(workout_plan_id);
CREATE INDEX idx_workout_exercises    ON workout_exercises(workout_day_id);
CREATE INDEX idx_progress_logs_user ON progress_logs(user_id);
CREATE INDEX idx_body_checks_user ON body_checks(user_id);
CREATE INDEX idx_msg_threads_client  ON message_threads(client_id);
CREATE INDEX idx_msg_threads_coach   ON message_threads(coach_id);
CREATE INDEX idx_messages_thread     ON messages(thread_id);
CREATE INDEX idx_products_type       ON products(type);
CREATE INDEX idx_orders_user         ON orders(user_id);
CREATE INDEX idx_workout_videos_created ON workout_videos(created_at DESC);
CREATE INDEX idx_workout_exercises_category ON workout_exercises (exercise_category);

-- ── 16. ROW LEVEL SECURITY ───────────────────────────────────
ALTER TABLE profiles                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_responses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans              ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plan_days          ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_checks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items                ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans              ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_videos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks             ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "admin_update_all_profiles" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "coach_read_assigned_profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM trainer_client_assignments WHERE trainer_id = auth.uid() AND client_id = profiles.id));

-- Subscriptions
CREATE POLICY "subscriptions_select_own" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_select_subscriptions" ON subscriptions FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "coach_read_client_subs" ON subscriptions FOR SELECT USING (user_id = auth.uid() OR is_admin() OR EXISTS (SELECT 1 FROM trainer_client_assignments WHERE trainer_id = auth.uid() AND client_id = subscriptions.user_id));
CREATE POLICY "Service role manages subscriptions" ON subscriptions FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Trainer Assignments
CREATE POLICY "tca_coach_see_own" ON trainer_client_assignments FOR SELECT USING (trainer_id = auth.uid() OR client_id = auth.uid() OR is_admin());
CREATE POLICY "tca_admin_all" ON trainer_client_assignments FOR ALL USING (is_admin());

-- Onboarding
CREATE POLICY "onboarding_own" ON onboarding_responses FOR ALL USING (user_id = auth.uid());
CREATE POLICY "onboarding_coach" ON onboarding_responses FOR SELECT USING (EXISTS (SELECT 1 FROM trainer_client_assignments WHERE trainer_id = auth.uid() AND client_id = onboarding_responses.user_id));
CREATE POLICY "onboarding_admin" ON onboarding_responses FOR SELECT USING (is_admin());

-- Plans
CREATE POLICY "meal_plans_client" ON meal_plans FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "meal_plans_coach"  ON meal_plans FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "meal_plans_admin"  ON meal_plans FOR ALL USING (is_admin());
CREATE POLICY "meal_items_access" ON meal_plan_items FOR ALL USING (EXISTS (SELECT 1 FROM meal_plans mp WHERE mp.id = meal_plan_id AND (mp.client_id = auth.uid() OR mp.coach_id = auth.uid())) OR is_admin());

CREATE POLICY "workout_plans_client" ON workout_plans FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "workout_plans_coach"  ON workout_plans FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "workout_plans_admin"  ON workout_plans FOR ALL USING (is_admin());
CREATE POLICY "workout_days_access"  ON workout_plan_days FOR ALL USING (EXISTS (SELECT 1 FROM workout_plans wp WHERE wp.id = workout_plan_id AND (wp.client_id = auth.uid() OR wp.coach_id = auth.uid())) OR is_admin());
CREATE POLICY "workout_ex_access"    ON workout_exercises FOR ALL USING (EXISTS (SELECT 1 FROM workout_plan_days wd JOIN workout_plans wp ON wp.id = wd.workout_plan_id WHERE wd.id = workout_day_id AND (wp.client_id = auth.uid() OR wp.coach_id = auth.uid())) OR is_admin());

-- Progress
CREATE POLICY "progress_own" ON progress_logs FOR ALL USING (user_id = auth.uid());
CREATE POLICY "progress_coach" ON progress_logs FOR SELECT USING (EXISTS (SELECT 1 FROM trainer_client_assignments WHERE trainer_id = auth.uid() AND client_id = progress_logs.user_id));
CREATE POLICY "progress_admin" ON progress_logs FOR SELECT USING (is_admin());

-- Body Checks
CREATE POLICY "body_checks_own" ON body_checks FOR ALL USING (user_id = auth.uid());
CREATE POLICY "body_checks_coach" ON body_checks FOR SELECT USING (EXISTS (SELECT 1 FROM trainer_client_assignments WHERE trainer_id = auth.uid() AND client_id = body_checks.user_id));
CREATE POLICY "body_checks_admin" ON body_checks FOR ALL USING (is_admin());

-- Messaging
CREATE POLICY "threads_participants" ON message_threads FOR ALL USING (client_id = auth.uid() OR coach_id = auth.uid() OR is_admin());
CREATE POLICY "messages_participants" ON messages FOR ALL USING (sender_id = auth.uid() OR EXISTS (SELECT 1 FROM message_threads mt WHERE mt.id = thread_id AND (mt.client_id = auth.uid() OR mt.coach_id = auth.uid())) OR is_admin());

-- Products & Pricing
CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "products_admin_write" ON products FOR ALL USING (is_admin());
CREATE POLICY "pricing_public_read" ON pricing_plans FOR SELECT USING (is_published = TRUE OR is_admin());
CREATE POLICY "pricing_admin_all" ON pricing_plans FOR ALL USING (is_admin());

-- Marketplace Orders
CREATE POLICY "orders_own" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "orders_admin" ON orders FOR ALL USING (is_admin());
CREATE POLICY "orders_service_insert" ON orders FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "order_items_own" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "order_items_admin" ON order_items FOR ALL USING (is_admin());

-- UI Features
CREATE POLICY "Authenticated users can view workout videos" ON workout_videos FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admins can manage workout videos" ON workout_videos FOR ALL USING (is_admin());
CREATE POLICY "content_blocks_public_read" ON content_blocks FOR SELECT USING (TRUE);
CREATE POLICY "content_blocks_admin_write" ON content_blocks FOR ALL USING (is_admin());

-- ── 17. REALTIME & REPLICATION ────────────────────────────────
-- Enable realtime for messaging
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_threads;

-- ── 18. DEFAULT DATA SEEDS ───────────────────────────────────
INSERT INTO pricing_plans (name, description, price_sar, features, is_published, sort_order) VALUES
('Starter', 'Perfect for beginners', 49, ARRAY['Personalized meal plan', 'Basic workout plan', 'Weekly check-in'], TRUE, 1),
('Full Coaching', 'Most popular plan', 99, ARRAY['Custom meal plan', 'Custom workout plan', 'Daily coach messaging', 'Progress tracking', 'Body check reviews'], TRUE, 2),
('Elite', 'Maximum results', 149, ARRAY['Everything in Full Coaching', 'Priority response', 'Video consultations', 'InBody analysis', 'Supplement guidance'], TRUE, 3)
ON CONFLICT DO NOTHING;

-- DONE
