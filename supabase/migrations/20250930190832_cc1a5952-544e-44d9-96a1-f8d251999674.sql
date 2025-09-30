-- Remove subject and subject_simple_id columns from quiz_questions
ALTER TABLE public.quiz_questions 
DROP COLUMN IF EXISTS subject,
DROP COLUMN IF EXISTS subject_simple_id;

-- Add subject_id column that references subjects_hierarchy
ALTER TABLE public.quiz_questions 
ADD COLUMN subject_id UUID REFERENCES public.subjects_hierarchy(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_subject_id ON public.quiz_questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_exam_simple_id ON public.quiz_questions(exam_simple_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic_simple_id ON public.quiz_questions(topic_simple_id);