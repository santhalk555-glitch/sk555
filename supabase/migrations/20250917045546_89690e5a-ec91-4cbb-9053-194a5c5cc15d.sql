-- Update the start_quiz_lobby function to set status to 'in_progress'
CREATE OR REPLACE FUNCTION public.start_quiz_lobby(lobby_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;