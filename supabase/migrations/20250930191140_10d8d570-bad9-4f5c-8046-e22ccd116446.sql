-- Remove difficulty column from quiz_questions table
ALTER TABLE public.quiz_questions 
DROP COLUMN IF EXISTS difficulty;

-- Drop the difficulty_level enum type if it exists and is no longer used
DROP TYPE IF EXISTS difficulty_level CASCADE;