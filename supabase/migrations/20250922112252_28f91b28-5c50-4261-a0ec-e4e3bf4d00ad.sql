-- Update the profile_view to handle the new competitive_exams JSONB structure
DROP VIEW IF EXISTS profile_view;

CREATE VIEW profile_view AS
SELECT 
    p.id,
    p.user_id,
    p.username,
    p.display_user_id,
    p.course_name,
    p.competitive_exams,
    p.subjects,
    p.created_at,
    p.updated_at
FROM profiles p;