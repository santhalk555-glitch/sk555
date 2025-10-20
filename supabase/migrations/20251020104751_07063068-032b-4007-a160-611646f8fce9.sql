-- Remove unique constraint on quiz_questions.question
DROP INDEX IF EXISTS public.idx_quiz_questions_unique_question;