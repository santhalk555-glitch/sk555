-- Enable realtime for lobby_participants table
ALTER TABLE public.lobby_participants REPLICA IDENTITY FULL;

-- Add to realtime publication if not already added
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'lobby_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_participants;
  END IF;
END $$;