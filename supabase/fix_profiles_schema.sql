-- ==========================================
-- FIX: Missing columns in profiles table
-- ==========================================

-- 1. Add specialization (for coaches)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS specialization TEXT;

-- 2. Add bio (for coach profiles)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. Add onboarding_completed (for client status tracking)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional: Re-verify roles exist
-- CREATE TYPE user_role AS ENUM ('client', 'coach', 'admin', 'suspended');
-- Note: If user_role enum is already defined, this might need more careful handling.
-- The existing code suggests 'client', 'coach', 'admin' are already there.
