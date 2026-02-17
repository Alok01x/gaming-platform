-- Global Comms Network Schema

-- 1. Channels Table
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT DEFAULT 'TEXT', -- 'TEXT', 'VOICE'
  category TEXT DEFAULT 'PUBLIC', -- 'PUBLIC', 'TEAM', 'OFFICER'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Security (RLS)
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Channels Policies
CREATE POLICY "Public channels are viewable by everyone"
  ON channels FOR SELECT
  USING ( category = 'PUBLIC' );

-- Messages Policies
CREATE POLICY "Messages are viewable by everyone in public channels"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = messages.channel_id
      AND channels.category = 'PUBLIC'
    )
  );

CREATE POLICY "Authenticated users can insert messages"
  ON messages FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- 4. Initial Seed Data
INSERT INTO channels (name, description, category)
VALUES 
  ('general', 'Global tactical channel for all operatives', 'PUBLIC'),
  ('lfg-ranked', 'Looking for Squad - Ranked Play', 'PUBLIC'),
  ('trash-talk', 'Psychological warfare allowed here', 'PUBLIC'),
  ('strategy', 'Map tactics and meta discussion', 'PUBLIC')
ON CONFLICT (name) DO NOTHING;
