-- Separate migration to add enum types safely if not using IF NOT EXISTS PostgreSQL 9.1 syntax
-- Run this BEFORE schema.sql if you are on Supabase (PostgreSQL 15+)

-- If the enum types fail, comment them out in schema.sql as Supabase may handle them differently.
-- These are already included in schema.sql. This file is for reference only.

-- To reset the database completely (careful!):
-- DROP TABLE IF EXISTS workout_sets, workout_sessions, meal_logs, foods, exercises, user_settings, activity_log CASCADE;
-- DROP TYPE IF EXISTS exercise_type, muscle_group CASCADE;
-- Then re-run schema.sql
