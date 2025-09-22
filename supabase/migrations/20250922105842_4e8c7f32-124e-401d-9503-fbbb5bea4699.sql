-- Remove old quiz_categories table as it uses outdated enum-based subjects
DROP TABLE IF EXISTS public.quiz_categories CASCADE;

-- Remove category field from competitive_exams_list as it's redundant
ALTER TABLE public.competitive_exams_list 
DROP COLUMN IF EXISTS category;

-- Remove main_category and sub_category from courses as they're replaced by simple_id system
ALTER TABLE public.courses 
DROP COLUMN IF EXISTS main_category,
DROP COLUMN IF EXISTS sub_category;