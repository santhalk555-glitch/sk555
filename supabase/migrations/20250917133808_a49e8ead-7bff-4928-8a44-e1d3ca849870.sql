-- First, let's create a view that controls what profile data is visible
-- This will show limited info to other users and full info to the profile owner

-- Create a function to check if two users are friends
CREATE OR REPLACE FUNCTION public.are_friends(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friends 
    WHERE (user1_id = $1 AND user2_id = $2) 
       OR (user1_id = $2 AND user2_id = $1)
  );
$$;

-- Create a secure view for profiles that controls data exposure
CREATE OR REPLACE VIEW public.profile_view AS
SELECT 
  id,
  user_id,
  -- Basic info visible to authenticated users (needed for invites/matching)
  username,
  display_user_id,
  created_at,
  updated_at,
  -- Sensitive info only visible to profile owner or friends
  CASE 
    WHEN auth.uid() = user_id THEN course_name
    WHEN public.are_friends(auth.uid(), user_id) THEN course_name
    ELSE NULL 
  END as course_name,
  CASE 
    WHEN auth.uid() = user_id THEN competitive_exams
    WHEN public.are_friends(auth.uid(), user_id) THEN competitive_exams
    ELSE ARRAY[]::text[]
  END as competitive_exams,
  CASE 
    WHEN auth.uid() = user_id THEN subjects
    WHEN public.are_friends(auth.uid(), user_id) THEN subjects  
    ELSE ARRAY[]::text[]
  END as subjects
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.profile_view SET (security_invoker = on);

-- Grant access to the view for authenticated users
GRANT SELECT ON public.profile_view TO authenticated;