-- Add privacy and preference columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS show_in_search BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_friend_requests BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_messages_non_friends BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
ADD COLUMN IF NOT EXISTS enable_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_show_in_search ON public.profiles(show_in_search);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_visibility ON public.profiles(profile_visibility);