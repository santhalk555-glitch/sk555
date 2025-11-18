-- Insert new General subjects: Environment and Computer
-- Ensures they exist in subjects_hierarchy with exam_simple_id NULL

INSERT INTO public.subjects_hierarchy (name, simple_id, source_type, exam_simple_id)
SELECT 'Environment', 'environment', 'general', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.subjects_hierarchy WHERE simple_id = 'environment'
);

INSERT INTO public.subjects_hierarchy (name, simple_id, source_type, exam_simple_id)
SELECT 'Computer', 'computer', 'general', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.subjects_hierarchy WHERE simple_id = 'computer'
);