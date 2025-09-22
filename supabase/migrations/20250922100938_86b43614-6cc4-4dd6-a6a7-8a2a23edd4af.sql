-- Update quiz_questions table structure
-- First, rename columns from option_a/b/c/d to option_1/2/3/4
ALTER TABLE public.quiz_questions 
RENAME COLUMN option_a TO option_1;

ALTER TABLE public.quiz_questions 
RENAME COLUMN option_b TO option_2;

ALTER TABLE public.quiz_questions 
RENAME COLUMN option_c TO option_3;

ALTER TABLE public.quiz_questions 
RENAME COLUMN option_d TO option_4;

-- Update correct_answer from letters to numbers
UPDATE public.quiz_questions 
SET correct_answer = CASE 
  WHEN correct_answer = 'A' THEN '1'
  WHEN correct_answer = 'B' THEN '2' 
  WHEN correct_answer = 'C' THEN '3'
  WHEN correct_answer = 'D' THEN '4'
  ELSE correct_answer
END;