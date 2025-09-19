-- Remove UUID-based ID columns from quiz_questions table, keeping only simple IDs
ALTER TABLE public.quiz_questions 
DROP COLUMN IF EXISTS course_id,
DROP COLUMN IF EXISTS exam_id,
DROP COLUMN IF EXISTS subject_id,
DROP COLUMN IF EXISTS topic_id;

-- Add indexes on simple ID columns for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_course_simple_id ON public.quiz_questions(course_simple_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_exam_simple_id ON public.quiz_questions(exam_simple_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_subject_simple_id ON public.quiz_questions(subject_simple_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic_simple_id ON public.quiz_questions(topic_simple_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_source_type ON public.quiz_questions(source_type);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_quiz_questions_filtering ON public.quiz_questions(source_type, exam_simple_id, topic_simple_id);