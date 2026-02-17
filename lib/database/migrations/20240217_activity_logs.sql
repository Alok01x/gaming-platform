-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'TOURNAMENT_START', 'MATCH_WIN', 'TEAM_CREATED', 'RANK_UP', 'SYSTEM'
  description TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Publicly viewable
CREATE POLICY "Activity logs are viewable by everyone"
  ON activity_log FOR SELECT
  USING (true);

-- Users can insert their own logs
CREATE POLICY "Users can insert own activity"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() = actor_id OR actor_id IS NULL);
