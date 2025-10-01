-- Add ready status to lobby_participants
ALTER TABLE public.lobby_participants 
ADD COLUMN ready boolean DEFAULT false;