-- MIGRATION: RESTORE MISSING PROFILES & FIX IDs
-- Run this in Supabase SQL Editor.

-- 1. Restore Missing Profiles
-- This finds any user in Auth who doesn't have a Profile row and creates it.
INSERT INTO public.profiles (id, gamertag, full_name, role, is_verified)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'gamertag', 'Operative-' || substr(id::text, 1, 4)), 
    COALESCE(raw_user_meta_data->>'full_name', 'Unknown Operative'),
    COALESCE(raw_user_meta_data->>'role', 'PLAYER'),
    TRUE
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 2. Force-Backfill Tactical IDs (Again, for the newly created profiles)
UPDATE profiles
SET tactical_id = 
  CASE role
    WHEN 'ORGANIZER' THEN 'AR'
    WHEN 'COACH' THEN 'TC'
    ELSE 'OP'
  END || '-' ||
  CASE COALESCE(primary_game, 'General')
    WHEN 'VALORANT' THEN 'VAL'
    WHEN 'BGMI' THEN 'BGM'
    WHEN 'CS2' THEN 'CS2'
    WHEN 'DOTA2' THEN 'DTA'
    WHEN 'LOL' THEN 'LOL'
    WHEN 'APEX' THEN 'APX'
    WHEN 'COD' THEN 'COD'
    ELSE 'GEN'
  END || '-' ||
  upper(substring(md5(random()::text) from 1 for 4))
WHERE tactical_id IS NULL;

-- 3. Verify RLS is not blocking you
-- (Re-run this just to be absolutely sure)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );
