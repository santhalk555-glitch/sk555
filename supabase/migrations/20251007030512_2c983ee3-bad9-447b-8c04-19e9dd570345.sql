-- Add Hindi translation columns to quiz_questions table
ALTER TABLE public.quiz_questions 
ADD COLUMN question_hindi TEXT,
ADD COLUMN option_1_hindi TEXT,
ADD COLUMN option_2_hindi TEXT,
ADD COLUMN option_3_hindi TEXT,
ADD COLUMN option_4_hindi TEXT;

-- Add index for better query performance when filtering by language availability
CREATE INDEX idx_quiz_questions_hindi ON public.quiz_questions(id) WHERE question_hindi IS NOT NULL;