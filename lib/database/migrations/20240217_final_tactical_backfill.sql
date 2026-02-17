-- MIGRATION: FINAL TACTICAL ID BACKFILL
-- Run this in Supabase SQL Editor.
-- This script DIRECTLY updates your profile, bypassing triggers to guarantee an ID is set.

UPDATE profiles
SET tactical_id = 
  -- Generate ID Logic Reproduced Directly in Update
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

-- Also verify the update trigger is loose enough for future
DROP TRIGGER IF EXISTS set_tactical_id_update ON profiles;

CREATE TRIGGER set_tactical_id_update
BEFORE UPDATE ON profiles
FOR EACH ROW
WHEN (
    NEW.tactical_id IS NULL -- Safety: If it ever becomes null, regenerate it
    OR OLD.primary_game IS DISTINCT FROM NEW.primary_game 
    OR OLD.role IS DISTINCT FROM NEW.role
)
EXECUTE FUNCTION public.generate_tactical_id();
