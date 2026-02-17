-- 1. Create a permanent SYSTEM profile
-- Using a fixed UUID for consistency across deployments
INSERT INTO profiles (id, gamertag, role, is_verified, tactical_id, primary_game, specialization)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  'HIGH_COMMAND', 
  'ADMIN', 
  TRUE, 
  'HQ-SIT-0000', 
  'General', 
  'Intelligence Oversight'
)
ON CONFLICT (id) DO UPDATE SET 
  gamertag = 'HIGH_COMMAND',
  tactical_id = 'HQ-SIT-0000';

-- 2. Create the Sitreps Channel
INSERT INTO channels (name, description, category, is_announcement)
VALUES ('sitreps', 'Automated platform activity logs and tactical sitreps.', 'PUBLIC', TRUE)
ON CONFLICT (name) DO UPDATE SET description = 'Automated platform activity logs and tactical sitreps.';

-- 3. Update Messages RLS to allow SYSTEM to post anywhere
-- This ensures logActivity can always post automated updates
DROP POLICY IF EXISTS "Messages insertion" ON messages;

CREATE POLICY "Messages insertion"
  ON messages FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000')
    AND (
      EXISTS (
        SELECT 1 FROM channels 
        WHERE channels.id = messages.channel_id 
        AND channels.is_announcement = FALSE
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (role = 'ADMIN' OR role = 'ORGANIZER')
      )
      OR
      (user_id = '00000000-0000-0000-0000-000000000000')
    )
  );
