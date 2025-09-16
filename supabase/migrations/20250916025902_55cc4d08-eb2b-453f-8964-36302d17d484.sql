-- Fix function search path for security
CREATE OR REPLACE FUNCTION public.create_friendship_on_accept()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Only proceed if status changed to accepted
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Insert friendship (ensure user1_id < user2_id for consistency)
    INSERT INTO public.friends (user1_id, user2_id)
    VALUES (
      LEAST(NEW.sender_id, NEW.receiver_id),
      GREATEST(NEW.sender_id, NEW.receiver_id)
    )
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
    
    -- Set responded_at timestamp
    NEW.responded_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;