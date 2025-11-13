-- Enable realtime for game_lobbies table
ALTER TABLE public.game_lobbies REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_lobbies;

-- Ensure lobby_participants also has REPLICA IDENTITY FULL
ALTER TABLE public.lobby_participants REPLICA IDENTITY FULL;