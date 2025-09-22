-- Convert correct_answer column from text to integer
-- First ensure all values are numeric strings
UPDATE public.quiz_questions 
SET correct_answer = CASE 
  WHEN correct_answer::text = 'A' THEN '1'
  WHEN correct_answer::text = 'B' THEN '2' 
  WHEN correct_answer::text = 'C' THEN '3'
  WHEN correct_answer::text = 'D' THEN '4'
  WHEN correct_answer::text IN ('1', '2', '3', '4') THEN correct_answer::text
  ELSE '1' -- Default fallback
END;

-- Now change column type from text to integer
ALTER TABLE public.quiz_questions 
ALTER COLUMN correct_answer TYPE INTEGER USING correct_answer::integer;