-- Migration: Add exercise_category to workout_exercises
-- Run this in Supabase SQL editor

ALTER TABLE workout_exercises
  ADD COLUMN IF NOT EXISTS exercise_category TEXT;

-- Optional: Add an index for filtering by category
CREATE INDEX IF NOT EXISTS idx_workout_exercises_category
  ON workout_exercises (exercise_category);
