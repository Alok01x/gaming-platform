-- 1. Add is_announcement to channels
ALTER TABLE channels ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN DEFAULT FALSE;

-- 2. Update Messages RLS for Announcements
-- We need to restrict INSERT on announcement channels to ADMINS/ORGANIZERS
DROP POLICY IF EXISTS "Messages insertion" ON messages;

CREATE POLICY "Messages insertion"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
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
    )
  );

-- 3. Create the Broadcast Channel
INSERT INTO channels (name, description, category, is_announcement)
VALUES ('broadcast', 'Global tactical feed and high-command announcements.', 'PUBLIC', TRUE)
ON CONFLICT (name) DO UPDATE SET is_announcement = TRUE;
