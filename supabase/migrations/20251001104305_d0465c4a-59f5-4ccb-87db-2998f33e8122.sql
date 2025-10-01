-- Update RLS policy to allow participants to update their ready status
DROP POLICY IF EXISTS "Users can update their participation" ON public.lobby_participants;

CREATE POLICY "Users can update their participation" 
ON public.lobby_participants 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);