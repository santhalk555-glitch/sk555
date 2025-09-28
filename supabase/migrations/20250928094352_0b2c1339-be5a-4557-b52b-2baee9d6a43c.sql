-- First, delete topics that reference course subjects
DELETE FROM topics 
WHERE subject_id IN (
  SELECT id FROM subjects_hierarchy WHERE source_type = 'course'
);

-- Now delete course-related data
DELETE FROM subjects_hierarchy WHERE source_type = 'course';
DELETE FROM branches WHERE source_type = 'course';
DELETE FROM game_lobbies WHERE source_type = 'course';