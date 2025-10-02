-- Drop the profile_view as it's redundant and has SECURITY DEFINER
-- The profiles table already has proper RLS policies
DROP VIEW IF EXISTS public.profile_view;