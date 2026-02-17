-- MIGRATION: REPAIR SERVICE RECORD & TACTICAL ID LOGIC
-- Run this in your Supabase SQL Editor to force-fix the update permissions.

-- 1. Ensure Columns Exist (Idempotent)
DO $$
BEGIN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tactical_id TEXT UNIQUE;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_game TEXT DEFAULT 'General';
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialization TEXT;
END $$;

-- 2. Reset Triggers (Defensive Drop)
DROP TRIGGER IF EXISTS set_tactical_id ON profiles;
DROP TRIGGER IF EXISTS set_tactical_id_insert ON profiles;
DROP TRIGGER IF EXISTS set_tactical_id_update ON profiles;

-- 3. Update Generation Logic Function
CREATE OR REPLACE FUNCTION public.generate_tactical_id()
RETURNS TRIGGER AS $$
DECLARE
  role_prefix TEXT;
  game_prefix TEXT;
  hash_suffix TEXT;
BEGIN
  -- Determine Role Prefix
  IF NEW.role = 'ORGANIZER' THEN
    role_prefix := 'AR'; 
  ELSIF NEW.role = 'COACH' THEN
    role_prefix := 'TC'; 
  ELSE
    role_prefix := 'OP'; 
  END IF;

  -- Determine Game Prefix
  CASE NEW.primary_game
    WHEN 'VALORANT' THEN game_prefix := 'VAL';
    WHEN 'BGMI' THEN game_prefix := 'BGM';
    WHEN 'CS2' THEN game_prefix := 'CS2';
    WHEN 'DOTA2' THEN game_prefix := 'DTA';
    WHEN 'LOL' THEN game_prefix := 'LOL';
    WHEN 'APEX' THEN game_prefix := 'APX';
    WHEN 'COD' THEN game_prefix := 'COD';
    ELSE game_prefix := 'GEN';
  END CASE;

  -- Generate Hash
  hash_suffix := upper(substring(md5(random()::text) from 1 for 4));
  
  -- Apply new ID
  NEW.tactical_id := role_prefix || '-' || game_prefix || '-' || hash_suffix;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Re-create Split Triggers (Corrected Logic)
CREATE TRIGGER set_tactical_id_insert
BEFORE INSERT ON profiles
FOR EACH ROW
WHEN (NEW.tactical_id IS NULL)
EXECUTE FUNCTION public.generate_tactical_id();

CREATE TRIGGER set_tactical_id_update
BEFORE UPDATE OF primary_game, role ON profiles
FOR EACH ROW
WHEN (OLD.primary_game IS DISTINCT FROM NEW.primary_game OR OLD.role IS DISTINCT FROM NEW.role)
EXECUTE FUNCTION public.generate_tactical_id();

-- 5. Force-Reset RLS Policies (The likely culprit)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old/conflicting policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- Create explicitly open policies for own data
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );
