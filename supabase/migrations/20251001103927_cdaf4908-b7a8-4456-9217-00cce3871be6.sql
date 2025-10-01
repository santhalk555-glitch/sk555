-- Add question_ids column to game_lobbies to store the randomized questions
ALTER TABLE public.game_lobbies 
ADD COLUMN question_ids uuid[] DEFAULT NULL;