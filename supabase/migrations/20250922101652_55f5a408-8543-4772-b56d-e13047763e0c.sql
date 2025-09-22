-- Add a new integer column for correct_answer
ALTER TABLE public.quiz_questions 
ADD COLUMN correct_answer_new INTEGER;

-- Convert existing data to integers
UPDATE public.quiz_questions 
SET correct_answer_new = CASE 
  WHEN correct_answer = 'A' THEN 1
  WHEN correct_answer = 'B' THEN 2 
  WHEN correct_answer = 'C' THEN 3
  WHEN correct_answer = 'D' THEN 4
  WHEN correct_answer = '1' THEN 1
  WHEN correct_answer = '2' THEN 2
  WHEN correct_answer = '3' THEN 3
  WHEN correct_answer = '4' THEN 4
  ELSE 1 -- Default fallback
END;

-- Make the new column NOT NULL
ALTER TABLE public.quiz_questions 
ALTER COLUMN correct_answer_new SET NOT NULL;

-- Drop the old column
ALTER TABLE public.quiz_questions 
DROP COLUMN correct_answer;

-- Rename the new column to correct_answer
ALTER TABLE public.quiz_questions 
RENAME COLUMN correct_answer_new TO correct_answer;