-- Drop the existing max_players constraint
ALTER TABLE public.game_lobbies 
DROP CONSTRAINT IF EXISTS game_lobbies_max_players_check;

-- Add new constraint allowing 1, 2, or 4 players
ALTER TABLE public.game_lobbies 
ADD CONSTRAINT game_lobbies_max_players_check 
CHECK (max_players = ANY (ARRAY[1, 2, 4]));