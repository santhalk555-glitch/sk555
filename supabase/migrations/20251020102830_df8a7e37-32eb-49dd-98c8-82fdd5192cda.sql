-- Add unique constraint on question text to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_questions_unique_question 
ON public.quiz_questions (question);

COMMENT ON INDEX idx_quiz_questions_unique_question IS 'Ensures no duplicate questions are inserted';
