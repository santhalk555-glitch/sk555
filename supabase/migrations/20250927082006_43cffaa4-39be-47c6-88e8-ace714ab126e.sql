-- Drop the profile_view first, then remove subjects column, then recreate the view without subjects
DROP VIEW IF EXISTS public.profile_view;

-- Remove subjects column from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS subjects;

-- Recreate profile_view without subjects column
CREATE VIEW public.profile_view AS
SELECT 
  p.id,
  p.user_id,
  p.username,
  p.display_user_id,
  p.course_name,
  p.competitive_exams,
  p.created_at,
  p.updated_at
FROM public.profiles p;