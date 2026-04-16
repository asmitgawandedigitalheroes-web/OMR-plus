-- ============================================================
-- OMR+ SCHEMA v2 — Full Platform Tables
-- Run in: SQL Editor → New Query → single tab, run all at once
-- NOTE: Run AFTER schema.sql (profiles + subscriptions already exist)
-- ============================================================


-- ── 1. ENUMS (new ones) ─────────────────────────────────────

CREATE TYPE plan_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE message_sender AS ENUM ('client', 'coach', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'refunded', 'cancelled');
CREATE TYPE product_type AS ENUM ('supplement', 'snack', 'ebook', 'other');
CREATE TYPE body_check_status AS ENUM ('pending', 'reviewed');


-- ── 2. TRAINER ↔ CLIENT ASSIGNMENTS ─────────────────────────

CREATE TABLE trainer_client_assignments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(trainer_id, client_id)
);

CREATE INDEX idx_tca_trainer ON trainer_client_assignments(trainer_id);
CREATE INDEX idx_tca_client  ON trainer_client_assignments(client_id);


-- ── 3. ONBOARDING RESPONSES ─────────────────────────────────

CREATE TABLE onboarding_responses (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fitness_goal         TEXT,                        -- 'fat_loss' | 'muscle_gain' | 'summer_body' | 'general'
  current_weight_kg    NUMERIC(5,2),
  target_weight_kg     NUMERIC(5,2),
  height_cm            NUMERIC(5,1),
  age                  INT,
  gender               TEXT,
  activity_level       TEXT,                        -- 'sedentary' | 'light' | 'moderate' | 'very_active'
  dietary_restrictions TEXT[],                      -- ['vegetarian', 'gluten_free', ...]
  health_conditions    TEXT,
  experience_level     TEXT,                        -- 'beginner' | 'intermediate' | 'advanced'
  workout_days_per_week INT,
  notes                TEXT,
  completed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);


-- ── 4. MEAL PLANS ────────────────────────────────────────────

CREATE TABLE meal_plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id     UUID NOT NULL REFERENCES profiles(id),
  title        TEXT NOT NULL,
  title_ar     TEXT,
  status       plan_status NOT NULL DEFAULT 'draft',
  week_start   DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE meal_plan_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id  UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  meal_type     TEXT NOT NULL,      -- 'breakfast' | 'lunch' | 'snack' | 'dinner'
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

CREATE INDEX idx_meal_plans_client ON meal_plans(client_id);
CREATE INDEX idx_meal_items_plan   ON meal_plan_items(meal_plan_id);


-- ── 5. WORKOUT PLANS ─────────────────────────────────────────

CREATE TABLE workout_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id    UUID NOT NULL REFERENCES profiles(id),
  title       TEXT NOT NULL,
  title_ar    TEXT,
  status      plan_status NOT NULL DEFAULT 'draft',
  week_start  DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workout_plan_days (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_label       TEXT NOT NULL,   -- 'Monday' | 'Day 1' | 'Push Day' etc (free text)
  day_number      INT NOT NULL,
  focus           TEXT,            -- 'Chest & Triceps', 'Legs', etc.
  sort_order      INT NOT NULL DEFAULT 0
);

CREATE TABLE workout_exercises (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_day_id   UUID NOT NULL REFERENCES workout_plan_days(id) ON DELETE CASCADE,
  exercise_name    TEXT NOT NULL,  -- free text per spec
  exercise_name_ar TEXT,
  sets             INT,
  reps             TEXT,           -- text allows '8-12', 'to failure', etc.
  rest_seconds     INT,
  weight_note      TEXT,           -- 'bodyweight', '60kg', 'RPE 8'
  image_url        TEXT,
  video_url        TEXT,
  notes            TEXT,
  sort_order       INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_workout_plans_client ON workout_plans(client_id);
CREATE INDEX idx_workout_days_plan    ON workout_plan_days(workout_plan_id);
CREATE INDEX idx_workout_exercises    ON workout_exercises(workout_day_id);


-- ── 6. PROGRESS LOGS ─────────────────────────────────────────

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

CREATE INDEX idx_progress_logs_user ON progress_logs(user_id);
CREATE INDEX idx_progress_logs_date ON progress_logs(logged_at);


-- ── 7. BODY CHECKS (InBody uploads) ──────────────────────────

CREATE TABLE body_checks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url    TEXT NOT NULL,
  file_type   TEXT NOT NULL DEFAULT 'pdf',   -- 'pdf' | 'image'
  status      body_check_status NOT NULL DEFAULT 'pending',
  coach_notes TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_body_checks_user ON body_checks(user_id);


-- ── 8. MESSAGING ─────────────────────────────────────────────

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

CREATE INDEX idx_msg_threads_client  ON message_threads(client_id);
CREATE INDEX idx_msg_threads_coach   ON message_threads(coach_id);
CREATE INDEX idx_messages_thread     ON messages(thread_id);
CREATE INDEX idx_messages_created    ON messages(created_at);


-- ── 9. MARKETPLACE — PRODUCTS ────────────────────────────────

CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  name_ar       TEXT,
  description   TEXT,
  description_ar TEXT,
  type          product_type NOT NULL DEFAULT 'supplement',
  price_sar     NUMERIC(10,2) NOT NULL,
  image_url     TEXT,
  file_url      TEXT,               -- for ebooks
  is_active     BOOLEAN NOT NULL DEFAULT FALSE,  -- starts hidden ("Coming Soon")
  stock         INT,                             -- NULL = unlimited
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_type   ON products(type);
CREATE INDEX idx_products_active ON products(is_active);


-- ── 10. ORDERS ───────────────────────────────────────────────

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
  price_sar   NUMERIC(10,2) NOT NULL  -- snapshot price at time of purchase
);

