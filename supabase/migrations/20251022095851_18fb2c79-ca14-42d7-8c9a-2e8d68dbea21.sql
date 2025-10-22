-- Add Physics topics
INSERT INTO public.topics (subject_id, simple_id, name)
SELECT 
  sh.id,
  topic.simple_id,
  topic.name
FROM subjects_hierarchy sh
CROSS JOIN (
  VALUES 
    ('electricity_magnetism', 'Electricity & Magnetism'),
    ('fluid', 'Fluid'),
    ('force', 'Force'),
    ('friction', 'Friction'),
    ('gravitation', 'Gravitation'),
    ('heat_temperature', 'Heat & Temperature'),
    ('light', 'Light'),
    ('motion', 'Motion'),
    ('properties_of_matter', 'Properties of Matter'),
    ('sound', 'Sound'),
    ('unit_dimensions', 'Unit Dimensions'),
    ('work_power_energy', 'Work Power & Energy')
) AS topic(simple_id, name)
WHERE sh.simple_id = 'physics'
AND NOT EXISTS (
  SELECT 1 FROM public.topics t 
  WHERE t.subject_id = sh.id 
  AND t.simple_id = topic.simple_id
);