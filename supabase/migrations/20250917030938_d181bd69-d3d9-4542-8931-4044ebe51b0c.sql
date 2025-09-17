-- Add username field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE;

-- Add constraint for username format (4-20 chars, letters/numbers/underscores only)
ALTER TABLE public.profiles 
ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]{4,20}$');

-- Create index for faster username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Update the display_user_id to be nullable since we'll use username instead
ALTER TABLE public.profiles 
ALTER COLUMN display_user_id DROP NOT NULL;