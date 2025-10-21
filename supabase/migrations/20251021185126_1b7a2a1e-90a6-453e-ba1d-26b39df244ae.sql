-- Remove all Biology subtopics, keeping only main topics
DELETE FROM public.topics 
WHERE subject_id = (SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology')
AND simple_id NOT IN (
  'blood_circulatory_system',
  'respiratory_system',
  'excretory_system',
  'digestive_system',
  'reproductive_system_humans',
  'coordination_humans',
  'cell',
  'tissue',
  'skeletal_system',
  'health_disease',
  'branches_of_biology',
  'biodiversity',
  'evolution',
  'biotechnology',
  'reproductive_system_plants',
  'nutrition'
);