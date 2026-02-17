-- 1. Profiles Table
-- Stores persistent global stats and persistent commander data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gamertag TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'PLAYER', -- 'PLAYER', 'ORGANIZER'
  is_verified BOOLEAN DEFAULT TRUE,
  rank_tier TEXT DEFAULT 'RECRUIT',
  total_kills INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  bio TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  tag TEXT UNIQUE NOT NULL, -- Short tag like [ELO]
  logo_url TEXT,
  owner_id UUID REFERENCES auth.users(id),
  description TEXT,
  invite_code TEXT UNIQUE DEFAULT substring(md5(random()::text) from 0 for 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Team Members Join Table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'PLAYER', -- 'OWNER', 'CAPTAIN', 'PLAYER'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 4. Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  game_type TEXT NOT NULL,
  classification TEXT DEFAULT 'MINOR', -- 'MINOR', 'MAJOR', 'PRO'
  status TEXT DEFAULT 'OPEN',
  prize_pool TEXT,
  rules TEXT,
  max_participants INTEGER DEFAULT 16,
  start_date TIMESTAMP WITH TIME ZONE,
  creator_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Matches & Brackets Table (Enhanced)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round_index INTEGER NOT NULL, -- 0 for Finals, 1 for Semis, etc.
  match_index INTEGER NOT NULL, -- Position in that round
  team_a_id UUID REFERENCES teams(id),
  team_b_id UUID REFERENCES teams(id),
  result_a INTEGER DEFAULT 0,
  result_b INTEGER DEFAULT 0,
  winner_id UUID REFERENCES teams(id),
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'LIVE', 'COMPLETED'
  parent_match_id UUID REFERENCES matches(id), -- For bracket advancement
  scheduled_at TIMESTAMP WITH TIME ZONE
);

-- 6. Tournament Participants Join Table
CREATE TABLE IF NOT EXISTS tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  status TEXT DEFAULT 'REGISTERED', -- 'REGISTERED', 'CONFIRMED', 'ELIMINATED'
  placement INTEGER, -- 1st, 2nd, etc.
  tournament_kills INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- 7. User Stats History (For Graphs)
CREATE TABLE IF NOT EXISTS user_stats_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rank_points INTEGER DEFAULT 0,
  cumulative_kills INTEGER DEFAULT 0,
  cumulative_wins INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON tournament_participants(user_id);

-- 7. High-Command (Admin) Protocols
-- To verify an Architect (Organizer), execute the following tactical update:
-- UPDATE public.profiles SET is_verified = TRUE WHERE gamertag = 'TARGET_GAMERTAG';

-- 10. Tactical Identification System
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tactical_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS primary_game TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS specialization TEXT;

CREATE OR REPLACE FUNCTION public.generate_tactical_id()
RETURNS TRIGGER AS $$
DECLARE
  role_prefix TEXT;
  game_prefix TEXT;
  hash_suffix TEXT;
BEGIN
  -- Determine Role Prefix
  IF NEW.role = 'ORGANIZER' THEN
    role_prefix := 'AR'; -- Architect
  ELSIF NEW.role = 'COACH' THEN
    role_prefix := 'TC'; -- Tactician
  ELSE
    role_prefix := 'OP'; -- Operative
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

  -- Generate Hash (4 chars)
  hash_suffix := upper(substring(md5(random()::text) from 1 for 4));

  -- Set Tactical ID
  NEW.tactical_id := role_prefix || '-' || game_prefix || '-' || hash_suffix;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate ID on Insert or when Game/Role changes
DROP TRIGGER IF EXISTS set_tactical_id ON profiles;

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

-- 8. Automated Profile Creation
-- This function and trigger ensure that every registered user 
-- automatically gets a corresponding record in the profiles table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, gamertag, role, is_verified)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'gamertag',
    COALESCE(NEW.raw_user_meta_data->>'role', 'PLAYER'),
    CASE WHEN (NEW.raw_user_meta_data->>'role') = 'ORGANIZER' THEN FALSE ELSE TRUE END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Security Protocols (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );
