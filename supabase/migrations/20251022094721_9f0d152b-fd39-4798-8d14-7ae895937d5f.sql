-- Add Chemistry topics
INSERT INTO public.topics (subject_id, simple_id, name)
SELECT 
  sh.id,
  topic.simple_id,
  topic.name
FROM subjects_hierarchy sh
CROSS JOIN (
  VALUES 
    ('acid_base_salt', 'Acid base & salt'),
    ('nature_of_matters', 'Nature of Matters'),
    ('amu_mole_concept', 'AMU & Mole Concept'),
    ('atom_molecule', 'Atom & Molecule'),
    ('concept_of_matter', 'Concept of Matter'),
    ('oxidation_reduction', 'Oxidation & Reduction'),
    ('periodic_table', 'Periodic Table'),
    ('radioactivity', 'Radioactivity'),
    ('mineral_ores', 'Mineral & Ores'),
    ('metal_nonmetals', 'Metal & Nonmetals'),
    ('electrochemistry', 'Electrochemistry'),
    ('gaseous_laws', 'Gaseous laws'),
    ('carbon_compound', 'Carbon and its compound'),
    ('chemical_bonding', 'Chemical bonding')
) AS topic(simple_id, name)
WHERE sh.simple_id = 'chemistry'
AND NOT EXISTS (
  SELECT 1 FROM public.topics t 
  WHERE t.subject_id = sh.id 
  AND t.simple_id = topic.simple_id
);