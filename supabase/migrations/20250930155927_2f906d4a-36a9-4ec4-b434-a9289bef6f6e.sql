-- Add avatar_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Drop existing profile_view
DROP VIEW IF EXISTS profile_view;

-- Recreate profile_view with avatar_url
CREATE VIEW profile_view AS
SELECT 
  p.id,
  p.user_id,
  p.username,
  p.display_user_id,
  p.course_name,
  p.competitive_exams,
  p.avatar_url,
  p.created_at,
  p.updated_at
FROM profiles p;