-- Migration: Add Arabic fields to pricing_plans
-- Run this in Supabase SQL editor

ALTER TABLE pricing_plans
  ADD COLUMN IF NOT EXISTS name_ar        TEXT,
  ADD COLUMN IF NOT EXISTS description_ar TEXT,
  ADD COLUMN IF NOT EXISTS tagline_ar     TEXT,
  ADD COLUMN IF NOT EXISTS cta_text_ar    TEXT,
  ADD COLUMN IF NOT EXISTS features_ar    TEXT[];
