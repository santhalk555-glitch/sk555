-- Convert correct_answer column from text to integer
-- First update any remaining letter values to numbers
UPDATE public.quiz_questions 
SET correct_answer = CASE 
  WHEN correct_answer = 'A' THEN '1'
  WHEN correct_answer = 'B' THEN '2' 
  WHEN correct_answer = 'C' THEN '3'
  WHEN correct_answer = 'D' THEN '4'
  ELSE correct_answer
END;

-- Change column type from text to integer
ALTER TABLE public.quiz_questions 
ALTER COLUMN correct_answer TYPE INTEGER USING correct_answer::integer;