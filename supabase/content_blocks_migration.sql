-- Migration: Create content_blocks table for homepage CMS
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS content_blocks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value_en   TEXT NOT NULL,
  value_ar   TEXT,
  section    TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_blocks_public_read"
  ON content_blocks FOR SELECT USING (TRUE);

CREATE POLICY "content_blocks_admin_write"
  ON content_blocks FOR ALL USING (is_admin());

-- Trigger to update updated_at on change
CREATE OR REPLACE TRIGGER content_blocks_updated_at
  BEFORE UPDATE ON content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
