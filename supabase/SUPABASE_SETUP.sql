-- ============================================================
-- OMR+ Platform — Supabase SQL Setup Script (Minimal / Delta)
-- Run this in: Supabase Dashboard → SQL Editor
--
-- The base schemas (schema.sql, schema_v2_tables.sql,
-- schema_v3_phase2.sql) are already applied to this database.
-- This script adds ONLY what those files do not cover.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. workout_videos TABLE
--    Stores Cloudinary video metadata uploaded from Admin → Videos.
--    Not present in any of the three existing schema files.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workout_videos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  cloudinary_url  TEXT NOT NULL,
  public_id       TEXT NOT NULL,
  thumbnail_url   TEXT,
  bytes           INTEGER,
  duration        NUMERIC(10,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workout_videos ENABLE ROW LEVEL SECURITY;

-- Authenticated users (coaches + clients) can view videos
DROP POLICY IF EXISTS "Authenticated users can view workout videos" ON workout_videos;
CREATE POLICY "Authenticated users can view workout videos"
  ON workout_videos FOR SELECT TO authenticated USING (TRUE);

-- Only admins can insert / update / delete
DROP POLICY IF EXISTS "Admins can manage workout videos" ON workout_videos;
CREATE POLICY "Admins can manage workout videos"
  ON workout_videos FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_workout_videos_created ON workout_videos(created_at DESC);


-- ─────────────────────────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────────────────────────
