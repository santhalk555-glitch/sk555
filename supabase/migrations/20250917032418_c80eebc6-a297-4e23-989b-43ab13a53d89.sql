-- Add username column to lobby_participants table
ALTER TABLE public.lobby_participants ADD COLUMN username TEXT;

-- Update existing records to use username from profiles table
UPDATE public.lobby_participants 
SET username = profiles.username 
FROM public.profiles 
WHERE lobby_participants.user_id = profiles.user_id;

-- Make username column NOT NULL after populating data
ALTER TABLE public.lobby_participants ALTER COLUMN username SET NOT NULL;

-- Drop the old display_user_id column
ALTER TABLE public.lobby_participants DROP COLUMN display_user_id;