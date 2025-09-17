-- Add subject column to game_lobbies table
ALTER TABLE public.game_lobbies ADD COLUMN subject TEXT;

-- Add game_mode column to distinguish between study and quiz modes
ALTER TABLE public.game_lobbies ADD COLUMN game_mode TEXT DEFAULT 'study';

-- Add start_quiz function for lobby creators only
CREATE OR REPLACE FUNCTION public.start_quiz_lobby(lobby_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  lobby_creator UUID;
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Get lobby creator
  SELECT creator_id INTO lobby_creator 
  FROM public.game_lobbies 
  WHERE id = lobby_id;
  
  -- Check if current user is the creator
  IF current_user_id = lobby_creator THEN
    -- Update lobby status to 'in_progress'
    UPDATE public.game_lobbies 
    SET status = 'in_progress' 
    WHERE id = lobby_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;