-- MIGRATION: BACKFILL TACTICAL IDs
-- Run this in Supabase SQL Editor to generate IDs for all existing users.

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
