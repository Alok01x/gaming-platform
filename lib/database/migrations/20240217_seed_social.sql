-- Seed Data for Social Graph & Chat

-- 1. Create Mock Profiles (using auth.users is hard without admin API, so we'll just insert into public.profiles and assume they map to nothing for now, OR we can just insert messages from 'Ghost' users if no foreign key enforcement on auth.users, but profiles.id usually refs auth.users)
-- Wait, profiles.id REFERENCES auth.users. We can't easily seed real users without creating them in Auth.
-- Workaround: We will create "Bot" profiles that might not be able to login but exist in the DB. Use standard UUIDs.

-- Bot UUIDs
-- '00000000-0000-0000-0000-000000000001' -> Commander Shepard (High Command)
-- '00000000-0000-0000-0000-000000000002' -> Cortana (AI/Bot)
-- '00000000-0000-0000-0000-000000000003' -> Viper (Operative - Valorant)
-- '00000000-0000-0000-0000-000000000004' -> Ghost (Operative - CoD)

INSERT INTO profiles (id, email, gamertag, role, tactical_id, avatar_url)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'shepard@n7.com', 'Shepard', 'HIGH_COMMAND', 'AR-GEN-001', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shepard'),
  ('00000000-0000-0000-0000-000000000002', 'cortana@unsc.org', 'Cortana', 'ADMIN', 'TC-AI-001', 'https://api.dicebear.com/7.x/bottts/svg?seed=Cortana'),
  ('00000000-0000-0000-0000-000000000003', 'viper@valorant.com', 'Viper', 'PLAYER', 'OP-VAL-007', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Viper'),
  ('00000000-0000-0000-0000-000000000004', 'ghost@mw2.com', 'Ghost', 'PLAYER', 'OP-COD-141', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost')
ON CONFLICT (id) DO NOTHING;

-- 2. Add them to 'General' channel (Find General ID first, or just insert if we know it)
-- We'll assume we subquery the channel ID

INSERT INTO messages (channel_id, user_id, content, created_at)
SELECT 
  id as channel_id,
  '00000000-0000-0000-0000-000000000001' as user_id,
  'Command to all stations: Situation critical. Maintain radio silence unless authorized.',
  NOW() - INTERVAL '1 hour'
FROM channels WHERE name = 'general';

INSERT INTO messages (channel_id, user_id, content, created_at)
SELECT 
  id as channel_id,
  '00000000-0000-0000-0000-000000000003' as user_id,
  'Sector 7 clear. Rotating to B site.',
  NOW() - INTERVAL '55 minutes'
FROM channels WHERE name = 'general';

INSERT INTO messages (channel_id, user_id, content, created_at)
SELECT 
  id as channel_id,
  '00000000-0000-0000-0000-000000000004' as user_id,
  'Copy that. Watch your six.',
  NOW() - INTERVAL '54 minutes'
FROM channels WHERE name = 'general';

INSERT INTO messages (channel_id, user_id, content, created_at)
SELECT 
  id as channel_id,
  '00000000-0000-0000-0000-000000000002' as user_id,
  '[SYSTEM] Environment synchronization complete. Packet loss: 0.0%',
  NOW() - INTERVAL '30 minutes'
FROM channels WHERE name = 'general';

-- 3. Populate Trash Talk
INSERT INTO messages (channel_id, user_id, content, created_at)
SELECT 
  id as channel_id,
  '00000000-0000-0000-0000-000000000003' as user_id,
  'Imagine using an Odin in round 2. unskilled behavior.',
  NOW() - INTERVAL '10 minutes'
FROM channels WHERE name = 'trash-talk';

-- 4. Channel Membership Mock (For sidebar listing)
-- Add bots to general
INSERT INTO channel_members (channel_id, user_id, role)
SELECT id, '00000000-0000-0000-0000-000000000001', 'OWNER' FROM channels WHERE name = 'general'
UNION ALL
SELECT id, '00000000-0000-0000-0000-000000000002', 'MEMBER' FROM channels WHERE name = 'general'
UNION ALL
SELECT id, '00000000-0000-0000-0000-000000000003', 'MEMBER' FROM channels WHERE name = 'general'
UNION ALL
SELECT id, '00000000-0000-0000-0000-000000000004', 'MEMBER' FROM channels WHERE name = 'general'
ON CONFLICT DO NOTHING;
