-- Add presence visibility settings to profiles table first
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS presence_visibility TEXT DEFAULT 'everyone' CHECK (presence_visibility IN ('everyone', 'friends', 'nobody'));

-- Create user presence table for real-time online status tracking
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id UUID PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'idle', 'offline')),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Policy: Users can update their own presence
CREATE POLICY "Users can update their own presence"
  ON public.user_presence
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can insert their own presence
CREATE POLICY "Users can insert their own presence"
  ON public.user_presence
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view presence based on privacy settings
CREATE POLICY "Users can view presence based on privacy settings"
  ON public.user_presence
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = user_presence.user_id
      AND (
        -- Show to everyone if visibility is 'everyone'
        profiles.presence_visibility = 'everyone'
        OR
        -- Show to friends if visibility is 'friends'
        (profiles.presence_visibility = 'friends' AND EXISTS (
          SELECT 1 FROM public.friends
          WHERE (user1_id = auth.uid() AND user2_id = user_presence.user_id)
             OR (user2_id = auth.uid() AND user1_id = user_presence.user_id)
        ))
        OR
        -- Always show own presence
        auth.uid() = user_presence.user_id
      )
    )
  );

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON public.user_presence(status);
CREATE INDEX IF NOT EXISTS idx_user_presence_updated_at ON public.user_presence(updated_at);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_user_presence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on presence changes
DROP TRIGGER IF EXISTS trigger_update_user_presence_updated_at ON public.user_presence;
CREATE TRIGGER trigger_update_user_presence_updated_at
  BEFORE UPDATE ON public.user_presence
  FOR EACH ROW
  EXECUTE FUNCTION update_user_presence_updated_at();

-- Enable realtime for user_presence table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;

-- Set replica identity for realtime updates
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;