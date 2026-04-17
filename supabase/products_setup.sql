-- ============================================================
-- OMR+ Products Table Setup
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- Safe to run multiple times (all statements are idempotent)
-- ============================================================

-- ── 1. product_type ENUM ──────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE product_type AS ENUM ('supplement', 'snack', 'ebook', 'equipment', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 2. update_updated_at helper (needed for trigger) ─────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 3. is_admin() helper (needed for RLS policies) ────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ── 4. PRODUCTS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  name_ar         TEXT,
  description     TEXT,
  description_ar  TEXT,
  type            product_type NOT NULL DEFAULT 'supplement',
  price_sar       NUMERIC(10,2) NOT NULL,
  image_url       TEXT,
  file_url        TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT FALSE,
  stock           INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. Auto-update updated_at on every row change ─────────────
DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 6. Row Level Security ─────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read"  ON products;
DROP POLICY IF EXISTS "products_admin_write"  ON products;

-- Anyone can read active products; admin can read all
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = TRUE OR is_admin());

-- Admin can insert / update / delete any product
CREATE POLICY "products_admin_write" ON products
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ── 7. Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_type   ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- ── 8. Verify ────────────────────────────────────────────────
SELECT 'products table ready ✓' AS status,
       COUNT(*) AS existing_rows
FROM products;
