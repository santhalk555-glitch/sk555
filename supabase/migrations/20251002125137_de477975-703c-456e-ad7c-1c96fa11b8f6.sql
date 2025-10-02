-- Recreate profile_view as a regular view (without SECURITY DEFINER)
-- This maintains functionality while keeping it secure
CREATE OR REPLACE VIEW public.profile_view AS
SELECT 
  id,
  user_id,
  username,
  display_user_id,
  course_name,
  competitive_exams,
  avatar_url,
  created_at,
  updated_at
FROM public.profiles;