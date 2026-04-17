-- ─────────────────────────────────────────────────────────────────────────────
-- PATCH: Add billing_type column to pricing_plans
--
-- Allows the checkout page to distinguish between recurring monthly plans
-- and one-time purchases so billing copy is shown correctly.
--
-- Values: 'monthly' (default, recurring) | 'one_time' (single purchase)
--
-- Run once in Supabase SQL Editor → Dashboard → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE pricing_plans
  ADD COLUMN IF NOT EXISTS billing_type text NOT NULL DEFAULT 'monthly'
  CHECK (billing_type IN ('monthly', 'one_time'));

COMMENT ON COLUMN pricing_plans.billing_type IS
  'Billing cadence: monthly = recurring subscription, one_time = single charge';
