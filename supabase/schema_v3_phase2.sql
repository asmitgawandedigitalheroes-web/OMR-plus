-- ============================================================
-- OMR+ SCHEMA v3 — Phase 2 Additions
-- Run AFTER schema.sql AND schema_v2_tables.sql
-- ============================================================

-- ── 1. Add description columns to plans ──────────────────────

ALTER TABLE meal_plans    ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS description TEXT;

-- ── 2. Pricing Plans table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS pricing_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly  NUMERIC(10,2),
  features      TEXT[],
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pricing_public_read" ON pricing_plans FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "pricing_admin_all"   ON pricing_plans FOR ALL USING (is_admin());

-- Seed default plans
INSERT INTO pricing_plans (name, description, price_monthly, price_yearly, features, is_active, display_order) VALUES
('Starter', 'Perfect for beginners', 49, 490, ARRAY['Personalized meal plan', 'Basic workout plan', 'Weekly check-in'], TRUE, 1),
('Full Coaching', 'Most popular plan', 99, 990, ARRAY['Custom meal plan', 'Custom workout plan', 'Daily coach messaging', 'Progress tracking', 'Body check reviews'], TRUE, 2),
('Elite', 'Maximum results', 149, 1490, ARRAY['Everything in Full Coaching', 'Priority response', 'Video consultations', 'InBody analysis', 'Supplement guidance'], TRUE, 3)
ON CONFLICT DO NOTHING;

-- ── 3. Admin full access to profiles ─────────────────────────

-- Allow admins to read all profiles (needed for users/coaches tabs)
DROP POLICY IF EXISTS "admin_select_all_profiles" ON public.profiles;
CREATE POLICY "admin_select_all_profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

-- Allow coaches to read profiles of their assigned clients
DROP POLICY IF EXISTS "coach_read_assigned_profiles" ON public.profiles;
CREATE POLICY "coach_read_assigned_profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trainer_client_assignments
      WHERE trainer_id = auth.uid() AND client_id = profiles.id
    )
  );

-- Allow admins to update any profile (e.g. role changes)
DROP POLICY IF EXISTS "admin_update_all_profiles" ON public.profiles;
CREATE POLICY "admin_update_all_profiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

-- ── 4. Admin full access to subscriptions ────────────────────

DROP POLICY IF EXISTS "admin_select_subscriptions" ON public.subscriptions;
CREATE POLICY "admin_select_subscriptions"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- ── 5. Enable Realtime on messaging tables ────────────────────

-- Run these in Supabase dashboard → Database → Replication
-- Or execute via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_threads;

-- ── 6. Coaches can insert trainer_client_assignments ──────────

DROP POLICY IF EXISTS "tca_admin_insert" ON trainer_client_assignments;
CREATE POLICY "tca_admin_insert"
  ON trainer_client_assignments FOR INSERT
  WITH CHECK (is_admin());

-- ── 7. Products — add category alias column ───────────────────

-- The schema uses `type` enum, but we also want a text `category` for flexibility.
-- Add a generated/alias or just use type column.
-- No change needed — code has been updated to use correct column name `type`.

-- ── 8. Coaches can read assigned client subscriptions ─────────

DROP POLICY IF EXISTS "coach_read_client_subs" ON public.subscriptions;
CREATE POLICY "coach_read_client_subs"
  ON public.subscriptions FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_admin() OR
    EXISTS (
      SELECT 1 FROM trainer_client_assignments
      WHERE trainer_id = auth.uid() AND client_id = subscriptions.user_id
    )
  );

-- ── Done ──────────────────────────────────────────────────────
-- Summary of changes:
-- • description TEXT added to meal_plans, workout_plans
-- • pricing_plans table created + seeded with 3 default plans
-- • Admin can read/update all profiles
-- • Admin can read all subscriptions
-- • Realtime enabled for messages and message_threads
-- • Coach can read assigned client subscriptions
