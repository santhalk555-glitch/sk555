-- Drop the old subjects table as it's redundant with subjects_hierarchy
-- The application code has been updated to use subjects_hierarchy exclusively
DROP TABLE IF EXISTS public.subjects;