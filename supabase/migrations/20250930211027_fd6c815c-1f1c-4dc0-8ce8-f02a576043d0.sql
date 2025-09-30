-- Remove explanation column from quiz_questions table
ALTER TABLE public.quiz_questions DROP COLUMN IF EXISTS explanation;