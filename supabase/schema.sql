-- ============================================================
-- OMR+ SUPABASE SCHEMA — Run in: SQL Editor (single tab)
-- ============================================================

-- ── 1. ENUMS ────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('client', 'coach', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');

-- ── 2. PROFILES TABLE ───────────────────────────────────────
-- Mirrors auth.users — created automatically on signup via trigger

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

-- ── 3. SUBSCRIPTIONS TABLE ──────────────────────────────────

CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_name               TEXT NOT NULL,
  status                  subscription_status NOT NULL DEFAULT 'pending',
  price_sar               NUMERIC(10, 2) NOT NULL,
  started_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at              TIMESTAMPTZ,
  stripe_subscription_id  TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. AUTO-CREATE PROFILE ON SIGNUP ────────────────────────

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

-- ── 5. AUTO-UPDATE updated_at ───────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 6. ROW LEVEL SECURITY (RLS) ─────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- profiles: users can only read/update their own row
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- profiles: admins can read all profiles
CREATE POLICY "profiles_admin_select_all"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- profiles: admins can update any profile (for role assignment)
CREATE POLICY "profiles_admin_update_all"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- subscriptions: users see only their own
CREATE POLICY "subscriptions_select_own"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- subscriptions: admins see all
CREATE POLICY "subscriptions_admin_select_all"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- subscriptions: only service role can insert/update (via webhooks)
CREATE POLICY "subscriptions_service_insert"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "subscriptions_service_update"
  ON subscriptions FOR UPDATE
  USING (auth.role() = 'service_role');

-- ── 7. INDEXES ──────────────────────────────────────────────

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
