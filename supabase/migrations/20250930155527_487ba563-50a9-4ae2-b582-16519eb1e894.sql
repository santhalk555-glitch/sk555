-- Remove source_type column from quiz_questions table
ALTER TABLE quiz_questions DROP COLUMN IF EXISTS source_type;