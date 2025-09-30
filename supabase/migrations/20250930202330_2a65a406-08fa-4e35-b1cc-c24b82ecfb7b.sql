-- Remove topic_simple_id from quiz_questions table
ALTER TABLE public.quiz_questions DROP COLUMN IF EXISTS topic_simple_id;

-- Remove simple_id from topics table
ALTER TABLE public.topics DROP COLUMN IF EXISTS simple_id;