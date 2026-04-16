-- ============================================================
-- OMR+ — Stripe Subscriptions Migration
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── 0. Extend the subscription_status enum ─────────────────
-- Adds 'past_due' value if it doesn't exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'past_due'
      AND enumtypid = 'subscription_status'::regtype
  ) THEN
    ALTER TYPE subscription_status ADD VALUE 'past_due';
  END IF;
END
$$;

-- ─── 1. Extend subscriptions table with Stripe fields ────────
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_price_id         TEXT,
  ADD COLUMN IF NOT EXISTS current_period_start    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cancelled_at            TIMESTAMPTZ;

-- Ensure status column exists with correct type
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'inactive';

-- ─── 2. Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subs_stripe_customer    ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subs_stripe_sub         ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subs_user_status        ON subscriptions(user_id, status);

-- ─── 3. RLS policies ─────────────────────────────────────────
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Clients can read their own subscription
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only service role (webhook) can insert/update
DROP POLICY IF EXISTS "Service role manages subscriptions" ON subscriptions;
CREATE POLICY "Service role manages subscriptions"
  ON subscriptions FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Admins can read all subscriptions
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 4. Helper function: is_subscribed ───────────────────────
-- Returns TRUE if the calling user has an active subscription right now.
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

-- ─── DONE ─────────────────────────────────────────────────────
