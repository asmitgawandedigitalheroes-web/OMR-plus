-- ─── pricing_plans table ───────────────────────────────────────────────────
-- Drops the old table (if it existed with different columns) and recreates it.
-- Run this in your Supabase SQL editor.

DROP TABLE IF EXISTS pricing_plans CASCADE;

CREATE TABLE pricing_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  description     text,
  tagline         text,
  cta_text        text DEFAULT 'Get Started',
  price_sar       integer NOT NULL DEFAULT 0,
  stripe_price_id text,
  features        text[] DEFAULT '{}',
  is_published    boolean NOT NULL DEFAULT false,
  is_featured     boolean NOT NULL DEFAULT false,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to pricing_plans" ON pricing_plans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Public read published pricing_plans" ON pricing_plans
  FOR SELECT
  USING (is_published = true);
