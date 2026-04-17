-- ─────────────────────────────────────────────────────────────────────────────
-- PATCH: Allow clients to read their assigned coach's profile
--
-- Problem: The profiles RLS only allowed:
--   • A user to read their OWN row
--   • Admins to read ALL rows
--   • Coaches to read their ASSIGNED CLIENTS' rows
--
-- Missing: Clients could not read their coach's profile, so
--   supabase.from('profiles').select('full_name').eq('id', trainer_id)
--   returned null for a client user → name defaulted to "Your Coach".
--
-- Run this once in Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "client_read_assigned_coach" ON profiles;

CREATE POLICY "client_read_assigned_coach" ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trainer_client_assignments
      WHERE client_id = auth.uid()
        AND trainer_id = profiles.id
    )
  );
