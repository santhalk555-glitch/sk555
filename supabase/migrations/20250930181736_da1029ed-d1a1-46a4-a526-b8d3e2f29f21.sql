-- Add missing columns to game_lobbies table
ALTER TABLE public.game_lobbies 
ADD COLUMN IF NOT EXISTS source_type text,
ADD COLUMN IF NOT EXISTS course_id uuid;