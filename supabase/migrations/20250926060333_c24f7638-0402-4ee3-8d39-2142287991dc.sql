-- Add lobby_type column to game_lobbies table to distinguish between quiz and practice lobbies
ALTER TABLE public.game_lobbies 
ADD COLUMN lobby_type text NOT NULL DEFAULT 'quiz';

-- Add comment for clarity
COMMENT ON COLUMN public.game_lobbies.lobby_type IS 'Type of lobby: quiz (multiplayer, broad subject questions) or practice (single player, specific topic questions)';