-- Remove all course-related data and simplify to exam-only system

-- Delete all course-related data
DELETE FROM subjects_hierarchy WHERE source_type = 'course';
DELETE FROM branches WHERE source_type = 'course';
DELETE FROM game_lobbies WHERE source_type = 'course';

-- Drop course-related columns and tables
DROP TABLE IF EXISTS courses CASCADE;

-- Remove course columns from tables
ALTER TABLE subjects_hierarchy DROP COLUMN IF EXISTS course_id;
ALTER TABLE subjects_hierarchy DROP COLUMN IF EXISTS course_simple_id;

ALTER TABLE branches DROP COLUMN IF EXISTS course_id;
ALTER TABLE branches DROP COLUMN IF EXISTS course_simple_id;

ALTER TABLE game_lobbies DROP COLUMN IF EXISTS course_id;
ALTER TABLE game_lobbies DROP COLUMN IF EXISTS course_simple_id;

-- Update source_type to only allow 'exam'
ALTER TABLE subjects_hierarchy DROP COLUMN source_type;
ALTER TABLE branches DROP COLUMN source_type;
ALTER TABLE game_lobbies DROP COLUMN source_type;

-- Clean up any remaining course references in quiz_questions
UPDATE quiz_questions SET course_simple_id = NULL WHERE course_simple_id IS NOT NULL;