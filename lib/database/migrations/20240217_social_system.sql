-- Social Graph System

-- 1. Friendships Table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id_2 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'BLOCKED'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id_1, user_id_2)
);

-- 2. Security (RLS)
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  USING ( auth.uid() = user_id_1 OR auth.uid() = user_id_2 );

CREATE POLICY "Users can insert friend requests"
  ON friendships FOR INSERT
  WITH CHECK ( auth.uid() = user_id_1 );

CREATE POLICY "Users can update their own friendships"
  ON friendships FOR UPDATE
  USING ( auth.uid() = user_id_1 OR auth.uid() = user_id_2 );

CREATE POLICY "Users can delete their own friendships"
  ON friendships FOR DELETE
  USING ( auth.uid() = user_id_1 OR auth.uid() = user_id_2 );

-- 3. DM Channels Support
-- We will use the existing 'channels' table but with category='DM'
-- And we need a way to link users to private channels. 
-- Since we don't have a 'channel_members' table yet (we relied on public access), we need one for DMs.

CREATE TABLE IF NOT EXISTS channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'MEMBER', -- 'OWNER', 'MEMBER'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view channel members for channels they are in"
  ON channel_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_members cm
      WHERE cm.channel_id = channel_members.channel_id
      AND cm.user_id = auth.uid()
    ) OR 
    EXISTS ( -- Allow viewing members of public channels
      SELECT 1 FROM channels c
      WHERE c.id = channel_members.channel_id
      AND c.category = 'PUBLIC'
    )
  );

-- Update Channels Policy for DMs
DROP POLICY IF EXISTS "Public channels are viewable by everyone" ON channels;

CREATE POLICY "Channels policy"
  ON channels FOR SELECT
  USING (
    category = 'PUBLIC' OR
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = channels.id
      AND channel_members.user_id = auth.uid()
    )
  );

-- Update Messages Policy to respect private channels
DROP POLICY IF EXISTS "Messages are viewable by everyone in public channels" ON messages;

CREATE POLICY "Messages visibility"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = messages.channel_id
      AND channels.category = 'PUBLIC'
    ) OR
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = messages.channel_id
      AND channel_members.user_id = auth.uid()
    )
  );