CREATE INDEX idx_orders_user     ON orders(user_id);
CREATE INDEX idx_order_items_ord ON order_items(order_id);


-- ── 11. updated_at TRIGGERS for new tables ───────────────────

CREATE TRIGGER meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER workout_plans_updated_at
  BEFORE UPDATE ON workout_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── 12. ROW LEVEL SECURITY ───────────────────────────────────

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

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: is current user a coach?
CREATE OR REPLACE FUNCTION is_coach()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- trainer_client_assignments
CREATE POLICY "tca_coach_see_own"     ON trainer_client_assignments FOR SELECT USING (trainer_id = auth.uid() OR client_id = auth.uid() OR is_admin());
CREATE POLICY "tca_admin_all"         ON trainer_client_assignments FOR ALL    USING (is_admin());

-- onboarding_responses
CREATE POLICY "onboarding_own"        ON onboarding_responses FOR ALL    USING (user_id = auth.uid());
CREATE POLICY "onboarding_coach"      ON onboarding_responses FOR SELECT USING (EXISTS (SELECT 1 FROM trainer_client_assignments WHERE trainer_id = auth.uid() AND client_id = onboarding_responses.user_id));
CREATE POLICY "onboarding_admin"      ON onboarding_responses FOR SELECT USING (is_admin());

-- meal_plans
CREATE POLICY "meal_plans_client"     ON meal_plans FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "meal_plans_coach"      ON meal_plans FOR ALL    USING (coach_id = auth.uid());
CREATE POLICY "meal_plans_admin"      ON meal_plans FOR ALL    USING (is_admin());

-- meal_plan_items (access through meal_plan)
CREATE POLICY "meal_items_access"     ON meal_plan_items FOR ALL USING (
  EXISTS (SELECT 1 FROM meal_plans mp WHERE mp.id = meal_plan_id AND (mp.client_id = auth.uid() OR mp.coach_id = auth.uid())) OR is_admin()
);

-- workout_plans
CREATE POLICY "workout_plans_client"  ON workout_plans FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "workout_plans_coach"   ON workout_plans FOR ALL    USING (coach_id = auth.uid());
CREATE POLICY "workout_plans_admin"   ON workout_plans FOR ALL    USING (is_admin());

-- workout_plan_days
CREATE POLICY "workout_days_access"   ON workout_plan_days FOR ALL USING (
  EXISTS (SELECT 1 FROM workout_plans wp WHERE wp.id = workout_plan_id AND (wp.client_id = auth.uid() OR wp.coach_id = auth.uid())) OR is_admin()
);

-- workout_exercises
CREATE POLICY "workout_ex_access"     ON workout_exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM workout_plan_days wd JOIN workout_plans wp ON wp.id = wd.workout_plan_id WHERE wd.id = workout_day_id AND (wp.client_id = auth.uid() OR wp.coach_id = auth.uid())) OR is_admin()
);

-- progress_logs
CREATE POLICY "progress_own"          ON progress_logs FOR ALL    USING (user_id = auth.uid());
CREATE POLICY "progress_coach"        ON progress_logs FOR SELECT USING (EXISTS (SELECT 1 FROM trainer_client_assignments WHERE trainer_id = auth.uid() AND client_id = progress_logs.user_id));
CREATE POLICY "progress_admin"        ON progress_logs FOR SELECT USING (is_admin());

-- body_checks
CREATE POLICY "body_checks_own"       ON body_checks FOR ALL    USING (user_id = auth.uid());
CREATE POLICY "body_checks_coach"     ON body_checks FOR SELECT USING (EXISTS (SELECT 1 FROM trainer_client_assignments WHERE trainer_id = auth.uid() AND client_id = body_checks.user_id));
CREATE POLICY "body_checks_admin"     ON body_checks FOR ALL    USING (is_admin());

-- message_threads
CREATE POLICY "threads_participants"  ON message_threads FOR ALL USING (client_id = auth.uid() OR coach_id = auth.uid() OR is_admin());

-- messages
CREATE POLICY "messages_participants" ON messages FOR ALL USING (
  sender_id = auth.uid() OR
  EXISTS (SELECT 1 FROM message_threads mt WHERE mt.id = thread_id AND (mt.client_id = auth.uid() OR mt.coach_id = auth.uid())) OR
  is_admin()
);

-- products (public read when active, admin writes)
CREATE POLICY "products_public_read"  ON products FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "products_admin_write"  ON products FOR ALL    USING (is_admin());

-- orders
CREATE POLICY "orders_own"            ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "orders_admin"          ON orders FOR ALL    USING (is_admin());
CREATE POLICY "orders_service_insert" ON orders FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- order_items
CREATE POLICY "order_items_own"       ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);
CREATE POLICY "order_items_admin"     ON order_items FOR ALL USING (is_admin());
